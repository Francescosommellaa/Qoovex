import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const implementation = readFileSync(new URL("./password-input.tsx", import.meta.url), "utf8");
const inputModule = readFileSync(new URL("./input.tsx", import.meta.url), "utf8");
const baseStyles = readFileSync(new URL("../../styles/base.css", import.meta.url), "utf8");
const packageJson = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));

test("PasswordInput has one canonical entry point and command semantics", () => {
  assert.equal(packageJson.exports["./components/*"], "./src/components/*.tsx");
  assert.match(implementation, /import \{ IconButton \} from "#components\/icon-button"/);
  assert.match(implementation, /import \{ Input \} from "#components\/input"/);
  assert.match(implementation, /revealLabel = "Mostra password"/);
  assert.match(implementation, /concealLabel = "Nascondi password"/);
  assert.doesNotMatch(implementation, /aria-pressed|title=|#components\/button|ToggleButton/);
  assert.doesNotMatch(inputModule, /function PasswordInput|\n  PasswordInput,/);
});

test("PasswordInput exposes an opt-in accessible strength meter without owning password policy", () => {
  assert.match(implementation, /type PasswordStrength = \{[\s\S]*label: string[\s\S]*value: 0 \| 1 \| 2 \| 3/);
  assert.match(implementation, /role="meter"/);
  assert.match(implementation, /aria-valuetext=\{strength\.label\}/);
  assert.match(implementation, /data-slot="password-strength"/);
  assert.doesNotMatch(implementation, /password\.length|characterGroups|validatePassword|COMMON_PASSWORDS/);
  assert.match(baseStyles, /\.qv-password-strength-fill[\s\S]*transform: scaleX\(calc\(var\(--qv-password-strength\) \/ 3\)\)/);
  assert.match(baseStyles, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.qv-password-strength-fill/);
  assert.match(baseStyles, /@media \(forced-colors: active\)[\s\S]*\.qv-password-strength-track/);
});

test("PasswordInput delegates its geometry-stable visibility glyph to IconAction", () => {
  assert.match(implementation, /import \{ IconAction \} from "#components\/icon-action"/);
  assert.match(implementation, /<IconAction intent="visibility" state=\{visible \? "visible" : "hidden"\}/);
  assert.doesNotMatch(implementation, /IconEye|IconEyeOff|motion\/react|readIconButtonMotion|iconTarget/);
});

test("PasswordInput preserves native value ownership, selection and modality-aware focus", () => {
  assert.match(implementation, /const \[revealed, setRevealed\] = React\.useState\(false\)/);
  assert.doesNotMatch(implementation, /useState\([^\n]*(?:value|defaultValue)/);
  assert.match(implementation, /visible = revealed && !disabled/);
  assert.match(implementation, /type=\{visible \? "text" : "password"\}/);
  assert.match(implementation, /restoreFocus: event\.detail > 0/);
  assert.match(implementation, /input\.focus\(\{ preventScroll: true \}\)/);
  assert.match(implementation, /input\.setSelectionRange/);
  assert.match(implementation, /className=\{cn\(inputClassName, "pr-14"\)\}/);
  assert.match(implementation, /absolute inset-y-0 right-1\.5 flex items-center/);
  assert.match(implementation, /disabled=\{disabled\}/);
});
