import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { hashPayload, readSkillVersion } from "../impeccable/payload.mjs";
import { loadRegistry, registryPath, repositoryRoot } from "./registry.mjs";

export function compareVersions(left, right) {
  const a = String(left).split(".").map((value) => Number.parseInt(value, 10) || 0);
  const b = String(right).split(".").map((value) => Number.parseInt(value, 10) || 0);
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    if ((a[index] ?? 0) !== (b[index] ?? 0)) return (a[index] ?? 0) - (b[index] ?? 0);
  }
  return 0;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: options.cwd ?? repositoryRoot, encoding: "utf8", stdio: "pipe", windowsHide: true });
  if (result.error || result.status !== 0) throw new Error(`${command} ${args.join(" ")} failed: ${result.stderr || result.error}`);
  return result.stdout.trim();
}

function readQuarantine() {
  const file = path.join(repositoryRoot, "config", "skills", "quarantine.json");
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function quarantined(provider, version) {
  return readQuarantine().candidates.some((candidate) => candidate.provider === provider && candidate.version === version);
}

function latestImpeccableTag(repository) {
  const lines = run("git", ["ls-remote", "--refs", "--tags", repository]).split(/\r?\n/).filter(Boolean);
  const tags = lines.map((line) => line.split(/\s+/)[1]?.replace("refs/tags/skill-v", "")).filter((value) => /^\d+\.\d+\.\d+$/.test(value));
  return tags.sort(compareVersions).at(-1) ?? null;
}

function inspectImpeccableCandidate(version, repository) {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "qoovex-impeccable-candidate-"));
  try {
    run("git", ["init", "--quiet"], { cwd: temp });
    run("git", ["remote", "add", "origin", repository], { cwd: temp });
    const tag = `skill-v${version}`;
    run("git", ["fetch", "--quiet", "--depth", "1", "origin", `refs/tags/${tag}:refs/tags/${tag}`], { cwd: temp });
    const commit = run("git", ["rev-parse", `refs/tags/${tag}^{commit}`], { cwd: temp });
    run("git", ["checkout", "--quiet", "--detach", commit], { cwd: temp });
    const payloadRoot = path.join(temp, ".agents", "skills", "impeccable");
    const digest = hashPayload(payloadRoot);
    const payloadVersion = readSkillVersion(payloadRoot);
    if (!digest || payloadVersion !== version) throw new Error(`candidate payload identity mismatch for ${tag}`);
    return { version, tag, commit, payloadSha256: digest.sha256 };
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
}

function replaceImpeccableConfig(candidate) {
  const file = path.join(repositoryRoot, "scripts", "impeccable", "config.mjs");
  let source = fs.readFileSync(file, "utf8");
  source = source.replace(/version: "[^"]+"/, `version: "${candidate.version}"`)
    .replace(/tag: "[^"]+"/, `tag: "${candidate.tag}"`)
    .replace(/commit: "[a-f0-9]+"/, `commit: "${candidate.commit}"`)
    .replace(/payloadSha256: "[a-f0-9]+"/, `payloadSha256: "${candidate.payloadSha256}"`);
  fs.writeFileSync(file, source, "utf8");
}

function replaceUiSkillsPackageVersion(oldVersion, newVersion) {
  const file = path.join(repositoryRoot, "package.json");
  const source = fs.readFileSync(file, "utf8").replaceAll(`ui-skills@${oldVersion}`, `ui-skills@${newVersion}`);
  fs.writeFileSync(file, source, "utf8");
}

export function updateRegistryVersions(registry, changes) {
  const next = structuredClone(registry);
  for (const [id, version] of Object.entries(changes)) {
    const skill = next.skills.find((entry) => entry.id === id);
    if (!skill) throw new Error(`unknown governed skill ${id}`);
    skill.version = version;
  }
  return next;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const registry = loadRegistry();
  const changes = {};
  const reports = [];

  const ui = registry.skills.find((skill) => skill.id === "ui-skills-root");
  const latestUi = JSON.parse(run("npm", ["view", "ui-skills", "version", "--json"]));
  if (compareVersions(latestUi, ui.version) > 0) {
    if (quarantined("ui-skills", latestUi)) reports.push(`QUARANTINED ui-skills ${latestUi}`);
    else { changes[ui.id] = latestUi; reports.push(`UPDATE ui-skills ${ui.version} -> ${latestUi}`); }
  } else reports.push(`CURRENT ui-skills ${ui.version}`);

  const impeccable = registry.skills.find((skill) => skill.id === "impeccable");
  const repository = "https://github.com/pbakaus/impeccable.git";
  const latestImpeccable = latestImpeccableTag(repository);
  let impeccableCandidate = null;
  if (latestImpeccable && compareVersions(latestImpeccable, impeccable.version) > 0) {
    if (quarantined("impeccable", latestImpeccable)) reports.push(`QUARANTINED impeccable ${latestImpeccable}`);
    else {
      impeccableCandidate = inspectImpeccableCandidate(latestImpeccable, repository);
      changes[impeccable.id] = latestImpeccable;
      reports.push(`UPDATE impeccable ${impeccable.version} -> ${latestImpeccable} @ ${impeccableCandidate.commit}`);
    }
  } else reports.push(`CURRENT impeccable ${impeccable.version}`);

  for (const report of reports) process.stdout.write(`${report}\n`);
  if (!apply || Object.keys(changes).length === 0) return;

  const updated = updateRegistryVersions(registry, changes);
  fs.writeFileSync(registryPath, `${JSON.stringify(updated, null, 2)}\n`, "utf8");
  if (changes[ui.id]) replaceUiSkillsPackageVersion(ui.version, changes[ui.id]);
  if (impeccableCandidate) replaceImpeccableConfig(impeccableCandidate);
  process.stdout.write(`APPLIED ${Object.keys(changes).join(", ")}\n`);
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  main().catch((error) => { process.stderr.write(`skills:update:check: FAIL — ${error.message}\n`); process.exitCode = 1; });
}
