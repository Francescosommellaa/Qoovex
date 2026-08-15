import fs from "node:fs";
import path from "node:path";

import { loadRegistry, repositoryRoot } from "./registry.mjs";

const destination = process.argv[2];
if (!destination) {
  process.stderr.write("Usage: pnpm skills:sync -- <explicit-destination>\n");
  process.exitCode = 2;
} else {
  const targetRoot = path.resolve(destination);
  const registry = loadRegistry();
  for (const skill of registry.skills.filter((entry) => entry.kind === "repository-owned" || entry.kind === "external-router")) {
    const source = path.join(repositoryRoot, ...path.dirname(skill.localPath).split("/"));
    const target = path.join(targetRoot, skill.id);
    if (!fs.existsSync(source)) throw new Error(`${skill.id}: repository source missing`);
    fs.rmSync(target, { recursive: true, force: true });
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.cpSync(source, target, { recursive: true });
    process.stdout.write(`SYNC ${skill.id} -> ${target}\n`);
  }
}
