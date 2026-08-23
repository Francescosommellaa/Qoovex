import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const read = (path) => readFileSync(join(root, path), "utf8");

function filesUnder(path) {
  const absolute = join(root, path);
  return readdirSync(absolute).flatMap((entry) => {
    const child = join(absolute, entry);
    return statSync(child).isDirectory()
      ? filesUnder(relative(root, child))
      : [relative(root, child).replaceAll("\\", "/")];
  });
}

test("Fontshare loads only the canonical, actually available font weights", () => {
  const loader = read("packages/ui/src/components/fontshare-fonts.tsx");
  assert.match(loader, /general-sans@400,500,600,700&display=swap/);
  assert.match(loader, /array@400,600,700&display=swap/);
  assert.doesNotMatch(loader, /array@[^"\n]*500/);
});

test("ARRAY never relies on synthetic 500 inside the shared package", () => {
  const base = read("packages/ui/styles/base.css");
  const design = read("packages/ui/DESIGN.md");
  const sources = filesUnder("packages/ui/src").filter((file) =>
    [".ts", ".tsx"].includes(extname(file)),
  );

  assert.match(base, /\.font-accent\s*\{[^}]*font-synthesis-weight:\s*none/s);
  assert.match(design, /\*\*Label \/ metadata\*\* \(600, `0\.75rem`, 1\.333, tracking `0\.08em`\)/);

  for (const file of sources) {
    const source = read(file);
    assert.doesNotMatch(
      source,
      /(?:font-accent[^"'\n]*font-medium|font-medium[^"'\n]*font-accent)/,
      `${file} richiede ARRAY 500, peso non disponibile dal provider`,
    );
  }
});
