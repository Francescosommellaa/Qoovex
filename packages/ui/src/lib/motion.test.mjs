import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

import {
  MOTION_DURATION_PROPERTIES,
  MOTION_EASING_PROPERTIES,
  PREFERS_REDUCED_MOTION_QUERY,
  resolveMotionTransition,
} from "./motion.ts"

const tokensSource = readFileSync(
  new URL("../../styles/tokens.css", import.meta.url),
  "utf8"
)
const switchSource = readFileSync(
  new URL("../components/switch.tsx", import.meta.url),
  "utf8"
)
const themeToggleSource = readFileSync(
  new URL("../components/theme-toggle.tsx", import.meta.url),
  "utf8"
)
const marketingCursorSource = readFileSync(
  new URL("../components/marketing-cursor.tsx", import.meta.url),
  "utf8"
)
const readmeSource = readFileSync(new URL("../../README.md", import.meta.url), "utf8")
const designSource = readFileSync(new URL("../../DESIGN.md", import.meta.url), "utf8")

function styleFromTokens(source) {
  const declarations = new Map(
    [...source.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((match) => [
      match[1],
      match[2].trim(),
    ])
  )

  return {
    getPropertyValue(property) {
      return declarations.get(property) ?? ""
    },
  }
}

test("CSS motion tokens are the single timing source for JavaScript transitions", () => {
  const styles = styleFromTokens(tokensSource)

  assert.deepEqual(MOTION_DURATION_PROPERTIES, {
    instant: "--motion-duration-instant",
    feedback: "--motion-duration-feedback",
    state: "--motion-duration-state",
    surface: "--motion-duration-surface",
  })
  assert.deepEqual(MOTION_EASING_PROPERTIES, {
    standard: "--ease-standard",
    emphasized: "--ease-emphasized",
  })
  assert.deepEqual(resolveMotionTransition(styles, "instant"), {
    duration: 0.1,
    ease: [0.2, 0, 0, 1],
  })
  assert.deepEqual(resolveMotionTransition(styles, "feedback"), {
    duration: 0.16,
    ease: [0.2, 0, 0, 1],
  })
  assert.deepEqual(resolveMotionTransition(styles, "state"), {
    duration: 0.2,
    ease: [0.2, 0, 0, 1],
  })
  assert.deepEqual(resolveMotionTransition(styles, "surface", "emphasized"), {
    duration: 0.3,
    ease: [0.16, 1, 0.3, 1],
  })
})

test("reduced motion removes spatial transition time without reading a parallel map", () => {
  const styles = styleFromTokens(tokensSource)

  assert.deepEqual(resolveMotionTransition(styles, "state", "standard", true), {
    duration: 0,
  })
  assert.equal(PREFERS_REDUCED_MOTION_QUERY, "(prefers-reduced-motion: reduce)")
})

test("CSS duration parsing accepts equivalent minified seconds", () => {
  const styles = styleFromTokens(tokensSource)
  const minifiedStyles = {
    getPropertyValue(property) {
      if (property === "--motion-duration-feedback") return ".16s"
      return styles.getPropertyValue(property)
    },
  }

  assert.deepEqual(resolveMotionTransition(minifiedStyles, "feedback"), {
    duration: 0.16,
    ease: [0.2, 0, 0, 1],
  })
})

test("invalid CSS motion tokens fail loudly instead of falling back to magic numbers", () => {
  const missing = { getPropertyValue: () => "" }
  const invalid = {
    getPropertyValue(property) {
      return property === "--motion-duration-state" ? "fast" : "ease"
    },
  }

  assert.throws(
    () => resolveMotionTransition(missing, "state"),
    /Missing CSS motion token --motion-duration-state/
  )
  assert.throws(
    () => resolveMotionTransition(invalid, "state"),
    /Invalid CSS duration token --motion-duration-state: fast/
  )
})

test("shared JavaScript consumers do not duplicate timing or reduced-motion literals", () => {
  assert.match(switchSource, /resolveMotionTransition/)
  assert.doesNotMatch(switchSource, /duration:\s*0\.(?:1|16|2|3)\b/)
  assert.doesNotMatch(switchSource, /setSwitchMotion|React\.useEffect/)
  assert.match(themeToggleSource, /PREFERS_REDUCED_MOTION_QUERY/)
  assert.match(marketingCursorSource, /PREFERS_REDUCED_MOTION_QUERY/)
  assert.doesNotMatch(themeToggleSource, /prefers-reduced-motion:\s*reduce/)
  assert.doesNotMatch(marketingCursorSource, /prefers-reduced-motion:\s*reduce/)
})

test("the package contract names semantic roles, interruption, and intentional reduced motion", () => {
  for (const term of [
    "instant → feedback → state → surface",
    "rest → interaction → transition → settled",
    "rapid repeated input",
    "prefers-reduced-motion",
    "transition-all",
  ]) {
    assert.match(readmeSource, new RegExp(term.replaceAll("→", "\\u2192")))
  }

  assert.match(designSource, /viva ma calma/)
  assert.match(designSource, /Spring/)
  assert.match(designSource, /Base UI/)
})
