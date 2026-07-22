import assert from "node:assert/strict";
import test from "node:test";
import {
  assertProductionFixtureCandidate,
  getFixtureReasons,
  maskFixtureEmail,
} from "./fixture-target";

test("recognizes an explicitly labeled E2E organization with fixture-only members", () => {
  const reasons = assertProductionFixtureCandidate({
    code: "QVX-EXAMPLE",
    name: "Qoovex E2E 123",
    memberEmails: ["owner@qoovex.local"],
  });

  assert.deepEqual(reasons, ["fixture-label", "all-member-emails-are-fixtures"]);
});

test("refuses production cleanup when any member email is not a fixture", () => {
  assert.throws(
    () => assertProductionFixtureCandidate({
      code: "QVX-EXAMPLE",
      name: "Qoovex E2E 123",
      memberEmails: ["owner@qoovex.local", "persona@example.com"],
    }),
    /every member must use a fixture email domain/,
  );
});

test("refuses production cleanup without an explicit fixture label or known code", () => {
  assert.throws(
    () => assertProductionFixtureCandidate({
      code: "QVX-REAL",
      name: "Azienda Reale",
      memberEmails: ["owner@qoovex.local"],
    }),
    /no explicit fixture label/,
  );
});

test("reports weak candidates for inventory without authorizing cleanup", () => {
  assert.deepEqual(
    getFixtureReasons({
      code: "QVX-REAL",
      name: "Azienda Reale",
      memberEmails: ["owner@qoovex.local"],
    }),
    ["all-member-emails-are-fixtures"],
  );
  assert.equal(maskFixtureEmail("owner@qoovex.local"), "o***@qoovex.local");
});
