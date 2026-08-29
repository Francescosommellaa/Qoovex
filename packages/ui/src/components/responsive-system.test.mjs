import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const design = readFileSync(new URL("../../DESIGN.md", import.meta.url), "utf8");
const readme = readFileSync(new URL("../../README.md", import.meta.url), "utf8");
const useMobile = readFileSync(new URL("../hooks/use-mobile.ts", import.meta.url), "utf8");
const tokens = readFileSync(new URL("../../styles/tokens.css", import.meta.url), "utf8");
const base = readFileSync(new URL("../../styles/base.css", import.meta.url), "utf8");
const indicator = readFileSync(new URL("./sliding-indicator.tsx", import.meta.url), "utf8");

test("sliding hover geometry follows items inside a scrolled popup", () => {
  assert.match(indicator, /elRect\.left - containerRect\.left \+ container\.scrollLeft/);
  assert.match(indicator, /elRect\.top - containerRect\.top \+ container\.scrollTop/);
  assert.match(indicator, /addEventListener\("scroll", handleResize/);
});

test("all scroll surfaces inherit one scrollbar skin, not sidebar/textarea/menu copies", () => {
  assert.equal([...base.matchAll(/::\-webkit-scrollbar\s*\{/g)].length, 1);
  assert.equal([...base.matchAll(/::\-webkit-scrollbar-thumb\s*\{/g)].length, 2); // rest + shared activation
  assert.doesNotMatch(base, /(?:sidebar-content|qv-textarea|qv-addon-options)[^\n]*::-webkit-scrollbar-thumb/);
  assert.match(base, /\*::-webkit-scrollbar\s*\{\s*width: var\(--scrollbar-size\);\s*height: var\(--scrollbar-size\)/);
  assert.match(base, /\*::-webkit-scrollbar-button\s*\{\s*display: none/);
  assert.match(base, /\(hover: hover\) and \(pointer: fine\) and \(forced-colors: none\)/);
});

test("Select and Menu own content-fit popup defaults with no addon width workaround", () => {
  for (const file of ["select.tsx", "dropdown-menu.tsx"]) {
    const source = readFileSync(new URL(file, import.meta.url), "utf8");
    assert.match(source, /w-max min-w-0 max-w-\(--available-width\)/);
    assert.doesNotMatch(source, /min-w-(?:36|40|44)|w-\(--anchor-width\)/);
  }
  const select = readFileSync(new URL("select.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(select, /ItemIndicator|IconCheck/);
  const addonRule = base.match(/\.qv-addon-options\s*\{([^}]+)\}/)?.[1] ?? "";
  assert.doesNotMatch(addonRule, /width:/);
});
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
