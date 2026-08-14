import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { ChangeProposalComparison, getChangeProposalPresentation } from "./ChangeProposalComparison";

const basePayload = {
  schemaVersion: 1 as const,
  changeSummary: "Sostituzione del rivestimento previsto.",
  reason: "Il materiale iniziale non è più disponibile.",
  affectedStepIds: [],
  collaboratorParticipantIds: [],
  estimatedCompletionAt: null,
  scheduleImpact: null,
  conditions: null,
};

describe("confronto delle proposte di modifica", () => {
  it("confronta l'importo precedente con quello proposto quando la baseline appartiene alla versione", () => {
    const presentation = getChangeProposalPresentation({ ...basePayload, priceMode: "FIXED_DELTA", previousPriceMinor: "125000", economicDeltaMinor: "25000", rangeMinimumMinor: null, rangeMaximumMinor: null });

    expect(presentation?.comparisons).toEqual([{ label: "Importo", before: "1.250,00 €", after: "1.500,00 €", change: "Variazione proposta: +250,00 €" }]);
  });

  it("mostra l'impatto sui tempi come dato proposto senza inventare una baseline", () => {
    const html = renderToStaticMarkup(<ChangeProposalComparison payload={{ ...basePayload, priceMode: "NO_PRICE_CHANGE", previousPriceMinor: null, economicDeltaMinor: null, rangeMinimumMinor: null, rangeMaximumMinor: null, estimatedCompletionAt: "2026-10-15T09:30:00.000Z", scheduleImpact: "Conclusione prevista una settimana più tardi." }} />);

    expect(html).toContain("Nuova conclusione prevista");
    expect(html).toContain("Conclusione prevista una settimana più tardi.");
    expect(html).not.toContain("Cosa cambia rispetto a prima");
  });

  it("mostra solo il valore proposto quando manca una baseline confrontabile", () => {
    const presentation = getChangeProposalPresentation({ ...basePayload, priceMode: "FIXED_DELTA", previousPriceMinor: null, economicDeltaMinor: "25000", rangeMinimumMinor: null, rangeMaximumMinor: null });

    expect(presentation?.comparisons).toEqual([]);
    expect(presentation?.details).toContainEqual({ label: "Variazione economica proposta", value: "+250,00 €" });
  });
});
