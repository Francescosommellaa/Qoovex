import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ClientHomeWorkQueue } from "./ClientHomeWorkQueue";

describe("ClientHomeWorkQueue", () => {
  it("mostra un'azione del Cliente con contesto, stato e collegamento diretto", () => {
    const html = renderToStaticMarkup(<ClientHomeWorkQueue items={[{
      detail: "L'Azienda ha pubblicato il riepilogo iniziale da controllare.",
      href: "/client/job-sites/cucina#riepilogo",
      id: "cucina:initial-agreement",
      jobSiteName: "Ristrutturazione cucina",
      kind: "INITIAL_AGREEMENT_CONFIRMATION",
    }]} />);

    expect(html).toContain("Da fare");
    expect(html).toContain("1 attività");
    expect(html).toContain("Conferma il riepilogo iniziale");
    expect(html).toContain("Ristrutturazione cucina");
    expect(html).toContain("Deve intervenire:");
    expect(html).toContain("Tu");
    expect(html).toContain('href="/client/job-sites/cucina#riepilogo"');
    expect(html).not.toContain("INITIAL_AGREEMENT_CONFIRMATION");
  });

  it("mostra più azioni senza duplicare i task", () => {
    const html = renderToStaticMarkup(<ClientHomeWorkQueue items={[{
      detail: "Serramenti: l'Azienda ha indicato il completamento dello step.",
      href: "/client/job-sites/cucina#step",
      id: "cucina:step:serramenti",
      jobSiteName: "Ristrutturazione cucina",
      kind: "STEP_CONFIRMATION",
    }, {
      detail: "La richiesta riguarda il preventivo aggiornato.",
      href: "/client/job-sites/bagno#richieste",
      id: "bagno:request:preventivo",
      jobSiteName: "Bagno principale",
      kind: "REQUEST_RESPONSE",
    }]} />);

    expect(html).toContain("2 attività");
    expect(html.match(/<h4[^>]*>Verifica uno step completato<\/h4>/g)).toHaveLength(1);
    expect(html.match(/<h4[^>]*>Rispondi a una richiesta<\/h4>/g)).toHaveLength(1);
    expect(html).toContain('href="/client/job-sites/cucina#step"');
    expect(html).toContain('href="/client/job-sites/bagno#richieste"');
  });

  it("rende esplicito quando non ci sono azioni richieste", () => {
    const html = renderToStaticMarkup(<ClientHomeWorkQueue items={[]} />);

    expect(html).toContain("Al momento non è richiesto nessun tuo intervento.");
  });
});
