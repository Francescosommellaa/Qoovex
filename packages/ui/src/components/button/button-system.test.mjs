import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const variants = readFileSync(resolve(here, "button-variants.ts"), "utf8")
const implementation = readFileSync(resolve(here, "button-client.tsx"), "utf8")
const motion = readFileSync(resolve(here, "button-motion.ts"), "utf8")
const tokens = readFileSync(resolve(here, "../../../styles/tokens.css"), "utf8")
const facade = readFileSync(resolve(here, "../button.tsx"), "utf8")
const cursor = readFileSync(resolve(here, "../marketing-cursor.tsx"), "utf8")
const webHome = readFileSync(resolve(here, "../../../../../apps/web/src/app/page.tsx"), "utf8")

test("Button exposes the approved opaque variant family", () => {
  for (const variant of ["default", "secondary", "outline", "ghost", "destructive"]) {
    assert.match(variants, new RegExp(`\\b${variant}:`))
  }

  assert.doesNotMatch(variants, /\blink:/)
  assert.doesNotMatch(
    variants,
    /(?:primary|secondary|accent|destructive|input|border)\/(?:10|20|30|40|50|60|70|80|90)\b/
  )
  assert.match(
    variants,
    /destructive:\s*"[^"]*text-destructive-foreground[^"]*--button-surface:var\(--destructive\)/
  )
  assert.doesNotMatch(facade, /buttonVariants|\blink\b/)
})

test("Button derives its size radii from the canonical Qoovex radius", () => {
  assert.match(tokens, /--radius:\s*0\.625rem/)
  assert.doesNotMatch(tokens, /--radius-action:/)
  assert.match(variants, /var\(--radius\)/)
  assert.match(variants, /calc\(var\(--radius\)\s*-\s*0\.125rem\)/)
  assert.match(variants, /calc\(var\(--radius\)\s*\+\s*0\.125rem\)/)
})

test("Button interaction uses anisotropic squash without duplicate animation controls", () => {
  assert.match(motion, /scaleX:\s*1\.0\d+/)
  assert.match(motion, /scaleY:\s*0\.9\d+/)
  assert.doesNotMatch(implementation, /useAnimationControls/)
  assert.match(implementation, /onTapCancel/)
  assert.match(implementation, /onPointerLeave/)
  assert.match(implementation, /event\.pointerType !== "touch"/)
  assert.doesNotMatch(implementation, /onHoverStart=/)
  assert.doesNotMatch(variants, /outline-none/)
})

test("Button loading keeps label and loader in one intrinsic grid slot", () => {
  assert.match(implementation, /col-start-1 row-start-1[^\n]*data-slot="button-label"|data-slot="button-label"[\s\S]*col-start-1 row-start-1/)
  assert.match(implementation, /data-slot="button-loader"/)
  assert.match(implementation, /inline-grid max-w-full min-w-0/)
  assert.doesNotMatch(implementation, /AnimatePresence/)
})

test("marketing magnetism is explicit, bounded, and never inherited from Button", () => {
  assert.match(cursor, /magneticSelector = '\[data-cursor-magnetic="true"\]'/)
  assert.match(cursor, /magneticMaximumStrength = 0\.14/)
  assert.match(cursor, /magneticMaximumOffset = 3/)
  assert.match(cursor, /strength = magneticMaximumStrength \* proximity/)
  assert.match(cursor, /offsetMagnitude > magneticMaximumOffset/)
  assert.doesNotMatch(cursor, /data-slot="button"|button\.bg-primary|a\.bg-primary/)
  assert.match(webHome, /data-cursor-magnetic="true"/)
})
