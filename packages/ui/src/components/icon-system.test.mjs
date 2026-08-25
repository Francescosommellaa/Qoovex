import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const tokens = read("../../styles/tokens.css");
const base = read("../../styles/base.css");
const packageJson = JSON.parse(read("../../package.json"));
const buttonClient = read("./button/button-client.tsx");
const buttonVariants = read("./button/button-variants.ts");
const alert = read("./alert.tsx");
const table = read("./table.tsx");
const spinner = read("./spinner.tsx");

test("the icon scale is semantic and Tabler remains the only functional icon dependency", () => {
  for (const contract of [
    "--icon-compact: 0.875rem",
    "--icon: 1rem",
    "--icon-emphasized: 1.25rem",
    "--icon-illustrative: 1.75rem",
    ".qv-icon-compact",
    ".qv-icon-default",
    ".qv-icon-emphasized",
    ".qv-icon-illustrative",
  ]) {
    assert.ok(`${tokens}\n${base}`.includes(contract), `missing icon contract ${contract}`);
  }

  assert.equal(packageJson.dependencies["@tabler/icons-react"], "^3.45.0");
  for (const alternative of ["lucide-react", "@heroicons/react", "react-icons", "phosphor-react"]) {
    assert.equal(packageJson.dependencies[alternative], undefined);
  }
});

test("generic descendant selectors do not apply semantic motion or optical offsets", () => {
  assert.doesNotMatch(buttonVariants, /group-hover\/button:\[&_svg/);
  assert.doesNotMatch(buttonVariants, /\[&_svg\]:transition-transform/);
  assert.match(alert, /\[&>svg\]:translate-y-0\.5/);
  assert.doesNotMatch(alert, /\[&_svg\]:translate-y/);
});

test("icon-only pagination and loaders keep semantics on their owner", () => {
  assert.match(table, /aria-label="Pagina precedente"/);
  assert.match(table, /aria-label="Pagina successiva"/);
  assert.match(table, /IconChevronLeft aria-hidden="true"/);
  assert.match(buttonClient, /aria-hidden="true"[\s\S]*data-slot="button-loader"/);
  assert.match(buttonClient, /IconLoader2 className=\{cn\(loading && "animate-spin", "motion-reduce:animate-none"\)\}/);
  assert.match(spinner, /aria-hidden="true"[\s\S]*motion-reduce:animate-none/);
});
