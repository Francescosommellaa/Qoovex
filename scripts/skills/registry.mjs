import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const repositoryRoot = path.resolve(here, "..", "..");
export const registryPath = path.join(repositoryRoot, "config", "skills", "registry.json");

export function loadRegistry(filePath = registryPath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function detectCycles(skills) {
  const graph = new Map(skills.map((skill) => [skill.id, new Set([...(skill.requires ?? []), ...(skill.runsAfter ?? [])])]));
  const visiting = new Set();
  const visited = new Set();
  const cycles = [];
  function visit(id, trail = []) {
    if (visiting.has(id)) { cycles.push([...trail, id].join(" -> ")); return; }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dependency of graph.get(id) ?? []) if (graph.has(dependency)) visit(dependency, [...trail, id]);
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of graph.keys()) visit(id);
  return cycles;
}

export function validateRegistry(registry) {
  const errors = [];
  const warnings = [];
  if (registry?.schemaVersion !== 1 || !Array.isArray(registry?.skills)) {
    return { errors: ["registry must use schemaVersion 1 and contain skills[]"], warnings };
  }
  const ids = new Set();
  const owners = new Map();
  for (const skill of registry.skills) {
    if (!skill?.id || ids.has(skill.id)) errors.push(`duplicate or missing skill id: ${skill?.id ?? "<missing>"}`);
    ids.add(skill.id);
    if (!skill.localPath || !skill.kind || !skill.role) errors.push(`${skill.id}: kind, role and localPath are required`);
    for (const responsibility of skill.primaryResponsibilities ?? []) {
      if (owners.has(responsibility)) errors.push(`primary responsibility collision: ${responsibility} owned by ${owners.get(responsibility)} and ${skill.id}`);
      else owners.set(responsibility, skill.id);
    }
  }
  for (const skill of registry.skills) {
    for (const dependency of [...(skill.requires ?? []), ...(skill.runsBefore ?? []), ...(skill.runsAfter ?? []), ...(skill.mayDelegateTo ?? [])]) {
      if (!ids.has(dependency)) errors.push(`${skill.id}: unknown skill reference ${dependency}`);
    }
  }
  for (const cycle of detectCycles(registry.skills)) errors.push(`dependency cycle: ${cycle}`);
  const impeccableProviders = registry.skills.filter((skill) => skill.id === "impeccable" || skill.role === "general-ui-quality");
  if (impeccableProviders.length !== 1) errors.push(`exactly one general UI quality owner is required; found ${impeccableProviders.length}`);
  if (registry.skills.some((skill) => skill.id === "ui-skills-impeccable")) errors.push("UI Skills duplicate of Impeccable is forbidden");
  return { errors: [...new Set(errors)], warnings };
}

export function existingLocalSkillPaths(registry) {
  return registry.skills.filter((skill) => skill.kind !== "pinned-external").map((skill) => ({
    id: skill.id,
    path: path.join(repositoryRoot, ...skill.localPath.split("/")),
  }));
}
