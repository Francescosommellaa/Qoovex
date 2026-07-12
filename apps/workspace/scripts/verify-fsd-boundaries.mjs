import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const sourceRoot = join(workspaceRoot, "src");
const layers = ["app", "views", "widgets", "features", "entities", "shared"];
const layerOrder = new Map(layers.map((layer, index) => [layer, index]));

function collectSourceFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = join(directory, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) return collectSourceFiles(fullPath);
    return /\.(ts|tsx)$/.test(fullPath) ? [fullPath] : [];
  });
}

function getLayer(file) {
  const [topLevel] = relative(sourceRoot, file).split(/[\\/]/);
  return layerOrder.has(topLevel) ? topLevel : undefined;
}

function getAliasedTargetLayer(source) {
  const match = source.match(/^@(shared|entities|features|widgets|views)\//);
  return match?.[1];
}

for (const file of collectSourceFiles(sourceRoot)) {
  const fromLayer = getLayer(file);
  if (!fromLayer) continue;

  const source = readFileSync(file, "utf8");
  const importPattern = /(?:from\s+|import\s*\()(["'])([^"']+)\1/g;
  for (const match of source.matchAll(importPattern)) {
    const targetLayer = getAliasedTargetLayer(match[2]);
    if (!targetLayer) continue;
    if (layerOrder.get(targetLayer) < layerOrder.get(fromLayer)) {
      throw new Error(`${relative(workspaceRoot, file)} importa verso l'alto da @${targetLayer}.`);
    }
  }
}

console.log("FSD boundary checks passed.");
