import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const implementation = readFileSync(new URL("./search-field.tsx", import.meta.url), "utf8");
const clearableBehavior = readFileSync(new URL("./input/use-clearable-input.ts", import.meta.url), "utf8");
const inputModule = readFileSync(new URL("./input.tsx", import.meta.url), "utf8");
const tableSpecimen = readFileSync(new URL("../../../../apps/sirio/src/app/(catalog)/components/table/page.tsx", import.meta.url), "utf8");
const packageJson = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));
const primitive = implementation.slice(implementation.indexOf("function SearchField("), implementation.indexOf("function SearchResults("));

test("SearchField composes the canonical Input and IconButton without owning search logic", () => {
  assert.equal(packageJson.exports["./components/*"], "./src/components/*.tsx");
  assert.match(implementation, /import \{ IconButton \} from "#components\/icon-button"/);
  assert.match(implementation, /import \{ Input \} from "#components\/input"/);
  assert.match(implementation, /<Input[\s\S]*type="search"/);
  assert.match(implementation, /import \{ IconAction \} from "#components\/icon-action"/);
  assert.match(implementation, /<IconButton[\s\S]*<IconAction intent="clear"/);
  assert.doesNotMatch(primitive, /#components\/button|CloseButton|debounce|fetch\(|filter\(|loading/);
});

test("SearchField clear follows the displayed value for controlled and uncontrolled input", () => {
  assert.match(implementation, /useClearableInput\(\{/);
  assert.doesNotMatch(primitive, /useState|setNativeInputValue|assignRef/);
  assert.match(clearableBehavior, /const isControlled = value !== undefined/);
  assert.match(clearableBehavior, /String\(defaultValue \?\? ""\)/);
  assert.match(clearableBehavior, /displayedValue = isControlled \? String\(value \?\? ""\) : uncontrolledValue/);
  assert.match(clearableBehavior, /clearable = true/);
  assert.match(clearableBehavior, /canClear = clearable && !disabled && !readOnly/);
  assert.match(clearableBehavior, /setNativeInputValue\(input, ""\)/);
  assert.match(clearableBehavior, /input\.dispatchEvent\(new Event\("input", \{ bubbles: true \}\)\)/);
  assert.match(clearableBehavior, /onClear\?\.\(\)/);
  assert.match(clearableBehavior, /input\.focus\(\{ preventScroll: true \}\)/);
  assert.match(clearableBehavior, /input\.setSelectionRange\(0, 0\)/);
  assert.doesNotMatch(clearableBehavior, /Boolean\(onClear/);
});

test("SearchField reserves icon geometry and SearchResults is not a live region by default", () => {
  assert.match(implementation, /className="peer pl-10 pr-14 /);
  assert.match(implementation, /absolute inset-y-0 right-1\.5 flex items-center/);
  assert.match(implementation, /pointer-events-none[\s\S]*aria-hidden="true"|aria-hidden="true"[\s\S]*pointer-events-none/);
  assert.match(clearableBehavior, /event\.key !== "Escape"/);
  assert.match(clearableBehavior, /event\.nativeEvent\.isComposing/);
  assert.match(clearableBehavior, /event\.preventDefault\(\)[\s\S]*clear\(\)/);
  assert.doesNotMatch(clearableBehavior, /stopPropagation/);
  assert.match(implementation, /webkit-search-cancel-button/);
  assert.doesNotMatch(inputModule, /webkit-search-(?:decoration|cancel-button|results-button|results-decoration)/);
  assert.doesNotMatch(inputModule, /function SearchInput|\n  SearchInput,/);
  assert.match(tableSpecimen, /import \{ SearchField \} from "@qoovex\/ui\/components\/search-field"/);
  assert.doesNotMatch(tableSpecimen, /SearchInput/);
  assert.match(implementation, /function SearchResults/);
  assert.doesNotMatch(implementation.slice(implementation.indexOf("function SearchResults")), /aria-live=/);
});

test("SearchResults owns the shared no-match presentation, not query execution", () => {
  const results = implementation.slice(implementation.indexOf("function SearchResults("));
  assert.match(results, /empty = false/);
  assert.match(results, /<Empty variant="ghost"/);
  assert.match(results, /<EmptyHeader role="status">/);
  assert.match(results, /<EmptyTitle>Nessun risultato<\/EmptyTitle>/);
  assert.match(results, /onReset \? \(/);
  assert.match(results, /onClick=\{onReset\}/);
  assert.match(results, /Ricomincia la ricerca[\s\S]*<IconAction intent="retry"/);
  assert.doesNotMatch(results, /Ricomincia la ricerca[\s\S]*<IconAction intent="clear"/);
  assert.doesNotMatch(results, /useState|fetch\(|filter\(|debounce/);
});
