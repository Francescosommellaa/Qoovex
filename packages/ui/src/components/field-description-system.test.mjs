import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"

const source = fs.readFileSync(
  path.join(import.meta.dirname, "field.tsx"),
  "utf8"
)

const descriptionStart = source.indexOf("function FieldDescription")
const descriptionEnd = source.indexOf("function FieldSeparator")
const descriptionSource = source.slice(descriptionStart, descriptionEnd)

test("FieldDescription is a static semantic paragraph", () => {
  assert.ok(descriptionStart >= 0 && descriptionEnd > descriptionStart)
  assert.match(descriptionSource, /React\.ComponentProps<"p">/)
  assert.match(descriptionSource, /<p/)
  assert.match(descriptionSource, /data-slot="field-description"/)
  assert.doesNotMatch(descriptionSource, /role=|aria-live|role-status|animate-|transition-|transform/)
})

test("FieldDescription owns readable supporting typography without external geometry", () => {
  assert.match(
    descriptionSource,
    /min-w-0 text-left text-sm leading-5 font-normal text-muted-foreground \[overflow-wrap:anywhere\]/
  )
  assert.doesNotMatch(
    descriptionSource,
    /(?:^|[\s"'`])(?:-?m[trblxy]?-[^\s"'`]+|opacity-50|truncate|line-clamp-|text-destructive)/m
  )
})

test("FieldDescription delegates inline-link presentation to the canonical link scope", () => {
  assert.match(descriptionSource, /data-link-scope="inline"/)
  assert.doesNotMatch(descriptionSource, /\[&>a/)
})
