import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const facade = readFileSync(new URL("../toggle-button.tsx", import.meta.url), "utf8")
const implementation = readFileSync(new URL("./toggle-button-client.tsx", import.meta.url), "utf8")
const motion = readFileSync(new URL("./toggle-button-motion.ts", import.meta.url), "utf8")
const variants = readFileSync(new URL("./toggle-button-variants.ts", import.meta.url), "utf8")

test("ToggleButton is a stable public facade over Base UI Toggle", () => {
  assert.match(facade, /toggle-button-client/)
  assert.match(implementation, /@base-ui\/react\/toggle/)
  assert.match(implementation, /<TogglePrimitive/)
  assert.doesNotMatch(implementation, /useState\([^)]*pressed|setPressed/)
  assert.doesNotMatch(implementation, /aria-pressed=/)
})

test("persistent pressed state and transient physical press use separate layers", () => {
  assert.match(implementation, /state\.pressed/)
  assert.match(implementation, /data-slot="toggle-button-state-surface"/)
  assert.match(implementation, /data-slot="toggle-button-interaction-surface"/)
  assert.match(implementation, /useActionInteraction/)
  assert.match(motion, /getToggleButtonStateVariants/)
  assert.match(motion, /getToggleButtonInteractionVariants/)
  assert.doesNotMatch(motion, /pressedState[^\n]*scaleY:\s*0\.9/)
})

test("composed render handlers are invoked once even when root props are spread", () => {
  assert.match(implementation, /function callDistinctHandlers/)
  assert.match(implementation, /called\.has\(handler\)/)
  for (const handler of [
    "onBlur",
    "onKeyDown",
    "onKeyUp",
    "onPointerCancel",
    "onPointerDown",
    "onPointerEnter",
    "onPointerLeave",
    "onPointerUp",
  ]) {
    assert.match(
      implementation,
      new RegExp(`callDistinctHandlers\\(event, elementProps\\.${handler}, rootProps\\.${handler}\\)`),
    )
  }
  assert.doesNotMatch(implementation, /elementProps\.onBlur\?\.\(event\)[\s\S]*rootProps\.onBlur\?\.\(event\)/)
})

test("stateful copy shares intrinsic geometry and keeps only the active layer accessible", () => {
  assert.match(implementation, /pressedContent\?: React\.ReactNode/)
  assert.match(implementation, /inline-grid min-w-0 items-center justify-items-center/)
  assert.match(implementation, /data-slot="toggle-button-unpressed-content"/)
  assert.match(implementation, /data-slot="toggle-button-pressed-content"/)
  assert.match(implementation, /aria-hidden=\{state\.pressed\}/)
  assert.match(implementation, /aria-hidden=\{!state\.pressed\}/)
  assert.match(motion, /getToggleButtonStateContentVariants/)
})

test("every animated surface inherits its radius from the correct visual owner", () => {
  assert.match(implementation, /data-slot="toggle-button-interaction-surface"/)
  assert.match(implementation, /origin-center rounded-\[inherit\]/)
  assert.match(implementation, /data-slot="toggle-button-visual-surface"/)
  assert.match(implementation, /absolute inset-0 rounded-\[inherit\]/)
  assert.match(implementation, /size-\[var\(--icon-button-visual-size\)\] rounded-\[var\(--icon-button-radius\)\]/)
  assert.match(implementation, /data-slot="toggle-button-hover-surface"/)
  assert.match(implementation, /data-slot="toggle-button-state-surface"/)
})

test("ToggleButton keeps one opaque quiet presentation and derives Action geometry", () => {
  assert.match(variants, /--toggle-button-state-surface:var\(--foreground\)/)
  assert.match(variants, /--toggle-button-interaction-surface:var\(--accent\)/)
  assert.doesNotMatch(variants, /primary|destructive|success|warning/)
  assert.doesNotMatch(variants, /\/(?:10|20|30|40|50|60|70|80|90)\b/)
  assert.doesNotMatch(variants, /transition-all|active:scale/)
  assert.match(implementation, /data-slot="toggle-button-state-indicator"/)
  assert.match(implementation, /buttonVariants\(\{ size, variant: "ghost" \}\)/)
  assert.match(implementation, /iconButtonVariants\(\{ size: iconButtonSize\(size\), variant: "ghost" \}\)/)
  assert.match(implementation, /"icon-xs" \| "icon-sm" \| "icon"/)
})

test("disabled state preserves persistent state and suppresses interaction", () => {
  assert.match(implementation, /animate=\{state\.disabled \? "rest" : interaction\.visualPhase\}/)
  assert.match(implementation, /animate=\{state\.pressed \? "pressed" : "unpressed"\}/)
  assert.match(variants, /qv-disabled:pointer-events-none/)
})
