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
const legacyConsumerCssSources = readSources([
  ...collectFiles(join(root, "apps", "web", "src"), (file) => file.endsWith(".css")),
  ...collectFiles(join(root, "apps", "workspace", "src"), (file) => file.endsWith(".css")),
]);
const sirioBoundarySources = readSources([
  join(root, "apps", "sirio", "package.json"),
  join(root, "apps", "sirio", "next.config.ts"),
  join(root, "apps", "sirio", "tsconfig.json"),
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

function readHexToken(source, name) {
  const match = source.match(new RegExp(`${name}:\\s*(#[0-9a-f]{6})`, "i"));
  if (!match) throw new Error(`Token colore non leggibile: ${name}`);
  return match[1];
}

function relativeLuminance(hex) {
  const channels = hex.slice(1).match(/.{2}/g).map((channel) => Number.parseInt(channel, 16) / 255);
  const linear = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(foreground, background) {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

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

if (!marketingLayoutSource.includes('<html lang="it">')) {
  throw new Error("apps/web deve dichiarare la lingua italiana sul documento.");
}

if (webSources.includes("data-theme") || webSources.includes("prefers-color-scheme")) {
  throw new Error("apps/web deve restare light-first senza selettori o dipendenze di tema.");
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
  "@theme inline",
  "--qv-ref-color-field",
  "--qv-bg-canvas",
  "--qv-surface-content",
  "--qv-fg-primary",
  "--qv-border-default",
  "--qv-action-primary",
  "--qv-state-info",
  "--qv-focus-ring",
  "--qv-font-family-sans",
  "--qv-font-size-display",
  "--qv-space-page",
  "--qv-space-section",
  "--qv-size-control",
  "--qv-radius-control",
  "--qv-elevation-overlay",
  "--qv-motion-duration-standard",
  "--qv-container-content",
  "--qv-z-overlay",
  "--breakpoint-qv-md",
  "--qv-trace-color",
  "--qv-terminal-width",
  '"General Sans"',
  '"Cabinet Grotesk"',
]) {
  if (!tokenSource.includes(requiredToken)) {
    throw new Error(`Token foundation mancante: ${requiredToken}`);
  }
}

const subtleOnCanvas = contrastRatio(
  readHexToken(tokenSource, "--qv-ref-color-ink-subtle"),
  readHexToken(tokenSource, "--qv-ref-color-field"),
);

if (subtleOnCanvas < 4.5) {
  throw new Error(`Il testo sottile sul Campo non raggiunge WCAG AA: ${subtleOnCanvas.toFixed(2)}:1`);
}

if (!tokenSource.includes("--qv-overlay-scrim: rgb(32 35 31 / 0.58)")) {
  throw new Error("Il ruolo overlay deve usare Inchiostro al 58%.");
}

if (/@theme\s+static/.test(tokenSource)) {
  throw new Error("Il bridge Tailwind non deve forzare l'emissione con @theme static.");
}

const publicCssSources = `${baseSource}\n${legacyConsumerCssSources}`;
const tailwindBridgeReference = /var\(--(?:color|font|text|tracking|spacing|radius|shadow|ease|duration|container|z-index)-qv-/;

if (tailwindBridgeReference.test(publicCssSources)) {
  throw new Error("Base o consumer usano direttamente il bridge Tailwind invece dei token semantici.");
}

if (/var\(--qv-ref-/.test(publicCssSources)) {
  throw new Error("Base o consumer usano direttamente un reference token privato.");
}

const definedQvTokens = new Set(
  [...tokenSource.matchAll(/(--qv-[a-z0-9-]+)\s*:/g)].map((match) => match[1]),
);
const referencedQvTokens = new Set(
  [...publicCssSources.matchAll(/var\((--qv-[a-z0-9-]+)/g)].map((match) => match[1]),
);

for (const referencedToken of referencedQvTokens) {
  if (!definedQvTokens.has(referencedToken)) {
    throw new Error(`Token semantico non definito: ${referencedToken}`);
  }
}

for (const obsoleteSizeToken of ["--spacing-qv-9:", "--spacing-qv-10:", "--spacing-qv-12:", "--spacing-qv-24:"]) {
  if (tokenSource.includes(obsoleteSizeToken)) {
    throw new Error(`Token dimensionale ambiguo ancora presente: ${obsoleteSizeToken}`);
  }
}

for (const retiredToken of [
  "surface-raised",
  "surface-sunken",
  "shadow-qv-control",
  "shadow-qv-pressed",
  "radius-qv-pill",
  "z-index-qv-raised",
  "[data-theme=\"dark\"]",
]) {
  if (tokenSource.includes(retiredToken) || baseSource.includes(retiredToken)) {
    throw new Error(`Fondazione legacy ancora presente: ${retiredToken}`);
  }
}

if (tokenSource.includes("prefers-color-scheme") || uiSources.includes("data-theme")) {
  throw new Error("La fondazione deve essere esclusivamente light-first.");
}

for (const requiredBaseRule of [
  "min-block-size: 100dvh",
  "text-size-adjust: 100%",
  "prefers-reduced-motion",
  "forced-colors: active",
  ".qv-trace",
  ".qv-trace-node",
  '[data-kind="gap"]',
  '[data-kind="terminal"]',
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

for (const appName of ["web", "workspace"]) {
  const globalSource = readFileSync(join(root, "apps", appName, "src", "app", "globals.css"), "utf8");
  for (const requiredImport of canonicalStyleImports) {
    if (!globalSource.includes(requiredImport)) {
      throw new Error(`${appName}/globals.css non riusa la foundation canonica: ${requiredImport}`);
    }
  }
}

const sirioGlobalSource = readFileSync(join(root, "apps", "sirio", "src", "app", "globals.css"), "utf8");

for (const requiredSirioFoundation of [
  '@import "tailwindcss";',
  '@import "tw-animate-css";',
  "@custom-variant dark",
  '[data-theme="vercel"]',
  "@theme inline",
]) {
  if (!sirioGlobalSource.includes(requiredSirioFoundation)) {
    throw new Error(`sirio/globals.css non contiene la foundation app-local richiesta: ${requiredSirioFoundation}`);
  }
}

for (const forbiddenSirioDependency of [
  "@qoovex/ui",
  "@qoovex/brand-resources/styles/fontshare.css",
]) {
  if (sirioSources.includes(forbiddenSirioDependency) || sirioBoundarySources.includes(forbiddenSirioDependency)) {
    throw new Error(`apps/sirio viola il confine della sandbox app-local: ${forbiddenSirioDependency}`);
  }
}

if (workspaceSources.includes("--qvx-") || workspaceSources.includes("styles.muted")) {
  throw new Error("apps/workspace contiene alias o utility generiche locali invece dei token condivisi.");
}

if (/#[0-9a-f]{3,8}\b|rgba?\(/i.test(legacyConsumerCssSources)) {
  throw new Error("I CSS delle app contengono colori hardcoded invece dei token semantici condivisi.");
}

if (/border-radius:\s*(?:[0-9.]+(?:px|rem)|999px)/i.test(legacyConsumerCssSources)) {
  throw new Error("I CSS delle app contengono raggi hardcoded invece della scala condivisa.");
}

for (const retiredExport of ["Card", "Panel", "Badge", "Status"]) {
  const retiredFile = join(root, "packages", "ui", "src", "components", `${retiredExport}.tsx`);
  if (existsSync(retiredFile) || new RegExp(`export\\s+(?:type\\s+)?\\{[^}]*\\b${retiredExport}\\b`).test(uiSources)) {
    throw new Error(`Primitiva legacy ancora pubblica: ${retiredExport}`);
  }
}

for (const retiredConsumerPattern of [
  "WorkspaceStatusBadge",
  "statusPill",
  "qv-card",
  "surface-raised",
  "surface-sunken",
]) {
  if (webSources.includes(retiredConsumerPattern) || sirioSources.includes(retiredConsumerPattern) || workspaceSources.includes(retiredConsumerPattern)) {
    throw new Error(`Consumer legacy ancora presente: ${retiredConsumerPattern}`);
  }
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
