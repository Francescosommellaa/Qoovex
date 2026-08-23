import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const page = readFileSync(
  new URL("../app/(catalog)/foundations/typography/page.tsx", import.meta.url),
  "utf8",
);

test("Sirio proves every canonical typography role and both font families", () => {
  for (const value of [
    "data-typography-foundation",
    'id: "display"',
    'id: "headline"',
    'id: "title"',
    'id: "body"',
    'id: "compact-control"',
    'id: "label-metadata"',
    'data-font-proof="general-sans"',
    'data-font-proof="array"',
    'data-font-proof="fallback"',
  ]) {
    assert.ok(page.includes(value), `typography proof must contain ${value}`);
  }
});

test("Sirio includes numeric, hostile-string, wrap, and recoverable truncation proofs", () => {
  for (const value of [
    'data-typography-proof="numbers"',
    'data-typography-proof="hostile-strings"',
    'data-typography-proof="wrap"',
    'data-typography-proof="intentional-truncation"',
    "tabular-nums",
    "overflow-wrap:anywhere",
    "Mostra il valore completo",
    "€ 1.250,00",
    "€ 125.000,50",
    "22/08/2026",
    "14:07",
  ]) {
    assert.ok(page.includes(value), `typography proof must contain ${value}`);
  }
  assert.doesNotMatch(page, /break-all/);
  assert.doesNotMatch(page, /from ["']motion\/react["']/);
});
