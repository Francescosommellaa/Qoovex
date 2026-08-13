import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

import { InitialAgreementActions, initialAgreementConfirmationAction, presentInitialAgreementActionError } from "./JobSiteForms";

describe("azioni del riepilogo iniziale", () => {
  it("lega conferma e richiesta di correzioni alla precisa versione mostrata", () => {
    expect(initialAgreementConfirmationAction("versione-corrente", 12, "ACCEPTED")).toEqual({
      action: "INITIAL_AGREEMENT_CONFIRM@1",
      agreementVersionId: "versione-corrente",
      expectedRevision: 12,
      decision: "ACCEPTED",
    });
    expect(initialAgreementConfirmationAction("versione-corrente", 12, "REJECTED")).toMatchObject({
      agreementVersionId: "versione-corrente",
      expectedRevision: 12,
      decision: "REJECTED",
    });
  });

  it("non trasforma un cambio di versione in una conferma ambigua", () => {
    expect(initialAgreementConfirmationAction("versione-aggiornata", 13, "ACCEPTED")).toMatchObject({
      agreementVersionId: "versione-aggiornata",
      expectedRevision: 13,
    });
    expect(presentInitialAgreementActionError("Versione del riepilogo non disponibile.")).toContain("riepilogo è cambiato");
    expect(presentInitialAgreementActionError("expectedRevision non valida.")).toContain("Aggiorna la pagina");
  });

  it("mantiene un messaggio di recupero comprensibile in caso di errore", () => {
    expect(presentInitialAgreementActionError("errore interno raw")).toBe("Non è stato possibile registrare la tua scelta. Riprova oppure chiedi all'Azienda di controllare il riepilogo.");
  });

  it("presenta due azioni distinguibili senza usare la conferma nativa del browser", () => {
    const html = renderToStaticMarkup(createElement(InitialAgreementActions, { agreementVersionId: "versione-corrente", endpoint: "/api/client/job-sites/cantiere/actions", revision: 12 }));

    expect(html).toContain("Conferma questa versione del riepilogo");
    expect(html).toContain("Richiedi correzioni");
    expect(html).toContain("Confermi soltanto il riepilogo mostrato sopra");
    expect(html).not.toContain("window.confirm");
  });
});
