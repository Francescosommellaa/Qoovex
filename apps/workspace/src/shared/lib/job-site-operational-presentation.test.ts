import { describe, expect, it } from "vitest";
import { presentClientWorkItem, presentJobSiteNotification, presentOrganizationWorkItem } from "./job-site-operational-presentation";

describe("job-site operational presentation", () => {
  it("separa l'evento dalla prossima azione Cliente usando lo stesso lessico", () => {
    const notification = presentJobSiteNotification("INITIAL_AGREEMENT_PUBLISH@1", "ORGANIZATION_MEMBER");
    const task = presentClientWorkItem("INITIAL_AGREEMENT_CONFIRMATION");

    expect(notification).toMatchObject({ title: "Riepilogo iniziale pubblicato", severity: "ATTENTION" });
    expect(notification.message).toContain("L'Azienda ha pubblicato il riepilogo iniziale");
    expect(task).toMatchObject({ title: "Conferma il riepilogo iniziale", actionLabel: "Apri riepilogo" });
  });

  it("allinea dichiarazione e review del pagamento lato Azienda", () => {
    const notification = presentJobSiteNotification("PAYMENT_TRANSFER_DECLARE@1", "CLIENT");
    const task = presentOrganizationWorkItem("PAYMENT_DECLARATION_REVIEW");

    expect(notification).toMatchObject({ title: "Pagamento dichiarato dal cliente", severity: "ATTENTION" });
    expect(task).toMatchObject({ title: "Controlla la dichiarazione di pagamento", actionLabel: "Apri pagamento", actor: "Azienda" });
    expect(task.state.label).toBe("Revisione richiesta");
  });

  it("mantiene informativi gli aggiornamenti che non implicano una nuova azione", () => {
    expect(presentJobSiteNotification("PAYMENT_RECEIPT_CONFIRM@1", "ORGANIZATION_MEMBER")).toMatchObject({
      severity: "INFO",
      title: "Dichiarazione di pagamento aggiornata",
    });
  });
});
