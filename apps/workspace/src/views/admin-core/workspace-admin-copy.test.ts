import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

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
  const evidenceFormSource = readFileSync(join(root, "admin-core", "evidence", "EvidenceForm.tsx"), "utf8");
  const shareLinksPanelSource = readFileSync(join(root, "admin-core", "document-packages", "ShareLinksPanel.tsx"), "utf8");
  const shareLinkCreateSource = readFileSync(join(root, "admin-core", "document-packages", "ShareLinkCreateForm.tsx"), "utf8");

  it("does not render forbidden legal or sensitive storage copy", () => {
    expect(source).not.toMatch(/sei a norma|conformita garantita|validita legale|legalmente valido|abilitato automaticamente|obbligatorio per legge/i);
    expect(source).not.toMatch(/blobKey|tokenHash|downloadUrl|token raw/i);
  });

  it("keeps the required empty states for admin core", () => {
    expect(source).toContain("Aggiungi il primo documento per iniziare");
    expect(source).toContain("Registra una scadenza");
    expect(source).toContain("Aggiungi un lavoratore per collegare documenti e scadenze");
    expect(source).toContain("Crea un cantiere per raccogliere documenti");
  });

  it("keeps the required empty states for extended admin", () => {
    expect(source).toContain("Crea una checklist configurata per seguire attivita");
    expect(source).toContain("Aggiungi una foto, un file o una nota");
    expect(source).toContain("Crea un pacchetto documentale pronto per revisione");
  });

  it("keeps evidence upload conditional by evidence type", () => {
    expect(evidenceFormSource).toContain('type !== "NOTE"');
    expect(evidenceFormSource).toContain('name="file"');
    expect(evidenceFormSource).toContain("Limite 4 MB");
  });

  it("does not keep created share link values in the share link list", () => {
    expect(shareLinksPanelSource).not.toContain("createdToken");
    expect(shareLinkCreateSource).toContain("Link creato. Copialo ora");
  });
});
