import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

import { buildPlaywrightArgs, buildRunPlan, changedFilesFromGit, parseChangedFiles, visualAppEnvironment } from "./run.mjs";
import { VISUAL_UPDATE_ATTESTATION } from "./snapshot-policy.mjs";
import { visualPorts } from "./ports.mjs";

test("isolated visual ports preserve loopback defaults and reject invalid ranges", () => {
  assert.deepEqual(visualPorts("3000"), { web: 3000, workspace: 3001, sirio: 3002 });
  assert.deepEqual(visualPorts("3300"), { web: 3300, workspace: 3301, sirio: 3302 });
  for (const value of ["", "0", "65534", "3300.5", "remote:3300"]) assert.throws(() => visualPorts(value));
});

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

test("visual scope includes unstaged, staged and untracked working-tree changes", () => {
  const cwd = mkdtempSync(path.join(os.tmpdir(), "qoovex-visual-scope-"));
  const git = (...args) => execFileSync("git", args, { cwd, stdio: "pipe" });
  const base = process.env.QOOVEX_VISUAL_BASE_SHA;
  try {
    git("init");
    git("config", "user.name", "Visual test");
    git("config", "user.email", "visual@example.invalid");
    mkdirSync(path.join(cwd, "packages/ui/styles"), { recursive: true });
    writeFileSync(path.join(cwd, "packages/ui/styles/base.css"), "/* initial */\n");
    git("add", ".");
    git("commit", "-m", "fixture");
    process.env.QOOVEX_VISUAL_BASE_SHA = "HEAD";
    writeFileSync(path.join(cwd, "packages/ui/styles/base.css"), "/* modified */\n");
    writeFileSync(path.join(cwd, "new.tsx"), "export default null\n");
    assert.deepEqual(changedFilesFromGit(cwd).sort(), ["new.tsx", "packages/ui/styles/base.css"]);
    git("add", ".");
    assert.deepEqual(changedFilesFromGit(cwd).sort(), ["new.tsx", "packages/ui/styles/base.css"]);
  } finally {
    if (base === undefined) delete process.env.QOOVEX_VISUAL_BASE_SHA;
    else process.env.QOOVEX_VISUAL_BASE_SHA = base;
    rmSync(cwd, { recursive: true, force: true });
  }
});
