import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { fileURLToPath } from "node:url"
import { auditLabelRequiredDirectory, labelRequiredIssues } from "../../scripts/label-required-contract.mjs"

const label = readFileSync(new URL("./label.tsx", import.meta.url), "utf8")
const field = readFileSync(new URL("./field.tsx", import.meta.url), "utf8")
const base = readFileSync(new URL("../../styles/base.css", import.meta.url), "utf8")
const sirio = readFileSync(
  new URL("../../../../apps/sirio/src/app/(catalog)/components/field/page.tsx", import.meta.url),
  "utf8",
)

test("Label remains the single native semantic primitive", () => {
  assert.match(label, /React\.ComponentProps<"label">/)
  assert.match(label, /<label/)
  assert.match(label, /data-slot="label"/)
  assert.match(label, /\.\.\.props/)
  assert.doesNotMatch(field, /function FieldLabel|data-slot="field-label"/)
  assert.doesNotMatch(label, /motion\/react|useState|useEffect|onClick|role=/)
})

test("Label owns calm type and inline metadata without external geometry", () => {
  assert.match(label, /text-sm leading-5 font-medium text-foreground/)
  assert.match(label, /inline-block/)
  assert.match(label, /overflow-wrap:anywhere/)
  assert.match(label, /optional\?: boolean/)
  assert.match(label, /Facoltativo/)
  assert.match(label, /aria-hidden="true" data-slot="label-required"/)
  assert.match(label, /aria-hidden="true" data-slot="label-optional"/)
  assert.doesNotMatch(label, /font-accent|uppercase|tracking-|truncate|line-clamp|text-destructive/)
  assert.doesNotMatch(label, /\bm[trblxy]?-|opacity-|transition-|animate-|scale-|translate-/)
})

test("required presentation is explicit, never inferred from nearby controls", () => {
  assert.match(label, /required\?: boolean/)
  assert.match(label, /required \? \([\s\S]*: optional \? \(/)
  assert.doesNotMatch(base, /:has\(:required\)|:has\(\[aria-required=/)
  assert.doesNotMatch(base, /\[data-slot="field"\]:has\(:disabled\)/)
  assert.match(base, /color: var\(--muted-foreground\)/)
  const labelCss = base.slice(base.indexOf('.qv-label[data-slot="label"]'), base.indexOf(".qv-icon-compact"))
  assert.doesNotMatch(labelCss, /opacity:/)
  assert.doesNotMatch(field, /data-\[invalid=true\]:text-destructive/)
})

test("required contract catches lost markers, visual-only required and contradictory optional", () => {
  const source = (labelProps, controlProps) => `import { Label as FieldName } from "@qoovex/ui/components/label";
    const field = <><FieldName htmlFor={id} ${labelProps}>Nome</FieldName><Input id={id} ${controlProps}/></>`
  for (const [labelProps, controlProps] of [["", "required"], ["required", ""], ["required optional", "required"], ["required={needed}", "required={other}"]]) {
    assert.equal(labelRequiredIssues(source(labelProps, controlProps)).length, 1)
  }
  for (const [labelProps, controlProps] of [["", ""], ["required", "required"], ["required={needed} optional={!needed}", "required={needed}"], ["required={needed}", "required={needed || undefined}"], ["required", 'aria-required="true"']]) {
    assert.deepEqual(labelRequiredIssues(source(labelProps, controlProps)), [])
  }
  assert.deepEqual(labelRequiredIssues(`import { Label } from "@qoovex/ui/components/label";
    function A() { return <><Label htmlFor={id} required>A</Label><Input id={id} required/></> }
    function B() { return <><Label htmlFor={id}>B</Label><Input id={id}/></> }`), [])
})

test("all explicit app Label/control associations share the required contract", () => {
  const issues = ["sirio", "workspace", "web"].flatMap((app) =>
    auditLabelRequiredDirectory(fileURLToPath(new URL(`../../../../apps/${app}/src`, import.meta.url))),
  )
  assert.deepEqual(issues, [])
})

test("Sirio proves native association, required semantics, optional metadata and reuse", () => {
  for (const proof of ["basic", "required", "optional", "description", "invalid", "disabled", "long"]) {
    assert.match(sirio, new RegExp(`data-label-proof="${proof}"`))
  }
  assert.match(sirio, /<Label htmlFor="label-required" required=\{codeRequired\}/)
  assert.match(sirio, /<Input[^>]*id="label-required"[^>]*required/)
  assert.match(sirio, /<Label htmlFor="label-optional" optional>/)
  for (const control of ["Textarea", "SelectTrigger", "NumberInput"]) {
    assert.match(sirio, new RegExp(`<${control}`))
  }
  assert.doesNotMatch(sirio, /<FieldLabel|\(opzionale\)|\(obbligatorio\)/)
})
