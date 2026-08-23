import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const design = readFileSync(new URL("../../DESIGN.md", import.meta.url), "utf8");
const readme = readFileSync(new URL("../../README.md", import.meta.url), "utf8");
const useMobile = readFileSync(new URL("../hooks/use-mobile.ts", import.meta.url), "utf8");
const tokens = readFileSync(new URL("../../styles/tokens.css", import.meta.url), "utf8");
const mobileContract = JSON.parse(
  readFileSync(new URL("../../../../config/mobile-experience.json", import.meta.url), "utf8"),
);

test("the responsive matrix remains QA coverage rather than five breakpoints", () => {
  assert.deepEqual(
    mobileContract.viewports.map(({ width }) => width),
    [320, 390, 768, 1024, 1440],
  );
  for (const contract of [
    "intrinsic",
    "container query",
    "media query",
    "stesso componente",
    "feature availability",
  ]) {
    assert.ok(design.toLowerCase().includes(contract), `responsive contract must contain ${contract}`);
  }
  assert.match(readme, /matrice di prova, non una scala di breakpoint/i);
});

test("the Sidebar behavior observer follows matchMedia without inferring a device", () => {
  assert.match(useMobile, /useSyncExternalStore/);
  assert.match(useMobile, /matchMedia\(MOBILE_MEDIA_QUERY\)\.matches/);
  assert.match(useMobile, /addEventListener\("change"/);
  assert.doesNotMatch(useMobile, /innerWidth|userAgent|pointer|hover|touch/i);
});

test("safe-area environment values have one shared source", () => {
  for (const edge of ["top", "right", "bottom", "left"]) {
    assert.match(tokens, new RegExp(`--safe-area-${edge}: env\\(safe-area-inset-${edge}, 0px\\)`));
  }
});
