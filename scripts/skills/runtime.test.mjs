import test from "node:test";
import assert from "node:assert/strict";

import { acknowledgeSkill, completeGate, runCanary, startSession, verifyCompletion } from "./orchestrator.mjs";
import { removeState } from "./runtime-state.mjs";

test("runtime completion fails closed until required skill and gates are acknowledged", () => {
  const id = `test-${Date.now()}`;
  startSession(id, { ui: true, motion: true });
  let result = verifyCompletion(id);
  assert.equal(result.ok, false);
  assert.equal(result.errors.includes("missing required skill: impeccable"), true);
  acknowledgeSkill(id, "impeccable");
  acknowledgeSkill(id, "qoovex-ux-motion");
  completeGate(id, "impeccable-review");
  completeGate(id, "qoovex-gates");
  result = verifyCompletion(id);
  assert.equal(result.ok, true);
  removeState(id);
});

test("forbidden skill acknowledgement becomes a violation", () => {
  const id = `test-${Date.now()}-forbidden`;
  startSession(id, { ui: false, backend: true });
  acknowledgeSkill(id, "impeccable");
  const result = verifyCompletion(id);
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /forbidden skill acknowledged/);
  removeState(id);
});

test("canary preserves core routing invariants", () => {
  assert.equal(runCanary(), true);
});
