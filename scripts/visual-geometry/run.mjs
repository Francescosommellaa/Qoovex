import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { selectVisualScope } from "./blast-radius.mjs";
import { assertSnapshotUpdateAllowed } from "./snapshot-policy.mjs";

const require = createRequire(import.meta.url);
const PLAYWRIGHT_CLI = require.resolve("@playwright/test/cli");
const TURBO_CLI = require.resolve("turbo/bin/turbo");
const APP_PACKAGES = Object.freeze({
  sirio: "@qoovex/sirio",
  web: "@qoovex/web",
  workspace: "@qoovex/workspace",
});
const INERT_DATABASE_URL = "postgresql://visual_geometry:visual_geometry@127.0.0.1:9/visual_geometry?connect_timeout=1";

export function visualAppEnvironment(app, baseEnvironment = process.env) {
  const environment = { ...baseEnvironment, QOOVEX_VISUAL_GEOMETRY: "1" };
  if (app === "workspace") {
    environment.DATABASE_URL = INERT_DATABASE_URL;
    environment.DATABASE_PRISMA_DATABASE_URL = INERT_DATABASE_URL;
    environment.DATABASE_POSTGRES_URL = INERT_DATABASE_URL;
  }
  return environment;
}

export function parseChangedFiles(value = "") {
  return value
    .split(/[\r\n,]+/)
    .map((file) => file.trim())
    .filter(Boolean);
}

export function buildPlaywrightArgs({ mode }) {
  const args = ["playwright", "test", "--config", "playwright.visual-geometry.config.ts"];
  if (mode === "update") args.push("--update-snapshots=all");
  return args;
}

export function buildRunPlan({ mode, ci, attestation, changedFiles }) {
  if (!["run", "update"].includes(mode)) throw new Error(`unsupported visual geometry mode: ${mode}`);

  const scope = selectVisualScope(changedFiles);
  const plan = {
    mode,
    platform: process.platform,
    tier: mode === "update" ? "broad" : scope.tier,
    apps: scope.apps,
    selfTest: scope.selfTest,
  };

  if (mode === "update") {
    assertSnapshotUpdateAllowed({
      ci,
      attestation,
      argv: buildPlaywrightArgs({ mode }),
      runnerOwnsUpdate: true,
    });
  }

  return plan;
}

function runProcess(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? process.cwd(),
    env: options.env ?? process.env,
    shell: false,
    stdio: options.stdio ?? "inherit",
    encoding: "utf8",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status}`);
  }
  return result;
}

function changedFilesFromGit() {
  const base = process.env.QOOVEX_VISUAL_BASE_SHA?.trim() || "origin/master";
  const result = spawnSync("git", ["diff", "--name-only", `${base}...HEAD`], {
    cwd: process.cwd(),
    shell: false,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    return ["scripts/visual-geometry/run.mjs"];
  }
  return parseChangedFiles(result.stdout);
}

function resolveChangedFiles() {
  const explicit = process.env.QOOVEX_VISUAL_CHANGED_FILES;
  return explicit === undefined ? changedFilesFromGit() : parseChangedFiles(explicit);
}

function validatePureContracts() {
  runProcess("node", [
    "--test",
    "tests/visual-geometry/*.test.mjs",
    "scripts/visual-geometry/*.test.mjs",
    "apps/sirio/src/components/specimen.test.mjs",
  ]);
}

function buildApps(apps) {
  for (const app of apps) {
    runProcess(process.execPath, [TURBO_CLI, "run", "build", `--filter=${APP_PACKAGES[app]}`], {
      env: visualAppEnvironment(app),
    });
  }
}

export function execute(mode) {
  if (mode === "self-test") {
    runProcess("node", ["scripts/visual-geometry/self-test.mjs"]);
    return;
  }

  const changedFiles = resolveChangedFiles();
  const plan = buildRunPlan({
    mode,
    ci: Boolean(process.env.CI),
    attestation: process.env.QOOVEX_VISUAL_BASELINE_UPDATE,
    changedFiles,
  });

  console.log(`[visual-geometry] platform=${plan.platform} tier=${plan.tier} apps=${plan.apps.join(",")}`);
  validatePureContracts();
  if (plan.selfTest) runProcess("node", ["scripts/visual-geometry/self-test.mjs"]);
  buildApps(plan.apps);
  const [, ...playwrightArgs] = buildPlaywrightArgs({ mode });
  runProcess(process.execPath, [PLAYWRIGHT_CLI, ...playwrightArgs], {
    env: {
      ...process.env,
      QOOVEX_VISUAL_APPS: plan.apps.join(","),
      QOOVEX_VISUAL_TIER: plan.tier,
    },
  });
}

const isEntryPoint = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isEntryPoint) {
  if (process.argv.length > 3) throw new Error("unexpected arguments: use the governed root scripts only");
  execute(process.argv[2] ?? "run");
}
