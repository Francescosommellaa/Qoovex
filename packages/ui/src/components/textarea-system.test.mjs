import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const implementation = readFileSync(new URL("./textarea.tsx", import.meta.url), "utf8");
const base = readFileSync(new URL("../../styles/base.css", import.meta.url), "utf8");
const packageJson = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));
const primitive = implementation.slice(implementation.indexOf("function Textarea("), implementation.indexOf("function TextareaGroup("));

test("Textarea keeps a native focus and ref owner inside a non-interactive overflow frame", () => {
  assert.equal(packageJson.exports["./components/*"], "./src/components/*.tsx");
  assert.match(primitive, /React\.ComponentProps<"textarea">/);
  assert.match(primitive, /data-slot="textarea-frame"/);
  assert.match(primitive, /ref=\{inputRef\}/);
  assert.match(primitive, /useImperativeHandle\(ref, \(\) => inputRef.current!/);
  assert.match(primitive, /aria-hidden="true" className="qv-textarea-overflow"/);
  assert.match(primitive, /data-slot="textarea"/);
  assert.match(primitive, /qv-textarea w-full min-w-0 rounded-lg border px-3 py-2 text-base leading-6/);
  assert.doesNotMatch(primitive, /GripIcon|motion\/react|useState|transition-all|tabIndex|role="textbox"/);
});

test("Textarea exposes only auto, vertical and fixed resize outcomes", () => {
  assert.match(primitive, /autoResize = true/);
  assert.match(primitive, /autoResize \? "auto" : resizable \? "vertical" : "none"/);
  assert.match(primitive, /data-resize=\{resizeMode\}/);
  assert.match(primitive, /field-sizing-content resize-none overflow-y-auto/);
  assert.match(primitive, /resize-y overflow-y-auto/);
  assert.doesNotMatch(primitive, /resize-x|resize-both|pointer-events-none absolute/);
  assert.match(base, /\.qv-textarea\[data-resize="vertical"\]::-webkit-resizer/);
  assert.match(base, /radial-gradient\(ellipse 4px 1px at center/);
  assert.match(base, /cursor: ns-resize/);
});

test("Textarea owns shared edge detection without duplicating native value or scrolling", () => {
  assert.match(primitive, /new ResizeObserver\(syncOverflow\)/);
  assert.match(primitive, /useLayoutEffect\(syncOverflow\)/);
  assert.match(primitive, /data-overflow-start/);
  assert.match(primitive, /data-overflow-end/);
  assert.match(primitive, /form\?\.addEventListener\("reset"/);
  assert.match(base, /\.qv-textarea-overflow[\s\S]*inset: 1px/);
  assert.match(base, /inset-inline-end: calc\(1px \+ var\(--qv-textarea-scrollbar/);
  assert.match(base, /\*::-webkit-scrollbar-thumb/);
  assert.match(base, /\.qv-textarea::-webkit-scrollbar-track/);
  assert.doesNotMatch(primitive, /setValue|scrollTop\s*=|scrollTo\(/);
});

test("Textarea derives row bounds from live line height and shares Input states", () => {
  assert.match(primitive, /calc\(\$\{minimumRows\}lh \+ 1\.125rem\)/);
  assert.match(primitive, /calc\(\$\{maximumRows\}lh \+ 1\.125rem\)/);
  assert.match(base, /:where\(\.qv-input, \.qv-textarea\)/);
  assert.match(base, /\.qv-textarea\s*\{[\s\S]*min-block-size:[\s\S]*max-block-size:[\s\S]*overflow-wrap: anywhere/);
  assert.doesNotMatch(primitive, /bg-transparent|bg-input\/|bg-muted\/|opacity-|scale-|translate-/);
});

test("Textarea dissolves content without blurring its surface or border", () => {
  const fade = base.slice(base.indexOf(".qv-textarea-overflow {"), base.indexOf("/* Style the actual browser resize"));
  assert.doesNotMatch(fade, /backdrop-filter|filter:|blur\(/);
  assert.match(fade, /overflow: hidden/);
  assert.match(fade, /background-color: var\(--qv-field-surface\)/);
  assert.match(fade, /mask-image: linear-gradient/);
  assert.doesNotMatch(fade, /visibility: hidden/);
  assert.match(fade, /:focus:not\(\[readonly\]\)[\s\S]*opacity: 0\.6/);
  assert.doesNotMatch(primitive, /<span \/>/);
});
