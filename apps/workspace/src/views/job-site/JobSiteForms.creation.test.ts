import { describe, expect, it } from "vitest";
import { changeProposalDecisionAction, createdJobSiteDetailPath, isStaleChangeProposalAction, presentChangeProposalActionError } from "./JobSiteForms";

describe("destinazione dopo la creazione del cantiere", () => {
  it("usa l'identificativo restituito dalla creazione per aprire il dettaglio corretto", () => {
    expect(createdJobSiteDetailPath({ id: "job-site-1" })).toBe("/job-sites/job-site-1");
  });

  it("non costruisce una destinazione se la risposta non contiene un identificativo valido", () => {
    expect(() => createdJobSiteDetailPath({ id: "" })).toThrow("non è stato possibile aprirlo");
  });
});

describe("azioni sulla proposta corrente", () => {
  it("lega accettazione e rifiuto alla proposta e alla versione esatte", () => {
    expect(changeProposalDecisionAction({ decision: "ACCEPTED", proposalId: "proposal-1", revision: 4, versionId: "proposal-version-2" })).toEqual({
      action: "CHANGE_PROPOSAL_APPLY@1",
      decision: "ACCEPTED",
      expectedRevision: 4,
      proposalId: "proposal-1",
      versionId: "proposal-version-2",
    });
    expect(changeProposalDecisionAction({ decision: "REJECTED", proposalId: "proposal-1", revision: 4, versionId: "proposal-version-2" }).decision).toBe("REJECTED");
  });

  it("trasforma i conflitti di proposta o revisione in un recovery umano", () => {
    for (const message of ["Proposta non disponibile per questa parte.", "Il cantiere e stato modificato.", "STALE_PROPOSAL_VERSION"]) {
      expect(isStaleChangeProposalAction(message)).toBe(true);
      expect(presentChangeProposalActionError(message)).toBe("La proposta è cambiata, è già stata gestita o non è più disponibile. Aggiorna la pagina e controlla lo stato attuale.");
    }
  });

  it("non espone il messaggio raw per un errore non attribuibile a una proposta obsoleta", () => {
    expect(presentChangeProposalActionError("Operazione non disponibile.")).toBe("Non è stato possibile registrare la tua scelta sulla proposta. Riprova dopo averne controllato i dettagli.");
  });
});
