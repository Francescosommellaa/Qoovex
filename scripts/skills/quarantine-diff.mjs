import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { repositoryRoot } from "./registry.mjs";

const [baseRef, candidateRef, reason = "governance-or-ci-failure"] = process.argv.slice(2);
if (!baseRef || !candidateRef) {
  process.stderr.write("Usage: node scripts/skills/quarantine-diff.mjs <base-ref> <candidate-ref> [reason]\n");
  process.exitCode = 2;
} else {
  const show = (ref) => {
    const result = spawnSync("git", ["show", `${ref}:config/skills/registry.json`], { cwd: repositoryRoot, encoding: "utf8" });
    if (result.status !== 0) throw new Error(`cannot read registry at ${ref}`);
    return JSON.parse(result.stdout);
  };
  const base = show(baseRef);
  const candidate = show(candidateRef);
  const quarantinePath = path.join(repositoryRoot, "config", "skills", "quarantine.json");
  const quarantine = JSON.parse(fs.readFileSync(quarantinePath, "utf8"));
  const providerById = { impeccable: "impeccable", "ui-skills-root": "ui-skills" };
  for (const nextSkill of candidate.skills) {
    const previous = base.skills.find((skill) => skill.id === nextSkill.id);
    if (!previous || previous.version === nextSkill.version || !providerById[nextSkill.id]) continue;
    const entry = { provider: providerById[nextSkill.id], version: nextSkill.version, reason };
    if (!quarantine.candidates.some((item) => item.provider === entry.provider && item.version === entry.version)) quarantine.candidates.push(entry);
  }
  quarantine.candidates.sort((a, b) => `${a.provider}@${a.version}`.localeCompare(`${b.provider}@${b.version}`, "en"));
  fs.writeFileSync(quarantinePath, `${JSON.stringify(quarantine, null, 2)}\n`, "utf8");
  process.stdout.write(`QUARANTINE ${quarantine.candidates.length} candidate entries\n`);
}
