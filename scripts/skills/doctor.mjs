import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { existingLocalSkillPaths, loadRegistry, repositoryRoot, validateRegistry } from "./registry.mjs";

const ci = process.argv.includes("--ci");
const failures = [];
const warnings = [];
const passes = [];
const pass = (message) => passes.push(message);
const fail = (message) => failures.push(message);
const warn = (message) => warnings.push(message);

const registry = loadRegistry();
const validation = validateRegistry(registry);
for (const error of validation.errors) fail(error);
for (const warning of validation.warnings) warn(warning);
if (validation.errors.length === 0) pass("registry schema, ownership and dependency graph");

for (const entry of existingLocalSkillPaths(registry)) {
  if (!fs.existsSync(entry.path)) fail(`${entry.id}: missing ${path.relative(repositoryRoot, entry.path)}`);
  else pass(`${entry.id}: repository skill present`);
}

const packageJson = JSON.parse(fs.readFileSync(path.join(repositoryRoot, "package.json"), "utf8"));
const uiSkills = registry.skills.find((skill) => skill.id === "ui-skills-root");
for (const command of ["ui-skills:start", "ui-skills:categories", "ui-skills:list", "ui-skills:get"]) {
  const script = packageJson.scripts?.[command] ?? "";
  if (!script.includes(`ui-skills@${uiSkills.version}`)) fail(`${command}: expected ui-skills@${uiSkills.version}`);
}
if (!failures.some((message) => message.startsWith("ui-skills:"))) pass(`UI Skills CLI pin ${uiSkills.version}`);

const impeccable = registry.skills.find((skill) => skill.id === "impeccable");
const impeccableConfig = fs.readFileSync(path.join(repositoryRoot, "scripts", "impeccable", "config.mjs"), "utf8");
const configVersion = impeccableConfig.match(/version: "([^"]+)"/)?.[1];
const configTag = impeccableConfig.match(/tag: "([^"]+)"/)?.[1];
if (configVersion !== impeccable.version) fail(`Impeccable registry/config drift: ${impeccable.version} != ${configVersion ?? "missing"}`);
if (configTag !== `skill-v${impeccable.version}`) fail(`Impeccable tag drift: expected skill-v${impeccable.version}, found ${configTag ?? "missing"}`);
else pass(`Impeccable repository pin ${configTag}`);

const agents = fs.readFileSync(path.join(repositoryRoot, "AGENTS.md"), "utf8");
if (!agents.includes("Skill Governance System")) fail("AGENTS.md lost Skill Governance System contract");
if (!agents.includes("config/skills/registry.json")) fail("AGENTS.md lost canonical skill registry reference");
if (!agents.includes("Impeccable obbligatorio per UI/UX")) fail("AGENTS.md lost mandatory Impeccable routing");
if (!agents.includes("qoovex-ux-motion")) fail("AGENTS.md lost motion specialist routing");
if (!agents.includes("UI Skills specialist routing")) fail("AGENTS.md lost UI Skills specialist routing");
if (!agents.includes("In caso di conflitto prevale Qoovex")) fail("AGENTS.md lost Qoovex precedence");
if (!failures.some((message) => message.startsWith("AGENTS.md"))) pass("AGENTS routing and governance contract");

const qualityDoc = fs.readFileSync(path.join(repositoryRoot, "docs", "07_QUALITY_AND_RELEASE.md"), "utf8");
for (const required of ["Skill governance gate", "Automatic skill updates", `skill-v${impeccable.version}`, `ui-skills@${uiSkills.version}`]) {
  if (!qualityDoc.includes(required)) fail(`quality/release governance drift: missing ${required}`);
}
if (!failures.some((message) => message.startsWith("quality/release"))) pass("quality/release skill governance contract");

const quarantine = JSON.parse(fs.readFileSync(path.join(repositoryRoot, "config", "skills", "quarantine.json"), "utf8"));
if (quarantine.schemaVersion !== 1 || !Array.isArray(quarantine.candidates)) fail("quarantine registry invalid");
else pass(`quarantine registry: ${quarantine.candidates.length} blocked candidates`);

if (!ci) {
  const result = spawnSync("pnpm", ["verify:impeccable"], { cwd: repositoryRoot, encoding: "utf8", shell: process.platform === "win32" });
  if (result.status !== 0) fail("Impeccable local verification failed; run pnpm setup:impeccable first");
  else pass("Impeccable local verification");
} else {
  warn("CI verifies the repository Impeccable contract only; machine-local ignored distribution is verified by pnpm verify:impeccable at runtime");
}

for (const message of passes) process.stdout.write(`PASS ${message}\n`);
for (const message of warnings) process.stdout.write(`WARN ${message}\n`);
for (const message of failures) process.stderr.write(`FAIL ${message}\n`);
process.stdout.write(`skill orchestration: ${failures.length === 0 ? "PASS" : "FAIL"}\n`);
if (failures.length) process.exitCode = 1;
