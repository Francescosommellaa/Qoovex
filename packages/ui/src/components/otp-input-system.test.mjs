import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const otp = readFileSync(new URL("./otp-input.tsx", import.meta.url), "utf8");
const base = readFileSync(new URL("../../styles/base.css", import.meta.url), "utf8");

test("OtpInput delegates value, validation, paste, focus progression and completion to Base UI", () => {
  assert.match(otp, /<OTPField\.Root/);
  assert.match(otp, /<OTPField\.Input/);
  assert.match(otp, /length=\{length\}/);
  assert.doesNotMatch(otp, /useState|useEffect|onPaste|onKeyDown|onChange|onComplete|autoSubmit\??=|setValue/);
  assert.doesNotMatch(otp, /status|Codice verificato|Codice errato|groupSeparator|\bmask\??=|sizeStyles/);
});

test("OtpInput is one stable Field surface without Action motion", () => {
  assert.match(otp, /className=\{cn\("qv-otp-field"/);
  assert.match(otp, /className=\{cn\("qv-otp-slot"/);
  assert.match(otp, /"--qv-otp-length": length/);
  assert.doesNotMatch(otp, /data-focus-owner|data-focus-target/);
  assert.match(base, /\.qv-otp-field\s*\{[\s\S]*grid-template-columns:\s*repeat\(var\(--qv-otp-length\), minmax\(0, 1fr\)\)[\s\S]*gap:\s*var\(--qv-otp-slot-gap\)/);
  assert.match(base, /\.qv-otp-slot\s*\{[\s\S]*border:\s*1px solid var\(--input\)[\s\S]*border-radius:\s*var\(--radius-md\)[\s\S]*background-color:\s*var\(--background\)/);
  assert.match(base, /\.qv-otp-slot:focus-visible\s*\{[\s\S]*background-color:/);
  assert.match(base, /\.qv-otp-field\[data-focused\]:not\(\[aria-invalid="true"\]\):not\(\[data-invalid\]\)/);
  assert.match(base, /\.qv-otp-field:is\(\[aria-invalid="true"\], \[data-invalid\]\)/);
  assert.match(base, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.qv-otp-slot[\s\S]*transition:\s*none/);
  assert.doesNotMatch(otp, /transition-all|scale-|translate-|otp-shake|motion\/react|bg-transparent|opacity-50/);
});
