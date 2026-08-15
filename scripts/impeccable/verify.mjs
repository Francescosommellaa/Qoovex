import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  IMPECCABLE_CONTEXTS,
  IMPECCABLE_DISPATCHER_STATE,
  IMPECCABLE_INSTALL_MARKER,
  IMPECCABLE_PIN,
} from "./config.mjs";
import {
  UPSTREAM_HOOK_RELATIVE,
  UPSTREAM_HOOK_LIB_RELATIVE,
} from "./hook-dispatcher.mjs";
import { inspectPayload } from "./payload.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..", "..");
const distributionRoot = path.join(repositoryRoot, ...IMPECCABLE_PIN.sourceDirectory.split("/"));
const failures = [];
const passes = [];
const warnings = [];

function pass(message) { passes.push(message); }
function fail(message) { failures.push(message); }
function warn(message) { warnings.push(message); }

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? repositoryRoot,
    encoding: "utf8",
    stdio: "pipe",
    windowsHide: true,
  });
  return {
    status: result.status,
    stdout: result.stdout?.trim() ?? "",
    stderr: result.stderr?.trim() ?? "",
    error: result.error,
  };
}

function readJson(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, "utf8")); } catch { return null; }
}

function verifyDistribution() {
  const inspection = inspectPayload(distributionRoot, IMPECCABLE_PIN);
  if (!inspection.exists) {
    fail("tool distribution missing; run pnpm setup:impeccable");
    return;
  }
  if (inspection.version !== IMPECCABLE_PIN.version) {
    fail(`skill version is ${inspection.version ?? "missing"}, expected ${IMPECCABLE_PIN.version}`);
  }
  if (inspection.sha256 !== IMPECCABLE_PIN.payloadSha256) {
    fail(`payload digest is ${inspection.sha256}, expected ${IMPECCABLE_PIN.payloadSha256}`);
  }
  if (inspection.missing.length > 0) {
    fail(`required upstream files missing: ${inspection.missing.join(", ")}`);
  }
  if (inspection.valid) {
    pass(`distribution ${IMPECCABLE_PIN.version}, ${inspection.fileCount} files, pinned payload digest`);
  }

  const marker = readJson(path.join(repositoryRoot, ...IMPECCABLE_INSTALL_MARKER.split("/")));
  if (!marker) {
    fail("local install provenance marker missing; run pnpm setup:impeccable");
    return;
  }
  for (const [key, expected] of Object.entries({
    repository: IMPECCABLE_PIN.repositoryId,
    tag: IMPECCABLE_PIN.tag,
    commit: IMPECCABLE_PIN.commit,
    version: IMPECCABLE_PIN.version,
    payloadSha256: IMPECCABLE_PIN.payloadSha256,
  })) {
    if (marker[key] !== expected) fail(`install marker ${key} does not match the repository pin`);
  }
  if (failures.length === 0) pass(`source pin ${IMPECCABLE_PIN.tag} -> ${IMPECCABLE_PIN.commit}`);
}

function verifyContexts() {
  const doctorPath = path.join(distributionRoot, "scripts", "doctor.mjs");
  for (const context of IMPECCABLE_CONTEXTS) {
    const root = path.join(repositoryRoot, ...context.split("/"));
    for (const relative of [
      "PRODUCT.md",
      "DESIGN.md",
      ".impeccable/config.json",
      ".impeccable/design.json",
    ]) {
      const target = path.join(root, ...relative.split("/"));
      if (!fs.existsSync(target)) fail(`${context}/${relative} missing`);
      if (relative.endsWith(".json") && fs.existsSync(target) && !readJson(target)) {
        fail(`${context}/${relative} is not valid JSON`);
      }
    }

    if (!fs.existsSync(doctorPath)) continue;
    const doctor = run(process.execPath, [doctorPath, "--json", "--target", context]);
    if (doctor.status !== 0 || doctor.error) {
      fail(`impeccable doctor failed for ${context}: ${doctor.stderr || doctor.error}`);
      continue;
    }
    let report;
    try { report = JSON.parse(doctor.stdout); } catch {
      fail(`impeccable doctor returned invalid JSON for ${context}`);
      continue;
    }
    if (!report.ruleRegistryAvailable) fail(`doctor rule registry unavailable for ${context}`);
    if (!Array.isArray(report.findings)) {
      fail(`doctor returned no findings array for ${context}`);
      continue;
    }
    const blockingFindings = report.findings.filter((finding) => finding?.severity !== "mention");
    const informationalFindings = report.findings.filter((finding) => finding?.severity === "mention");
    if (blockingFindings.length > 0) {
      fail(`doctor reported actionable drift for ${context}: ${JSON.stringify(blockingFindings)}`);
      continue;
    }
    for (const finding of informationalFindings) {
      warn(`doctor ${context}: ${finding.id} — ${finding.summary}`);
    }
    const resolved = path.resolve(report.projectRoot ?? "");
    if (resolved !== path.resolve(root)) {
      fail(`doctor resolved ${context} to ${resolved}`);
      continue;
    }
    pass(`context ${context}: PRODUCT, DESIGN, config, sidecar and doctor`);
  }
}

function verifyDispatcher() {
  const dispatcherPath = path.join(scriptDirectory, "hook-dispatcher.mjs");
  const hooksPath = path.join(repositoryRoot, ".codex", "hooks.json");
  if (!fs.existsSync(dispatcherPath)) fail("compatibility dispatcher missing");
  const manifest = readJson(hooksPath);
  if (!manifest) {
    fail(".codex/hooks.json missing or invalid");
    return;
  }

  for (const eventName of ["PostToolUse", "Stop"]) {
    const definitions = manifest?.hooks?.[eventName];
    const commands = Array.isArray(definitions)
      ? definitions.flatMap((definition) => definition?.hooks ?? [])
      : [];
    if (commands.length !== 1) {
      fail(`${eventName} must contain exactly one compatibility dispatcher command`);
      continue;
    }
    for (const key of ["command", "commandWindows"]) {
      const command = commands[0]?.[key];
      if (typeof command !== "string" || !command.includes("scripts/impeccable/hook-dispatcher.mjs")) {
        fail(`${eventName}.${key} does not point to the compatibility dispatcher`);
      }
      if (typeof command === "string" && command.includes(".agents/skills/impeccable/scripts/hook.mjs")) {
        fail(`${eventName}.${key} bypasses the compatibility dispatcher`);
      }
      if (typeof command === "string" && /[A-Z]:[\\/](?:Users|Qoovex)/i.test(command)) {
        fail(`${eventName}.${key} contains a machine-specific absolute path`);
      }
    }
  }

  if (UPSTREAM_HOOK_RELATIVE !== `${IMPECCABLE_PIN.sourceDirectory}/scripts/hook.mjs`) {
    fail("dispatcher upstream hook path is not derived from the pinned provider path");
  }
  if (UPSTREAM_HOOK_LIB_RELATIVE !== `${IMPECCABLE_PIN.sourceDirectory}/scripts/hook-lib.mjs`) {
    fail("dispatcher upstream hook library path is not derived from the pinned provider path");
  }

  const tests = run(process.execPath, ["--test", path.join(scriptDirectory, "hook-dispatcher.test.mjs")]);
  if (tests.status !== 0 || tests.error) {
    fail(`dispatcher regression tests failed:\n${tests.stdout}\n${tests.stderr}`.trim());
  } else {
    pass("dispatcher routing, backend exclusion, Stop selection and real upstream delegation tests");
  }
}

function verifyGovernance() {
  const agentsPath = path.join(repositoryRoot, "AGENTS.md");
  if (!fs.existsSync(agentsPath)) {
    fail("AGENTS.md missing");
    return;
  }
  const source = fs.readFileSync(agentsPath, "utf8");
  if (!/Impeccable obbligatorio per UI\/UX/i.test(source)) fail("AGENTS.md lacks mandatory UI/UX workflow");
  if (!/In caso di conflitto prevale Qoovex/i.test(source)) fail("AGENTS.md lacks Qoovex precedence");
  if (!/detector\/review Impeccable manuale/i.test(source)) fail("AGENTS.md lacks the manual fallback gate");
  if (failures.length === 0) pass("AGENTS.md mandatory workflow, Qoovex precedence and manual fallback");
}

function ignored(relativePath) {
  return run("git", ["check-ignore", "--quiet", "--no-index", relativePath]).status === 0;
}

function verifyGitHygiene() {
  const trackedDistribution = run("git", ["ls-files", "--", ".agents/skills/impeccable/**"]);
  if (trackedDistribution.stdout) fail(".agents/skills/impeccable contains tracked files");
  else pass("tool distribution is not tracked");

  const trackedLocal = run("git", [
    "ls-files",
    "--",
    "**/.impeccable/config.local.json",
    "**/.impeccable/hook.cache.json",
    "**/.impeccable/hook.pending.json",
    `${IMPECCABLE_DISPATCHER_STATE}/**`,
  ]);
  if (trackedLocal.stdout) fail(`machine-local or ephemeral files are tracked: ${trackedLocal.stdout}`);

  for (const localPath of [
    ".agents/skills/impeccable/SKILL.md",
    "apps/web/.impeccable/config.local.json",
    "apps/web/.impeccable/hook.cache.json",
    `${IMPECCABLE_DISPATCHER_STATE}/test-session.json`,
  ]) {
    if (!ignored(localPath)) fail(`${localPath} is not ignored`);
  }

  for (const sharedPath of [
    ".codex/hooks.json",
    "apps/workspace/.impeccable/config.json",
    "apps/workspace/.impeccable/design.json",
    "apps/web/.impeccable/config.json",
    "apps/sirio/.impeccable/config.json",
    "packages/ui/.impeccable/config.json",
  ]) {
    if (ignored(sharedPath)) fail(`${sharedPath} is incorrectly ignored`);
  }
  if (!failures.some((message) => message.includes("ignored") || message.includes("tracked"))) {
    pass("shared artifacts visible to Git; distribution and local state ignored");
  }
}

verifyDistribution();
verifyContexts();
verifyDispatcher();
verifyGovernance();
verifyGitHygiene();

for (const message of passes) process.stdout.write(`PASS ${message}\n`);
for (const message of warnings) process.stdout.write(`WARN ${message}\n`);
for (const message of failures) process.stderr.write(`FAIL ${message}\n`);

if (failures.length > 0) {
  process.stderr.write("repository integration: FAIL\n");
  process.exitCode = 1;
} else {
  process.stdout.write("repository integration: PASS\n");
}
// Codex owns hook trust locally; `/hooks` is the source of truth for Installed/Active.
// A new or changed manifest can require another local review.
process.stdout.write("local hook trust: MANUAL CHECK (/hooks)\n");
