import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workflowUrl = new URL("../../.github/workflows/visual-geometry.yml", import.meta.url);

async function readWorkflow() {
  return readFile(workflowUrl, "utf8");
}

test("visual geometry CI is a read-only required-check candidate", async () => {
  const workflow = await readWorkflow();

  assert.match(workflow, /^name: Visual Geometry/m);
  assert.match(workflow, /^\s{2}pull_request:$/m);
  assert.match(workflow, /^\s{2}push:$/m);
  assert.match(workflow, /^\s{2}workflow_dispatch:$/m);
  assert.match(workflow, /^\s{4}name: visual-geometry$/m);
  assert.match(workflow, /^permissions:\n\s{2}contents: read$/m);
  assert.match(workflow, /mcr\.microsoft\.com\/playwright:v1\.62\.0-noble/);
  assert.match(
    workflow,
    /steps:\n\s+- name: Install Git LFS\n\s+run: \|\n\s+apt-get update\n\s+apt-get install --yes --no-install-recommends git-lfs\n\s+git lfs version\n\s+- uses: actions\/checkout@/,
  );
  assert.match(workflow, /actions\/checkout@[0-9a-f]{40}/);
  assert.match(workflow, /actions\/checkout@[0-9a-f]{40}[\s\S]*?with:\n\s+fetch-depth: 0\n\s+lfs: true/);
  assert.match(workflow, /pnpm\/action-setup@[0-9a-f]{40}/);
  assert.match(workflow, /actions\/setup-node@[0-9a-f]{40}/);
  assert.match(workflow, /actions\/upload-artifact@[0-9a-f]{40}/);
  assert.match(workflow, /pnpm install --frozen-lockfile/);
  assert.match(workflow, /pnpm visual:geometry:self-test/);
  assert.match(workflow, /pnpm visual:geometry$/m);
  assert.match(
    workflow,
    /git --git-dir="\$GITHUB_WORKSPACE\/\.git" --work-tree="\$GITHUB_WORKSPACE" diff --check/,
  );
  assert.doesNotMatch(workflow, /visual:geometry:update|update-snapshots/i);
});

test("failure evidence is short-lived and the workflow does not gate fonts", async () => {
  const workflow = await readWorkflow();

  assert.match(workflow, /if: failure\(\)/);
  assert.match(workflow, /retention-days: 7/);
  assert.match(workflow, /output\/visual-geometry/);
  assert.match(workflow, /if-no-files-found: ignore/);
  assert.doesNotMatch(workflow, /document\.fonts|fontshare|font-family|woff2|webfont/i);
});
