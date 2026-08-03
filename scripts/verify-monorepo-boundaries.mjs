import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const root = process.cwd();
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);
const violations = [];

async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (["node_modules", ".next", "generated", "dist"].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await visit(path);
      continue;
    }
    if (!sourceExtensions.has(extname(entry.name))) continue;
    const source = await readFile(path, "utf8");
    if (/from\s+["'][^"']*apps\//.test(source) || /import\(["'][^"']*apps\//.test(source)) {
      violations.push(relative(root, path));
    }
  }
}

await visit(join(root, "apps"));
if (violations.length > 0) {
  throw new Error(`Cross-app imports are forbidden: ${violations.join(", ")}`);
}

console.log("Monorepo app boundaries verified.");
