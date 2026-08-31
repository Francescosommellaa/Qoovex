import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const field = readFileSync(new URL("./field.tsx", import.meta.url), "utf8")
const sirio = readFileSync(
  new URL("../../../../apps/sirio/src/app/(catalog)/components/field/page.tsx", import.meta.url),
  "utf8",
)

test("Field is a layout primitive, not an automatic semantic group", () => {
  assert.match(field, /data-slot="field"/)
  assert.doesNotMatch(field, /role="group"|aria-labelledby|aria-describedby/)
  assert.doesNotMatch(field, /data-\[invalid=true\]:text-destructive/)
  assert.doesNotMatch(field, /group-data-\[disabled=true\]\/field:opacity/)
})

test("Field keeps only consumer-backed orientations and stable geometry", () => {
  assert.match(field, /vertical: "flex-col"/)
  assert.match(field, /horizontal:/)
  assert.doesNotMatch(field, /responsive:/)
  assert.match(field, /flex min-w-0 w-full gap-x-3 gap-y-1\.5/)
  assert.doesNotMatch(field, /\*-mt-|:-mt-|translate-|scale-|animate-|motion\/react/)
})

test("FieldContent is removed because no composition owns it", () => {
  assert.doesNotMatch(field, /function FieldContent|data-slot="field-content"|\bFieldContent,?\s*$/m)
})

test("Sirio proves composition, state, horizontal layout and reflow", () => {
  for (const proof of ["basic", "complete", "invalid", "disabled", "horizontal", "long"]) {
    assert.match(sirio, new RegExp(`data-field-proof="${proof}"`))
  }
  assert.match(sirio, /orientation="horizontal"/)
  assert.match(sirio, /<Checkbox/)
  assert.match(sirio, /<FieldDescription/)
  assert.match(sirio, /<FieldError/)
})
