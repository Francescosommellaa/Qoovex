import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const page = readFileSync(
  new URL("../app/(catalog)/foundations/surfaces/page.tsx", import.meta.url),
  "utf8",
);
const motionProof = readFileSync(new URL("./surface-elevation-proof.tsx", import.meta.url), "utf8");

test("Sirio proves the approved surface roles and difficult separations", () => {
  for (const contract of [
    "data-surface-foundation",
    'id: "base"',
    'id: "contained"',
    'id: "raised"',
    'id: "floating"',
    'id: "modal"',
    'data-surface-stress="similar"',
    'data-surface-stress="floating-over-card"',
    'data-surface-stress="nested"',
    "qv-backdrop-modal",
  ]) {
    assert.ok(page.includes(contract), `surface proof must contain ${contract}`);
  }
});

test("the Motion proof uses canonical surface timing and explicit interruption states", () => {
  for (const contract of [
    'from "motion/react"',
    "AnimatePresence",
    "resolveMotionTransition",
    '"surface"',
    '"emphasized"',
    "aria-expanded={open}",
    "onPointerCancel",
    "onPointerLeave",
    "data-surface-motion-phase",
    "data-reduced-motion",
    "onExitComplete",
  ]) {
    assert.ok(motionProof.includes(contract), `surface Motion proof must contain ${contract}`);
  }
  assert.doesNotMatch(motionProof, /boxShadow|framer-motion|duration:\s*0\.[0-9]/);
});
