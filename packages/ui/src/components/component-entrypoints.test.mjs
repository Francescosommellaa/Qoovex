import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const packageJson = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));

test("Button keeps one public entry point and private responsibility boundaries", () => {
  const facade = read("./button.tsx");

  assert.equal(packageJson.exports["./components/*"], "./src/components/*.tsx");
  assert.equal(packageJson.exports["./components/button/*"], null);
  assert.equal(packageJson.exports["."], undefined);
  assert.equal(packageJson.exports["./internal/*"], undefined);
  assert.match(facade, /\.\/button\/button-client/);
  assert.match(facade, /\.\/button\/button-variants/);
  assert.equal(existsSync(new URL("./button-client.tsx", import.meta.url)), false);
  assert.equal(existsSync(new URL("./button-variants.ts", import.meta.url)), false);
  assert.equal(existsSync(new URL("./button/button-client.tsx", import.meta.url)), true);
  assert.equal(existsSync(new URL("./button/button-variants.ts", import.meta.url)), true);
});
