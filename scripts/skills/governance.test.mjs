import test from "node:test";
import assert from "node:assert/strict";

import { loadRegistry, validateRegistry } from "./registry.mjs";
import { routeTask } from "./router.mjs";

const registry = loadRegistry();

test("registry has one owner per primary responsibility and an acyclic graph", () => {
  const result = validateRegistry(registry);
  assert.deepEqual(result.errors, []);
});

test("backend tasks do not route UI skills", () => {
  const plan = routeTask(registry, { ui: false, backend: true });
  assert.deepEqual(plan.required, []);
  assert.equal(plan.forbidden.includes("impeccable"), true);
});

test("ordinary UI requires Impeccable but not motion", () => {
  const plan = routeTask(registry, { ui: true });
  assert.deepEqual(plan.required, ["impeccable"]);
  assert.equal(plan.required.includes("qoovex-ux-motion"), false);
});

test("single component routes component creator after Impeccable", () => {
  const plan = routeTask(registry, { ui: true, singleComponent: true });
  assert.deepEqual(plan.required, ["impeccable", "qoovex-component-creator"]);
});

test("motion routes in canonical order and keeps UI Skills optional", () => {
  const plan = routeTask(registry, { ui: true, motion: true, specialistEscalation: true });
  assert.deepEqual(plan.required, ["impeccable", "qoovex-ux-motion"]);
  assert.deepEqual(plan.optional, ["ui-skills-root"]);
});
