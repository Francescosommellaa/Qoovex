import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const implementation = readFileSync(new URL("./close-button-client.tsx", import.meta.url), "utf8")
const dialog = readFileSync(new URL("../dialog.tsx", import.meta.url), "utf8")
const input = readFileSync(new URL("../input.tsx", import.meta.url), "utf8")
const searchField = readFileSync(new URL("../search-field.tsx", import.meta.url), "utf8")
const spinner = readFileSync(new URL("../spinner.tsx", import.meta.url), "utf8")
const floatingNavigation = readFileSync(new URL("../floating-navigation.tsx", import.meta.url), "utf8")

test("CloseButton owns one quiet IconX presentation and no placement", () => {
  assert.match(implementation, /<IconButtonRoot/)
  assert.match(implementation, /data-slot="close-button"/)
  assert.match(implementation, /size="sm"/)
  assert.match(implementation, /variant="ghost"/)
  assert.match(implementation, /<IconX aria-hidden="true"/)
  assert.match(implementation, /text-muted-foreground/)
  assert.doesNotMatch(implementation, /loading=/)
  assert.doesNotMatch(implementation, /variant="destructive"/)
  assert.doesNotMatch(implementation, /className=.*(?:absolute|fixed|top-|right-|bottom-|left-)/)
})

test("Dialog.Close composes CloseButton without duplicating icon or behavior", () => {
  assert.match(dialog, /DialogPrimitive\.Close/)
  assert.match(dialog, /render=\{\s*<CloseButton/)
  assert.match(dialog, /closeButtonProps/)
  assert.doesNotMatch(dialog, /aria-label="Chiudi(?: finestra)?"/)
  assert.doesNotMatch(dialog, /IconX/)
  assert.doesNotMatch(dialog, /size="icon-xs"/)
})

test("IconX lookalikes retain their distinct clear and status semantics", () => {
  assert.match(input, /aria-label="Azzera ricerca"[\s\S]*<IconX/)
  assert.match(searchField, /clearLabel[\s\S]*<IconX/)
  assert.match(spinner, /status === "error"[\s\S]*<IconX/)
  assert.match(floatingNavigation, /aria-label="Chiudi navigazione"[\s\S]*<IconChevronLeft/)
})
