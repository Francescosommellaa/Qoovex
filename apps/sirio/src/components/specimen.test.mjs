import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const specimenSource = readFileSync(new URL("./specimen.tsx", import.meta.url), "utf8");
const catalogLayoutSource = readFileSync(new URL("../app/(catalog)/layout.tsx", import.meta.url), "utf8");
const buttonPageSource = readFileSync(
  new URL("../app/(catalog)/components/button/page.tsx", import.meta.url),
  "utf8",
);

test("Specimen keeps visual geometry and deterministic state identifiers separate", () => {
  assert.match(specimenSource, /visualId\?: string/);
  assert.match(specimenSource, /data-visual-specimen=\{visualId\}/);
  assert.match(specimenSource, /stateId\?: string/);
  assert.match(specimenSource, /data-specimen-state=\{stateId\}/);
  assert.doesNotMatch(specimenSource, /data-testid/);
});

test("SpecimenSection exposes semantic, labelled proof regions", () => {
  for (const region of [
    "overview",
    "variants",
    "sizes",
    "persistent-states",
    "interaction-states",
    "high-risk-combinations",
    "content-stress",
    "responsive",
    "themes",
    "motion-final",
    "motion-lifecycle",
  ]) {
    assert.match(specimenSource, new RegExp(`\\| "${region}"`));
  }

  assert.match(specimenSource, /aria-labelledby=\{titleId\}/);
  assert.match(specimenSource, /data-specimen-region=\{region\}/);
});

test("a component page composes the shared specimen contract without changing component APIs", () => {
  assert.match(buttonPageSource, /SpecimenSection region="variants"/);
  assert.match(buttonPageSource, /SpecimenSection[\s\S]*region="sizes"/);
  assert.match(buttonPageSource, /SpecimenSection[\s\S]*region="motion-lifecycle"/);
  assert.match(buttonPageSource, /stateId="default" visualId="button-default"/);
  assert.match(buttonPageSource, /stateId="disabled" visualId="button-disabled"/);
});

test("the catalog exposes a stable visual surface root", () => {
  assert.match(catalogLayoutSource, /data-visual-surface="sirio-catalog"/);
});
