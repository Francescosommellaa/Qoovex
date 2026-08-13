import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  JobSiteAttachmentList,
  presentAttachmentContext,
  type JobSiteAttachmentContextReferences,
} from "./JobSiteAttachmentLibrary";

const references: JobSiteAttachmentContextReferences = {
  requests: [{ id: "request-1", title: "Verifica impianto elettrico" }],
  proposals: [{ id: "proposal-1", version: 2 }],
  payments: [{ id: "payment-1", reason: "Acconto lavori" }],
  disputes: [{ id: "dispute-1", title: "Danno alla parete" }],
};

describe("JobSiteAttachmentLibrary", () => {
  it("riconosce il contesto reale e usa un fallback umano per i file generici", () => {
    expect(presentAttachmentContext({ category: "REQUEST", sourceId: "request-1" }, references)).toBe("Richiesta: Verifica impianto elettrico");
    expect(presentAttachmentContext({ category: "PAYMENT_RECEIPT", sourceId: "payment-1" }, references)).toBe("Pagamento: Acconto lavori");
    expect(presentAttachmentContext({ category: "DOCUMENT", sourceId: null }, references)).toBe("File del cantiere");
  });

  it("mostra soltanto metadati leggibili per un file contestuale e uno generico", () => {
    const html = renderToStaticMarkup(<JobSiteAttachmentList
      attachments={[
        { id: "attachment-1", category: "REQUEST", sourceId: "request-1", originalFileName: "preventivo.pdf", size: 1_250_000, createdAt: new Date("2026-08-13T09:30:00.000Z") },
        { id: "attachment-2", category: "DOCUMENT", sourceId: null, originalFileName: "planimetria.pdf", size: 250_000, createdAt: new Date("2026-08-13T10:30:00.000Z") },
      ]}
      base="/api/job-sites/job-site-1"
      contextReferences={references}
      visibilityForAttachment={() => "SHARED"}
    />);

    expect(html).toContain("Richiesta: Verifica impianto elettrico");
    expect(html).toContain("File del cantiere");
    expect(html).toContain("Visibilità: Condiviso con il cliente");
    expect(html).toContain("1,3 MB");
    expect(html).toContain("Scarica preventivo.pdf");
    expect(html).not.toContain("application/pdf");
    expect(html.replace(/href="[^"]+"/g, "")).not.toContain("attachment-1");
  });
});
