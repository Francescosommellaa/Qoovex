import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PaymentRequestSummary, presentPaymentNextAction } from "./PaymentRequestSummary";

const payment = {
  status: "TRANSFER_DECLARED" as const,
  amountMinor: BigInt("125000"),
  reason: "Acconto per i lavori elettrici",
  requestedAt: new Date("2026-08-13T09:30:00.000Z"),
  createdAt: new Date("2026-08-13T09:30:00.000Z"),
  dueAt: null,
  confirmedAt: null,
  requestedByParticipant: { publicRoleLabel: "Responsabile del cantiere", user: { firstName: "Luca", lastName: "Bianchi" } },
};

describe("PaymentRequestSummary", () => {
  it("presenta richiesta, dichiarazione e prossima azione senza attribuire il pagamento a Qoovex", () => {
    const html = renderToStaticMarkup(<PaymentRequestSummary payment={payment} viewer="ORGANIZATION" />);

    expect(html).toContain("1.250,00 €");
    expect(html).toContain("Acconto per i lavori elettrici");
    expect(html).toContain("Luca Bianchi");
    expect(html).toContain("Invio dichiarato dal cliente");
    expect(html).toContain("Prossimo passo:");
    expect(html).not.toContain("125000");
    expect(html).not.toMatch(/Qoovex.*(incassa|custodisce|trasferisce|garantisce)/i);
  });

  it("spiega la prossima azione del cliente per una richiesta appena inviata", () => {
    expect(presentPaymentNextAction("REQUESTED", "CLIENT")).toContain("dichiarane l'invio");
    expect(presentPaymentNextAction("TRANSFER_DECLARED", "ORGANIZATION")).toContain("registra l'esito della ricezione dichiarata dal cliente");
  });
});
