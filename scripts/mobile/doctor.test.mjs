import assert from "node:assert/strict";
import test from "node:test";

import { validateGateIntegration } from "./doctor.mjs";

const packageJson = {
  scripts: {
    "mobile:contract": "node scripts/mobile/contract.mjs",
    "mobile:doctor": "node scripts/mobile/doctor.mjs",
    "mobile:test": "node scripts/mobile/run-playwright.mjs",
  },
};

const workflow = `
jobs:
  mobile-responsive:
    steps:
      - run: pnpm mobile:doctor
      - run: pnpm mobile:test
`;

test("accepts the independent doctor-before-browser CI wiring", () => {
  assert.deepEqual(validateGateIntegration(packageJson, workflow), []);
});

test("reports each missing command with an actionable recovery", () => {
  const findings = validateGateIntegration({ scripts: {} }, "jobs: {}\n");

  assert.deepEqual(
    findings.map(({ rule }) => findingRule(rule)),
    [
      "package-mobile-contract",
      "package-mobile-doctor",
      "package-mobile-test",
      "ci-mobile-responsive-job",
      "ci-mobile-doctor-first",
      "ci-mobile-test",
    ],
  );
  assert.equal(findings.every(({ recovery }) => recovery.length > 10), true);
});

test("rejects a CI job that starts Playwright before the deterministic doctor", () => {
  const findings = validateGateIntegration(
    packageJson,
    workflow.replace(
      "- run: pnpm mobile:doctor\n      - run: pnpm mobile:test",
      "- run: pnpm mobile:test\n      - run: pnpm mobile:doctor",
    ),
  );

  assert.deepEqual(findings.map(({ rule }) => findingRule(rule)), [
    "ci-mobile-doctor-first",
  ]);
});

function findingRule(rule) {
  return rule;
}
