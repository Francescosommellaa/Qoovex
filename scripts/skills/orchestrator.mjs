import { loadRegistry } from "./registry.mjs";
import { routeTask } from "./router.mjs";
import { readState, removeState, writeState } from "./runtime-state.mjs";

export function createPlan(classification) {
  return routeTask(loadRegistry(), classification);
}

export function startSession(sessionId, classification) {
  const plan = createPlan(classification);
  return writeState(sessionId, { classification, ...plan, acknowledged: [], completedGates: [], violations: [] });
}

export function acknowledgeSkill(sessionId, skillId) {
  const state = readState(sessionId);
  if (state.forbidden.includes(skillId)) state.violations.push(`forbidden skill acknowledged: ${skillId}`);
  if (!state.acknowledged.includes(skillId)) state.acknowledged.push(skillId);
  return writeState(sessionId, state);
}

export function completeGate(sessionId, gate) {
  const state = readState(sessionId);
  if (!state.gates.includes(gate)) state.violations.push(`unknown gate completed: ${gate}`);
  if (!state.completedGates.includes(gate)) state.completedGates.push(gate);
  return writeState(sessionId, state);
}

export function verifyCompletion(sessionId) {
  const state = readState(sessionId);
  const missingSkills = state.required.filter((id) => !state.acknowledged.includes(id));
  const missingGates = state.gates.filter((gate) => !state.completedGates.includes(gate));
  const errors = [...state.violations, ...missingSkills.map((id) => `missing required skill: ${id}`), ...missingGates.map((gate) => `missing gate: ${gate}`)];
  return { ok: errors.length === 0, errors, state };
}

export function runCanary() {
  const scenarios = [
    { ui: false, backend: true },
    { ui: true },
    { ui: true, singleComponent: true },
    { ui: true, motion: true, specialistEscalation: true },
  ];
  for (const classification of scenarios) {
    const plan = createPlan(classification);
    if (classification.ui && plan.required[0] !== "impeccable") throw new Error("UI canary lost Impeccable precedence");
    if (!classification.ui && plan.required.length !== 0) throw new Error("backend canary routed UI skills");
  }
  return true;
}

async function main() {
  const [command, sessionId = "manual", payload = "{}"] = process.argv.slice(2);
  if (!command) return;
  if (command === "route") process.stdout.write(`${JSON.stringify(startSession(sessionId, JSON.parse(payload)), null, 2)}\n`);
  else if (command === "ack") process.stdout.write(`${JSON.stringify(acknowledgeSkill(sessionId, payload), null, 2)}\n`);
  else if (command === "gate") process.stdout.write(`${JSON.stringify(completeGate(sessionId, payload), null, 2)}\n`);
  else if (command === "complete") {
    const result = verifyCompletion(sessionId);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    if (!result.ok) process.exitCode = 1;
    else removeState(sessionId);
  } else if (command === "canary") {
    runCanary();
    process.stdout.write("skill canary: PASS\n");
  } else throw new Error(`unknown orchestrator command: ${command}`);
}

await main();
