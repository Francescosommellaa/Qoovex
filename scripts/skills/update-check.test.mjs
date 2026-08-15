import test from "node:test";
import assert from "node:assert/strict";

import { compareVersions, updateRegistryVersions } from "./update-check.mjs";
import { loadRegistry } from "./registry.mjs";

test("semantic version comparison is deterministic for governed providers", () => {
  assert.equal(compareVersions("4.1.2", "4.1.1") > 0, true);
  assert.equal(compareVersions("0.2.4", "0.2.4"), 0);
  assert.equal(compareVersions("1.0.0", "2.0.0") < 0, true);
});

test("registry candidate update changes only requested governed versions", () => {
  const registry = loadRegistry();
  const beforeMotion = registry.skills.find((skill) => skill.id === "qoovex-ux-motion").version;
  const next = updateRegistryVersions(registry, { "ui-skills-root": "9.9.9" });
  assert.equal(next.skills.find((skill) => skill.id === "ui-skills-root").version, "9.9.9");
  assert.equal(next.skills.find((skill) => skill.id === "qoovex-ux-motion").version, beforeMotion);
  assert.notEqual(next, registry);
});
