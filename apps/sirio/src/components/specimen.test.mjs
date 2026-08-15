import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const specimenSource = readFileSync(new URL("./specimen.tsx", import.meta.url), "utf8");
const catalogLayoutSource = readFileSync(new URL("../app/(catalog)/layout.tsx", import.meta.url), "utf8");

test("Specimen exposes an intentional visual identifier", () => {
  assert.match(specimenSource, /visualId\?: string/);
  assert.match(specimenSource, /data-visual-specimen=\{visualId\}/);
});

test("the catalog exposes a stable visual surface root", () => {
  assert.match(catalogLayoutSource, /data-visual-surface="sirio-catalog"/);
});
