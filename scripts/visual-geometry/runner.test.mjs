import assert from "node:assert/strict";
import test from "node:test";

import { buildPlaywrightArgs, buildRunPlan, parseChangedFiles, visualAppEnvironment } from "./run.mjs";
import { VISUAL_UPDATE_ATTESTATION } from "./snapshot-policy.mjs";

test("run mode never forwards update flags", () => {
  assert.deepEqual(buildPlaywrightArgs({ mode: "run" }), [
    "playwright",
    "test",
    "--config",
    "playwright.visual-geometry.config.ts",
  ]);
});

test("update mode is platform-local and forbidden in CI", () => {
  assert.throws(
    () => buildRunPlan({ mode: "update", ci: true, attestation: VISUAL_UPDATE_ATTESTATION, changedFiles: [] }),
    /forbidden in CI/,
  );
  assert.match(
    buildRunPlan({ mode: "update", ci: false, attestation: VISUAL_UPDATE_ATTESTATION, changedFiles: [] }).platform,
    /^(win32|linux|darwin)$/,
  );
});

test("update mode adds its own snapshot flag exactly once", () => {
  assert.deepEqual(buildPlaywrightArgs({ mode: "update" }), [
    "playwright",
    "test",
    "--config",
    "playwright.visual-geometry.config.ts",
    "--update-snapshots=all",
  ]);
});

test("changed file input accepts newline and comma separated paths", () => {
  assert.deepEqual(parseChangedFiles("apps/web/src/app/page.tsx\npackages/ui/src/index.ts, docs/quality.md"), [
    "apps/web/src/app/page.tsx",
    "packages/ui/src/index.ts",
    "docs/quality.md",
  ]);
});

test("Workspace visual builds replace every database target with an inert loopback URL", () => {
  const environment = visualAppEnvironment("workspace", {
    DATABASE_URL: "postgresql://production.example.invalid/db",
    DATABASE_PRISMA_DATABASE_URL: "postgresql://preview.example.invalid/db",
    DATABASE_POSTGRES_URL: "postgresql://another.example.invalid/db",
  });

  assert.match(environment.DATABASE_URL, /@127\.0\.0\.1:9\//);
  assert.equal(environment.DATABASE_PRISMA_DATABASE_URL, environment.DATABASE_URL);
  assert.equal(environment.DATABASE_POSTGRES_URL, environment.DATABASE_URL);
});
