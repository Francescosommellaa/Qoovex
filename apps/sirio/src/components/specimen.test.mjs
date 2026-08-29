import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const specimenSource = readFileSync(new URL("./specimen.tsx", import.meta.url), "utf8");
const textareaPageSource = readFileSync(new URL("../app/(catalog)/components/textarea/page.tsx", import.meta.url), "utf8");
const catalogLayoutSource = readFileSync(new URL("../app/(catalog)/layout.tsx", import.meta.url), "utf8");
const catalogNavigationSource = readFileSync(new URL("../lib/catalog-navigation.ts", import.meta.url), "utf8");

test("each UI component has a distinct catalog glyph", () => {
  const entries = [...catalogNavigationSource.matchAll(/href: "\/components\/([^"]+)", icon: (\w+)/g)];
  assert.ok(entries.length >= 30);
  const seen = new Map();
  for (const [, route, icon] of entries) {
    assert.equal(seen.has(icon), false, `${route} repeats ${icon} from ${seen.get(icon)}`);
    seen.set(icon, route);
  }
});
const buttonPageSource = readFileSync(
  new URL("../app/(catalog)/components/button/page.tsx", import.meta.url),
  "utf8",
);
const iconButtonPageSource = readFileSync(
  new URL("../app/(catalog)/components/icon-button/page.tsx", import.meta.url),
  "utf8",
);
const searchFieldPageSource = readFileSync(
  new URL("../app/(catalog)/components/search-field/page.tsx", import.meta.url),
  "utf8",
);
const controlsPageSource = readFileSync(
  new URL("../app/(catalog)/components/controls/page.tsx", import.meta.url),
  "utf8",
);
const otpInputPageSource = readFileSync(
  new URL("../app/(catalog)/components/otp-input/page.tsx", import.meta.url),
  "utf8",
);
const sirioTopbarSource = readFileSync(new URL("./sirio-topbar.tsx", import.meta.url), "utf8");
const sirioSidebarSource = readFileSync(new URL("./sirio-sidebar.tsx", import.meta.url), "utf8");
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

test("Textarea preserves useful height, usage and state examples without duplicate technical demos", () => {
  assert.equal((textareaPageSource.match(/<Textarea\b/g) ?? []).length, 7);
  for (const proof of ["auto", "fixed", "manual", "comment", "note", "disabled", "invalid"]) {
    assert.match(textareaPageSource, new RegExp(`data-textarea-proof="${proof}"`));
  }
  assert.doesNotMatch(textareaPageSource, /Focus da tastiera|Interazione reale|Stati reali|Geometry|focus-first|focus-second|geometry-stack/);
  assert.match(textareaPageSource, /maxRows=\{5\}/);
  assert.match(textareaPageSource, /setValue\(exampleText\)/);
  assert.match(textareaPageSource, /maxLength=\{200\}/);
  assert.match(textareaPageSource, /CharacterCounter current=\{comment\.length\}/);
  assert.match(textareaPageSource, /CharacterCounter current=\{shortNote\.length\}/);
  assert.doesNotMatch(textareaPageSource, /TextareaCounter/);
  assert.doesNotMatch(textareaPageSource, /textarea-address|textarea-readonly|backdrop-blur|ResizeObserver/);
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
  assert.match(buttonPageSource, /data-specimen-state="default"[^>]*data-visual-specimen="button-default"/);
  assert.match(buttonPageSource, /data-specimen-state="disabled"[^>]*data-visual-specimen="button-disabled"/);
  assert.doesNotMatch(buttonPageSource, /SpecimenGrid/);
  assert.match(buttonPageSource, /\{action\}[\s\S]{0,110}data-icon="inline-end"/);
});

test("IconButton specimen proves real interaction, naming, target, and Motion boundaries", () => {
  for (const region of ["variants", "interaction-states", "persistent-states", "motion-lifecycle"]) {
    assert.match(iconButtonPageSource, new RegExp(`region="${region}"`));
  }
  assert.match(iconButtonPageSource, /data-icon-button-proof="loading"/);
  assert.match(iconButtonPageSource, /data-icon-button-proof="permanent-loading" loading/);
  assert.match(iconButtonPageSource, /loading \? "Salvataggio in corso" : "Salvataggio"/);
  assert.match(iconButtonPageSource, /data-icon-button-target-grid/);
  assert.match(iconButtonPageSource, /<IconAction intent="forward"/);
  assert.match(iconButtonPageSource, /<IconAction intent="disclosure" state=/);
  assert.match(iconButtonPageSource, /closeButtonProps=/);
  assert.match(iconButtonPageSource, /<CopyButton/);
  assert.doesNotMatch(iconButtonPageSource, /region="themes"/);
  assert.doesNotMatch(iconButtonPageSource, /data-testid|setHovered|setPressed/);
});

test("IconButton view documents IconAction through real parent interactions", () => {
  for (const intent of ["back", "forward", "up", "down", "download", "neutral", "disclosure", "visibility", "menu", "clear", "increment", "decrement"]) {
    assert.match(iconButtonPageSource, new RegExp(`intent="${intent}"`));
  }
  assert.match(iconButtonPageSource, /setClearValue\(\(current\) => current \? "" : "QVX-204"\)/);
  assert.match(iconButtonPageSource, /aria-label=\{clearValue \? "Cancella valore" : "Ripristina valore"\}/);
  assert.match(iconButtonPageSource, /<IconAction icon=\{IconReload\} intent="neutral"/);
  assert.doesNotMatch(iconButtonPageSource, />Ripristina<\/Button>/);
  assert.doesNotMatch(iconButtonPageSource, /label="inactive"/);
  const direction = iconButtonPageSource.slice(iconButtonPageSource.indexOf('title="Direzione"'), iconButtonPageSource.indexOf('title="Stato e comando"'));
  assert.doesNotMatch(direction, /intent="download"/);
  assert.match(iconButtonPageSource.slice(iconButtonPageSource.indexOf('title="Stato e comando"')), /data-icon-action-proof="download"/);
  assert.match(iconButtonPageSource, /setExpanded\(\(current\) => !current\)/);
  assert.match(iconButtonPageSource, /setVisible\(\(current\) => !current\)/);
  assert.doesNotMatch(iconButtonPageSource, /region="themes"|data-testid|setHovered|setPressed/);
});

test("SearchField modal proof shares Sirio's selectable-result language without duplicating search in the topbar", () => {
  assert.match(searchFieldPageSource, /function SearchResultList/);
  assert.match(searchFieldPageSource, /<SlidingIndicatorContainer[\s\S]{0,220}rounded="lg"/);
  assert.match(searchFieldPageSource, /rounded-lg border border-border\/40 bg-card\/40/);
  assert.match(searchFieldPageSource, /onMouseEnter=\{\(event\) => indicator\?\.moveIndicator/);
  assert.match(searchFieldPageSource, /group\/search-result/);
  assert.doesNotMatch(searchFieldPageSource, /group-hover:/);
  assert.match(searchFieldPageSource, /<SearchResults/);
  assert.match(searchFieldPageSource, /onReset=/);
  assert.doesNotMatch(searchFieldPageSource, /Nessuna corrispondenza|Nessuna risorsa corrisponde/);
  assert.match(searchFieldPageSource, /<DialogTitle>Seleziona una risorsa<\/DialogTitle>/);
  assert.doesNotMatch(searchFieldPageSource, /divide-y divide-border border-y/);

  assert.match(sirioSidebarSource, /<CatalogSearchModal open=\{searchOpen\}/);
  assert.doesNotMatch(sirioTopbarSource, /CatalogSearchModal|KbdShortcut|IconSearch|Cerca nel catalogo/);
});

test("IconButton view includes the icon-only Toggle proof without a duplicate catalog route", () => {
  assert.match(iconButtonPageSource, /data-toggle-button-proof="icon-only"/);
  assert.match(iconButtonPageSource, /pressedContent=\{<IconAction icon=\{IconPinFilled\}/);
  assert.match(iconButtonPageSource, /size="icon"/);
  assert.equal(existsSync(new URL("../app/(catalog)/components/toggle-button/page.tsx", import.meta.url)), false);
  assert.doesNotMatch(catalogNavigationSource, /\/components\/toggle-button/);
});

test("IconButton view preserves CloseButton composition, target, and real lifecycle proof", () => {
  assert.match(iconButtonPageSource, /data-close-button-dialog-trigger/);
  assert.match(iconButtonPageSource, /focus torna al trigger reale/);
  assert.doesNotMatch(iconButtonPageSource, /region="themes"|data-testid|setHovered|setPressed/);
});

test("IconButton view preserves truthful CopyButton naming and lifecycle proof", () => {
  assert.match(iconButtonPageSource, /data-copy-button-proof="core"/);
  assert.doesNotMatch(iconButtonPageSource, /data-copy-button-proof="(?:failure|rapid)"/);
  assert.doesNotMatch(iconButtonPageSource, /region="themes"|data-copy-button-target-grid/);
  assert.doesNotMatch(iconButtonPageSource, /data-testid|setHovered|setPressed|setCopied/);
});

test("the catalog exposes one IconButton family view instead of duplicate icon-action routes", () => {
  for (const route of ["icon-action", "close-button", "copy-button", "toggle-button"]) {
    assert.equal(
      existsSync(new URL(`../app/(catalog)/components/${route}/page.tsx`, import.meta.url)),
      false,
    );
    assert.doesNotMatch(catalogNavigationSource, new RegExp(`/components/${route}`));
  }
  assert.match(catalogNavigationSource, /\/components\/icon-button/);
});

test("OTP Input has a dedicated component view and Controls no longer owns its proof", () => {
  assert.match(catalogNavigationSource, /name: "Controlli", href: "\/components\/controls"/);
  assert.match(catalogNavigationSource, /name: "OTP Input", href: "\/components\/otp-input"/);
  assert.doesNotMatch(controlsPageSource, /OtpInput|OTP Input|Input Speciali/);
  assert.match(otpInputPageSource, /data-otp-proof="core"/);
  assert.match(otpInputPageSource, /@qoovex\/ui\/components\/otp-input/);
  assert.match(otpInputPageSource, /onValueComplete/);
  assert.match(otpInputPageSource, /length=\{4\}/);
  assert.match(otpInputPageSource, /length=\{6\}/);
  assert.match(otpInputPageSource, /aria-invalid="true"/);
  assert.match(otpInputPageSource, /disabled id="otp-disabled"/);
  assert.doesNotMatch(otpInputPageSource, /status=|mask|groupSeparator|Codice verificato|Codice errato|Motion Playground/);
});

test("Input documents the primitive while Field owns composition and Password avoids a duplicate interaction field", () => {
  const input = readFileSync(new URL("../app/(catalog)/components/input/page.tsx", import.meta.url), "utf8");
  const field = readFileSync(new URL("../app/(catalog)/components/field/page.tsx", import.meta.url), "utf8");
  const password = readFileSync(new URL("../app/(catalog)/components/password-input/page.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(input, /<Field|components\/field/);
  assert.match(field, /<FieldLabel/);
  assert.match(field, /<FieldDescription/);
  assert.match(field, /<FieldError/);
  assert.match(password, /data-password-proof="interaction"/);
  assert.doesNotMatch(password, /data-password-proof="focus-sibling"/);
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
