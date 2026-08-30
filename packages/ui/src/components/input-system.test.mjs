import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

const validationSource = readFileSync(new URL("./input/entry-validation.ts", import.meta.url), "utf8");
const validationModule = ts.transpileModule(validationSource, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { phoneEntryError, phoneNationalDigitLimit, sanitizePhoneEntry, urlEntryError, currencyEntryRules, currencyEntryError, formatCurrencyEntry, editCurrencyEntry } = await import(`data:text/javascript;base64,${Buffer.from(validationModule).toString("base64")}`);

test("Basic phone and URL validation rejects malformed entries without normalization or external checks", () => {
  assert.equal(phoneEntryError("3331234567", "+39"), null);
  assert.equal(phoneEntryError("", "+39"), null);
  for (const value of ["123", "+393331234567", "333 1234567", "333abc1234", "1".repeat(14)]) assert.ok(phoneEntryError(value, "+39"));
  assert.ok(phoneEntryError("3331234567", "invalid"));
  assert.equal(phoneNationalDigitLimit("+39"), 13);
  assert.equal(phoneNationalDigitLimit("+351"), 12);
  assert.equal(sanitizePhoneEntry("vvv +39 333-123-4567", "+39"), "393331234567");
  assert.equal(sanitizePhoneEntry("+39 333-123-4567", "+39"), "3331234567");
  assert.equal(sanitizePhoneEntry("1".repeat(30), "+351"), "1".repeat(12));
  assert.equal(urlEntryError("esempio.test/percorso?q=uno"), null);
  assert.equal(urlEntryError(""), null);
  for (const value of ["https://esempio.test", "esempio", "esempio .test", "user:secret@esempio.test", "esempio..test", "esempio.test:abc"]) assert.ok(urlEntryError(value));
});

test("Price guard rejects ambiguous separators, excess precision and unsafe magnitudes instead of rounding", () => {
  const euro = currencyEntryRules("EUR", "it-IT");
  assert.equal(currencyEntryError("", euro), null);
  assert.equal(currencyEntryError("0", euro), null);
  assert.equal(currencyEntryError("1250,50", euro), null);
  assert.equal(currencyEntryError("1.234,56", euro), null);
  assert.equal(formatCurrencyEntry("1250,5", euro), "1.250,50");
  assert.equal(editCurrencyEntry("1.250,50", euro), "1250,50");
  assert.equal(formatCurrencyEntry("12,345", euro), "12,345");
  assert.equal(formatCurrencyEntry("90071992547409,91", euro), "90.071.992.547.409,91");
  assert.equal(currencyEntryError("-12,50", euro), null);
  for (const value of ["1,234", "12.50", "€ 12", "1e6", "1234567890123456"]) assert.ok(currencyEntryError(value, euro));
  assert.ok(currencyEntryError("-12,50", euro, 0));
  assert.ok(currencyEntryError("101", euro, 0, 100));
  assert.equal(currencyEntryError("12.50", currencyEntryRules("USD", "en-US")), null);
  assert.ok(currencyEntryError("12,50", currencyEntryRules("USD", "en-US")));
  assert.equal(currencyEntryError("120", currencyEntryRules("JPY")), null);
  assert.ok(currencyEntryError("120,50", currencyEntryRules("JPY")));
});

const implementation = readFileSync(new URL("./input.tsx", import.meta.url), "utf8");
const base = readFileSync(new URL("../../styles/base.css", import.meta.url), "utf8");
const packageJson = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));
const baseInput = implementation.slice(implementation.indexOf("function Input("), implementation.indexOf("function InputGroup("));
const inputStyles = readFileSync(new URL("./input/input-styles.ts", import.meta.url), "utf8");
const groupImplementation = implementation.slice(implementation.indexOf("function InputGroup("), implementation.indexOf("function InputIcon("));

test("Phone and Currency have canonical entrypoints and share a private behavioral Select addon", () => {
  const phone = readFileSync(new URL("./phone-input.tsx", import.meta.url), "utf8");
  const currency = readFileSync(new URL("./currency-input.tsx", import.meta.url), "utf8");
  const addon = readFileSync(new URL("./input/selectable-addon.tsx", import.meta.url), "utf8");
  assert.equal(packageJson.exports["./components/input/*"], null);
  assert.doesNotMatch(implementation, /function (PhoneInput|CurrencyInput)|DEFAULT_COUNTRIES|DEFAULT_CURRENCIES/);
  for (const component of [phone, currency]) {
    assert.match(component, /<CompositeInput/);
    assert.match(component, /<SelectableAddon/);
    assert.doesNotMatch(component, /motion\/react|onWheel|setAmount|setNumber/);
  }
  assert.match(phone, /<Input \{\.\.\.props\} ref=\{inputRef\} type="tel"/);
  assert.doesNotMatch(phone, /countryFlagSources|flag:|searchLabel/);
  assert.match(phone, /value=\{selected\}/);
  assert.match(currency, /<Input inputMode="decimal"/);
  assert.match(currency, /value=\{display\}/);
  assert.match(currency, /formatCurrencyEntry/);
  assert.match(currency, /editCurrencyEntry/);
  assert.match(currency, /options.length === 1/);
  assert.doesNotMatch(currency, /Number\(|parseFloat|toFixed|value\s*[+-]\s*step/);
  assert.match(addon, /<Select value=\{value\} defaultValue=\{defaultValue\}/);
  assert.match(addon, /<SelectPrimitive\.Trigger render=/);
  assert.match(addon, /disabled=\{state.disabled \|\| readOnly\}/);
  assert.match(addon, /<IconAction intent="disclosure"/);
  assert.doesNotMatch(addon, /InputAddon/);
  assert.match(addon, /data-slot="selectable-addon"/);
  assert.doesNotMatch(addon, /useState|onKeyDown|onPointerDown|onClick|motion\/react/);
});

test("InputGroup and InputAddon remain explicit static composition without a second input API", () => {
  assert.match(groupImplementation, /qv-input-group qv-touch-target-field/);
  assert.match(groupImplementation, /data-focus-owner="composite"/);
  assert.match(groupImplementation, /qv-input-addon/);
  assert.match(groupImplementation, /shrink-0/);
  assert.doesNotMatch(groupImplementation, /truncate|text-ellipsis/);
  assert.doesNotMatch(groupImplementation, /useState|useEffect|cloneElement|onClick|tabIndex|bg-transparent|bg-input\/|bg-muted\//);
  assert.match(base, /\.qv-input-group > \.qv-input\[data-slot="input"\]\s*\{[^}]*border: 0;[^}]*background-color: transparent;[^}]*box-shadow: none/);
  assert.match(base, /\.qv-input-group:has\(> \.qv-input:disabled\)/);
  assert.match(base, /\.qv-input-group\[data-slot="input-group"\]:has\(> \.qv-input:focus-visible/);
  assert.doesNotMatch(base, /max-inline-size: 35%/);
  assert.match(base, /\.qv-input-addon\s*\{\s*flex: 0 0 auto/);
});

test("Input preserves one native public API and one intrinsic size", () => {
  assert.equal(packageJson.exports["./components/*"], "./src/components/*.tsx");
  assert.match(baseInput, /React\.ComponentProps<"input">/);
  assert.match(baseInput, /<InputPrimitive/);
  assert.match(baseInput, /data-slot="input"/);
  assert.match(baseInput, /inputControlClassName/);
  assert.match(inputStyles, /qv-input qv-touch-target-field h-9 w-full min-w-0 rounded-lg/);
  assert.match(inputStyles, /text-base text-foreground outline-none sm:text-sm/);
  assert.doesNotMatch(baseInput, /useState|useEffect|motion\/react|transition-all/);
});

test("Input owns an opaque stable surface without Action motion or opacity-only availability", () => {
  assert.match(base, /:where\(\.qv-input, \.qv-textarea, \.qv-textarea-frame\),\s*\.qv-input-group\s*\{\s*--qv-field-surface: var\(--background\)/);
  assert.match(base, /:where\(\.qv-input, \.qv-textarea\),\s*\.qv-input-group\s*\{[^}]*background-color:\s*var\(--qv-field-surface\)/);
  assert.match(base, /transition:\s*[\s\S]*border-color[\s\S]*background-color[\s\S]*color[\s\S]*outline-color[\s\S]*box-shadow/);
  assert.match(base, /:where\(\.qv-input, \.qv-textarea\)::placeholder\s*\{[\s\S]*color:\s*color-mix\(in oklch, var\(--muted-foreground\) 85%, var\(--background\)\)[\s\S]*opacity:\s*1/);
  assert.match(base, /@media \(hover: hover\) and \(pointer: fine\)[\s\S]*:where\(\.qv-input, \.qv-textarea\)/);
  assert.match(base, /:where\(\.qv-input, \.qv-textarea\):disabled,[^{]*\{\s*--qv-field-surface: var\(--secondary\)/);
  assert.match(base, /:where\(\.qv-input, \.qv-textarea\):is\(\[readonly\][^{]*\{\s*--qv-field-surface: var\(--muted\)/);
  const rootPresentation = (baseInput + inputStyles).replaceAll("file:bg-transparent", "");
  assert.doesNotMatch(rootPresentation, /bg-transparent|bg-input\/|bg-muted\/|opacity-|scale-|translate-|transition-all/);
});

test("Input composes real focus, invalid and forced-colors states without box-model changes", () => {
  assert.match(base, /:is\(\.qv-input\[data-slot="input"\], \.qv-textarea\[data-slot="textarea"\]\):focus-visible:not\(:where\(\[data-focus-owner="composite"\] \*\)\)[\s\S]*outline-width:\s*1px[\s\S]*outline-offset:\s*0/);
  assert.match(base, /:where\(\.qv-input, \.qv-textarea\):focus-visible:not\(\[aria-invalid="true"\]\):not\(:user-invalid\)[\s\S]*outline-color:\s*color-mix[\s\S]*box-shadow:\s*0 0 0 3px/);
  assert.match(base, /:where\(\.qv-input, \.qv-textarea\):is\(\[aria-invalid="true"\], :user-invalid\),\s*\.qv-input-group:has\(> \.qv-input:is\(\[aria-invalid="true"\], :user-invalid\)\)\s*\{[\s\S]*border-color:\s*var\(--destructive\)/);
  assert.match(base, /:is\(\.qv-input\[data-slot="input"\], \.qv-textarea\[data-slot="textarea"\]\):focus-visible:not\(:where\(\[data-focus-owner="composite"\] \*\)\):is\(\[aria-invalid="true"\], :user-invalid\)[\s\S]*var\(--destructive\)[\s\S]*box-shadow/);
  assert.match(base, /@media \(prefers-reduced-motion: reduce\)[\s\S]*:where\(\.qv-input, \.qv-textarea\)[\s\S]*transition-duration:\s*1ms !important/);
  assert.match(base, /@media \(forced-colors: active\)[\s\S]*:where\(\.qv-input, \.qv-textarea\)[\s\S]*background-color:\s*Field/);
  assert.match(base, /@media \(forced-colors: active\)[\s\S]*:is\(\.qv-input\[data-slot="input"\], \.qv-textarea\[data-slot="textarea"\]\):focus-visible:not\(:where\(\[data-focus-owner="composite"\] \*\)\)[\s\S]*outline:\s*2px solid Highlight/);
  assert.doesNotMatch(base, /\.qv-input[\s\S]{0,500}(?:border-width|transform|scale|translate)/);
});
