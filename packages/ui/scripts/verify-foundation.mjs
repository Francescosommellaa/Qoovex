import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const apps = ["sirio", "web", "workspace"];
const read = (path) => readFileSync(join(root, path), "utf8");
function filesUnder(path) { const absolute = join(root, path); if (!existsSync(absolute)) return []; return readdirSync(absolute).flatMap((entry) => { const child = join(absolute, entry); return statSync(child).isDirectory() ? filesUnder(relative(root, child)) : [relative(root, child).replaceAll("\\", "/")]; }); }
function assert(condition, message) { if (!condition) throw new Error(message); }

const uiPackage = JSON.parse(read("packages/ui/package.json"));
assert(!uiPackage.exports?.["."], "@qoovex/ui non deve esporre un barrel root.");
for (const path of ["./components/*", "./hooks/*", "./lib/*", "./styles/base.css", "./styles/tokens.css"]) assert(uiPackage.exports?.[path], `Export UI mancante: ${path}`);
assert(uiPackage.dependencies?.["@tabler/icons-react"] || read("package.json").includes("@tabler/icons-react"), "Tabler deve restare la libreria icone applicativa approvata.");

for (const app of apps) {
  const config = JSON.parse(read(`apps/${app}/components.json`));
  assert(config.style === "base-nova" && config.iconLibrary === "tabler", `${app}: foundation visuale non canonica.`);
  const globals = read(`apps/${app}/src/app/globals.css`);
  assert((globals.match(/@qoovex\/ui\/styles\/base\.css/g) ?? []).length === 1, `${app}: base.css deve essere importato una volta.`);
}

const sourceFiles = [...filesUnder("packages/ui/src"), ...apps.flatMap((app) => filesUnder(`apps/${app}/src`))].filter((file) => [".ts", ".tsx", ".css"].includes(extname(file)));
for (const file of sourceFiles) {
  const source = read(file);
  if (file.startsWith("packages/ui/src/")) assert(!/@qoovex\/(db|types)|next-auth|@prisma|apps[\\/]/.test(source), `Boundary packages/ui violato: ${file}`);
  assert(!/from\s+["']@qoovex\/ui["']/.test(source), `Root import @qoovex/ui vietato: ${file}`);
  if (!file.endsWith("styles/tokens.css")) assert(!/^\s*--radius\s*:/m.test(source), `Copia locale di --radius vietata: ${file}`);
  assert(!/variant=["']link["']/.test(source), `La variant link non appartiene a Button: ${file}`);
  assert(!/<Button[^>]*render=\{<(?:a\b|Link\b)/s.test(source), `Button non puo possedere navigazione: ${file}`);
  assert(!/<(?:a|Link)\b[^>]*styles\.(?:linkButton|ghostButton)/.test(source), `Un anchor usa ancora styling button app-local: ${file}`);
  assert(!/\.linkButton\b/.test(source), `Foundation parallela linkButton vietata: ${file}`);
}

for (const file of [...sourceFiles.filter((file) => file.endsWith(".css")), "packages/ui/styles/base.css", "packages/ui/styles/tokens.css"]) {
  for (const declaration of read(file).matchAll(/border-radius\s*:\s*([^;\n]+)/g)) {
    const value = declaration[1].trim();
    assert(/^(?:var\(|calc\(|999px\b|0\b|inherit\b)/.test(value), `Radius CSS locale fuori dal contratto canonico: ${file} (${value}).`);
  }
}

const base = read("packages/ui/styles/base.css");
const tokens = read("packages/ui/styles/tokens.css");
const design = read("packages/ui/DESIGN.md");
const webDesign = read("apps/web/DESIGN.md");
const workspaceDesign = read("apps/workspace/DESIGN.md");
const sirioDesign = read("apps/sirio/DESIGN.md");
const spacingAndRadiusProof = read("apps/sirio/src/app/(catalog)/foundations/spacing-and-radius/page.tsx");
const surfaceProof = read("apps/sirio/src/app/(catalog)/foundations/surfaces/page.tsx");
const responsiveProof = read("apps/sirio/src/app/(catalog)/foundations/responsive/page.tsx");
const dropdownMenu = read("packages/ui/src/components/dropdown-menu.tsx");
const select = read("packages/ui/src/components/select.tsx");
const floatingNavigation = read("packages/ui/src/components/floating-navigation.tsx");
const link = read("packages/ui/src/components/link.tsx");
const emailTokens = read("apps/workspace/src/shared/server/email/transactional-email-tokens.ts");
for (const value of ["prefers-reduced-motion", "@custom-variant dark", "data-link=", "scrollbar-width: thin"]) assert(base.includes(value), `base.css non contiene ${value}`);
for (const value of ["--info", "--success", "--warning", "--warning-emphasis", "--destructive", "--sidebar", "oklch("]) assert(tokens.includes(value), `tokens.css non contiene ${value}`);
assert(tokens.includes("--font-sans: var(--ff-sans);") && tokens.includes("--font-accent: var(--ff-accent);"), "tokens.css deve esporre i token --font-sans e --font-accent.");
for (const value of ["--focus-ring-width: 2px", "--focus-ring-offset: 2px", "--focus-ring-color: var(--ring)"]) assert(tokens.includes(value), `Token focus canonico mancante: ${value}`);
assert(tokens.includes("--radius: 0.625rem"), "Token radius Qoovex canonico mancante.");
assert(!tokens.includes("--radius-action:"), "Il radius Action non deve duplicare il radius Qoovex canonico.");
assert(design.includes("R_esterno = R_interno + inset"), "Formula canonica dei raggi nidificati mancante.");
for (const [file, source, values] of [
  ["packages/ui/DESIGN.md", design, ['sm: "0.375rem"', 'md: "0.5rem"', 'lg: "0.625rem"', 'xl: "0.875rem"']],
  ["apps/web/DESIGN.md", webDesign, ['sm: "0.375rem"', 'md: "0.5rem"', 'lg: "0.625rem"', 'xl: "0.875rem"']],
  ["apps/sirio/DESIGN.md", sirioDesign, ['sm: "0.375rem"', 'md: "0.5rem"', 'lg: "0.625rem"', 'xl: "0.875rem"']],
  ["apps/workspace/DESIGN.md", workspaceDesign, ['control: "10px"', 'surface: "14px"']],
]) for (const value of values) assert(source.includes(value), `${file}: contratto curvature non allineato (${value}).`);
for (const source of [design, webDesign, workspaceDesign, sirioDesign]) {
  assert(source.includes("R esterno = R interno + padding reale") || source.includes("R_esterno = R_interno + inset"), "Un DESIGN.md non documenta la formula curvature canonica.");
}
assert(link.includes('React.ComponentProps<"a">') && !/buttonVariants|components\/button|\.\/button/.test(link), "Link deve possedere semantica anchor senza dipendere dal Button.");
assert(!apps.flatMap((app) => filesUnder(`apps/${app}/src`)).some((file) => /\.(?:ts|tsx)$/.test(file) && read(file).includes("buttonVariants")), "I consumer non devono importare buttonVariants.");
assert(dropdownMenu.includes('rounded-xl border border-border bg-popover/95 p-1.5') && dropdownMenu.includes('gap-2 rounded-md px-3 py-2') && dropdownMenu.includes('<SlidingIndicator rounded="md" />'), "DropdownMenu deve rispettare 14px = 8px + 6px nel nesting popup/item.");
assert(select.includes('rounded-lg bg-popover') && select.includes('p-1') && select.includes('gap-1.5 rounded-sm py-1') && select.includes('<SlidingIndicator rounded="sm" />'), "Select deve rispettare 10px = 6px + 4px nel nesting popup/item.");
assert(floatingNavigation.includes('w-80 rounded-2xl p-2') && floatingNavigation.includes('min-h-14 gap-3 rounded-md'), "Floating navigation deve rispettare 16px = 8px + 8px nel nesting popup/item.");
assert(emailTokens.includes('radius: "10px"') && emailTokens.includes('radiusLg: "14px"'), "Le email devono usare la curvature canonica 10/14px.");
for (const value of ['data-visual-specimen="nested-radius-formula"', 'calc(var(--radius) + var(--space-2))', 'borderRadius: "var(--radius)"']) assert(spacingAndRadiusProof.includes(value), `Proof Sirio del nesting radius mancante: ${value}`);
for (const value of ['rounded-[calc(var(--radius)+var(--space-4))]', 'rounded-[var(--radius)]']) assert(surfaceProof.includes(value), `Proof Surface non allineata al nesting canonico: ${value}`);
assert(responsiveProof.includes('rounded-[calc(var(--radius)+var(--space-3))]'), "Proof responsive non allineata al nesting canonico.");
for (const value of [':focus-visible', 'data-focus-owner="composite"', 'data-focus-target="composite"', "outline: var(--focus-ring-width) solid var(--focus-ring-color)", "outline-color: Highlight"]) assert(base.includes(value), `Contratto focus canonico mancante: ${value}`);
for (const value of ["--touch-target-min: 2.75rem", "(any-pointer: coarse)", ".qv-touch-target-compact::after", ".qv-touch-target-inline", "width: var(--touch-target-min)", "height: var(--touch-target-min)"]) assert(`${tokens}\n${base}`.includes(value), `Contratto pointer/touch canonico mancante: ${value}`);
for (const value of ["--icon-compact: 0.875rem", "--icon: 1rem", "--icon-emphasized: 1.25rem", "--icon-illustrative: 1.75rem", ".qv-icon-compact", ".qv-icon-default", ".qv-icon-emphasized", ".qv-icon-illustrative"]) assert(`${tokens}\n${base}`.includes(value), `Contratto iconografico canonico mancante: ${value}`);
for (const value of ["--elevation-raised: var(--shadow-sm)", "--elevation-floating: var(--shadow-md)", "--elevation-modal: var(--shadow-xl)", "--backdrop-modal", ".qv-surface-base", ".qv-surface-contained", ".qv-surface-raised", ".qv-surface-floating", ".qv-surface-modal", ".qv-backdrop-modal"]) assert(`${tokens}\n${base}`.includes(value), `Contratto surface/elevation canonico mancante: ${value}`);

const workspaceOrganization = read("apps/workspace/src/app/job-sites/[jobSiteId]/page.tsx");
const workspaceClient = read("apps/workspace/src/app/client/job-sites/[jobSiteId]/page.tsx");
const web = read("apps/web/src/app/page.tsx");
const sirio = read("apps/sirio/src/app/page.tsx");
assert(workspaceOrganization.includes("Timeline") && workspaceOrganization.includes("Pagamenti documentati"), "Workspace Azienda non espone il contratto Qoovex.");
assert(workspaceClient.includes("Timeline condivisa") && workspaceClient.includes("I tuoi lavori") === false, "Workspace cliente non applica la projection Qoovex.");
assert(web.includes("Qoovex") && !web.includes("non implementata"), "Web deve indicare la direzione Qoovex senza presentarla come disponibile.");
assert(sirio.includes("foundation visuale") && !sirio.includes("Dashboard"), "Sirio deve conservare soltanto la foundation visuale.");
for (const removed of ["apps/workspace/src/views/dashboard/DashboardOverviewView.tsx", "apps/sirio/src/components/dashboard-shell.tsx", "apps/web/src/components/marketing-dashboard-preview.tsx"]) assert(!existsSync(join(root, removed)), `Superficie prodotto rimossa ancora presente: ${removed}`);

const notice = read("packages/ui/THIRD_PARTY_NOTICES.md");
assert(/MIT License/i.test(notice), "Licenza MIT mancante negli avvisi.");
console.log("Canonical Qoovex visual foundation verified.");
