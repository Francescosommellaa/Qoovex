import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const number = readFileSync(new URL("./number-input.tsx", import.meta.url), "utf8");
const input = readFileSync(new URL("./input.tsx", import.meta.url), "utf8");

test("NumberInput delegates numeric behavior exclusively to Base UI", () => {
  for (const part of ["Root", "Group", "Input", "Decrement", "Increment"]) {
    assert.match(number, new RegExp(`<NumberField\\.${part}`));
  }
  assert.doesNotMatch(number, /useState|Number\(|parseFloat|onChangeValue|value\s*=\s*0|value\s*[+-]\s*step/);
  assert.doesNotMatch(input, /function NumberInput|onChangeValue/);
  assert.match(number, /allowWheelScrub=\{false\}/);
  for (const prop of ["value", "defaultValue", "onValueChange", "min", "max", "step", "form", "name", "required", "readOnly", "disabled"]) {
    assert.match(number, new RegExp(`${prop}=\\{${prop}\\}`));
  }
});

test("NumberInput reuses the Input visual and IconAction contracts", () => {
  assert.match(number, /inputControlClassName/);
  assert.match(input, /inputControlClassName/);
  assert.match(number, /ref=\{ref\}/);
  assert.match(number, /data-slot="input"/);
  for (const intent of ["increment", "decrement"]) assert.match(number, new RegExp(`<IconAction intent="${intent}"`));
  assert.match(number, /disabled=\{state.disabled \|\| state.readOnly\}/);
  assert.doesNotMatch(number, /IconPlus|IconMinus|motion\/react|onClick|\.focus\(|aria-pressed|type="number"/);
  assert.match(number, /event.nativeEvent.pointerType === ""\) event.preventDefault\(\)/);
});
