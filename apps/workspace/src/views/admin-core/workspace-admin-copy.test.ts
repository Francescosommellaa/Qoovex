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
  const evidenceFormSource = readFileSync(join(root, "admin-core", "evidence", "EvidenceForm.tsx"), "utf8");
  const shareLinksPanelSource = readFileSync(join(root, "admin-core", "document-packages", "ShareLinksPanel.tsx"), "utf8");
  const shareLinkCreateSource = readFileSync(join(root, "admin-core", "document-packages", "ShareLinkCreateForm.tsx"), "utf8");
  const notificationEmailPanelSource = readFileSync(join(root, "admin-core", "notifications", "NotificationEmailDigestPanel.tsx"), "utf8");
  const notificationPreferencesPanelSource = readFileSync(join(root, "admin-core", "notifications", "NotificationEmailPreferencesPanel.tsx"), "utf8");
  const notificationActionsSource = readFileSync(join(root, "admin-core", "notifications", "NotificationActionButtons.tsx"), "utf8");
  const combinedSource = `${source}\n${appSource}`;

  const adminRoutes = ["/dashboard", "/notifications", "/documents", "/deadlines", "/workers", "/job-sites", "/checklists", "/evidence", "/document-packages"] as const;

  it("does not render forbidden legal or sensitive storage copy", () => {
    expect(combinedSource).not.toMatch(/sei a norma|conformita garantita|validita legale|legalmente valido|abilitato automaticamente|obbligatorio per legge/i);
    expect(combinedSource).not.toMatch(/blobKey|tokenHash|downloadUrl|token raw/i);
  });

  it("references every main admin route in the workspace navigation", () => {
    for (const route of adminRoutes) expect(navigationSource).toContain(`href: "${route}"`);
  });

  it("keeps page titles for the main admin sections", () => {
    for (const title of ["Notifiche", "Documenti", "Scadenze", "Lavoratori", "Cantieri", "Checklist", "Prove", "Pacchetti documentali"]) {
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
  });

  it("keeps labels for the primary admin forms", () => {
    for (const label of ["Titolo documento", "Titolo scadenza", "Nome visualizzato", "Nome cantiere", "Nome checklist", "Titolo prova", "Titolo pacchetto"]) {
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
});
