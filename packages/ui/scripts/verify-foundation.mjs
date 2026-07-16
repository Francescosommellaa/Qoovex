import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const apps = ["sirio", "web", "workspace"];
const approvedDependencies = [
  "@base-ui/react",
  "@tabler/icons-react",
  "class-variance-authority",
  "clsx",
  "next-themes",
  "recharts",
  "tailwind-merge",
  "tw-animate-css",
];

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function filesUnder(path) {
  const absolute = join(root, path);
  if (!existsSync(absolute)) return [];
  const result = [];
  for (const entry of readdirSync(absolute)) {
    const child = join(absolute, entry);
    if (statSync(child).isDirectory()) result.push(...filesUnder(relative(root, child)));
    else result.push(relative(root, child).replaceAll("\\", "/"));
  }
  return result;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const uiPackage = JSON.parse(read("packages/ui/package.json"));
assert(!uiPackage.exports?.["."], "@qoovex/ui non deve esporre un barrel root.");
for (const subpath of ["./components/*", "./hooks/*", "./lib/*", "./styles/base.css", "./styles/tokens.css"]) {
  assert(uiPackage.exports?.[subpath], `Export UI mancante: ${subpath}`);
}
for (const dependency of approvedDependencies) {
  assert(uiPackage.dependencies?.[dependency], `Dipendenza canonica mancante in packages/ui: ${dependency}`);
}
assert(!uiPackage.dependencies?.["@phosphor-icons/react"], "Phosphor non deve restare nella foundation canonica.");

const packageConfig = JSON.parse(read("packages/ui/components.json"));
assert(packageConfig.style === "base-nova", "packages/ui/components.json deve usare base-nova.");
assert(packageConfig.iconLibrary === "tabler", "packages/ui/components.json deve usare Tabler.");
assert(packageConfig.aliases?.ui === "#components", "packages/ui/components.json deve usare package imports interni.");
assert(packageConfig.aliases?.utils === "#lib/utils", "packages/ui/components.json deve usare #lib/utils.");
assert(uiPackage.imports?.["#components/*"], "Package import #components mancante.");
assert(uiPackage.imports?.["#hooks/*"], "Package import #hooks mancante.");
assert(uiPackage.imports?.["#lib/*"], "Package import #lib mancante.");

const packageSources = filesUnder("packages/ui/src").filter((file) => [".ts", ".tsx"].includes(extname(file)));
for (const file of packageSources) {
  const source = read(file);
  assert(!/@qoovex\/(db|types)|next-auth|@prisma|apps[\\/]/.test(source), `Boundary packages/ui violato: ${file}`);
  assert(!/from\s+["']@\/|from\s+["']\.\.\/\.\.\/apps/.test(source), `Import app-local vietato in packages/ui: ${file}`);
}

for (const app of apps) {
  const config = JSON.parse(read(`apps/${app}/components.json`));
  assert(config.style === "base-nova", `${app}/components.json deve usare base-nova.`);
  assert(config.iconLibrary === "tabler", `${app}/components.json deve usare Tabler.`);
  assert(config.aliases?.ui === "@qoovex/ui/components", `${app}/components.json deve puntare ai componenti condivisi.`);
  const globals = read(`apps/${app}/src/app/globals.css`);
  assert(globals.includes('@import "@qoovex/ui/styles/base.css";'), `${app}/globals.css deve importare base.css una sola volta.`);
  assert((globals.match(/@qoovex\/ui\/styles\/base\.css/g) ?? []).length === 1, `${app}/globals.css importa base.css piu volte.`);
  assert(globals.includes('@source "../**/*.{ts,tsx}";'), `${app}/globals.css deve includere le sorgenti app-locali Tailwind.`);
}

for (const forbidden of [
  "apps/sirio/src/components/ui",
  "apps/sirio/src/lib/utils.ts",
  "apps/sirio/src/hooks/use-mobile.ts",
  "apps/sirio/src/components/theme-provider.tsx",
  "apps/sirio/src/components/theme-toggle.tsx",
  "apps/sirio/THIRD_PARTY_NOTICES.md",
  "packages/ui/src/index.ts",
  "packages/brand-resources/styles/fontshare.css",
]) {
  assert(!existsSync(join(root, forbidden)), `Duplicazione o legacy ancora presente: ${forbidden}`);
}

const visualFiles = [
  ...filesUnder("packages/ui"),
  ...apps.flatMap((app) => filesUnder(`apps/${app}/src`)),
].filter((file) => [".ts", ".tsx", ".css"].includes(extname(file)));

for (const file of visualFiles) {
  const source = read(file);
  assert(!/from\s+["']@qoovex\/ui["']/.test(source), `Root import @qoovex/ui vietato: ${file}`);
  assert(!/--qv-[a-z0-9-]+|\.qv-[a-z0-9_-]+/.test(source), `Token o classe visuale legacy in ${file}`);
  assert(!/@phosphor-icons|phosphor-icons|fontshare|cdn\.fontshare\.com/i.test(source), `Provider legacy in ${file}`);
}

const base = read("packages/ui/styles/base.css");
const tokens = read("packages/ui/styles/tokens.css");
for (const required of ["prefers-reduced-motion", "::view-transition-new(root)", "@source", "@custom-variant dark"]) {
  assert(base.includes(required), `base.css non contiene ${required}`);
}
for (const required of ["--info", "--success", "--warning", "--destructive", "--sidebar", "--chart-1", "oklch("]) {
  assert(tokens.includes(required), `tokens.css non contiene ${required}`);
}

const notice = read("packages/ui/THIRD_PARTY_NOTICES.md");
assert(notice.includes("0edc5cf631ac7a8280112fd2bcb80312597bafdf"), "Commit sorgente mancante negli avvisi MIT.");
assert(/MIT License/i.test(notice), "Licenza MIT mancante negli avvisi.");

console.log("Canonical Qoovex design-system foundation verified.");
