import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { PaymentReviewForm, presentPaymentReviewOutcome } from "./JobSiteForms";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

const declaration = {
  amountMinor: "125000",
  createdAt: "2026-08-13T09:35:00.000Z",
  declaredBy: { publicRoleLabel: "Cliente principale", user: { firstName: "Giulia", lastName: "Bianchi" } },
  method: "Bonifico",
  note: "Disposto oggi.",
  receiptFileName: "ricevuta-bonifico.pdf",
  reference: "TRX-2026-08",
  transferredAt: "2026-08-13T09:30:00.000Z",
};

describe("PaymentReviewForm", () => {
  it("mostra alla Azienda la dichiarazione e la prova senza dati tecnici", () => {
    const html = renderToStaticMarkup(<PaymentReviewForm declaration={declaration} endpoint="/api/test" paymentRequestId="payment-internal-id" reviews={[{ createdAt: "2026-08-13T10:00:00.000Z", note: "Ricezione rilevata in contabilità.", outcome: "CONFIRMED_RECEIVED", reviewedBy: { publicRoleLabel: "Amministrazione", user: { firstName: "Mario", lastName: "Rossi" } } }]} revision={1} />);

    expect(html).toContain("Dichiarazione del Cliente");
    expect(html).toContain("1.250,00 €");
    expect(html).toContain("Giulia Bianchi");
    expect(html).toContain("ricevuta-bonifico.pdf");
    expect(html).toContain("Esiti già registrati dall&#x27;Azienda");
    expect(html).toContain("Indica ricezione dell&#x27;importo");
    expect(html).toContain("Registra un esito sulla dichiarazione");
    expect(html).toContain("Qoovex registra questa dichiarazione e non la verifica automaticamente.");
    expect(html).not.toContain("payment-internal-id");
    expect(html).not.toContain("125000");
    expect(html).not.toMatch(/CONFIRMED_RECEIVED|TRANSFER_DECLARED|pagamento verificato|pagamento certificato|transazione completata da Qoovex/i);
  });

  it("distingue una dichiarazione senza prova allegata e usa etichette umane per gli esiti", () => {
    const html = renderToStaticMarkup(<PaymentReviewForm actionable={false} declaration={{ ...declaration, receiptFileName: null }} endpoint="/api/test" paymentRequestId="payment-internal-id" revision={1} />);

    expect(html).toContain("Nessuna ricevuta o prova indicata.");
    expect(html).toContain("Non ci sono altre azioni disponibili per questa dichiarazione nello stato attuale.");
    expect(["CONFIRMED_RECEIVED", "NOT_RECEIVED", "AMOUNT_MISMATCH", "CLARIFICATION_REQUIRED"].map((outcome) => presentPaymentReviewOutcome(outcome as "CONFIRMED_RECEIVED" | "NOT_RECEIVED" | "AMOUNT_MISMATCH" | "CLARIFICATION_REQUIRED").label)).toEqual([
      "Indica ricezione dell'importo",
      "Indica ricezione non risultata",
      "Indica importo non corrispondente",
      "Richiedi un chiarimento",
    ]);
  });
});
