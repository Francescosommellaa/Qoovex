#!/usr/bin/env node

/**
 * Temporary Qoovex compatibility shim for Impeccable 4.1.1.
 *
 * Codex starts repository hooks from the monorepo root. Impeccable 4.1.1
 * therefore resolves PostToolUse and Stop against that root instead of the
 * touched child project. This shim changes only the child cwd and delegates
 * all event parsing, detector rules, context loading and rendering to the
 * pinned upstream hook.
 */

import { spawn } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  IMPECCABLE_CONTEXTS,
  IMPECCABLE_DISPATCHER_STATE,
  IMPECCABLE_PIN,
} from "./config.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_REPOSITORY_ROOT = path.resolve(scriptDirectory, "..", "..");
export const UPSTREAM_HOOK_RELATIVE = `${IMPECCABLE_PIN.sourceDirectory}/scripts/hook.mjs`;
export const UPSTREAM_HOOK_LIB_RELATIVE = `${IMPECCABLE_PIN.sourceDirectory}/scripts/hook-lib.mjs`;

function isInside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function contextForAbsoluteFile(filePath, repositoryRoot) {
  const absolute = path.resolve(filePath);
  for (const relativeRoot of IMPECCABLE_CONTEXTS) {
    const contextRoot = path.join(repositoryRoot, ...relativeRoot.split("/"));
    if (isInside(contextRoot, absolute)) return relativeRoot;
  }
  return null;
}

export function sessionIdentity(event) {
  return event?.session_id
    ?? event?.sessionId
    ?? event?.conversation_id
    ?? event?.transcript_path
    ?? null;
}

function sessionToken(event) {
  const identity = sessionIdentity(event);
  if (!identity) return null;
  return createHash("sha256").update(String(identity)).digest("hex");
}

async function loadUpstreamApi(upstreamHookPath) {
  const hookLibPath = path.join(path.dirname(upstreamHookPath), "hook-lib.mjs");
  return import(pathToFileURL(hookLibPath).href);
}

export function resolveRoutedTargets(event, {
  repositoryRoot = DEFAULT_REPOSITORY_ROOT,
  hookApi,
} = {}) {
  if (!hookApi) throw new Error("resolveRoutedTargets requires the upstream hook API");
  const originalCwd = path.resolve(event?.cwd || repositoryRoot);
  const rawTargets = hookApi.resolveTargetFiles(event, originalCwd);
  const grouped = new Map();

  for (const rawTarget of rawTargets) {
    if (typeof rawTarget !== "string" || rawTarget.includes("..")) continue;
    const absolute = path.isAbsolute(rawTarget)
      ? path.resolve(rawTarget)
      : path.resolve(originalCwd, rawTarget);
    const context = contextForAbsoluteFile(absolute, repositoryRoot);
    if (!context) continue;

    const contextRoot = path.join(repositoryRoot, ...context.split("/"));
    const config = hookApi.readConfig(contextRoot);
    const extension = path.extname(absolute).toLowerCase();
    const configuredExtension = hookApi.matchConfiguredExtension(absolute, config.extensions);
    if (!hookApi.ALLOWED_EXTS.has(extension) && !configuredExtension) continue;

    const targets = grouped.get(context) ?? [];
    if (!targets.includes(absolute)) targets.push(absolute);
    grouped.set(context, targets);
  }

  return grouped;
}

function delegatedPostEvent(event, contextRoot, targets) {
  const command = targets.map((target) => `*** Update File: ${target}`).join("\n");
  return {
    ...event,
    cwd: contextRoot,
    hook_event_name: "PostToolUse",
    tool_name: "apply_patch",
    tool_input: { command },
  };
}

function delegatedStopEvent(event, contextRoot) {
  return { ...event, cwd: contextRoot, hook_event_name: "Stop" };
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function acquireLock(lockPath) {
  fs.mkdirSync(path.dirname(lockPath), { recursive: true });
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const handle = fs.openSync(lockPath, "wx");
      return () => {
        try { fs.closeSync(handle); } catch { /* already closed */ }
        try { fs.unlinkSync(lockPath); } catch { /* already removed */ }
      };
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;
      try {
        const age = Date.now() - fs.statSync(lockPath).mtimeMs;
        if (age > 30_000) fs.unlinkSync(lockPath);
      } catch { /* another process released it */ }
      await sleep(10);
    }
  }
  throw new Error("timed out waiting for dispatcher session lock");
}

function statePaths(event, stateRoot) {
  const token = sessionToken(event);
  if (!token) return null;
  return {
    state: path.join(stateRoot, `${token}.json`),
    lock: path.join(stateRoot, `${token}.lock`),
  };
}

async function rememberContexts(event, contexts, stateRoot) {
  const files = statePaths(event, stateRoot);
  if (!files || contexts.length === 0) return;
  const release = await acquireLock(files.lock);
  try {
    let current = [];
    try {
      const parsed = JSON.parse(fs.readFileSync(files.state, "utf8"));
      if (parsed?.version === 1 && Array.isArray(parsed.contexts)) current = parsed.contexts;
    } catch { /* first touch or invalid ephemeral state */ }
    const merged = IMPECCABLE_CONTEXTS.filter((context) => {
      return current.includes(context) || contexts.includes(context);
    });
    fs.writeFileSync(files.state, JSON.stringify({ version: 1, contexts: merged }), "utf8");
  } finally {
    release();
  }
}

async function consumeContexts(event, stateRoot) {
  const files = statePaths(event, stateRoot);
  if (!files) return [];
  const release = await acquireLock(files.lock);
  try {
    let contexts = [];
    try {
      const parsed = JSON.parse(fs.readFileSync(files.state, "utf8"));
      if (parsed?.version === 1 && Array.isArray(parsed.contexts)) {
        contexts = IMPECCABLE_CONTEXTS.filter((context) => parsed.contexts.includes(context));
      }
    } catch { /* absent or invalid ephemeral state */ }
    try { fs.unlinkSync(files.state); } catch { /* already absent */ }
    return contexts;
  } finally {
    release();
  }
}

export function runUpstreamProcess({ upstreamHookPath, cwd, eventJson }) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [upstreamHookPath], {
      cwd,
      env: process.env,
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
    });
    const stdout = [];
    const stderr = [];
    child.stdout.on("data", (chunk) => stdout.push(chunk));
    child.stderr.on("data", (chunk) => stderr.push(chunk));
    child.on("error", (error) => resolve({ stdout: "", stderr: String(error), exitCode: 0 }));
    child.on("close", () => resolve({
      stdout: Buffer.concat(stdout).toString("utf8"),
      stderr: Buffer.concat(stderr).toString("utf8"),
      exitCode: 0,
    }));
    child.stdin.end(eventJson);
  });
}

function additionalContext(stdout) {
  if (!stdout || !stdout.trim()) return null;
  try {
    const payload = JSON.parse(stdout);
    return payload?.hookSpecificOutput?.additionalContext
      ?? payload?.additionalContext
      ?? payload?.additional_context
      ?? null;
  } catch {
    return null;
  }
}

function combineOutputs(outputs, eventName) {
  const populated = outputs.filter((output) => output?.stdout?.trim());
  if (populated.length === 0) return "";
  if (populated.length === 1) return populated[0].stdout;

  const contexts = populated.map((output) => additionalContext(output.stdout)).filter(Boolean);
  if (contexts.length === 0) return "";
  return JSON.stringify({
    hookSpecificOutput: {
      hookEventName: eventName,
      additionalContext: contexts.join("\n\n"),
    },
  });
}

export async function dispatchHook({
  stdinJson,
  repositoryRoot = DEFAULT_REPOSITORY_ROOT,
  upstreamHookPath = path.join(repositoryRoot, ...UPSTREAM_HOOK_RELATIVE.split("/")),
  stateRoot = path.join(repositoryRoot, ...IMPECCABLE_DISPATCHER_STATE.split("/")),
  hookApi,
  runUpstream = runUpstreamProcess,
} = {}) {
  if (!fs.existsSync(upstreamHookPath)) return "";

  let event;
  try { event = JSON.parse(stdinJson); } catch { return ""; }
  if (!event || typeof event !== "object") return "";

  const eventName = event.hook_event_name;
  const api = hookApi ?? await loadUpstreamApi(upstreamHookPath);
  const outputs = [];

  if (eventName === "PostToolUse") {
    const grouped = resolveRoutedTargets(event, { repositoryRoot, hookApi: api });
    const contexts = IMPECCABLE_CONTEXTS.filter((context) => grouped.has(context));
    await rememberContexts(event, contexts, stateRoot);
    for (const context of contexts) {
      const cwd = path.join(repositoryRoot, ...context.split("/"));
      const delegated = delegatedPostEvent(event, cwd, grouped.get(context));
      outputs.push(await runUpstream({
        upstreamHookPath,
        cwd,
        eventJson: JSON.stringify(delegated),
      }));
    }
    return combineOutputs(outputs, eventName);
  }

  if (eventName === "Stop") {
    const contexts = await consumeContexts(event, stateRoot);
    for (const context of contexts) {
      const cwd = path.join(repositoryRoot, ...context.split("/"));
      outputs.push(await runUpstream({
        upstreamHookPath,
        cwd,
        eventJson: JSON.stringify(delegatedStopEvent(event, cwd)),
      }));
    }
    return combineOutputs(outputs, eventName);
  }

  return "";
}

async function readStdin() {
  if (process.stdin.isTTY) return "";
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

async function main() {
  try {
    const stdout = await dispatchHook({ stdinJson: await readStdin() });
    if (stdout) process.stdout.write(stdout);
  } catch (error) {
    if (process.env.IMPECCABLE_DISPATCHER_DEBUG) {
      process.stderr.write(`[qoovex-impeccable-dispatcher] ${String(error)}\n`);
    }
  }
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) await main();

