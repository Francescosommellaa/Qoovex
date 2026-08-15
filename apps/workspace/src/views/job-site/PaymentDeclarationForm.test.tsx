import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { PaymentDeclarationForm, presentPaymentDeclarationSummary } from "./JobSiteForms";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

const receiptAttachments = [{ id: "attachment-internal-id", label: "ricevuta-bonifico.pdf" }];

describe("PaymentDeclarationForm", () => {
  it("riassume una dichiarazione con ricevuta senza esporre dati tecnici", () => {
    const summary = presentPaymentDeclarationSummary({
      amountMinor: "125000",
      reason: "Acconto per i lavori elettrici",
      receiptAttachments,
      value: { method: "Bonifico", note: "Disposto oggi", receiptAttachmentId: "attachment-internal-id", reference: "TRX-2026-08", transferredAt: "2026-08-13T09:30" },
    });

    expect(summary).toMatchObject({
      amount: "1.250,00 €",
      method: "Bonifico",
      receipt: "ricevuta-bonifico.pdf",
      reference: "TRX-2026-08",
    });
    expect(summary.receipt).not.toContain("attachment-internal-id");
  });

  it("offre una dichiarazione prudente anche senza ricevuta", () => {
    const html = renderToStaticMarkup(<PaymentDeclarationForm amountMinor="125000" endpoint="/api/test" paymentRequestId="payment-internal-id" reason="Acconto per i lavori elettrici" receiptAttachments={[]} revision={1} />);

    expect(html).toContain("Dichiara pagamento effettuato");
    expect(html).toContain("Qoovex registra la tua dichiarazione e non esegue né verifica automaticamente il pagamento.");
    expect(html).toContain("Riepilogo della dichiarazione");
    expect(html).toContain("1.250,00 €");
    expect(html).toContain("Puoi allegare una ricevuta o una prova nella sezione qui sotto.");
    expect(html).not.toContain("payment-internal-id");
    expect(html).not.toContain("125000");
    expect(html).not.toMatch(/pagamento verificato|pagamento confermato da Qoovex/i);
  });
});
