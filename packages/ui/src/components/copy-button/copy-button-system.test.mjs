import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const implementation = readFileSync(new URL("./copy-button-client.tsx", import.meta.url), "utf8")
const securityFlow = readFileSync(new URL("../../../../../apps/workspace/src/views/account-security/AccountSecurityFlow.tsx", import.meta.url), "utf8")
const tokenExplorer = readFileSync(new URL("../../../../../apps/sirio/src/components/token-explorer.tsx", import.meta.url), "utf8")

test("CopyButton owns a truthful transient clipboard state machine", () => {
  assert.match(implementation, /"idle" \| "copying" \| "success" \| "error"/)
  assert.match(implementation, /await clipboard\.writeText\(value\)/)
  assert.match(implementation, /if \(!clipboard\?\.writeText\) throw/)
  assert.match(implementation, /setCopyState\("success"\)/)
  assert.match(implementation, /setCopyState\("error"\)/)
  assert.doesNotMatch(implementation, /aria-pressed|data-[^=]*value|console\.|IconLoader|toast|confetti/)
})

test("CopyButton restarts one bounded feedback timer and cleans up async work", () => {
  assert.match(implementation, /COPY_FEEDBACK_HOLD_MS = 1000/)
  assert.match(implementation, /window\.clearTimeout\(resetTimerRef\.current\)/)
  assert.match(implementation, /requestIdRef\.current \+= 1/)
  assert.match(implementation, /requestId !== requestIdRef\.current/)
  assert.match(implementation, /mountedRef\.current = false/)
})

test("CopyButton composes IconButton material with a designed Copy Check Error transition", () => {
  assert.match(implementation, /<IconButtonRoot/)
  assert.match(implementation, /size="sm"/)
  assert.match(implementation, /variant="ghost"/)
  assert.doesNotMatch(implementation, /AnimatePresence|mode="wait"/)
  assert.match(implementation, /<IconAction intent="copy" state=\{copyState\}/)
  assert.doesNotMatch(implementation, /IconCopy|IconCheck|IconAlertCircle|iconTarget|motion\/react/)
  assert.match(implementation, /Copiato negli appunti/)
  assert.match(implementation, /Copia non riuscita\. Riprova\./)
  assert.match(implementation, /data-slot="copy-button-status"/)
  assert.match(implementation, /role="status"/)
  assert.match(implementation, /<\/IconButtonRoot>[\s\S]*data-slot="copy-button-status"/)
})

test("sensitive and whole-card copy flows remain intentional non-migrations", () => {
  assert.match(securityFlow, /copySensitiveValue/)
  assert.match(securityFlow, /Copia i codici/)
  assert.match(securityFlow, /Copia il secret/)
  assert.doesNotMatch(securityFlow, /CopyButton/)
  assert.match(tokenExplorer, /role="button"/)
  assert.match(tokenExplorer, /navigator\.clipboard\.writeText/)
  assert.doesNotMatch(tokenExplorer, /CopyButton/)
})
