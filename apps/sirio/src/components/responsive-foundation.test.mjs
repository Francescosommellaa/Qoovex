import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const page = readFileSync(
  new URL("../app/(catalog)/foundations/responsive/page.tsx", import.meta.url),
  "utf8",
);
const proof = readFileSync(new URL("./responsive-contract-proof.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("./responsive-contract-proof.module.css", import.meta.url), "utf8");

test("Sirio proves the canonical matrix and container independence with one component", () => {
  for (const contract of [
    "[320, 390, 768, 1024, 1440]",
    'data-responsive-host="narrow"',
    'data-responsive-host="complex"',
    "ResponsiveContractProof",
    "ResponsiveSafeAreaProof",
  ]) {
    assert.ok(page.includes(contract), `responsive proof must contain ${contract}`);
  }
  assert.equal((proof.match(/data-responsive-component/g) ?? []).length, 1);
});

test("the proof uses a local container query and never animates browser resize", () => {
  assert.match(styles, /container-type:\s*inline-size/);
  assert.match(styles, /@container qoovex-responsive-proof \(min-width: 34rem\)/);
  assert.match(styles, /min-width:\s*0/);
  assert.match(styles, /overflow-wrap:\s*anywhere/);
  assert.doesNotMatch(styles, /@media|transition|animation/);
  assert.doesNotMatch(proof, /motion\/react|matchMedia|useIsMobile|innerWidth/);
});
