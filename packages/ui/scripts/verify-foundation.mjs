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

const codeFile = (file) => /\.(ts|tsx|css)$/.test(file) && !/\.(test|spec)\.(ts|tsx)$/.test(file);
const webSources = readSources(collectFiles(join(root, "apps", "web", "src"), codeFile));
const sirioSources = readSources(collectFiles(join(root, "apps", "sirio", "src"), codeFile));
const workspaceSources = readSources(collectFiles(join(root, "apps", "workspace", "src"), codeFile));
const uiSources = readSources([
  ...collectFiles(join(root, "packages", "ui", "src"), codeFile),
  ...collectFiles(join(root, "packages", "ui", "styles"), codeFile),
]);
const marketingForbidden = /sei a norma|conformita garantita|validita legale|legalmente valido|abilitato automaticamente|obbligatorio per legge|GDPR compliant|privacy garantita|cancellazione legale/i;
const allUiSources = [webSources, sirioSources, workspaceSources, uiSources].join("\n");

if (webSources.match(marketingForbidden)) {
  throw new Error("apps/web contiene copy vietata.");
}

if (allUiSources.match(/conformita garantita|documento certificato|cantiere conforme|lavoratore automaticamente abilitato|sicurezza legale assicurata/i)) {
  throw new Error("Le superfici UI contengono una promessa normativa vietata.");
}

for (const required of [
  "supporto@qoovex.com",
  "/privacy",
  "/terms",
  "/cookies",
  "/dpa",
  "/manuale-operativo",
  "qoovex-cookie-preference-v1",
]) {
  if (!webSources.includes(required)) {
    throw new Error(`apps/web non contiene elemento pre-commerciale richiesto: ${required}`);
  }
}

const trackingScriptPattern = /gtag\s*\(|googletagmanager|plausible\s*\(|posthog|fbq\s*\(/i;
if (trackingScriptPattern.test(webSources)) {
  throw new Error("apps/web contiene riferimenti a tracking non previsto.");
}

if (webSources.includes("@qoovex/db") || sirioSources.includes("@qoovex/db")) {
  throw new Error("apps/web o apps/sirio importano @qoovex/db.");
}

if (/from\s+["']\.\.\/\.\.\/apps|from\s+["']apps\//.test(uiSources)) {
  throw new Error("packages/ui importa da apps/*.");
}

const uiForbiddenImports = ["@qoovex/db", "next-auth", "@auth/", "@shared/", "@entities/", "@features/", "@widgets/", "@views/"];
for (const forbiddenImport of uiForbiddenImports) {
  if (uiSources.includes(forbiddenImport)) {
    throw new Error(`packages/ui importa una dipendenza proibita: ${forbiddenImport}`);
  }
}

if (/<svg\b/i.test(allUiSources)) {
  throw new Error("Le superfici UI contengono SVG inline invece di icone Phosphor.");
}

if (/lucide|@heroicons|react-icons|@tabler|hugeicons/i.test(allUiSources)) {
  throw new Error("Le superfici UI importano una libreria icone diversa da Phosphor.");
}

for (const packagePath of [
  ["packages", "ui", "package.json"],
  ["apps", "sirio", "package.json"],
  ["apps", "web", "package.json"],
  ["apps", "workspace", "package.json"],
]) {
  const packageSource = readFileSync(join(root, ...packagePath), "utf8");
  if (!packageSource.includes('"@phosphor-icons/react"')) {
    throw new Error(`${packagePath.join("/")} non dichiara @phosphor-icons/react.`);
  }
}

const tokenDeclarations = new Set([...allUiSources.matchAll(/(--(?:qv|qvx|color-qv|spacing-qv|radius-qv|shadow-qv|z-index-qv|text-qv|font-(?:sans|display))[a-z0-9-]*)\s*:/gi)].map((match) => match[1]));
const tokenReferences = new Set([...allUiSources.matchAll(/var\((--(?:qv|qvx|color-qv|spacing-qv|radius-qv|shadow-qv|z-index-qv|text-qv|font-(?:sans|display))[a-z0-9-]*)/gi)].map((match) => match[1]));
for (const token of tokenReferences) {
  if (!tokenDeclarations.has(token)) throw new Error(`Token CSS non definito: ${token}`);
}

for (const forbiddenDomainName of ["DocumentStatus", "OrganizationRole", "Permission", "organizationId"]) {
  if (uiSources.includes(forbiddenDomainName)) {
    throw new Error(`packages/ui contiene un riferimento di dominio: ${forbiddenDomainName}`);
  }
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
