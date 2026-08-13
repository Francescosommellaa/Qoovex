import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { InitialAgreementReview } from "./InitialAgreementReview";

describe("review del riepilogo iniziale", () => {
  it("mostra tutti i dati effettivamente inclusi nella versione completa", () => {
    const html = renderToStaticMarkup(<InitialAgreementReview snapshot={{
      schemaVersion: 1,
      name: "Rifacimento facciata",
      address: "Via Roma 12, Milano",
      description: "Ripristino della facciata principale.",
      participantSummary: [
        { participantId: "participant-company", publicRoleLabel: "Responsabile dei lavori" },
        { participantId: "participant-client", publicRoleLabel: "Committente" },
      ],
      initialEstimateMinor: "1250000",
      estimatedCompletionAt: "2026-10-15T09:30:00.000Z",
      sharedCommercialNotes: "La stima comprende i materiali indicati.",
    }} />);

    expect(html).toContain("Questo è il contenuto esatto della versione in attesa di conferma.");
    expect(html).toContain("Rifacimento facciata");
    expect(html).toContain("Via Roma 12, Milano");
    expect(html).toContain("Ripristino della facciata principale.");
    expect(html).toContain("12.500,00 €");
    expect(html).toContain("15 ott 2026");
    expect(html).toContain("La stima comprende i materiali indicati.");
    expect(html).toContain("Responsabile dei lavori");
    expect(html).toContain("Committente");
    expect(html).not.toContain("participant-company");
    expect(html).not.toContain("initialEstimateMinor");
  });

  it("omettere i campi facoltativi assenti senza sostituirli con valori tecnici", () => {
    const html = renderToStaticMarkup(<InitialAgreementReview snapshot={{
      schemaVersion: 1,
      name: "Manutenzione tetto",
      address: null,
      description: null,
      participantSummary: [],
      initialEstimateMinor: null,
      estimatedCompletionAt: null,
      sharedCommercialNotes: null,
    }} />);

    expect(html).toContain("Manutenzione tetto");
    expect(html).not.toContain("Indirizzo del lavoro");
    expect(html).not.toContain("Stima economica iniziale");
    expect(html).not.toContain("Ruoli nel lavoro");
    expect(html).not.toContain("Non indicata");
  });
});
