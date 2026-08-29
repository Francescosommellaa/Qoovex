import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const implementation = readFileSync(new URL("./character-counter.tsx", import.meta.url), "utf8")
const textarea = readFileSync(new URL("./textarea.tsx", import.meta.url), "utf8")
const sirio = readFileSync(new URL("../../../../apps/sirio/src/app/(catalog)/components/textarea/page.tsx", import.meta.url), "utf8")

test("CharacterCounter is one field-agnostic current/max presentation", () => {
  assert.match(implementation, /current: number/)
  assert.match(implementation, /max: number/)
  assert.match(implementation, /data-slot="character-counter"/)
  assert.match(implementation, /\{current\} \/ \{max\}/)
  assert.match(implementation, /tabular-nums/)
  assert.match(implementation, /React\.ComponentProps<"span">/)
  assert.doesNotMatch(implementation, /<output|aria-live|role="status"/)
  assert.doesNotMatch(implementation, /value|onChange|mode|word|progress|Badge/)
  assert.doesNotMatch(textarea, /TextareaCounter|data-slot="textarea-counter"/)
})

test("CharacterCounter owns four semantic attention states without validation or noisy announcements", () => {
  for (const state of ["normal", "near-limit", "at-limit", "over-limit"]) {
    assert.match(implementation, new RegExp(`"${state}"`))
  }
  assert.match(implementation, /current \/ max >= 0\.9/)
  assert.match(implementation, /data-state=\{state\}/)
  assert.match(implementation, /transition-colors duration-150/)
  assert.match(implementation, /motion-reduce:transition-none/)
  assert.doesNotMatch(implementation, /aria-live|aria-invalid|scale-|animate-|pulse|bounce/)
})

test("Sirio connects CharacterCounter to real Textarea and Input values", () => {
  assert.match(sirio, /CharacterCounter current=\{comment\.length\}[^>]*max=\{200\}/)
  assert.match(sirio, /CharacterCounter current=\{shortNote\.length\}[^>]*max=\{40\}/)
  assert.match(sirio, /aria-describedby="textarea-comment-help textarea-comment-count"/)
  assert.match(sirio, /aria-describedby="input-counter-help input-counter-count"/)
  for (const example of ["120", "470", "500", "510"]) {
    assert.match(sirio, new RegExp(`, ${example}\\]`))
  }
})
