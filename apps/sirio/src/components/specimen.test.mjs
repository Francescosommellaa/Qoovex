import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const specimenSource = readFileSync(new URL("./specimen.tsx", import.meta.url), "utf8");
const catalogLayoutSource = readFileSync(new URL("../app/(catalog)/layout.tsx", import.meta.url), "utf8");
const buttonPageSource = readFileSync(
  new URL("../app/(catalog)/components/button/page.tsx", import.meta.url),
  "utf8",
);
const iconButtonPageSource = readFileSync(
  new URL("../app/(catalog)/components/icon-button/page.tsx", import.meta.url),
  "utf8",
);
const toggleButtonPageSource = readFileSync(
  new URL("../app/(catalog)/components/toggle-button/page.tsx", import.meta.url),
  "utf8",
);
const closeButtonPageSource = readFileSync(
  new URL("../app/(catalog)/components/close-button/page.tsx", import.meta.url),
  "utf8",
);
const copyButtonPageSource = readFileSync(
  new URL("../app/(catalog)/components/copy-button/page.tsx", import.meta.url),
  "utf8",
);
const spacingAndRadiusPageSource = readFileSync(
  new URL("../app/(catalog)/foundations/spacing-and-radius/page.tsx", import.meta.url),
  "utf8",
);
const surfacePageSource = readFileSync(
  new URL("../app/(catalog)/foundations/surfaces/page.tsx", import.meta.url),
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
  assert.match(buttonPageSource, /SpecimenSection[\s\S]{0,240}region="variants"/);
  assert.match(buttonPageSource, /SpecimenSection[\s\S]*region="motion-lifecycle"/);
  for (const title of ["Core variants", "Keyboard focus", "Interactive loading", "Directional icon", "Magnetic CTA"]) {
    assert.match(buttonPageSource, new RegExp(`title="${title}"`));
  }
  assert.match(buttonPageSource, /stateId="default"[^>]*visualId="button-default"/);
  assert.match(buttonPageSource, /stateId="disabled"[^>]*visualId="button-disabled"/);
});

test("IconButton specimen proves real interaction, naming, target, and Motion boundaries", () => {
  for (const region of ["variants", "sizes", "interaction-states", "high-risk-combinations", "responsive", "motion-lifecycle"]) {
    assert.match(iconButtonPageSource, new RegExp(`region="${region}"`));
  }
  assert.match(iconButtonPageSource, /aria-labelledby="download-icon-button-label"/);
  assert.match(iconButtonPageSource, /TooltipTrigger render=\{<IconButton/);
  assert.match(iconButtonPageSource, /data-icon-button-proof="loading"/);
  assert.match(iconButtonPageSource, /data-icon-button-target-grid/);
  assert.match(iconButtonPageSource, /motionIntent="directional-right"/);
  assert.match(iconButtonPageSource, /<CloseButton/);
  assert.match(iconButtonPageSource, /<CopyButton/);
  assert.doesNotMatch(iconButtonPageSource, /region="themes"/);
  assert.doesNotMatch(iconButtonPageSource, /data-testid|setHovered|setPressed/);
});

test("ToggleButton specimen proves stateful copy and parent-driven state without debug UI", () => {
  for (const region of ["persistent-states", "high-risk-combinations"]) assert.match(toggleButtonPageSource, new RegExp(`region="${region}"`));
  assert.match(toggleButtonPageSource, /Fissa elemento/);
  assert.match(toggleButtonPageSource, /Elemento fissato/);
  assert.match(toggleButtonPageSource, /pressedContent=\{onContent\}/);
  assert.match(toggleButtonPageSource, /data-toggle-button-geometry-row/);
  assert.match(toggleButtonPageSource, /data-toggle-button-proof="controlled"/);
  assert.match(toggleButtonPageSource, /data-toggle-button-parent-control/);
  assert.doesNotMatch(toggleButtonPageSource, /region="themes"/);
  assert.doesNotMatch(toggleButtonPageSource, /data-testid|setHovered|setPressed|raw boolean|change-count/);
});

test("CloseButton specimen proves close semantics, composition, target, and real lifecycle", () => {
  for (const region of ["overview", "persistent-states", "interaction-states", "high-risk-combinations", "content-stress", "responsive", "motion-lifecycle"]) {
    assert.match(closeButtonPageSource, new RegExp(`region="${region}"`));
  }
  assert.match(closeButtonPageSource, /aria-labelledby="close-notice-label"/);
  assert.match(closeButtonPageSource, /data-close-button-dialog-trigger/);
  assert.match(closeButtonPageSource, /data-close-button-proof="motion"/);
  assert.match(closeButtonPageSource, /data-close-button-target-grid/);
  assert.match(closeButtonPageSource, /X<\/code> per “Elimina”/);
  assert.doesNotMatch(closeButtonPageSource, /region="themes"/);
  assert.doesNotMatch(closeButtonPageSource, /data-testid|setHovered|setPressed/);
});

test("CopyButton specimen proves truthful feedback, naming, and real lifecycle", () => {
  for (const region of ["overview", "interaction-states", "high-risk-combinations", "content-stress", "motion-lifecycle"]) {
    assert.match(copyButtonPageSource, new RegExp(`region="${region}"`));
  }
  assert.match(copyButtonPageSource, /aria-labelledby="copy-url-label"/);
  assert.match(copyButtonPageSource, /data-copy-button-proof="failure"/);
  assert.match(copyButtonPageSource, /data-copy-button-proof="rapid"/);
  assert.doesNotMatch(copyButtonPageSource, /region="themes"|data-copy-button-target-grid/);
  assert.doesNotMatch(copyButtonPageSource, /data-testid|setHovered|setPressed|setCopied/);
});

test("the catalog exposes a stable visual surface root", () => {
  assert.match(catalogLayoutSource, /data-visual-surface="sirio-catalog"/);
});

test("spacing and radius proves the canonical concentric nesting formula", () => {
  assert.match(spacingAndRadiusPageSource, /data-visual-specimen="nested-radius-formula"/);
  assert.match(spacingAndRadiusPageSource, /calc\(var\(--radius\) \+ var\(--space-2\)\)/);
  assert.match(spacingAndRadiusPageSource, /data-radius-layer="inner"/);
  assert.match(spacingAndRadiusPageSource, /borderRadius: "var\(--radius\)"/);
  assert.doesNotMatch(spacingAndRadiusPageSource, /--radius-(?:xs|2xl|full)/);
});

test("surface specimens consume the canonical nested-radius formula", () => {
  assert.match(surfacePageSource, /rounded-\[calc\(var\(--radius\)\+var\(--space-4\)\)\]/);
  assert.match(surfacePageSource, /data-surface-stress="nested"/);
  assert.match(surfacePageSource, /rounded-\[var\(--radius\)\]/);
});
