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
}

const base = read("packages/ui/styles/base.css");
const tokens = read("packages/ui/styles/tokens.css");
for (const value of ["prefers-reduced-motion", "@custom-variant dark", "data-link=", "scrollbar-width: thin"]) assert(base.includes(value), `base.css non contiene ${value}`);
for (const value of ["--info", "--success", "--warning", "--destructive", "--sidebar", "oklch("]) assert(tokens.includes(value), `tokens.css non contiene ${value}`);
assert(tokens.includes("--font-sans: var(--ff-sans);") && tokens.includes("--font-accent: var(--ff-accent);"), "tokens.css deve esporre i token --font-sans e --font-accent.");

const workspaceOrganization = read("apps/workspace/src/app/org/[organizationId]/job-sites/[jobSiteId]/page.tsx");
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
