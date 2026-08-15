import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { closureConfirmationAction, presentClosureActionError, presentReopeningActionError, reopeningConfirmationAction } from "./JobSiteForms";
import { canCurrentUserConfirmReopening, getClosureBlockers, JobSiteClosureConfirmation, JobSiteClosureReadinessReview, JobSiteClosureSnapshotReview, JobSiteReopeningConfirmation } from "./JobSiteClosureReview";

describe("JobSiteClosureReview", () => {
  it("mostra un cantiere chiudibile senza introdurre condizioni ulteriori", () => {
    const readiness = {
      openDisputes: [],
      openPayments: [],
      openProcesses: [],
      openProposals: [],
      openRequests: [],
      openSteps: [],
      steps: [{ id: "step-complete", status: "CONFIRMED" as const, title: "Finiture" }],
    };
    const html = renderToStaticMarkup(<JobSiteClosureReadinessReview readiness={readiness} />);

    expect(getClosureBlockers(readiness)).toEqual([]);
    expect(html).toContain("Non risultano elementi aperti tra quelli verificati dal lifecycle.");
    expect(html).toContain("1 conclusi o annullati su 1");
    expect(html).toContain("Completato");
  });

  it("mostra soltanto i blocchi reali del lifecycle e collega alle sezioni pertinenti", () => {
    const readiness = {
      openDisputes: [{ id: "dispute-internal", status: "OPEN" as const, title: "Data di consegna" }],
      openPayments: [{ id: "payment-internal", status: "UNDER_REVIEW" as const, amountMinor: "125000", reason: "Saldo lavori" }],
      openProcesses: [{ id: "process-internal", definitionKey: "CHANGE_NEGOTIATION@1", status: "WAITING" as const }],
      openProposals: [{ id: "proposal-internal", status: "PROPOSED" as const }],
      openRequests: [{ id: "request-internal", status: "RESPONDED" as const, title: "Conferma materiale" }],
      openSteps: [{ id: "step-open", status: "WORK_COMPLETED" as const, title: "Posa pavimento" }],
      steps: [{ id: "step-internal", status: "CONFIRMED" as const, title: "Preparazione" }, { id: "step-open", status: "WORK_COMPLETED" as const, title: "Posa pavimento" }],
    };
    const html = renderToStaticMarkup(<JobSiteClosureReadinessReview readiness={readiness} />);

    expect(getClosureBlockers(readiness)).toHaveLength(6);
    expect(html).toContain("Posa pavimento");
    expect(html).toContain("Conferma materiale");
    expect(html).toContain("Saldo lavori");
    expect(html).toContain("1.250,00 €");
    expect(html).toContain("Data di consegna");
    expect(html).toContain('href="#step"');
    expect(html).toContain('href="#pagamenti"');
    expect(html).not.toContain("proposal-internal");
    expect(html).not.toContain("step-internal");
  });

  it("mostra il riepilogo immutabile della chiusura senza ID, revisioni o valori tecnici", () => {
    const html = renderToStaticMarkup(<JobSiteClosureSnapshotReview snapshot={{
      jobSite: { address: "Via Roma 1", estimatedCompletionAt: "2026-08-13T09:30:00.000Z", name: "Rifacimento cucina" },
      participants: [{ kind: "ORGANIZATION_MEMBER", publicRoleLabel: "Responsabile del cantiere" }, { kind: "CLIENT", publicRoleLabel: null }],
      payments: [{ amountMinor: "250000", status: "CONFIRMED" }],
      statement: "Alla data indicata, le parti registrano che non risultano ulteriori attività aperte nello spazio condiviso.",
      steps: [{ title: "Finiture", status: "CONFIRMED" }],
    }} />);

    expect(html).toContain("Questa è la fotografia registrata quando è stata proposta la chiusura.");
    expect(html).toContain("Rifacimento cucina");
    expect(html).toContain("2.500,00 €");
    expect(html).toContain("Lavoro confermato");
    expect(html).not.toContain("ORGANIZATION_MEMBER");
    expect(html).not.toMatch(/revision|internal/i);
  });

  it("rende esplicito chi deve confermare e cosa accade dopo la seconda conferma", () => {
    const pendingHtml = renderToStaticMarkup(<JobSiteClosureConfirmation actionsEndpoint="/api/actions" closure={{
      consents: [], id: "closure-internal", proposedAt: new Date("2026-08-13T09:30:00.000Z"), status: "PENDING_CLIENT_CONFIRMATION",
    }} revision={4} viewer="ORGANIZATION" />);
    const waitingHtml = renderToStaticMarkup(<JobSiteClosureConfirmation actionsEndpoint="/api/actions" closure={{
      consents: [{ decision: "ACCEPTED", participant: { kind: "CLIENT" } }], id: "closure-internal", proposedAt: new Date("2026-08-13T09:30:00.000Z"), status: "CLIENT_CONFIRMED",
    }} revision={4} viewer="CLIENT" />);
    const finalizedHtml = renderToStaticMarkup(<JobSiteClosureConfirmation actionsEndpoint="/api/actions" closure={{
      consents: [{ decision: "ACCEPTED", participant: { kind: "CLIENT" } }, { decision: "ACCEPTED", participant: { kind: "ORGANIZATION_MEMBER" } }], id: "closure-internal", proposedAt: new Date("2026-08-13T09:30:00.000Z"), status: "FINALIZED",
    }} revision={4} viewer="CLIENT" />);

    expect(pendingHtml).toContain("Proposta inviata dall&#x27;Azienda");
    expect(pendingHtml).toContain("In attesa della conferma del Cliente.");
    expect(waitingHtml).toContain("La tua conferma è già registrata.");
    expect(finalizedHtml).toContain("Entrambe le parti hanno confermato il riepilogo.");
    expect(finalizedHtml).not.toContain("FINALIZED");
    expect(finalizedHtml).not.toContain("closure-internal");
  });

  it("protegge la conferma da una chiusura non più aggiornata", () => {
    expect(closureConfirmationAction("closure-1", 8, "ACCEPTED")).toEqual({ action: "JOB_SITE_CLOSE@1", closureId: "closure-1", expectedRevision: 8, decision: "ACCEPTED" });
    expect(presentClosureActionError("Riepilogo chiusura obsoleto.")).toBe("La chiusura è cambiata o non è più disponibile. Aggiorna la pagina e controlla lo stato attuale.");
    expect(presentClosureActionError("Azione non disponibile nello stato corrente del cantiere.")).toBe("La chiusura è cambiata o non è più disponibile. Aggiorna la pagina e controlla lo stato attuale.");
  });

  it("separa la proposta di riapertura, l'attesa e la conferma della controparte", () => {
    const proposal = {
      consents: [{ decision: "ACCEPTED" as const, participant: { id: "organization-participant", kind: "ORGANIZATION_MEMBER" as const } }],
      id: "reopening-internal",
      proposedAt: new Date("2026-08-13T09:30:00.000Z"),
      proposedByParticipantId: "organization-participant",
      reason: "Serve completare un'attività rimasta aperta.",
      status: "PROPOSED" as const,
    };
    const waitingHtml = renderToStaticMarkup(<JobSiteReopeningConfirmation actionsEndpoint="/api/actions" proposal={proposal} revision={5} viewer="ORGANIZATION" />);

    expect(waitingHtml).toContain("Proposta da Azienda");
    expect(waitingHtml).toContain("La tua proposta è in attesa della decisione del Cliente.");
    expect(waitingHtml).not.toContain("Conferma la riapertura");
    expect(waitingHtml).toContain("Il cantiere torna alle sezioni operative.");
    expect(waitingHtml).not.toContain("PROPOSED");
    expect(waitingHtml).not.toContain("reopening-internal");
    expect(canCurrentUserConfirmReopening(proposal, "ORGANIZATION")).toBe(false);
    expect(canCurrentUserConfirmReopening(proposal, "CLIENT")).toBe(true);
  });

  it("protegge la conferma della riapertura quando la proposta non è più disponibile", () => {
    expect(reopeningConfirmationAction("reopening-1", 8, "ACCEPTED")).toEqual({ action: "JOB_SITE_REOPEN@1", reopeningProposalId: "reopening-1", expectedRevision: 8, decision: "ACCEPTED" });
    expect(presentReopeningActionError("Proposta di riapertura non disponibile.")).toBe("La proposta di riapertura è cambiata o non è più disponibile. Aggiorna la pagina e controlla lo stato attuale.");
  });
});
