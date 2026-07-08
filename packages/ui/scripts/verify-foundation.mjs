import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "..", "..", "..");

function collectFiles(dir, predicate) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) return collectFiles(fullPath, predicate);
    return predicate(fullPath) ? [fullPath] : [];
  });
}

function readSources(paths) {
  return paths.map((file) => readFileSync(file, "utf8")).join("\n");
}

const codeFile = (file) => /\.(ts|tsx|css)$/.test(file);
const webSources = readSources(collectFiles(join(root, "apps", "web", "src"), codeFile));
const sirioSources = readSources(collectFiles(join(root, "apps", "sirio", "src"), codeFile));
const uiSources = readSources([
  ...collectFiles(join(root, "packages", "ui", "src"), codeFile),
  ...collectFiles(join(root, "packages", "ui", "styles"), codeFile),
]);
const marketingForbidden = /sei a norma|conformita garantita|validita legale|legalmente valido|abilitato automaticamente|obbligatorio per legge|GDPR compliant|privacy garantita|cancellazione legale/i;

if (webSources.match(marketingForbidden)) {
  throw new Error("apps/web contiene copy vietata.");
}

if (webSources.includes("@qoovex/db") || sirioSources.includes("@qoovex/db")) {
  throw new Error("apps/web o apps/sirio importano @qoovex/db.");
}

if (/from\s+["']\.\.\/\.\.\/apps|from\s+["']apps\//.test(uiSources)) {
  throw new Error("packages/ui importa da apps/*.");
}

if (existsSync(join(root, "docs", "research")) || existsSync(join(root, "docs", "presets"))) {
  throw new Error("Sono state create cartelle research/presets non consentite.");
}

for (const forbidden of ["DURC", "POS", "DVR"]) {
  const pattern = new RegExp(`\\b${forbidden}\\b`);
  if (pattern.test(webSources) || pattern.test(sirioSources) || pattern.test(uiSources)) {
    throw new Error(`Preset o documento non validato rilevato: ${forbidden}`);
  }
}

console.log("Foundation static checks passed.");
