import assert from "node:assert/strict"
import { readFileSync, readdirSync } from "node:fs"
import test from "node:test"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import ts from "typescript"

const here = dirname(fileURLToPath(import.meta.url))
const implementation = readFileSync(resolve(here, "icon-button-client.tsx"), "utf8")
const motion = readFileSync(resolve(here, "icon-button-motion.ts"), "utf8")
const variants = readFileSync(resolve(here, "icon-button-variants.ts"), "utf8")
const iconAction = readFileSync(resolve(here, "../icon-action/icon-action-client.tsx"), "utf8")
const base = readFileSync(resolve(here, "../../../styles/base.css"), "utf8")
const buttonVariants = readFileSync(resolve(here, "../button/button-variants.ts"), "utf8")
const repositoryRoot = resolve(here, "../../../../..")

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) return sourceFiles(path)
    return entry.name.endsWith(".tsx") ? [path] : []
  })
}

test("IconButton owns an accessible icon-only API and stable layered geometry", () => {
  assert.match(implementation, /"aria-label": string/)
  assert.match(implementation, /"aria-labelledby": string/)
  assert.match(implementation, /data-slot="icon-button-motion-surface"/)
  assert.match(implementation, /data-slot="icon-button-motion-content"/)
  assert.match(implementation, /absolute inset-0 -z-10 grid place-items-center/)
  assert.match(implementation, /"nativeButton" \| "render"/)
  assert.match(implementation, /nativeButton\s*\n\s*render=/)
  assert.doesNotMatch(implementation, /from "#components\/button"|<Button(?:\s|>)/)
})

test("IconButton exposes only the approved variants and minimum size set", () => {
  for (const variant of ["default", "secondary", "outline", "ghost", "destructive"]) {
    assert.match(variants, new RegExp(`\\b${variant}:`))
  }
  for (const size of ["xs", "sm", "default"]) {
    assert.match(variants, new RegExp(`\\b["']?${size}["']?:`))
  }
  assert.doesNotMatch(variants, /\blg:/)
  assert.doesNotMatch(variants, /(?:primary|secondary|accent|destructive)\/(?:10|20|30|40|50|60|70|80|90)\b/)
  assert.doesNotMatch(buttonVariants, /"icon-lg"/)
})

test("IconButton uses a real coarse target and icon-specific anisotropic motion", () => {
  assert.match(base, /\.qv-icon-button\s*\{[\s\S]*width:\s*var\(--icon-button-visual-size\)/)
  assert.match(base, /@media \(hover: none\), \(pointer: coarse\), \(any-pointer: coarse\)[\s\S]*\.qv-icon-button\s*\{[\s\S]*width:\s*var\(--touch-target-min\)/)
  assert.match(motion, /stiffness:\s*440/)
  assert.match(motion, /scaleX:[^\n]*1\.0\d+/)
  assert.match(motion, /scaleY:[^\n]*0\.9\d+/)
  assert.match(implementation, /onTapCancel/)
  assert.match(implementation, /focusableWhenDisabled=\{loading \? true : focusableWhenDisabled\}/)
})

test("semantic icon motion is explicit while disabled remains solid and still", () => {
  assert.match(implementation, /IconActionInteractionProvider/)
  assert.match(iconAction, /type IconActionProps/)
  assert.match(implementation, /event\.pointerType !== "touch"/)
  assert.doesNotMatch(implementation, /motionIntent|getActionIconVariants/)
  assert.doesNotMatch(iconAction, /displayName|\.name\b|constructor/)
  assert.doesNotMatch(variants, /qv-disabled:opacity-/)
  assert.match(variants, /data-\[availability=disabled\]:text-muted-foreground/)
})

test("directional intent deforms the real IconButton surface without a second border", () => {
  assert.match(implementation, /readIconActionIntent/)
  assert.match(iconAction, /child\.type === IconAction/)
  assert.match(motion, /intent === "forward" \|\| intent === "back" \|\| intent === "up" \|\| intent === "down"/)
  assert.match(motion, /x: directional && horizontal/)
  assert.match(motion, /y: directional && !horizontal/)
  assert.doesNotMatch(implementation, /icon-action-directional-frame/)
  assert.doesNotMatch(iconAction, /icon-action-directional-frame/)
})

test("legacy Button icon sizes remain limited to the explicit specialized-consumer allowlist", () => {
  const expected = new Map([
    ["packages/ui/src/components/floating-navigation.tsx", 1],
  ])
  const roots = ["apps/sirio/src", "apps/workspace/src", "packages/ui/src"]
  const actual = new Map()

  for (const root of roots) {
    for (const file of sourceFiles(resolve(repositoryRoot, root))) {
      const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
      let count = 0
      function visit(node) {
        if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && node.tagName.getText(source) === "Button") {
          const size = node.attributes.properties.find((attribute) => ts.isJsxAttribute(attribute) && attribute.name.getText(source) === "size")
          if (size && ts.isJsxAttribute(size) && size.initializer && ts.isStringLiteral(size.initializer) && /^icon(?:-xs|-sm|-lg)?$/.test(size.initializer.text)) count += 1
        }
        ts.forEachChild(node, visit)
      }
      visit(source)
      if (count === 0) continue
      const relative = file.slice(repositoryRoot.length + 1).replaceAll("\\", "/")
      actual.set(relative, count)
    }
  }

  assert.deepEqual(actual, expected)
})
