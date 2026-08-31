import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"

const source = fs.readFileSync(path.join(import.meta.dirname, "field.tsx"), "utf8")
const errorStart = source.indexOf("function FieldError")
const errorEnd = source.indexOf("\nexport {", errorStart)
const errorSource = source.slice(errorStart, errorEnd)
const jobSiteForms = fs.readFileSync(
  path.join(import.meta.dirname, "../../../../apps/workspace/src/views/job-site/JobSiteForms.tsx"),
  "utf8"
)
const sirio = fs.readFileSync(
  path.join(import.meta.dirname, "../../../../apps/sirio/src/app/(catalog)/components/field/page.tsx"),
  "utf8"
)

test("FieldError is static field-level content without automatic announcements", () => {
  assert.ok(errorStart >= 0 && errorEnd > errorStart)
  assert.match(errorSource, /React\.ComponentProps<"div">/)
  assert.match(errorSource, /data-slot="field-error"/)
  assert.doesNotMatch(errorSource, /role="alert"|aria-live|autoFocus|\.focus\(|animate-|transition-|transform/)
})

test("FieldError owns readable destructive typography without external geometry", () => {
  assert.match(
    errorSource,
    /min-w-0 text-sm leading-5 font-normal text-destructive \[overflow-wrap:anywhere\]/
  )
  assert.doesNotMatch(
    errorSource,
    /(?:^|[\s"'`])(?:-?m[trblxy]?-[^\s"'`]+|opacity-50|truncate|line-clamp-|absolute|fixed)/m
  )
})

test("FieldError keeps the consumer-backed deterministic multiple-error API", () => {
  assert.match(jobSiteForms, /<FieldError errors=\{errors\.map/)
  assert.match(errorSource, /new Set\(/)
  assert.match(errorSource, /if \(uniqueMessages\.length === 0\)/)
  assert.match(errorSource, /<ul className="flex list-disc flex-col gap-1 ps-4">/)
  assert.match(errorSource, /<li key=\{message\}>/)
})

test("Sirio proves field relationships, multiple errors and real correction", () => {
  for (const proof of ["basic", "long", "multiple", "interactive"]) {
    assert.match(sirio, new RegExp(`data-error-proof="${proof}"`))
  }
  assert.match(sirio, /aria-invalid=\{interactiveError \? true : undefined\}/)
  assert.match(sirio, /setInteractiveError\(null\)/)
})
