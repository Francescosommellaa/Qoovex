import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const readJson = async (path) => JSON.parse(await readFile(join(root, path), "utf8"));
const manifest = await readJson("ops/workspace-release-manifest.json");
const environment = await readJson("ops/environment-contract.json");
const ledger = await readJson("ops/migration-ledger.json");
const scheduler = await readFile(join(root, ".github/workflows/scheduled-jobs.yml"), "utf8");
const productionRelease = await readFile(join(root, ".github/workflows/release-workspace.yml"), "utf8");
const previewRelease = await readFile(join(root, ".github/workflows/rehearse-workspace-preview.yml"), "utf8");
const turbo = await readJson("turbo.json");
const vercel = await readJson("apps/workspace/vercel.json");
const workspacePackage = await readJson("apps/workspace/package.json");

if (manifest.database.migrationHead !== ledger.protectedProductionHead) {
  throw new Error("Release manifest and migration ledger head differ.");
}
if (manifest.database.migrationCount !== ledger.migrations.length) {
  throw new Error("Release manifest migration count is stale.");
}
const currentMigration = ledger.migrations.find((entry) => entry.name === manifest.database.migrationHead);
if (
  !currentMigration ||
  currentMigration.productionApplied !== false ||
  currentMigration.destructiveApproved !== false ||
  currentMigration.executionPolicy !== "MANUAL_REAUTHORIZATION_REQUIRED"
) {
  throw new Error("Pending destructive current migration must remain frozen pending manual reauthorization.");
}

const expectedJobs = new Map([
  ["data-control", { method: "GET", path: "/api/data/jobs/run" }],
  ["job-site-processes", { method: "POST", path: "/api/internal/job-sites/processes/run" }],
]);
for (const job of manifest.scheduler.jobs) {
  const expected = expectedJobs.get(job.id);
  if (!expected || job.method !== expected.method || job.path !== expected.path) {
    throw new Error(`Unexpected scheduler contract for ${job.id}.`);
  }
  if (!scheduler.includes(job.path)) {
    throw new Error(`Scheduled workflow is missing ${job.path}.`);
  }
  expectedJobs.delete(job.id);
}
if (
  expectedJobs.size > 0 ||
  scheduler.includes("/api/reminders/email-digest/run") ||
  scheduler.includes("/api/operations/run")
) {
  throw new Error("Scheduled workflow must contain only data-control and the current process queue.");
}
if (manifest.application.runtimeTrack !== "job-site" || manifest.application.current !== "implemented_not_end_to_end_verified") {
  throw new Error("Runtime track must identify current without claiming end-to-end verification.");
}
if (
  manifest.blob?.access !== "private" ||
  manifest.blob?.resetScript !== "apps/workspace/scripts/reset-private-blob-store.mjs"
) {
  throw new Error("current private Blob reset contract is incomplete.");
}
if (manifest.http.anonymousProtectedPage !== "307_sign_in_with_sanitized_relative_callback") {
  throw new Error("Protected page redirect contract must match the runtime 307 response.");
}
if (vercel.ignoreCommand !== "node scripts/vercel-ignore-build.mjs") {
  throw new Error("Workspace Git deployments must use the repository preview guard.");
}
if (workspacePackage.scripts?.prebuild !== "node scripts/cloud-migrate.mjs") {
  throw new Error("Workspace cloud builds must run the guarded migration hook.");
}

function assertManualDestructiveWorkflow({ name, source, confirmation }) {
  if (!source.includes("workflow_dispatch:")) {
    throw new Error(`${name} must be manually dispatched.`);
  }
  if (/^\s{2}(?:push|pull_request|workflow_run|schedule):/m.test(source)) {
    throw new Error(`${name} may not have an automatic trigger.`);
  }
  if (!source.includes(`test \"$CONFIRMATION\" = \"${confirmation}\"`)) {
    throw new Error(`${name} must require the exact manual confirmation phrase.`);
  }
}

assertManualDestructiveWorkflow({
  name: "Production release",
  source: productionRelease,
  confirmation: "RELEASE_QOOVEX_PRODUCTION_MANUALLY",
});
assertManualDestructiveWorkflow({
  name: "Preview rehearsal",
  source: previewRelease,
  confirmation: "RECREATE_ISOLATED_PREVIEW",
});

if (
  manifest.previewRelease.automaticGitDeployment !== "disabled" ||
  manifest.previewRelease.trigger !== "manual_workflow_dispatch_exact_confirmation" ||
  manifest.productionRelease.trigger !== "manual_workflow_dispatch_after_green_ci_exact_confirmation"
) {
  throw new Error("Release manifest must keep Preview and Production destructive paths manual-only.");
}

for (const [name, source] of [["Production release", productionRelease], ["Preview rehearsal", previewRelease]]) {
  if (/\bprisma\s+(?:db\s+push|migrate\s+(?:reset|resolve))\b/i.test(source) || /\b(?:db:push|migrate:reset|migrate:resolve)\b/i.test(source)) {
    throw new Error(`${name} may not invoke unguarded schema mutation or migration-history commands.`);
  }
}
if (productionRelease.includes("vercel env run") || previewRelease.includes("vercel env run")) {
  throw new Error("Release workflows must not try to export Vercel Sensitive variables to GitHub runners.");
}
if (!productionRelease.includes("vercel@50.17.1 deploy --prod") || !previewRelease.includes("vercel@50.17.1 deploy --yes")) {
  throw new Error("Release workflows must use Vercel cloud builds for guarded migrations.");
}
for (const checkName of ["push-gate", "quality-gate", "workspace-e2e"]) {
  if (!productionRelease.includes(`\"${checkName}\"`)) {
    throw new Error(`Production release must require the current ${checkName} result.`);
  }
}
for (const [name, source] of [["Production release", productionRelease], ["Preview rehearsal", previewRelease]]) {
  if (!source.includes("pnpm/action-setup@0ebf47130e4866e96fce0953f49152a61190b271")) {
    throw new Error(`${name} must install pnpm before running the Vercel CLI.`);
  }
}

const ignoreScript = join(root, "apps/workspace/scripts/vercel-ignore-build.mjs");
const previewIgnore = spawnSync(process.execPath, [ignoreScript], {
  env: { ...process.env, VERCEL_ENV: "preview" },
});
const productionIgnore = spawnSync(process.execPath, [ignoreScript], {
  env: { ...process.env, VERCEL_ENV: "production" },
});
if (previewIgnore.status !== 0 || productionIgnore.status !== 1) {
  throw new Error("Workspace Git deployment guard must cancel Preview and allow staged Production builds.");
}

const requiredTurboEnv = new Set();
for (const group of Object.values(environment.groups)) {
  for (const name of group.required ?? []) requiredTurboEnv.add(name);
  for (const name of group.anyOf ?? []) requiredTurboEnv.add(name);
  if (group.marker) requiredTurboEnv.add(group.marker);
}
const turboEnv = new Set([
  ...(turbo.globalEnv ?? []),
  ...(turbo.tasks?.build?.env ?? []),
  ...(turbo.tasks?.test?.env ?? []),
]);
const missingTurboEnv = [...requiredTurboEnv].filter((name) => !turboEnv.has(name));
if (missingTurboEnv.length > 0) {
  throw new Error(`Turbo environment contract is incomplete: ${missingTurboEnv.join(", ")}`);
}

console.log("Release, scheduler and environment contracts verified.");
