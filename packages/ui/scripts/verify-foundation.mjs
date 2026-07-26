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
const marketingCursor = read("packages/ui/src/components/marketing-cursor.tsx");
const floatingNavigation = read("packages/ui/src/components/floating-navigation.tsx");
const scrollbarController = read("packages/ui/src/components/scrollbar-controller.tsx");
const alert = read("packages/ui/src/components/alert.tsx");
const field = read("packages/ui/src/components/field.tsx");
const empty = read("packages/ui/src/components/empty.tsx");
const button = read("packages/ui/src/components/button.tsx");
const badge = read("packages/ui/src/components/badge.tsx");
const brandMark = read("packages/ui/src/components/brand-mark.tsx");
const sidebar = read("packages/ui/src/components/sidebar.tsx");
const dialog = read("packages/ui/src/components/dialog.tsx");
const webLayout = read("apps/web/src/app/layout.tsx");
const webChrome = read("apps/web/src/app/site-chrome.tsx");
const webDashboardPreview = read("apps/web/src/components/marketing-dashboard-preview.tsx");
const sirioLayout = read("apps/sirio/src/app/layout.tsx");
const sirioFoundation = read("apps/sirio/src/app/page.tsx");
const sirioDashboardOverview = read("apps/sirio/src/components/dashboard-overview.tsx");
const sirioDashboardShell = read("apps/sirio/src/components/dashboard-shell.tsx");
const workspaceLayout = read("apps/workspace/src/app/layout.tsx");
const workspaceDashboard = read("apps/workspace/src/views/dashboard/DashboardView.tsx");
const workspaceShell = read("apps/workspace/src/views/workspace/WorkspaceShell.tsx");
const workspaceNavigation = read("apps/workspace/src/views/workspace/WorkspaceNavigation.tsx");
const workspaceFavorites = read("apps/workspace/src/views/workspace/WorkspaceFavorites.tsx");
const workspaceTopbar = read("apps/workspace/src/views/workspace/WorkspaceTopbar.tsx");
const workspaceNavigationHistory = read("apps/workspace/src/views/workspace/workspace-navigation-history.ts");
const workspaceNotificationsPanel = read("apps/workspace/src/views/workspace/WorkspaceNotificationsPanel.tsx");
const workspaceAssignmentDialog = read("apps/workspace/src/views/dashboard/DashboardAssignmentDialog.tsx");
const resourceAssignmentOptionsRoute = read("apps/workspace/src/app/api/resource-assignments/options/route.ts");
const authStyles = read("apps/workspace/src/views/auth/AuthPages.module.css");
const authShell = read("apps/workspace/src/views/auth/AuthPageShell.tsx");
const signInView = read("apps/workspace/src/views/auth/SignInPageView.tsx");
const signUpView = read("apps/workspace/src/views/auth/SignUpPageView.tsx");
const resetPasswordView = read("apps/workspace/src/views/auth/ResetPasswordPageView.tsx");
const invitationView = read("apps/workspace/src/views/auth/InvitationPageView.tsx");
const accountSecurityFlow = read("apps/workspace/src/views/account-security/AccountSecurityFlow.tsx");
const otpInput = read("packages/ui/src/components/otp-input.tsx");
const passwordInput = read("packages/ui/src/components/password-input.tsx");
for (const required of ["prefers-reduced-motion", "::view-transition-new(root)", "@source", "@custom-variant dark"]) {
  assert(base.includes(required), `base.css non contiene ${required}`);
}
for (const required of ["--info", "--success", "--warning", "--destructive", "--sidebar", "--chart-1", "oklch("]) {
  assert(tokens.includes(required), `tokens.css non contiene ${required}`);
}
for (const required of ["--link-underline-color", "--link-underline-offset", "--link-underline-thickness", "--link-underline-thickness-active", "--selection-background", "--selection-foreground"]) {
  assert(tokens.includes(required), `tokens.css non contiene il token link ${required}`);
}
for (const required of ["--scrollbar-size", "--scrollbar-thumb", "--scrollbar-thumb-hover", "--scrollbar-thumb-active"]) {
  assert(tokens.includes(required), `tokens.css non contiene il token scrollbar ${required}`);
}
for (const required of ['data-link="inline"', 'data-link="quiet"', 'data-link="plain"', 'data-link-scope="inline"', "text-decoration-skip-ink", "LinkText"]) {
  assert(base.includes(required), `base.css non contiene il contratto link ${required}`);
}
for (const [name, source] of [["Alert", alert], ["Field", field], ["Empty", empty]]) {
  assert(source.includes('data-link-scope="inline"'), `${name} deve rendere esplicito lo scope dei link inline.`);
}
for (const [name, source] of [["Button", button], ["Badge", badge]]) {
  assert(source.includes("no-underline"), `${name} deve impedire la sottolineatura delle azioni.`);
  assert(!source.includes("hover:underline"), `${name} non deve usare la sottolineatura come affordance.`);
}
assert(button.includes("cursor-pointer"), "Button e buttonVariants devono comunicare l'azione con il cursore pointer.");
assert(sirioFoundation.includes('data-link="inline"') && sirioFoundation.includes('data-link="quiet"') && sirioFoundation.includes('data-link="plain"'), "Sirio deve mostrare tutti i ruoli semantici dei link.");
assert(webChrome.includes('data-link="quiet"') && webChrome.includes('data-link-scope="inline"'), "Web deve distinguere link quiet e inline.");
assert(workspaceDashboard.includes('data-link="quiet"') && workspaceDashboard.includes('data-link="plain"'), "Workspace deve distinguere navigazione quiet e plain.");
assert(!authStyles.includes("text-decoration: underline"), "Le azioni button delle pagine auth non devono simulare link sottolineati.");
for (const required of ["OTPField", 'data-slot="otp-input"', "autoFocus={autoFocus && index === 0}", "transition-[border-color,box-shadow,background-color]", "ring-inset", "focus-visible:ring-1", "focus-visible:ring-ring/25"]) {
  assert(otpInput.includes(required), `OtpInput condiviso non contiene ${required}`);
}
for (const required of ["PasswordInput", 'data-slot="password-input"', "aria-pressed={revealed}", "IconEyeOff", "#components/input"]) {
  assert(passwordInput.includes(required), `PasswordInput condiviso non contiene ${required}`);
}
for (const required of ["AuthPageShell", "AuthTrustPanel", "AuthSteps", "WorkspaceBrandMark", "CardContent"]) {
  assert(authShell.includes(required), `Shell auth non contiene ${required}`);
}
for (const required of ["prefers-reduced-motion", "forced-colors", "auth-card-enter", "auth-stage-enter", "100dvh"]) {
  assert(authStyles.includes(required), `AuthPages.module.css non contiene ${required}`);
}
assert(signInView.includes("@qoovex/ui/components/password-input"), "Sign-in deve usare PasswordInput condiviso.");
assert(signUpView.includes("@qoovex/ui/components/otp-input") && signUpView.includes("@qoovex/ui/components/password-input"), "Sign-up deve usare i controlli auth condivisi.");
assert(resetPasswordView.includes("@qoovex/ui/components/otp-input") && resetPasswordView.includes("@qoovex/ui/components/password-input"), "Reset password deve usare i controlli auth condivisi.");
assert(invitationView.includes("AuthPageShell") && invitationView.includes("buttonVariants"), "Inviti devono comporre la shell auth e le varianti link condivise.");
assert(accountSecurityFlow.includes("@qoovex/ui/components/otp-input") && accountSecurityFlow.includes('id="mfa-gate-code"'), "MFA deve usare OTP numerico senza rimuovere il campo libero per i backup code.");
assert(sirioFoundation.includes("@qoovex/ui/components/otp-input") && sirioFoundation.includes("@qoovex/ui/components/password-input"), "Sirio deve mostrare i controlli auth condivisi.");
for (const required of ['data-selection="none"', "-webkit-user-select", "-webkit-user-drag", "::selection", "HighlightText"]) {
  assert(base.includes(required), `base.css non contiene il contratto di selezione ${required}`);
}
assert(brandMark.includes("select-none"), "BrandMark non deve produrre selezione testuale accidentale.");
assert(webDashboardPreview.includes('data-selection="none"'), "Il preview dashboard Web non deve essere selezionabile.");
assert(sirioDashboardOverview.includes('data-selection={preview ? "none" : undefined}'), "Solo la modalita preview della dashboard Sirio deve disabilitare la selezione.");
for (const required of ["scrollbar-width: thin", "::-webkit-scrollbar-thumb", 'data-scrollbar-active="true"', 'data-scrollbar-edge="true"', "scrollbar-color: auto"]) {
  assert(base.includes(required), `base.css non contiene il contratto scrollbar ${required}`);
}
for (const required of ["document.addEventListener(\"scroll\"", "window.addEventListener(\"scroll\"", "pointermove", "data-scrollbar-controller", "data-scrollbar-active", "data-scrollbar-edge", "ACTIVE_TIMEOUT_MS"]) {
  assert(scrollbarController.includes(required), `ScrollbarController non contiene ${required}`);
}
assert(!sidebar.includes("no-scrollbar"), "SidebarContent deve usare la scrollbar condivisa.");
assert(!sidebar.includes("after:w-[2px]"), "SidebarRail non deve disegnare una linea nel distacco inset.");
assert(sidebar.includes('hidden w-4 bg-transparent'), "SidebarRail deve conservare una hit area trasparente da 16 px.");
for (const required of ["function SidebarCollapseButton", 'data-slot="sidebar-collapse-button"', '"Riduci menu"', '"Espandi menu"', "iconOnly"]) {
  assert(sidebar.includes(required), `Sidebar condivisa non contiene il controllo esplicito ${required}.`);
}
for (const required of ["DialogPrimitive.Root", "DialogPrimitive.Title", "DialogPrimitive.Description", 'data-slot="dialog-content"', "sm:max-w-md"]) {
  assert(dialog.includes(required), `Dialog condiviso non contiene ${required}.`);
}
assert(sirioDashboardOverview.includes("<DialogTitle>Assegna responsabile</DialogTitle>"), "Sirio deve provare il Dialog di assegnazione.");
for (const required of ["Ricerca rapida, in preparazione", "Analisi, in preparazione", "<GroupNavigation", "items={navigation.documents}", "items={navigation.people}", "<CreationActions", "<WorkspaceFavorites"]) {
  assert(workspaceNavigation.includes(required), `Navigazione Workspace non contiene ${required}.`);
}
for (const required of ["Azioni rapide", "IconFilePlus", "IconBuildingPlus", "IconUserPlus", "IconPhotoPlus", "grid grid-cols-4", "items.map((item)", "hidden: false", 'data-slot="workspace-quick-actions"', "bg-sidebar-accent/55"]) {
  assert(workspaceNavigation.includes(required), `Azioni rapide Workspace non contengono ${required}.`);
}
assert(!workspaceNavigation.includes("visibleActions") && !workspaceNavigation.includes("Cosa vuoi creare?"), "Tutte le azioni autorizzate devono restare visibili nel dock compatto.");
assert(workspaceNavigation.indexOf("<CreationActions items={navigation.add} />") > workspaceNavigation.lastIndexOf("<SidebarFooter"), "Azioni rapide Workspace devono vivere nel footer sopra account.");
assert(workspaceNavigation.includes("setOpenMobile(false)") && workspaceFavorites.includes("setOpenMobile(false)"), "Le destinazioni della sidebar devono chiudere il drawer mobile dopo la navigazione.");
for (const required of ["MAX_FAVORITES = 4", "qoovex.workspace.favorites.v2", "window.localStorage", "DropdownMenuCheckboxItem", "Personalizza Preferiti", "Scegli fino a {MAX_FAVORITES} viste", "sanitizeFavoriteHrefs", "loadFavoriteHrefs"]) {
  assert(workspaceFavorites.includes(required), `Preferiti Workspace non contengono ${required}.`);
}
assert(!workspaceNavigation.includes('href="/notifications"') && !workspaceFavorites.includes("/notifications"), "La sidebar non deve contenere destinazioni Notifiche.");
assert(!workspaceShell.includes("SidebarRail"), "Workspace non deve usare il rail ambiguo per ridurre il menu.");
assert(workspaceShell.includes("SIDEBAR_COOKIE_NAME") && workspaceShell.includes("defaultOpen={sidebarDefaultOpen}"), "Workspace deve ripristinare la preferenza della sidebar dal cookie.");
for (const required of ['className="h-dvh min-h-0! overflow-hidden bg-sidebar"', "overflow-y-auto", "...state.navigation.documents", "...state.navigation.people"]) {
  assert(workspaceShell.includes(required), `Shell Workspace non contiene il contratto fisso ${required}.`);
}
assert(workspaceTopbar.includes("<SidebarCollapseButton") && workspaceTopbar.includes("iconOnly"), "La topbar Workspace deve ospitare il toggle desktop iconico.");
assert(workspaceTopbar.includes("<WorkspaceNotificationsPanel"), "La campanella Workspace deve aprire il pannello notifiche.");
for (const required of ["Pagine recenti", "Navigazione mobile", "displayedPages", "BreadcrumbSeparator", 'render={<Link href="/dashboard" />}>Da fare</BreadcrumbLink>']) {
  assert(workspaceTopbar.includes(required), `Topbar Workspace non contiene il breadcrumb ${required}.`);
}
for (const required of ["MAX_RECENT_WORKSPACE_PAGES = 3", "window.sessionStorage", "pushRecentWorkspacePage", "parseRecentWorkspacePages", "specificPageLabels"]) {
  const source = required === "window.sessionStorage" ? workspaceTopbar : workspaceNavigationHistory;
  assert(source.includes(required), `Cronologia Workspace non contiene ${required}.`);
}
assert(!workspaceTopbar.includes("WorkspaceBrandMark"), "La topbar mobile non deve mostrare il logo al posto del breadcrumb Da fare.");
for (const required of ["Ricerca rapida", "Analisi", "Calendario", "Persone", "Azioni rapide", "Preferiti", "Documenti da controllare", "IconFilePlus", "IconBuildingPlus", "Pagine recenti", "Navigazione mobile", "iconOnly", "overflow-y-auto"]) {
  assert(sirioDashboardShell.includes(required), `Sirio deve provare la nuova sidebar con ${required}.`);
}
assert(sirioDashboardShell.includes('data-slot="workspace-quick-actions"') && sirioDashboardShell.includes("<DemoQuickActions />"), "Sirio deve provare l'action tray nel footer.");
assert(sirioDashboardShell.indexOf("<DemoQuickActions />") > sirioDashboardShell.lastIndexOf("<SidebarFooter"), "Sirio deve tenere le azioni rapide nel footer.");
for (const required of ['fetch("/api/notifications?limit=5&sort=recent"', "<SheetTitle>Notifiche</SheetTitle>", "Vedi tutte le notifiche", "NotificationsLoading", "Nessuna notifica recente", "Impossibile caricare le notifiche"]) {
  assert(workspaceNotificationsPanel.includes(required), `Pannello notifiche Workspace non contiene ${required}.`);
}
for (const required of ["<DialogTitle>{dialogTitle}</DialogTitle>", "Assegna Responsabile cantiere", "Responsabile cantiere assegnato", "Collega account lavoratore", 'fetch("/api/resource-assignments/options"', "worker-user-links", "job-site-user-assignments", "Nessuna persona disponibile"]) {
  assert(workspaceAssignmentDialog.includes(required), `Dialog assegnazione Workspace non contiene ${required}.`);
}
assert(resourceAssignmentOptionsRoute.includes("getResourceAssignmentOptions"), "La dashboard deve caricare opzioni assegnazione tramite una route autorizzata.");
assert(sirioFoundation.includes('data-scrollbar-proof="vertical"') && sirioFoundation.includes('data-scrollbar-proof="horizontal"'), "Sirio deve mostrare scrollbar verticale e orizzontale.");
for (const required of ["(hover: hover) and (pointer: fine)", "prefers-reduced-motion", "forced-colors", "data-cursor-label", "data-magnetic", "magneticSelector", "magneticDistance = 16", "magneticBlockingSurfaceSelector", "magneticTargetIsExposed", "document.elementFromPoint", "target: nearest.target", "magneticPoint.target ?? document.elementFromPoint", "nearest.rect.left + nearest.rect.width / 2", "nearest.rect.top + nearest.rect.height / 2", "getBoundingClientRect", "requestAnimationFrame", "window.location.pathname", "pageshow", "popstate"]) {
  assert(marketingCursor.includes(required), `MarketingCursor non contiene ${required}`);
}
for (const required of [".marketing-cursor", 'data-marketing-cursor="active"', 'data-cursor-native="text"', 'data-magnetic="true"', ".floating-navigation__mobile-sections", ".floating-navigation__focus-indicator", ".floating-navigation__resource-focus", "cubic-bezier(0.16, 1, 0.3, 1)", "@container (min-width: 15rem)"]) {
  assert(base.includes(required), `base.css non contiene il contratto cursore ${required}`);
}
for (const required of ["Sezioni vicine", "previousSection", "nextSection", "floating-navigation__mobile-adjacent", "navigationOffset", "animatePageScroll", "History.prototype.pushState", "const duration = 460", "directionThreshold = 10", "accumulatedDelta", 'data-navigation-mode', "DropdownMenuContent", "resourceLinks", "moveNavFocus", "moveResourceFocus"]) {
  assert(floatingNavigation.includes(required), `FloatingNavigation non contiene ${required}`);
}
for (const required of ['href: "/#panoramica"', 'href: "/pricing"', 'href: "/contattaci"', 'href: "/community"', 'href: "/storie"', 'href: "/novita"', 'label: "Storie operative"', 'label: "Novità"', 'resourceLabel="Risorse"']) {
  assert(webChrome.includes(required), `La navigazione Web non contiene ${required}`);
}
assert(!webChrome.includes('label: "FAQ"'), "Il menu Risorse Web non deve riproporre FAQ.");
for (const route of ["pricing", "contattaci", "community", "storie", "novita"]) {
  assert(existsSync(join(root, `apps/web/src/app/${route}/page.tsx`)), `Pagina marketing mancante: /${route}`);
}
assert(webLayout.includes('<MarketingCursor pathnames={marketingCursorPathnames} />'), "Web deve usare la allowlist marketing del MarketingCursor.");
for (const route of ["/", "/pricing", "/contattaci", "/community", "/manuale-operativo", "/storie", "/novita"]) {
  assert(webLayout.includes(`"${route}"`), `MarketingCursor Web non include ${route}`);
}
for (const route of ["/privacy", "/terms", "/cookies", "/dpa"]) {
  assert(!webLayout.includes(`"${route}"`), `MarketingCursor Web non deve includere ${route}`);
}
assert(sirioLayout.includes('<MarketingCursor pathnames={["/marketing"]} />'), "Sirio deve attivare MarketingCursor solo su /marketing.");
assert(!workspaceLayout.includes("MarketingCursor"), "Workspace non deve attivare MarketingCursor.");
for (const [name, source] of [["Web", webLayout], ["Sirio", sirioLayout], ["Workspace", workspaceLayout]]) {
  assert(source.includes("<ScrollbarController />"), `${name} deve montare ScrollbarController.`);
}

const notice = read("packages/ui/THIRD_PARTY_NOTICES.md");
assert(notice.includes("0edc5cf631ac7a8280112fd2bcb80312597bafdf"), "Commit sorgente mancante negli avvisi MIT.");
assert(/MIT License/i.test(notice), "Licenza MIT mancante negli avvisi.");

console.log("Canonical Qoovex design-system foundation verified.");
