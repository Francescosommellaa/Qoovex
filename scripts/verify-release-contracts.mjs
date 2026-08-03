import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const readJson = async (path) => JSON.parse(await readFile(join(root, path), "utf8"));
const manifest = await readJson("ops/workspace-release-manifest.json");
const environment = await readJson("ops/environment-contract.json");
const ledger = await readJson("ops/migration-ledger.json");
const scheduler = await readFile(join(root, ".github/workflows/scheduled-jobs.yml"), "utf8");
const turbo = await readJson("turbo.json");
const vercel = await readJson("apps/workspace/vercel.json");

if (manifest.database.migrationHead !== ledger.protectedProductionHead) {
  throw new Error("Release manifest and migration ledger head differ.");
}
if (manifest.database.migrationCount !== ledger.migrations.length) {
  throw new Error("Release manifest migration count is stale.");
}

const expectedJobs = new Map([
  ["data-control", "/api/data/jobs/run"],
  ["digest", "/api/reminders/email-digest/run"],
]);
for (const job of manifest.scheduler.jobs) {
  if (job.method !== "GET" || expectedJobs.get(job.id) !== job.path) {
    throw new Error(`Unexpected scheduler contract for ${job.id}.`);
  }
  if (!scheduler.includes(job.path)) {
    throw new Error(`Scheduled workflow is missing ${job.path}.`);
  }
  expectedJobs.delete(job.id);
}
if (expectedJobs.size > 0 || /\boperational\b/.test(scheduler) || scheduler.includes("/api/operations/run")) {
  throw new Error("Scheduled workflow must contain only the two legacy job families.");
}
if (manifest.application.runtimeTrack !== "legacy" || manifest.application.vNext !== "conceptual_not_implemented") {
  throw new Error("Runtime track must remain legacy with vNext inactive.");
}
if (manifest.http.anonymousProtectedPage !== "307_sign_in_with_sanitized_relative_callback") {
  throw new Error("Protected page redirect contract must match the runtime 307 response.");
}
if (vercel.ignoreCommand !== "node scripts/vercel-ignore-build.mjs") {
  throw new Error("Workspace Git deployments must use the repository preview guard.");
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
