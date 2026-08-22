import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const page = readFileSync(
  new URL("../app/(catalog)/foundations/pointer-touch/page.tsx", import.meta.url),
  "utf8",
);

test("Sirio pointer proof uses real controls and exposes the full press lifecycle", () => {
  for (const value of [
    "data-pointer-touch-foundation",
    "data-pointer-proof=\"compact-checkbox\"",
    "data-pointer-proof=\"motion-switch\"",
    "data-pointer-proof=\"inline-link\"",
    "onPointerDown",
    "onPointerLeave",
    "onPointerCancel",
    "onPointerUp",
  ]) {
    assert.ok(page.includes(value), `pointer proof must contain ${value}`);
  }
});

test("Sirio pointer proof does not duplicate Motion runtime or simulate hover state", () => {
  assert.doesNotMatch(page, /from ["']motion\/react["']/);
  assert.doesNotMatch(page, /set(?:Hover|Hovered|Pressed)/);
  assert.match(page, /group-active\/pointer-proof:scale-90/);
  assert.match(page, /motion-reduce:transform-none/);
});
