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
const workspaceSources = readSources(collectFiles(join(root, "apps", "workspace", "src"), codeFile));
const consumerCssSources = readSources([
  ...collectFiles(join(root, "apps", "web", "src"), (file) => file.endsWith(".css")),
  ...collectFiles(join(root, "apps", "sirio", "src"), (file) => file.endsWith(".css")),
  ...collectFiles(join(root, "apps", "workspace", "src"), (file) => file.endsWith(".css")),
]);
const uiSources = readSources([
  ...collectFiles(join(root, "packages", "ui", "src"), codeFile),
  ...collectFiles(join(root, "packages", "ui", "styles"), codeFile),
]);
const tokenSource = readFileSync(join(root, "packages", "ui", "styles", "tokens.css"), "utf8");
const baseSource = readFileSync(join(root, "packages", "ui", "styles", "base.css"), "utf8");
const brandFontSource = readFileSync(join(root, "packages", "brand-resources", "styles", "fontshare.css"), "utf8");
const marketingLayoutSource = readFileSync(join(root, "apps", "web", "src", "app", "layout.tsx"), "utf8");
const marketingForbidden = /sei a norma|conformita garantita|validita legale|legalmente valido|abilitato automaticamente|obbligatorio per legge|GDPR compliant|privacy garantita|cancellazione legale/i;

if (webSources.match(marketingForbidden)) {
  throw new Error("apps/web contiene copy vietata.");
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

if (!marketingLayoutSource.includes('<html lang="it" data-theme="light">')) {
  throw new Error("apps/web deve bloccare esplicitamente il sito marketing sul tema light.");
}

if (webSources.includes('data-theme="dark"') || webSources.includes("prefers-color-scheme")) {
  throw new Error("apps/web non puo contenere un tema dark o dipendere dal tema di sistema.");
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

for (const forbiddenDomainName of ["DocumentStatus", "OrganizationRole", "Permission", "organizationId"]) {
  if (uiSources.includes(forbiddenDomainName)) {
    throw new Error(`packages/ui contiene un riferimento di dominio: ${forbiddenDomainName}`);
  }
}

for (const requiredToken of [
  "@theme static",
  "--spacing-qv-page",
  "--spacing-qv-section",
  "--spacing-qv-control",
  "--container-qv-reading",
  "--container-qv-content",
  "--container-qv-wide",
  "--text-qv-display",
  "--color-qv-focus",
  "--color-qv-surface-raised",
  "--color-qv-surface-sunken",
  "--shadow-qv-control",
  "--shadow-qv-pressed",
  "[data-theme=\"dark\"]",
  '"General Sans"',
  '"Cabinet Grotesk"',
]) {
  if (!tokenSource.includes(requiredToken)) {
    throw new Error(`Token foundation mancante: ${requiredToken}`);
  }
}

for (const obsoleteSizeToken of ["--spacing-qv-9:", "--spacing-qv-10:", "--spacing-qv-12:", "--spacing-qv-24:"]) {
  if (tokenSource.includes(obsoleteSizeToken)) {
    throw new Error(`Token dimensionale ambiguo ancora presente: ${obsoleteSizeToken}`);
  }
}

if (tokenSource.includes("prefers-color-scheme")) {
  throw new Error("La fondazione deve usare light come default; il dark richiede data-theme esplicito.");
}

for (const requiredBaseRule of [
  "min-block-size: 100dvh",
  "text-size-adjust: 100%",
  "prefers-reduced-motion",
  "forced-colors: active",
  ".qv-surface-raised",
  ".qv-surface-sunken",
  ".qv-text-muted",
]) {
  if (!baseSource.includes(requiredBaseRule)) {
    throw new Error(`Regola base foundation mancante: ${requiredBaseRule}`);
  }
}

for (const fontFamily of ["General Sans", "Cabinet Grotesk"]) {
  if (!brandFontSource.includes(`font-family: "${fontFamily}"`)) {
    throw new Error(`Fontshare provider incompleto: ${fontFamily}`);
  }
}

for (const retiredFontFamily of ["Satoshi", "Chillax"]) {
  if (brandFontSource.includes(retiredFontFamily)) {
    throw new Error(`Font precedente ancora presente nel provider: ${retiredFontFamily}`);
  }
}

const canonicalStyleImports = [
  '@import "tailwindcss";',
  '@import "@qoovex/brand-resources/styles/fontshare.css";',
  '@import "@qoovex/ui/styles/tokens.css";',
  '@import "@qoovex/ui/styles/base.css";',
];

for (const appName of ["web", "sirio", "workspace"]) {
  const globalSource = readFileSync(join(root, "apps", appName, "src", "app", "globals.css"), "utf8");
  for (const requiredImport of canonicalStyleImports) {
    if (!globalSource.includes(requiredImport)) {
      throw new Error(`${appName}/globals.css non riusa la foundation canonica: ${requiredImport}`);
    }
  }
}

if (workspaceSources.includes("--qvx-") || workspaceSources.includes("styles.muted")) {
  throw new Error("apps/workspace contiene alias o utility generiche locali invece dei token condivisi.");
}

if (/#[0-9a-f]{3,8}\b|rgba?\(/i.test(consumerCssSources)) {
  throw new Error("I CSS delle app contengono colori hardcoded invece dei token semantici condivisi.");
}

if (/border-radius:\s*(?:[0-9.]+(?:px|rem)|999px)/i.test(consumerCssSources)) {
  throw new Error("I CSS delle app contengono raggi hardcoded invece della scala condivisa.");
}

const workspaceGlobalSource = readFileSync(join(root, "apps", "workspace", "src", "app", "globals.css"), "utf8");
if (/\n(?:html|body|\*)\s*\{/.test(workspaceGlobalSource)) {
  throw new Error("workspace/globals.css duplica regole base possedute da @qoovex/ui.");
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
