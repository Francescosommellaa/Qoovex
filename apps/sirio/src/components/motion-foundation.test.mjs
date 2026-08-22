import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const component = readFileSync(
  new URL("./motion-foundation-lab.tsx", import.meta.url),
  "utf8"
)
const styles = readFileSync(
  new URL("./motion-foundation-lab.module.css", import.meta.url),
  "utf8"
)
const page = readFileSync(
  new URL("../app/(catalog)/foundations/motion/page.tsx", import.meta.url),
  "utf8"
)
const controlsPage = readFileSync(
  new URL("../app/(catalog)/components/controls/page.tsx", import.meta.url),
  "utf8"
)

test("Sirio proves the four semantic roles without a second Motion implementation", () => {
  for (const role of ["instant", "feedback", "state", "surface"]) {
    assert.match(page, new RegExp(`--motion-duration-${role}`))
  }
  assert.doesNotMatch(component, /motion\/react|framer-motion/)
  assert.match(component, /@qoovex\/ui\/components\/switch/)
  assert.match(component, /PREFERS_REDUCED_MOTION_QUERY/)
  assert.match(component, /event\.propertyName === "transform"/)
  assert.match(component, /aria-live="polite"/)
  assert.match(component, /aria-pressed=\{active\}/)
  assert.match(controlsPage, /href="\/foundations\/motion"/)
})

test("the page documents both canonical easing curves", () => {
  assert.match(page, /--ease-standard/)
  assert.match(page, /--ease-emphasized/)
  assert.match(page, /cubic-bezier/)
})

test("the CSS proof keeps non-spatial feedback in reduced motion and gates hover by capability", () => {
  assert.match(styles, /prefers-reduced-motion:\s*reduce/)
  assert.match(styles, /transition-property:\s*background-color,\s*color/)
  assert.match(styles, /hover:\s*hover/)
  assert.match(styles, /pointer:\s*fine/)
})
