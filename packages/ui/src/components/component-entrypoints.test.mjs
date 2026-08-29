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
  assert.doesNotMatch(facade, /button-variants/);
  assert.doesNotMatch(facade, /buttonVariants/);
  assert.equal(existsSync(new URL("./button-client.tsx", import.meta.url)), false);
  assert.equal(existsSync(new URL("./button-variants.ts", import.meta.url)), false);
  assert.equal(existsSync(new URL("./button/button-client.tsx", import.meta.url)), true);
  assert.equal(existsSync(new URL("./button/button-variants.ts", import.meta.url)), true);
});

test("Link owns anchor styling without importing Button internals", () => {
  const link = read("./link.tsx");

  assert.match(link, /React\.ComponentProps<"a">/);
  assert.match(link, /data-slot="link"/);
  assert.match(link, /export \{ Link, linkVariants \}/);
  assert.doesNotMatch(link, /buttonVariants|components\/button|\.\/button/);
  assert.doesNotMatch(link, /Button/);
});

test("IconButton keeps one public facade and private internals", () => {
  const facade = read("./icon-button.tsx");

  assert.equal(packageJson.exports["./components/icon-button/*"], null);
  assert.match(facade, /\.\/icon-button\/icon-button-client/);
  assert.doesNotMatch(facade, /icon-button-variants|buttonVariants/);
  assert.equal(existsSync(new URL("./icon-button-client.tsx", import.meta.url)), false);
  assert.equal(existsSync(new URL("./icon-button/icon-button-client.tsx", import.meta.url)), true);
});

test("IconAction keeps one public facade and private glyph-motion internals", () => {
  const facade = read("./icon-action.tsx");

  assert.equal(packageJson.exports["./components/icon-action/*"], null);
  assert.match(facade, /\.\/icon-action\/icon-action-client/);
  assert.doesNotMatch(facade, /IconArrow|IconEye|motion\/react|interactionContext/);
  assert.equal(existsSync(new URL("./icon-action-client.tsx", import.meta.url)), false);
  assert.equal(existsSync(new URL("./icon-action/icon-action-client.tsx", import.meta.url)), true);
});


test("ToggleButton keeps one public facade and private internals", () => {
  const facade = read("./toggle-button.tsx");

  assert.equal(packageJson.exports["./components/toggle-button/*"], null);
  assert.match(facade, /\.\/toggle-button\/toggle-button-client/);
  assert.doesNotMatch(facade, /toggle-button-variants|buttonVariants|iconButtonVariants/);
  assert.equal(existsSync(new URL("./toggle-button-client.tsx", import.meta.url)), false);
  assert.equal(existsSync(new URL("./toggle-button/toggle-button-client.tsx", import.meta.url)), true);
});

test("CloseButton keeps one public facade and private internals", () => {
  const facade = read("./close-button.tsx");

  assert.equal(packageJson.exports["./components/close-button/*"], null);
  assert.match(facade, /\.\/close-button\/close-button-client/);
  assert.doesNotMatch(facade, /IconX|icon-button/);
  assert.equal(existsSync(new URL("./close-button-client.tsx", import.meta.url)), false);
  assert.equal(existsSync(new URL("./close-button/close-button-client.tsx", import.meta.url)), true);
});

test("CopyButton keeps one public facade and private internals", () => {
  const facade = read("./copy-button.tsx");

  assert.equal(packageJson.exports["./components/copy-button/*"], null);
  assert.match(facade, /\.\/copy-button\/copy-button-client/);
  assert.doesNotMatch(facade, /IconCopy|navigator\.clipboard|icon-button/);
  assert.equal(existsSync(new URL("./copy-button-client.tsx", import.meta.url)), false);
  assert.equal(existsSync(new URL("./copy-button/copy-button-client.tsx", import.meta.url)), true);
});
