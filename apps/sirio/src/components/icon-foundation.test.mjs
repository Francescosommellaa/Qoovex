import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const page = readFileSync(
  new URL("../app/(catalog)/foundations/icons/page.tsx", import.meta.url),
  "utf8",
);
const motionProof = readFileSync(new URL("./icon-motion-proof.tsx", import.meta.url), "utf8");

test("Sirio proves the approved icon scale, alignment and accessibility categories", () => {
  for (const contract of [
    "data-icon-foundation",
    'id: "compact"',
    'id: "default"',
    'id: "emphasized"',
    'id: "illustrative"',
    'data-icon-alignment="text"',
    'data-icon-leading-multiline',
    'data-icon-only-control',
    'data-icon-accessibility="decorative"',
    'data-icon-accessibility="informative"',
    'role="img"',
    'data-icon-loader-proof',
  ]) {
    assert.ok(page.includes(contract), `icon proof must contain ${contract}`);
  }
});

test("the Motion proof keeps state semantics, interruption and reduced-motion replacement explicit", () => {
  for (const contract of [
    'from "motion/react"',
    "resolveMotionTransition",
    "aria-expanded={open}",
    "onPointerCancel",
    "onPointerLeave",
    'data-icon-motion-phase',
    'data-icon-motion-state',
    'data-reduced-motion',
    "onAnimationComplete",
    "IconChevronUp",
  ]) {
    assert.ok(motionProof.includes(contract), `icon Motion proof must contain ${contract}`);
  }
  assert.doesNotMatch(motionProof, /framer-motion/);
});
