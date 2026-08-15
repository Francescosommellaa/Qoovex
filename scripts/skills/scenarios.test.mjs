import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

import { loadRegistry } from "./registry.mjs";
import { routeTask } from "./router.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const scenarios = JSON.parse(fs.readFileSync(path.join(here, "scenarios", "core.json"), "utf8"));
const registry = loadRegistry();

for (const scenario of scenarios) {
  test(`routing scenario: ${scenario.name}`, () => {
    const plan = routeTask(registry, scenario.classification);
    assert.deepEqual(plan.required, scenario.required);
    assert.deepEqual(plan.optional, scenario.optional ?? []);
    for (const forbidden of scenario.forbidden ?? []) assert.equal(plan.forbidden.includes(forbidden), true, `${forbidden} must be forbidden`);
    assert.equal(plan.gates.includes("qoovex-gates"), true);
    assert.equal(plan.gates.includes("impeccable-review"), Boolean(scenario.classification.ui));
  });
}
