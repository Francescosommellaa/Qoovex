import fs from "node:fs";
import path from "node:path";

import { repositoryRoot } from "./registry.mjs";

const stateRoot = path.join(repositoryRoot, ".codex-runtime", "skill-governance");
const safeId = (value) => String(value ?? "default").replace(/[^a-zA-Z0-9._-]/g, "_");

export function statePath(sessionId) {
  return path.join(stateRoot, `${safeId(sessionId)}.json`);
}

export function writeState(sessionId, state) {
  fs.mkdirSync(stateRoot, { recursive: true });
  const sanitized = {
    schemaVersion: 1,
    sessionId: safeId(sessionId),
    classification: state.classification ?? {},
    required: [...(state.required ?? [])],
    optional: [...(state.optional ?? [])],
    forbidden: [...(state.forbidden ?? [])],
    acknowledged: [...(state.acknowledged ?? [])],
    gates: [...(state.gates ?? [])],
    completedGates: [...(state.completedGates ?? [])],
    violations: [...(state.violations ?? [])],
  };
  fs.writeFileSync(statePath(sessionId), `${JSON.stringify(sanitized, null, 2)}\n`, "utf8");
  return sanitized;
}

export function readState(sessionId) {
  return JSON.parse(fs.readFileSync(statePath(sessionId), "utf8"));
}

export function removeState(sessionId) {
  fs.rmSync(statePath(sessionId), { force: true });
}
