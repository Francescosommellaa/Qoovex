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
  const shareLinkCreateSource = readFileSync(join(root, "admin-core", "document-packages", "ShareLinkCreateForm.tsx"), "utf8");
  const notificationEmailPanelSource = readFileSync(join(root, "admin-core", "notifications", "NotificationEmailDigestPanel.tsx"), "utf8");
  const notificationPreferencesPanelSource = readFileSync(join(root, "admin-core", "notifications", "NotificationEmailPreferencesPanel.tsx"), "utf8");
  const notificationActionsSource = readFileSync(join(root, "admin-core", "notifications", "NotificationActionButtons.tsx"), "utf8");
  const auditLogSource = readFileSync(join(root, "admin-core", "audit-log", "AuditLogPageView.tsx"), "utf8");
  const accessSource = readFileSync(join(root, "admin-core", "access", "AccessAssignmentsPageView.tsx"), "utf8");
  const dataControlSource = readFileSync(join(root, "admin-core", "data-control", "DataControlPageView.tsx"), "utf8");
  const authSource = collectCodeFiles(join(root, "auth")).map((file) => readFileSync(file, "utf8")).join("\n");
  const signInSource = readFileSync(join(appRoot, "sign-in", "page.tsx"), "utf8");
  const signUpSource = readFileSync(join(appRoot, "sign-up", "page.tsx"), "utf8");
  const dashboardSource = readFileSync(join(root, "dashboard", "DashboardView.tsx"), "utf8");
  const documentListPageSource = readFileSync(join(appRoot, "documents", "page.tsx"), "utf8");
  const documentDetailPageSource = readFileSync(join(appRoot, "documents", "[documentId]", "page.tsx"), "utf8");
  const evidencePageSource = readFileSync(join(appRoot, "evidence", "page.tsx"), "utf8");
  const documentCreateFlowSource = readFileSync(join(root, "admin-core", "documents", "DocumentCreateFlow.tsx"), "utf8");
  const invitePersonSource = readFileSync(join(root, "settings", "InvitePersonView.tsx"), "utf8");
  const nextConfigSource = readFileSync(join(root, "..", "..", "next.config.ts"), "utf8");
  const combinedSource = `${source}\n${appSource}`;

  const adminRoutes = ["/dashboard", "/notifications", "/documents", "/deadlines", "/workers", "/job-sites", "/checklists", "/evidence", "/document-packages", "/access", "/audit-log", "/data-control"] as const;

  it("does not render forbidden legal or sensitive storage copy", () => {
    expect(combinedSource).not.toMatch(/sei a norma|conformita garantita|validita legale|legalmente valido|abilitato automaticamente|obbligatorio per legge/i);
    expect(combinedSource).not.toMatch(/blobKey|tokenHash|downloadUrl|token raw/i);
  });

  it("keeps everyday navigation small and preserves secondary routes", () => {
    for (const route of ["/dashboard", "/documents", "/workers", "/job-sites"]) expect(navigationPolicySource).toContain(`href: "${route}"`);
    for (const route of adminRoutes) expect(appSource).toContain(route.slice(1));
    for (const route of ["/deadlines", "/checklists", "/evidence", "/document-packages", "/access", "/audit-log", "/data-control"]) {
      expect(navigationPolicySource).not.toContain(`label: "${route}"`);
    }
  });

  it("keeps page titles for the main admin sections", () => {
    for (const title of ["Notifiche", "Documenti", "Scadenze", "Lavoratori", "Cantieri", "Checklist", "Prove", "Pacchetti documentali", "Accessi operativi", "Audit", "Controllo dati"]) {
      expect(combinedSource).toContain(title);
    }
  });

  it("keeps the required empty states for admin core", () => {
    expect(combinedSource).toContain("Aggiungi il primo documento per iniziare");
    expect(combinedSource).toContain("Registra una scadenza");
    expect(combinedSource).toContain("Aggiungi un lavoratore per collegare documenti e scadenze");
    expect(combinedSource).toContain("Crea un cantiere per raccogliere documenti");
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
    for (const label of ["Titolo documento", "Titolo scadenza", "Nome visualizzato", "Nome cantiere", "Nome checklist", "Titolo prova", "Titolo condivisione"]) {
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
    expect(evidenceFormSource).toContain("Limite 4 MB");
  });

  it("does not keep created share link values in the share link list", () => {
    expect(shareLinksPanelSource).not.toContain("createdToken");
    expect(shareLinksPanelSource).not.toContain("token");
    expect(shareLinkCreateSource).toContain("Link creato. Copialo ora");
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
    expect(accessSource).toContain("Accessi operativi");
    expect(accessSource).toContain("Collega utenti e lavoratori");
    expect(accessSource).toContain("Assegna capocantiere ai cantieri");
    expect(accessSource).toContain("Assegna lavoratori ai cantieri");
    expect(accessSource).not.toMatch(/blobKey|tokenHash|downloadUrl|token raw/i);
  });

  it("does not call role-restricted configuration services from ordinary document and evidence lists", () => {
    expect(documentListPageSource).not.toContain("listDocumentTypes");
    expect(documentListPageSource).not.toContain("getMissingDocumentRequirements");
    expect(documentDetailPageSource).toContain("capabilities.canReadDocumentSettings ? await listDocumentTypes() : []");
    expect(evidencePageSource).toContain("capabilities.canCompleteChecklists || capabilities.canManageChecklists ? await listChecklists() : []");
  });

  it("keeps document upload retry on the created record and owner out of invitation choices", () => {
    expect(documentCreateFlowSource).toContain("setCreatedDocumentId(document.id)");
    expect(documentCreateFlowSource).toContain("senza creare un duplicato");
    expect(invitePersonSource).not.toContain('value: "OWNER"');
    expect(invitePersonSource).toContain("Gestisce l'azienda e il lavoro quotidiano");
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
