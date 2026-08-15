import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  IMPECCABLE_INSTALL_MARKER,
  IMPECCABLE_PIN,
} from "./config.mjs";
import { inspectPayload } from "./payload.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..", "..");
const installPath = path.join(repositoryRoot, ...IMPECCABLE_PIN.sourceDirectory.split("/"));
const markerPath = path.join(repositoryRoot, ...IMPECCABLE_INSTALL_MARKER.split("/"));

function fail(message) {
  process.stderr.write(`setup:impeccable: FAIL — ${message}\n`);
  process.exitCode = 1;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? repositoryRoot,
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit",
    windowsHide: true,
  });
  if (result.error || result.status !== 0) {
    const detail = options.capture
      ? [result.stdout, result.stderr].filter(Boolean).join("\n").trim()
      : "";
    throw new Error(`${command} ${args.join(" ")} failed${detail ? `: ${detail}` : ""}`);
  }
  return options.capture ? result.stdout.trim() : "";
}

function assertRuntime() {
  const nodeMajor = Number.parseInt(process.versions.node.split(".")[0], 10);
  if (nodeMajor !== 24) {
    throw new Error(`Qoovex requires Node 24.x; found ${process.versions.node}`);
  }
  run("git", ["--version"], { capture: true });
}

function expectedMarker() {
  return {
    schemaVersion: 1,
    repository: IMPECCABLE_PIN.repositoryId,
    tag: IMPECCABLE_PIN.tag,
    commit: IMPECCABLE_PIN.commit,
    version: IMPECCABLE_PIN.version,
    payloadSha256: IMPECCABLE_PIN.payloadSha256,
  };
}

function writeMarkerIfNeeded() {
  const content = `${JSON.stringify(expectedMarker(), null, 2)}\n`;
  let current = null;
  try { current = fs.readFileSync(markerPath, "utf8"); } catch { /* absent */ }
  if (current === content) return false;
  fs.mkdirSync(path.dirname(markerPath), { recursive: true });
  fs.writeFileSync(markerPath, content, "utf8");
  return true;
}

function fetchPinnedSource(tempRoot) {
  const cloneRoot = path.join(tempRoot, "upstream");
  fs.mkdirSync(cloneRoot, { recursive: true });
  run("git", ["init", "--quiet"], { cwd: cloneRoot });
  run("git", ["remote", "add", "origin", IMPECCABLE_PIN.repository], { cwd: cloneRoot });
  run("git", [
    "fetch",
    "--quiet",
    "--depth",
    "1",
    "origin",
    `refs/tags/${IMPECCABLE_PIN.tag}:refs/tags/${IMPECCABLE_PIN.tag}`,
  ], { cwd: cloneRoot });

  const resolvedCommit = run(
    "git",
    ["rev-parse", `refs/tags/${IMPECCABLE_PIN.tag}^{commit}`],
    { cwd: cloneRoot, capture: true },
  );
  if (resolvedCommit !== IMPECCABLE_PIN.commit) {
    throw new Error(
      `tag ${IMPECCABLE_PIN.tag} resolves to ${resolvedCommit}, expected ${IMPECCABLE_PIN.commit}`,
    );
  }

  run("git", ["sparse-checkout", "init", "--cone"], { cwd: cloneRoot });
  run("git", ["sparse-checkout", "set", IMPECCABLE_PIN.sourceDirectory], { cwd: cloneRoot });
  run("git", ["checkout", "--quiet", "--detach", IMPECCABLE_PIN.commit], { cwd: cloneRoot });

  const sourcePath = path.join(cloneRoot, ...IMPECCABLE_PIN.sourceDirectory.split("/"));
  const sourceInspection = inspectPayload(sourcePath, IMPECCABLE_PIN);
  if (!sourceInspection.valid) {
    throw new Error(
      `retrieved payload failed verification (version=${sourceInspection.version ?? "missing"}, `
      + `sha256=${sourceInspection.sha256 ?? "missing"}, files=${sourceInspection.fileCount})`,
    );
  }
  return sourcePath;
}

function replaceInstallation(sourcePath, tempRoot) {
  const stagedPath = path.join(tempRoot, "payload");
  const backupPath = path.join(tempRoot, "previous-payload");
  fs.cpSync(sourcePath, stagedPath, { recursive: true, errorOnExist: true });

  const stagedInspection = inspectPayload(stagedPath, IMPECCABLE_PIN);
  if (!stagedInspection.valid) {
    throw new Error("staged payload changed during copy");
  }

  fs.mkdirSync(path.dirname(installPath), { recursive: true });
  let movedPrevious = false;
  try {
    if (fs.existsSync(installPath)) {
      fs.renameSync(installPath, backupPath);
      movedPrevious = true;
    }
    fs.renameSync(stagedPath, installPath);
  } catch (error) {
    if (!fs.existsSync(installPath) && movedPrevious && fs.existsSync(backupPath)) {
      fs.renameSync(backupPath, installPath);
    }
    throw error;
  }
}

async function main() {
  try {
    assertRuntime();
    const current = inspectPayload(installPath, IMPECCABLE_PIN);
    if (current.valid) {
      const markerChanged = writeMarkerIfNeeded();
      process.stdout.write(
        `Impeccable ${IMPECCABLE_PIN.version} already matches ${IMPECCABLE_PIN.commit.slice(0, 7)}`
        + `${markerChanged ? "; local provenance marker repaired" : "; no reinstall needed"}.\n`,
      );
      return;
    }

    const runtimeParent = path.join(repositoryRoot, ".codex-runtime");
    fs.mkdirSync(runtimeParent, { recursive: true });
    const tempRoot = fs.mkdtempSync(path.join(runtimeParent, "impeccable-setup-"));
    try {
      const sourcePath = fetchPinnedSource(tempRoot);
      replaceInstallation(sourcePath, tempRoot);
      const installed = inspectPayload(installPath, IMPECCABLE_PIN);
      if (!installed.valid) throw new Error("installed payload failed final verification");
      writeMarkerIfNeeded();
      process.stdout.write(
        `Installed Impeccable ${IMPECCABLE_PIN.version} from ${IMPECCABLE_PIN.tag} `
        + `at ${IMPECCABLE_PIN.commit}.\n`,
      );
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  }
}

await main();

