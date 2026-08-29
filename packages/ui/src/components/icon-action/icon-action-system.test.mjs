import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const client = readFileSync(new URL("./icon-action-client.tsx", import.meta.url), "utf8")
const motion = readFileSync(new URL("./icon-action-motion.ts", import.meta.url), "utf8")
const facade = readFileSync(new URL("../icon-action.tsx", import.meta.url), "utf8")
const button = readFileSync(new URL("../button/button-client.tsx", import.meta.url), "utf8")
const iconButton = readFileSync(new URL("../icon-button/icon-button-client.tsx", import.meta.url), "utf8")
const closeButton = readFileSync(new URL("../close-button/close-button-client.tsx", import.meta.url), "utf8")
const copyButton = readFileSync(new URL("../copy-button/copy-button-client.tsx", import.meta.url), "utf8")
const passwordInput = readFileSync(new URL("../password-input.tsx", import.meta.url), "utf8")
const searchField = readFileSync(new URL("../search-field.tsx", import.meta.url), "utf8")
const numberInput = readFileSync(new URL("../number-input.tsx", import.meta.url), "utf8")

test("IconAction exposes semantic intent and state without interaction or motion primitives", () => {
  assert.match(facade, /export \{ IconAction \}/)
  assert.match(facade, /IconActionIntent, IconActionProps/)
  for (const intent of [
    "neutral", "forward", "back", "up", "down", "disclosure", "menu", "clear",
    "visibility", "copy", "close", "increment", "decrement", "download",
    "retry",
  ]) {
    assert.match(motion, new RegExp(`\\| "${intent}"`))
  }
  assert.match(client, /intent: "visibility"[\s\S]*state: "hidden" \| "visible"/)
  assert.match(client, /intent: "disclosure"[\s\S]*state: "closed" \| "open"/)
  assert.match(client, /intent: "menu"[\s\S]*state: "closed" \| "open"/)
  assert.match(client, /intent: "copy"[\s\S]*"idle" \| "copying" \| "success" \| "error"/)
  assert.doesNotMatch(client, /onClick|onPointer|onHover|tabIndex|<button|aria-label/)
  assert.match(client, /type CommonProps = \{\s+"data-icon"\?: IconPlacement\s+\}/)
  assert.doesNotMatch(client, /duration\??:|rotate\??:|translateX\??:|scale\??:|spring\??:/)
})

test("IconAction owns canonical Tabler glyphs and one geometry-stable decorative slot", () => {
  for (const glyph of [
    "IconArrowRight", "IconArrowLeft", "IconArrowUp", "IconArrowDown", "IconChevronDown",
    "IconMenu", "IconX", "IconEye", "IconEyeOff", "IconCopy", "IconCheck", "IconPlus", "IconMinus", "IconRefresh",
  ]) {
    assert.match(client, new RegExp(`\\b${glyph}\\b`))
  }
  assert.match(client, /aria-hidden": true/)
  assert.match(client, /data-slot": "icon-action"/)
  assert.match(client, /size-\[var\(--icon-action-size,var\(--icon\)\)\]/)
  assert.match(client, /absolute inset-0 inline-grid place-items-center/)
  assert.doesNotMatch(client, /displayName|constructor|\.name\b/)
})

test("IconAction recipes preserve semantic state and remove spatial travel in reduced motion", () => {
  assert.match(motion, /stateRotation = intent === "disclosure" && state === "open" \? 180 : 0/)
  assert.match(motion, /if \(reducedMotion\)[\s\S]*rotate: stateRotation, scale: 1, x: 0, y: 0/)
  assert.match(motion, /intent === "copy"|case "copy"/)
  assert.match(motion, /layer === "success" \? 0\.74 : 0\.84/)
  assert.match(motion, /instantTransition/)
  assert.match(motion, /getIconActionDownloadArrowVariants/)
  assert.doesNotMatch(client, /icon-action-directional-frame/)
  assert.match(client, /<motion\.path animate=\{phase\}[\s\S]*d="M12 3v12/)
  assert.match(client, /<path d="M5 21h14"/)
  assert.match(client, /\["closed", IconMenu\][\s\S]*\["open", IconX\]/)
  assert.match(motion, /case "close":\s+case "clear":/)
  assert.doesNotMatch(motion, /displayName|constructor|\.name\b/)
})

test("Actions provide interaction phase while specialized consumers keep lifecycle ownership", () => {
  assert.match(button, /<IconActionInteractionProvider phase=/)
  assert.match(iconButton, /<IconActionInteractionProvider phase=/)
  assert.doesNotMatch(button, /iconMotion|getActionIconVariants/)
  assert.doesNotMatch(iconButton, /motionIntent|getActionIconVariants|icon-button-semantic-icon/)
  assert.match(closeButton, /<IconAction intent="close"/)
  assert.match(copyButton, /<IconAction intent="copy" state=\{copyState\}/)
  assert.match(passwordInput, /<IconAction intent="visibility" state=\{visible \? "visible" : "hidden"\}/)
  assert.match(searchField, /<IconAction intent="clear"/)
  assert.match(numberInput, /<IconAction intent="decrement"/)
  assert.match(numberInput, /<IconAction intent="increment"/)
  assert.match(copyButton, /navigator\.clipboard/)
  assert.match(passwordInput, /setSelectionRange/)
})
