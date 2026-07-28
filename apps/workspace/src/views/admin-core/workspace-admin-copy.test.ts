import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const appRoot = join(root, "..", "app");

function collectCodeFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) return collectCodeFiles(fullPath);
    return /\.(tsx|ts)$/.test(entry) && !entry.endsWith(".test.ts") ? [fullPath] : [];
  });
}

describe("workspace admin UI copy", () => {
  const source = collectCodeFiles(root).map((file) => readFileSync(file, "utf8")).join("\n");
  const appSource = collectCodeFiles(appRoot).map((file) => readFileSync(file, "utf8")).join("\n");
  const navigationSource = readFileSync(join(root, "workspace", "WorkspaceNavigation.tsx"), "utf8");
  const navigationPolicySource = readFileSync(join(root, "workspace", "workspace-navigation-policy.ts"), "utf8");
  const settingsHubSource = readFileSync(join(root, "settings", "SettingsHubView.tsx"), "utf8");
  const evidenceFormSource = readFileSync(join(root, "admin-core", "evidence", "EvidenceForm.tsx"), "utf8");
  const shareLinksPanelSource = readFileSync(join(root, "admin-core", "document-packages", "ShareLinksPanel.tsx"), "utf8");
  const shareReviewSource = readFileSync(join(root, "..", "widgets", "document-package-share-review", "ui", "DocumentPackageShareReview.tsx"), "utf8");
  const notificationEmailPanelSource = readFileSync(join(root, "admin-core", "notifications", "NotificationEmailDigestPanel.tsx"), "utf8");
  const notificationPreferencesPanelSource = readFileSync(join(root, "admin-core", "notifications", "NotificationEmailPreferencesPanel.tsx"), "utf8");
  const notificationActionsSource = readFileSync(join(root, "admin-core", "notifications", "NotificationActionButtons.tsx"), "utf8");
  const auditLogSource = readFileSync(join(root, "admin-core", "audit-log", "AuditLogPageView.tsx"), "utf8");
  const accessSource = readFileSync(join(root, "admin-core", "access", "AccessAssignmentsPageView.tsx"), "utf8");
  const peopleSettingsSource = readFileSync(join(root, "settings", "PeopleSettingsView.tsx"), "utf8");
  const dataControlSource = readFileSync(join(root, "admin-core", "data-control", "DataControlPageView.tsx"), "utf8");
  const authSource = collectCodeFiles(join(root, "auth")).map((file) => readFileSync(file, "utf8")).join("\n");
  const signInSource = readFileSync(join(appRoot, "sign-in", "page.tsx"), "utf8");
  const signUpSource = readFileSync(join(appRoot, "sign-up", "page.tsx"), "utf8");
  const dashboardSource = readFileSync(join(root, "operational-center", "OperationalCenterView.tsx"), "utf8");
  const documentListPageSource = readFileSync(join(appRoot, "documents", "page.tsx"), "utf8");
  const documentArchivePageSource = readFileSync(join(appRoot, "documents", "archive", "page.tsx"), "utf8");
  const documentDetailPageSource = readFileSync(join(appRoot, "documents", "[documentId]", "page.tsx"), "utf8");
  const evidencePageSource = readFileSync(join(appRoot, "evidence", "page.tsx"), "utf8");
  const documentCreateFlowSource = readFileSync(join(root, "admin-core", "documents", "DocumentCreateFlow.tsx"), "utf8");
  const deadlineFormSource = readFileSync(join(root, "admin-core", "deadlines", "DeadlineForm.tsx"), "utf8");
  const checklistFormSource = readFileSync(join(root, "admin-core", "checklists", "ChecklistForm.tsx"), "utf8");
  const documentPackageFormSource = readFileSync(join(root, "admin-core", "document-packages", "DocumentPackageForm.tsx"), "utf8");
  const documentsPageViewSource = readFileSync(join(root, "admin-core", "documents", "DocumentsPageView.tsx"), "utf8");
  const workersPageViewSource = readFileSync(join(root, "admin-core", "workers", "WorkersPageView.tsx"), "utf8");
  const workerCreateDialogSource = readFileSync(join(root, "admin-core", "workers", "WorkerCreateDialog.tsx"), "utf8");
  const guidedWorkerCreateSource = readFileSync(join(root, "admin-core", "workers", "GuidedWorkerCreateFlow.tsx"), "utf8");
  const workerDetailsDialogSource = readFileSync(join(root, "admin-core", "workers", "WorkerDetailsDialog.tsx"), "utf8");
  const workerFormSource = readFileSync(join(root, "admin-core", "workers", "WorkerForm.tsx"), "utf8");
  const workerDetailViewSource = readFileSync(join(root, "admin-core", "workers", "WorkerDetailView.tsx"), "utf8");
  const workerDetailRouteSource = readFileSync(join(appRoot, "workers", "[workerId]", "page.tsx"), "utf8");
  const workersRouteSource = readFileSync(join(appRoot, "workers", "page.tsx"), "utf8");
  const newWorkerRouteSource = readFileSync(join(appRoot, "workers", "new", "page.tsx"), "utf8");
  const jobSitesPageViewSource = readFileSync(join(root, "admin-core", "job-sites", "JobSitesPageView.tsx"), "utf8");
  const jobSitesOverviewSource = readFileSync(join(root, "admin-core", "job-sites", "JobSitesOverviewView.tsx"), "utf8");
  const jobSiteCreateWizardSource = readFileSync(join(root, "admin-core", "job-sites", "JobSiteCreateWizard.tsx"), "utf8");
  const jobSiteSegmentedViewSource = readFileSync(join(root, "admin-core", "job-sites", "JobSiteDetailSegmentedView.tsx"), "utf8");
  const jobSiteCreateDialogSource = readFileSync(join(root, "admin-core", "job-sites", "JobSiteCreateDialog.tsx"), "utf8");
  const jobSiteDetailsDialogSource = readFileSync(join(root, "admin-core", "job-sites", "JobSiteDetailsDialog.tsx"), "utf8");
  const jobSiteFormSource = readFileSync(join(root, "admin-core", "job-sites", "JobSiteForm.tsx"), "utf8");
  const jobSiteDetailViewSource = readFileSync(join(root, "admin-core", "job-sites", "JobSiteDetailView.tsx"), "utf8");
  const jobSiteQuickActionsSource = readFileSync(join(root, "admin-core", "job-sites", "JobSiteQuickActions.tsx"), "utf8");
  const jobSiteDetailRouteSource = readFileSync(join(appRoot, "job-sites", "[jobSiteId]", "page.tsx"), "utf8");
  const jobSitesRouteSource = readFileSync(join(appRoot, "job-sites", "page.tsx"), "utf8");
  const newJobSiteRouteSource = readFileSync(join(appRoot, "job-sites", "new", "page.tsx"), "utf8");
  const documentsPageViewStyles = readFileSync(join(root, "admin-core", "documents", "DocumentsPageView.module.css"), "utf8");
  const documentDetailsDialogSource = readFileSync(join(root, "admin-core", "documents", "DocumentDetailsDialog.tsx"), "utf8");
  const documentCreateDialogSource = readFileSync(join(root, "admin-core", "documents", "DocumentCreateDialog.tsx"), "utf8");
  const documentDetailViewSource = readFileSync(join(root, "admin-core", "documents", "DocumentDetailView.tsx"), "utf8");
  const archivedDocumentActionsSource = readFileSync(join(root, "admin-core", "documents", "ArchivedDocumentActions.tsx"), "utf8");
  const invitePersonSource = readFileSync(join(root, "settings", "InvitePersonView.tsx"), "utf8");
  const nextConfigSource = readFileSync(join(root, "..", "..", "next.config.ts"), "utf8");
  const combinedSource = `${source}\n${appSource}`;

  const adminRoutes = ["/dashboard", "/notifications", "/documents", "/calendar", "/deadlines", "/workers", "/job-sites", "/checklists", "/evidence", "/document-packages", "/access", "/audit-log", "/data-control"] as const;

  it("does not render forbidden legal or sensitive storage copy", () => {
    expect(combinedSource).not.toMatch(/sei a norma|conformita garantita|validita legale|legalmente valido|abilitato automaticamente|obbligatorio per legge/i);
    expect(combinedSource).not.toMatch(/blobKey|tokenHash|downloadUrl|token raw/i);
  });

  it("keeps everyday navigation small and preserves secondary routes", () => {
    for (const route of ["/dashboard", "/documents", "/workers", "/job-sites", "/document-packages", "/settings"]) expect(navigationPolicySource).toContain(`href: "${route}"`);
    for (const route of adminRoutes) expect(appSource).toContain(route.slice(1));
    for (const route of ["/deadlines", "/checklists", "/evidence", "/document-packages", "/access", "/audit-log", "/data-control"]) {
      expect(navigationPolicySource).not.toContain(`label: "${route}"`);
    }
  });

  it("keeps page titles for the main admin sections", () => {
    for (const title of ["Notifiche", "Documenti", "Scadenze", "Lavoratori", "Cantieri", "Checklist", "Prove", "Pacchetti documentali", "Assegnazioni cantieri", "Audit", "Controllo dati"]) {
      expect(combinedSource).toContain(title);
    }
  });

  it("keeps the required empty states for admin core", () => {
    expect(combinedSource).toContain("Aggiungi il primo documento per iniziare");
    expect(combinedSource).toContain("Registra una scadenza");
    expect(combinedSource).toContain("Modifica i filtri oppure aggiungi il primo profilo operativo");
    expect(combinedSource).toContain("Nessun cantiere trovato");
  });

  it("keeps the required empty states for extended admin", () => {
    expect(combinedSource).toContain("Crea una checklist configurata per seguire attivita");
    expect(combinedSource).toContain("Aggiungi una foto, un file o una nota");
    expect(combinedSource).toContain("Crea un pacchetto documentale pronto per revisione");
    expect(combinedSource).toContain("Nessuna notifica da controllare");
    expect(combinedSource).toContain("Nessun evento audit da mostrare");
    expect(combinedSource).toContain("Nessun collegamento operativo");
    expect(combinedSource).toContain("Nessun cantiere assegnato");
    expect(combinedSource).toContain("Nessun lavoratore assegnato");
  });

  it("keeps labels for the primary admin forms", () => {
    for (const label of ["Titolo documento", "Titolo scadenza", "Nome e cognome", "Nome cantiere", "Nome checklist", "Titolo prova", "Titolo condivisione"]) {
      expect(combinedSource).toContain(label);
    }
  });

  it("keeps the notification email digest UI safe and explicit", () => {
    expect(notificationEmailPanelSource).toContain("Riepilogo inviato");
    expect(notificationEmailPanelSource).toContain("Anteprima riepilogo");
    expect(notificationEmailPanelSource).toContain("Invia riepilogo a me");
    expect(notificationEmailPanelSource).toContain("Non include file o link di download");
    expect(notificationActionsSource).toContain("Invia promemoria");
    expect(notificationEmailPanelSource).not.toMatch(/recipientEmail|blobKey|tokenHash|downloadUrl/i);
  });

  it("keeps notification email preferences and recent deliveries safe", () => {
    expect(notificationPreferencesPanelSource).toContain("Preferenze email");
    expect(notificationPreferencesPanelSource).toContain("Digest email attivo");
    expect(notificationPreferencesPanelSource).toContain("Frequenza digest");
    expect(notificationPreferencesPanelSource).toContain("Ora digest");
    expect(notificationPreferencesPanelSource).toContain("Invii recenti");
    expect(notificationPreferencesPanelSource).toContain("Non includono file, allegati o link di download");
    expect(notificationPreferencesPanelSource).toContain("<Checkbox");
    expect(notificationPreferencesPanelSource).toContain("NotificationEmailPreferencesPanel.module.css");
    expect(notificationPreferencesPanelSource).not.toContain("AdminCore.module.css");
    expect(notificationPreferencesPanelSource).not.toContain('className={styles.field}');
    expect(notificationPreferencesPanelSource).not.toMatch(/recipientEmail|providerMessageId|blobKey|tokenHash|downloadUrl|token raw/i);
  });

  it("keeps evidence upload conditional by evidence type", () => {
    expect(evidenceFormSource).toContain('type !== "NOTE"');
    expect(evidenceFormSource).toContain('name="file"');
    expect(evidenceFormSource).toContain("massimo 4 MB");
  });

  it("does not keep created share link values in the share link list", () => {
    expect(shareLinksPanelSource).not.toContain("createdToken");
    expect(shareLinksPanelSource).not.toContain("token");
    expect(shareReviewSource).toContain("Link creato: copialo ora");
    expect(shareReviewSource).toContain("Approva e crea link");
  });

  it("keeps the audit log UI minimized and adds basic security headers", () => {
    expect(auditLogSource).toContain("Eventi registrati");
    expect(auditLogSource).toContain("metadata minimizzati");
    expect(auditLogSource).not.toMatch(/blobKey|tokenHash|downloadUrl|token raw|emailBody|fileContent/i);
    expect(settingsHubSource).toContain("capabilities.canReadAudit");
    expect(nextConfigSource).toContain("X-Content-Type-Options");
    expect(nextConfigSource).toContain("Referrer-Policy");
    expect(nextConfigSource).toContain("X-Frame-Options");
    expect(nextConfigSource).toContain("Permissions-Policy");
  });

  it("keeps access assignment UI scoped and free of worker contact details in operational scope copy", () => {
    expect(accessSource).toContain("Assegnazioni cantieri");
    expect(accessSource).toContain("Associazione account al profilo");
    expect(accessSource).toContain("Non assegna e non modifica il ruolo");
    expect(accessSource).toContain("Responsabili dei cantieri");
    expect(accessSource).toContain("Lavoratori nei cantieri");
    expect(accessSource).toContain('@qoovex/ui/components/select');
    expect(accessSource).toContain('@qoovex/ui/components/field');
    expect(accessSource).not.toContain("AdminCore.module.css");
    expect(accessSource).not.toMatch(/blobKey|tokenHash|downloadUrl|token raw/i);
  });

  it("keeps users and invitations on the canonical workspace foundation", () => {
    expect(peopleSettingsSource).toContain("Utenti e inviti");
    expect(peopleSettingsSource).toContain("Utenti con accesso");
    expect(peopleSettingsSource).toContain("Inviti in attesa");
    expect(peopleSettingsSource).not.toContain('href="/access"');
    expect(peopleSettingsSource).toContain('@qoovex/ui/components/avatar');
    expect(peopleSettingsSource).toContain('@qoovex/ui/components/card');
    expect(peopleSettingsSource).not.toContain("AdminCore.module.css");
    expect(peopleSettingsSource).not.toContain(":hover");
  });

  it("does not call role-restricted configuration services from ordinary document and evidence lists", () => {
    expect(documentListPageSource).not.toContain("listDocumentTypes");
    expect(documentListPageSource).not.toContain("getMissingDocumentRequirements");
    expect(documentDetailPageSource).toContain("capabilities.canReadDocumentSettings ? await listDocumentTypes() : []");
    expect(evidencePageSource).toContain("capabilities.canCompleteChecklists || capabilities.canManageChecklists ? await listChecklistsWithItems() : []");
  });

  it("keeps document upload retry on the created record and owner out of invitation choices", () => {
    expect(documentCreateFlowSource).toContain("setCreatedDocument(document)");
    expect(documentCreateFlowSource).toContain("senza creare un duplicato");
    expect(invitePersonSource).not.toContain('value: "OWNER"');
    expect(invitePersonSource).toContain("Configura il Collaboratore con perimetro e permessi espliciti");
  });

  it("keeps the document list on the canonical UI foundation and preserves task context across filters", () => {
    expect(documentsPageViewSource).toContain('@qoovex/ui/components/card');
    expect(documentsPageViewSource).toContain('@qoovex/ui/components/empty');
    expect(documentsPageViewSource).toContain('@tabler/icons-react');
    expect(documentsPageViewSource).toContain('params.set("origin", "dashboard")');
    expect(documentsPageViewSource).toContain('params.set("intent", "upload")');
    expect(documentsPageViewSource).not.toContain("AdminCore.module.css");
    expect(documentsPageViewSource).toContain("<DocumentDetailsDialog");
    expect(documentsPageViewSource).toContain("<DocumentCreateDialog");
    expect(documentCreateDialogSource).toContain("DialogTrigger");
    expect(documentCreateDialogSource).toContain('fetch("/api/document-types"');
    expect(documentCreateDialogSource).toContain('layout="dialog"');
    expect(documentsPageViewSource).not.toContain('href="/documents/new"');
    expect(documentsPageViewSource).toContain('variant: active ? "default" : "ghost"');
    expect(documentsPageViewSource).toContain("<IconFilter");
    expect(documentDetailsDialogSource).toContain("DialogTitle");
    expect(documentDetailsDialogSource).toContain("DialogDescription");
    expect(documentDetailsDialogSource).toContain('cache: "no-store"');
    expect(documentDetailsDialogSource).toContain("Gestisci documento");
    expect(documentDetailsDialogSource).toContain("readOnly = false");
    expect(documentDetailsDialogSource).toContain("!readOnly && fullPageHref");
    expect(documentDetailsDialogSource).not.toContain("DialogClose");
    expect(documentDetailsDialogSource).toContain("buttonVariants(),");
    expect(documentDetailViewSource).toContain("<WorkspacePageIdentity");
    expect(documentDetailViewSource).toContain('@qoovex/ui/components/card');
    expect(documentDetailViewSource).not.toContain("AdminCore.module.css");
    expect(documentsPageViewSource).not.toContain('{ label: "Archivio", status: "ARCHIVED"');
    expect(documentsPageViewSource).toContain("capabilities.canManageArchivedDocuments");
    expect(documentsPageViewSource).toContain("Archivio documenti");
    expect(documentListPageSource).toContain('redirect(`/documents/archive');
    expect(documentArchivePageSource).toContain('listDocuments({ status: "ARCHIVED", ownerType })');
    expect(documentArchivePageSource).toContain("archiveMode");
    expect(documentsPageViewSource).toContain("Filtra documenti archiviati per contesto");
    expect(documentsPageViewSource).not.toContain("Archivio attivo");
    expect(documentsPageViewSource).toContain("<ArchivedDocumentActions");
    expect(documentsPageViewSource).toContain("readOnly");
    expect(documentsPageViewSource).toContain("includeFiles={false}");
    expect(documentDetailsDialogSource).toContain("nextOpen && includeFiles");
    expect(documentDetailsDialogSource).not.toContain("IconArrowRight");
    expect(documentDetailsDialogSource).toContain('className={readOnly ? "sr-only" : undefined}');
    expect(documentsPageViewSource).not.toContain("<IconArchive />Archivio</Badge>");
    expect(documentsPageViewStyles).not.toContain("var(--destructive), var(--card)");
    expect(documentsPageViewStyles).not.toContain(".documentCard:hover");
    expect(archivedDocumentActionsSource).toContain("Ripristina");
    expect(archivedDocumentActionsSource).toContain("Elimina definitivamente");
    expect(archivedDocumentActionsSource).toContain("confirmation !== documentTitle");
    expect(archivedDocumentActionsSource).toContain("navigator.clipboard.writeText(documentTitle)");
    expect(archivedDocumentActionsSource).toContain("Copia titolo documento");
    expect(archivedDocumentActionsSource).toContain("Per confermare, incolla il titolo esatto");
    expect(archivedDocumentActionsSource).toContain("border-destructive/50");
    expect(archivedDocumentActionsSource).not.toContain("Conferma distruttiva");
    expect(documentsPageViewSource).not.toContain("Zona sensibile");
  });

  it("keeps the worker list on the canonical UI foundation with explicit actions", () => {
    expect(workersPageViewSource).toContain('@qoovex/ui/components/avatar');
    expect(workersPageViewSource).toContain('@qoovex/ui/components/card');
    expect(workersPageViewSource).toContain('@qoovex/ui/components/empty');
    expect(workersPageViewSource).toContain('@tabler/icons-react');
    expect(workersPageViewSource).toContain("<WorkerCreateDialog");
    expect(workersPageViewSource).toContain('worker.nextAction.href');
    expect(workersPageViewSource).toContain('data-link="plain"');
    expect(workersPageViewSource).not.toContain("AdminCore.module.css");
    expect(workersPageViewSource).not.toContain(":hover");
    expect(workerCreateDialogSource).toContain("DialogTrigger");
    expect(workerCreateDialogSource).not.toContain('href="/workers/new"');
    expect(workerDetailsDialogSource).toContain("Apri profilo");
    expect(workerDetailsDialogSource).toContain("Gestisci lavoratore");
    expect(workerDetailsDialogSource).toContain("workerDetailsHref(worker)");
    expect(workerDetailsDialogSource).not.toContain("fetch(");
    expect(workerFormSource).toContain("Mansione");
    expect(guidedWorkerCreateSource).toContain("Solo profilo operativo");
    expect(guidedWorkerCreateSource).toContain('role: "COLLABORATOR"');
    expect(guidedWorkerCreateSource).toContain("Nomi simili trovati");
    expect(guidedWorkerCreateSource).toContain('preset: "LIMITED_UPLOAD"');
    expect(workersRouteSource).toContain("listPeopleWorkers");
    expect(workersRouteSource).toContain('params.intent === "create"');
    expect(newWorkerRouteSource).toContain('redirect("/workers?intent=create")');
    expect(workerDetailViewSource).toContain("<WorkspacePageIdentity");
    expect(workerDetailViewSource).toContain('@qoovex/ui/components/card');
    expect(workerDetailViewSource).toContain('@qoovex/ui/components/empty');
    expect(workerDetailViewSource).not.toContain("AdminCore.module.css");
    expect(workerDetailRouteSource).toContain("workerRouteId(workerRouteParam)");
  });

  it("keeps job sites on the canonical UI foundation with modal entry points", () => {
    expect(jobSitesPageViewSource).toContain('@qoovex/ui/components/card');
    expect(jobSitesPageViewSource).toContain('@tabler/icons-react');
    expect(jobSitesPageViewSource).toContain("<JobSiteCreateDialog");
    expect(jobSitesOverviewSource).toContain("Coda di attenzione");
    expect(jobSiteCreateWizardSource).toContain("Avanzamento creazione");
    expect(jobSiteCreateWizardSource).toContain("continueAfterDuplicateWarning");
    expect(jobSitesPageViewSource).not.toContain("AdminCore.module.css");
    expect(jobSitesPageViewSource).not.toContain(":hover");
    expect(jobSiteCreateDialogSource).toContain("DialogTrigger");
    expect(jobSiteCreateDialogSource).not.toContain('href="/job-sites/new"');
    expect(jobSiteDetailsDialogSource).toContain("Apri cantiere");
    expect(jobSiteDetailsDialogSource).toContain("Gestisci cantiere");
    expect(jobSiteDetailsDialogSource).toContain("jobSiteDetailsHref(jobSite)");
    expect(jobSiteDetailsDialogSource).not.toContain("fetch(");
    expect(jobSiteFormSource).toContain("Nome cantiere");
    expect(jobSiteFormSource).toContain("jobSiteDetailsHref(created)");
    expect(jobSitesRouteSource).toContain('params.intent === "create"');
    expect(newJobSiteRouteSource).toContain('redirect("/job-sites?intent=create")');
    expect(jobSiteSegmentedViewSource).toContain("<WorkspacePageIdentity");
    expect(jobSiteSegmentedViewSource).toContain('@qoovex/ui/components/card');
    expect(jobSiteSegmentedViewSource).not.toContain("AdminCore.module.css");
    expect(jobSiteSegmentedViewSource).toContain("Responsabili cantiere");
    expect(jobSiteSegmentedViewSource).toContain("<JobSiteQuickActions");
    for (const section of ["overview", "documents", "people", "activities", "evidence", "sharing", "settings"]) expect(jobSiteSegmentedViewSource).toContain(`id: "${section}"`);
    expect(documentCreateDialogSource).toContain("Aggiungi documento");
    for (const action of ["Aggiungi prova", "Aggiungi scadenza", "Crea checklist", "Prepara condivisione"]) {
      expect(jobSiteQuickActionsSource).toContain(action);
    }
    expect(jobSiteQuickActionsSource).toContain("<DocumentCreateDialog");
    expect(jobSiteQuickActionsSource).toContain("DialogTrigger");
    expect(jobSiteQuickActionsSource).toContain('layout="dialog"');
    for (const formSource of [documentCreateFlowSource, evidenceFormSource, deadlineFormSource, checklistFormSource, documentPackageFormSource]) {
      expect(formSource).toContain("DialogFooter");
      expect(formSource).not.toContain("AdminCore.module.css");
    }
    expect(documentCreateDialogSource).toContain('fetch("/api/document-types"');
    expect(jobSiteDetailRouteSource).toContain("jobSiteRouteId(routeParam)");
    expect(jobSiteDetailRouteSource).not.toContain("listDocumentTypes");
    expect(jobSiteDetailRouteSource).toContain("getMissingDocumentRequirements");
    expect(jobSiteDetailRouteSource).not.toContain("listWorkers");
    expect(jobSiteDetailRouteSource).not.toContain("listJobSites");
  });

  it("offers image upload on desktop and camera capture on mobile for every evidence flow", () => {
    expect(evidenceFormSource).toContain('useState<EvidenceType>("PHOTO")');
    expect(evidenceFormSource).toContain('name="file"');
    expect(evidenceFormSource).toContain('name="cameraFile"');
    expect(evidenceFormSource).toContain('capture="environment"');
    expect(evidenceFormSource).toContain('className="md:hidden"');
    expect(evidenceFormSource).toContain('formData.set("file", cameraFile)');
  });

  it("uses one product name for the site manager role", () => {
    expect(combinedSource).not.toMatch(/capocantiere|capo cantiere|caposquadra/i);
    expect(combinedSource).toContain("Responsabile cantiere");
  });

  it("keeps the shared responsive sidebar navigation surface", () => {
    expect(navigationSource).toContain("SidebarContent");
    expect(navigationSource).toContain("SidebarFooter");
    expect(navigationSource).toContain("SidebarMenu");
    expect(navigationSource).toContain("Azienda e account");
  });

  it("keeps data control metadata-only and owner scoped", () => {
    expect(settingsHubSource).toContain("Controllo dati");
    expect(settingsHubSource).toContain("capabilities.canReadDataControl");
    expect(dataControlSource).toContain("Inventario dati");
    expect(dataControlSource).toContain("Job Data Control");
    expect(dataControlSource).toContain("Metadata-only, generato via job e salvato su Blob privato");
    expect(dataControlSource).toContain("Le regole di conservazione sono operative, non normative");
    expect(dataControlSource).not.toMatch(/blobKey|tokenHash|rawToken|downloadUrl|emailBody|fileContent|password|secret/i);
  });

  it("keeps auth entry routes reachable and avoids the old dead dashboard fallback", () => {
    expect(signInSource).toContain("SignInPageView");
    expect(signUpSource).toContain("SignUpPageView");
    expect(authSource).toContain("Accedi");
    expect(authSource).toContain("Crea account");
    expect(authSource).toContain("Configura la tua azienda");
    expect(authSource).toContain("Crea la tua azienda");
    expect(dashboardSource).not.toContain("Nessun reset DB eseguito");
    expect(authSource).not.toMatch(/blobKey|tokenHash|downloadUrl|token raw/i);
  });
});
