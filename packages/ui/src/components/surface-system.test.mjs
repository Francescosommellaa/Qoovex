import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const tokens = readFileSync(new URL("../../styles/tokens.css", import.meta.url), "utf8");
const base = readFileSync(new URL("../../styles/base.css", import.meta.url), "utf8");

function tokenValue(name) {
  const match = new RegExp(`\\s${name}:\\s*([^;]+);`).exec(tokens);
  assert.ok(match, `missing ${name}`);
  return match[1].trim();
}

test("2xs and xs are an explicit compatibility alias rather than two elevation levels", () => {
  assert.equal(tokenValue("--shadow-2xs"), tokenValue("--shadow-xs"));
  assert.match(tokens, /Compatibility alias: 2xs and xs have never represented distinct planes/);
});

test("surface roles bind the approved tone, border and elevation combinations", () => {
  assert.equal(tokenValue("--elevation-raised"), "var(--shadow-sm)");
  assert.equal(tokenValue("--elevation-floating"), "var(--shadow-md)");
  assert.equal(tokenValue("--elevation-modal"), "var(--shadow-xl)");

  for (const role of ["base", "contained", "raised", "floating", "modal"]) {
    assert.match(base, new RegExp(`\\.qv-surface-${role}\\b`));
  }

  const contractStart = base.lastIndexOf("/*", base.indexOf("Surface roles are deliberate bundles"));
  const contract = base.slice(
    contractStart,
    base.indexOf("Canonical focus owner"),
  );
  assert.match(contract, /border: 1px solid transparent/);
  assert.match(contract, /box-shadow: var\(--elevation-raised\)/);
  assert.match(contract, /box-shadow: var\(--elevation-floating\)/);
  assert.match(contract, /box-shadow: var\(--elevation-modal\)/);
  const declarations = contract.replace(/\/\*[\s\S]*?\*\//g, "");
  assert.doesNotMatch(declarations, /z-index|position:/);
});

test("semantic surface colors are available to Tailwind utilities", () => {
  for (const role of ["destructive", "info", "success", "warning"]) {
    assert.match(tokens, new RegExp(`--color-${role}-surface: var\\(--${role}-surface\\);`));
  }
});

test("modal backdrop and forced-colors preserve separation without shadow", () => {
  assert.equal(tokenValue("--backdrop-modal"), "oklch(0 0 0 / 0.5)");
  assert.match(base, /\.qv-backdrop-modal\s*\{[\s\S]*?backdrop-filter: blur\(var\(--backdrop-blur\)\)/);
  assert.match(base, /prefers-reduced-transparency: reduce[\s\S]*?\.qv-backdrop-modal[\s\S]*?backdrop-filter: none/);
  assert.match(base, /forced-colors: active[\s\S]*?border-color: CanvasText;[\s\S]*?box-shadow: none/);
});
