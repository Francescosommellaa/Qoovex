import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

import { IMPECCABLE_CONTEXTS } from "./config.mjs";
import {
  DEFAULT_REPOSITORY_ROOT,
  dispatchHook,
  runUpstreamProcess,
  UPSTREAM_HOOK_LIB_RELATIVE,
  UPSTREAM_HOOK_RELATIVE,
} from "./hook-dispatcher.mjs";

const upstreamHookPath = path.join(
  DEFAULT_REPOSITORY_ROOT,
  ...UPSTREAM_HOOK_RELATIVE.split("/"),
);
const upstreamApi = await import(pathToFileURL(path.join(
  DEFAULT_REPOSITORY_ROOT,
  ...UPSTREAM_HOOK_LIB_RELATIVE.split("/"),
)).href);

function createFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "qoovex-impeccable-dispatcher-"));
  for (const context of IMPECCABLE_CONTEXTS) {
    fs.mkdirSync(path.join(root, ...context.split("/"), "src"), { recursive: true });
  }
  fs.mkdirSync(path.join(root, "packages", "db", "src"), { recursive: true });
  return root;
}

function eventFor(root, session, target) {
  return {
    hook_event_name: "PostToolUse",
    session_id: session,
    cwd: root,
    tool_name: "Write",
    tool_input: { file_path: path.join(root, ...target.split("/")) },
  };
}

function stopEvent(root, session) {
  return {
    hook_event_name: "Stop",
    session_id: session,
    cwd: root,
  };
}

function statePathFor(root, session) {
  const token = createHash("sha256").update(session).digest("hex");
  return path.join(root, ".dispatcher-state", `${token}.json`);
}

async function runWithCapture(root, event, calls) {
  return dispatchHook({
    stdinJson: JSON.stringify(event),
    repositoryRoot: root,
    upstreamHookPath,
    stateRoot: path.join(root, ".dispatcher-state"),
    hookApi: upstreamApi,
    runUpstream: async ({ cwd, eventJson }) => {
      calls.push({ cwd, event: JSON.parse(eventJson) });
      return { stdout: "", stderr: "", exitCode: 0 };
    },
  });
}

for (const [target, expectedContext] of [
  ["apps/workspace/src/test-target.tsx", "apps/workspace"],
  ["apps/web/src/test-target.tsx", "apps/web"],
  ["apps/sirio/src/test-target.tsx", "apps/sirio"],
  ["packages/ui/src/test-target.tsx", "packages/ui"],
]) {
  test(`PostToolUse routes ${target} to ${expectedContext}`, async (t) => {
    const root = createFixture();
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const calls = [];
    await runWithCapture(root, eventFor(root, `session-${expectedContext}`, target), calls);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].cwd, path.join(root, ...expectedContext.split("/")));
    assert.equal(calls[0].event.cwd, calls[0].cwd);
  });
}

test("PostToolUse does not attribute a backend package to a UI context", async (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const calls = [];
  await runWithCapture(root, eventFor(root, "session-backend", "packages/db/src/server.ts"), calls);
  assert.deepEqual(calls, []);
});

for (const [label, target] of [
  ["a non-UI edit", "docs/OperationalProtocol.md"],
  ["a database edit", "packages/db/src/server.ts"],
  ["an Impeccable verifier edit", "scripts/impeccable/verify.mjs"],
]) {
  test(`Stop is a successful no-op after ${label}`, async (t) => {
    const root = createFixture();
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const calls = [];
    const session = `session-no-op-${label}`;

    await runWithCapture(root, eventFor(root, session, target), calls);
    const stdout = await runWithCapture(root, stopEvent(root, session), calls);

    assert.equal(stdout, "");
    assert.deepEqual(calls, []);
  });
}

test("Stop is a successful no-op when no session state exists", async (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const calls = [];

  const stdout = await runWithCapture(root, stopEvent(root, "session-no-state"), calls);

  assert.equal(stdout, "");
  assert.deepEqual(calls, []);
});

test("Stop consumes empty session state without delegating", async (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const calls = [];
  const session = "session-empty-state";
  const statePath = statePathFor(root, session);
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, JSON.stringify({ version: 1, contexts: [] }), "utf8");

  const stdout = await runWithCapture(root, stopEvent(root, session), calls);

  assert.equal(stdout, "");
  assert.deepEqual(calls, []);
  assert.equal(fs.existsSync(statePath), false);
});

test("a second Stop is harmless after session state was consumed", async (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const calls = [];
  const session = "session-consumed-state";
  await runWithCapture(root, eventFor(root, session, "apps/web/src/test-target.tsx"), calls);
  await runWithCapture(root, stopEvent(root, session), calls);
  const callsAfterFirstStop = calls.length;

  const stdout = await runWithCapture(root, stopEvent(root, session), calls);

  assert.equal(stdout, "");
  assert.equal(calls.length, callsAfterFirstStop);
});

test("Stop runs exactly the Workspace and UI contexts touched by the session", async (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const calls = [];
  const session = "session-workspace-ui";
  const workspaceTarget = path.join(root, "apps", "workspace", "src", "test-target.tsx");
  const uiTarget = path.join(root, "packages", "ui", "src", "test-target.tsx");
  await runWithCapture(root, {
    hook_event_name: "PostToolUse",
    session_id: session,
    cwd: root,
    tool_name: "apply_patch",
    tool_input: {
      command: `*** Update File: ${workspaceTarget}\n*** Update File: ${uiTarget}`,
    },
  }, calls);
  await runWithCapture(root, {
    hook_event_name: "Stop",
    session_id: session,
    cwd: root,
  }, calls);

  const stopContexts = calls
    .filter((call) => call.event.hook_event_name === "Stop")
    .map((call) => path.relative(root, call.cwd).split(path.sep).join("/"));
  assert.deepEqual(stopContexts, ["apps/workspace", "packages/ui"]);
});

test("Stop for a Web-only session does not scan Workspace, Sirio or UI", async (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const calls = [];
  const session = "session-web-only";
  await runWithCapture(root, eventFor(root, session, "apps/web/src/test-target.tsx"), calls);
  await runWithCapture(root, {
    hook_event_name: "Stop",
    session_id: session,
    cwd: root,
  }, calls);

  const stopContexts = calls
    .filter((call) => call.event.hook_event_name === "Stop")
    .map((call) => path.relative(root, call.cwd).split(path.sep).join("/"));
  assert.deepEqual(stopContexts, ["apps/web"]);
});

test("dispatcher delegates a real temporary Web edit to the upstream hook", async (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const context = path.join(root, "apps", "web");
  const sourceContext = path.join(DEFAULT_REPOSITORY_ROOT, "apps", "web");
  fs.copyFileSync(path.join(sourceContext, "PRODUCT.md"), path.join(context, "PRODUCT.md"));
  fs.copyFileSync(path.join(sourceContext, "DESIGN.md"), path.join(context, "DESIGN.md"));
  fs.cpSync(path.join(sourceContext, ".impeccable"), path.join(context, ".impeccable"), {
    recursive: true,
  });
  const target = path.join(context, "src", "test-target.tsx");
  fs.writeFileSync(target, "export function TestTarget() { return <main>Test</main>; }\n", "utf8");

  const session = "session-real-upstream";
  const stdout = await dispatchHook({
    stdinJson: JSON.stringify(eventFor(root, session, "apps/web/src/test-target.tsx")),
    repositoryRoot: root,
    upstreamHookPath,
    stateRoot: path.join(root, ".dispatcher-state"),
    hookApi: upstreamApi,
  });
  assert.match(stdout, /hookSpecificOutput/);

  const cache = JSON.parse(fs.readFileSync(
    path.join(context, ".impeccable", "hook.cache.json"),
    "utf8",
  ));
  assert.ok(cache.sessions[session].files[target]);
});

test("runUpstreamProcess preserves a real non-zero upstream exit code", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "qoovex-impeccable-upstream-error-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const failingHook = path.join(root, "failing-hook.mjs");
  fs.writeFileSync(failingHook, "process.stderr.write('upstream failed\\n'); process.exitCode = 7;\n", "utf8");

  const result = await runUpstreamProcess({
    upstreamHookPath: failingHook,
    cwd: root,
    eventJson: "{}",
  });

  assert.equal(result.exitCode, 7);
  assert.equal(result.stderr, "upstream failed\n");
});

test("dispatchHook propagates a delegated upstream failure", async (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  await assert.rejects(
    dispatchHook({
      stdinJson: JSON.stringify(eventFor(
        root,
        "session-upstream-failure",
        "apps/web/src/test-target.tsx",
      )),
      repositoryRoot: root,
      upstreamHookPath,
      stateRoot: path.join(root, ".dispatcher-state"),
      hookApi: upstreamApi,
      runUpstream: async () => ({ stdout: "", stderr: "upstream failed\n", exitCode: 7 }),
    }),
    (error) => {
      assert.equal(error.exitCode, 7);
      assert.match(error.message, /upstream failed/);
      return true;
    },
  );
});
