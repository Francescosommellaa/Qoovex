import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { JobSiteDisagreementConversation, JobSiteRequestConversation, presentRequestNextAction, type JobSiteRequestConversationData } from "./JobSiteRequestConversation";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

const participant = { publicRoleLabel: "Responsabile del cantiere", user: { firstName: "Luca", lastName: "Bianchi" } };
const conversation: JobSiteRequestConversationData = {
  availableActions: [{ label: "Segna come risolta", value: "RESOLVE" }, { label: "Ritira la richiesta", value: "WITHDRAW" }],
  blocking: true,
  body: "Serve confermare il materiale previsto per il lavoro.",
  createdAt: new Date("2026-08-13T09:30:00.000Z"),
  interactions: [{ action: "RESPOND", actor: { publicRoleLabel: "Cliente", user: { firstName: "Anna", lastName: "Verdi" } }, createdAt: new Date("2026-08-13T10:00:00.000Z"), message: "Confermo il materiale indicato." }],
  openedByParticipant: participant,
  resolvedAt: null,
  status: "RESPONDED",
  title: "Conferma del materiale",
  type: "ISSUE",
};

describe("JobSiteRequestConversation", () => {
  it("presenta una richiesta aperta come conversazione, con blocco e azioni consentite", () => {
    const html = renderToStaticMarkup(<JobSiteRequestConversation actionsEndpoint="/api/test/requests/request-internal-id" conversation={conversation} revision={1} />);

    expect(html).toContain("Conferma del materiale");
    expect(html).toContain("Serve confermare il materiale previsto per il lavoro.");
    expect(html).toContain("Aperta da Luca Bianchi");
    expect(html).toContain("Argomento: Problema operativo.");
    expect(html).toContain("Risposta ricevuta");
    expect(html).toContain("Risposta inviata");
    expect(html).toContain("Anna Verdi");
    expect(html).toContain("Confermo il materiale indicato.");
    expect(html).toContain("La chiusura del cantiere resta sospesa.");
    expect(html).toContain("Segna come risolta");
    expect(html).toContain("puoi chiudere o ritirare questa richiesta");
    expect(html).not.toContain("request-internal-id");
    expect(html).not.toContain("RESPONDED");
  });

  it("rende i terminali risolto e ritirato leggibili senza azioni residue", () => {
    const resolvedHtml = renderToStaticMarkup(<JobSiteRequestConversation actionsEndpoint="/api/test" conversation={{ ...conversation, availableActions: [], interactions: [], status: "RESOLVED" }} revision={1} />);
    const withdrawnHtml = renderToStaticMarkup(<JobSiteRequestConversation actionsEndpoint="/api/test" conversation={{ ...conversation, availableActions: [], interactions: [], status: "WITHDRAWN" }} revision={1} />);

    expect(resolvedHtml).toContain("Richiesta risolta");
    expect(resolvedHtml).toContain("Questa richiesta non blocca più la chiusura.");
    expect(resolvedHtml).toContain("Nessuna azione richiesta");
    expect(resolvedHtml).not.toContain("Aggiorna questa richiesta");
    expect(withdrawnHtml).toContain("Richiesta ritirata");
    expect(withdrawnHtml).toContain("Nessuna azione richiesta");
  });

  it("esplicita il prossimo passo in base alle sole azioni disponibili", () => {
    expect(presentRequestNextAction({ availableActions: [{ label: "Invia una risposta", value: "RESPOND" }], status: "OPEN" })).toBe("Prossimo passo: invia una risposta.");
    expect(presentRequestNextAction({ availableActions: [], status: "OPEN" })).toContain("attendi una risposta");
  });

  it("distingue il disaccordo dalla richiesta operativa senza attribuire a Qoovex un ruolo di arbitro", () => {
    const html = renderToStaticMarkup(<JobSiteDisagreementConversation actionsEndpoint="/api/test/disputes/disagreement-internal-id" conversation={{
      availableActions: [{ label: "Aggiungi la tua posizione", value: "RESPOND" }, { label: "Registra accordo", value: "AGREE" }],
      description: "Le parti non condividono la data indicata per la consegna.",
      interactions: [{ action: "RESPOND", actor: participant, createdAt: new Date("2026-08-13T10:00:00.000Z"), message: "Propongo di verificare il calendario." }],
      openedAt: new Date("2026-08-13T09:30:00.000Z"),
      openedByParticipant: participant,
      status: "IN_DISCUSSION",
      title: "Data di consegna",
    }} revision={1} />);

    expect(html).toContain("Data di consegna");
    expect(html).toContain("Confronto in corso");
    expect(html).toContain("Le parti non condividono la data indicata per la consegna.");
    expect(html).toContain("Posizione aggiunta");
    expect(html).toContain("Aggiungi la tua posizione");
    expect(html).toContain("richiede le conferme previste da entrambe le parti");
    expect(html).not.toContain("disagreement-internal-id");
    expect(html).not.toMatch(/Qoovex.*(?:decide|arbitr)/i);
  });
});
