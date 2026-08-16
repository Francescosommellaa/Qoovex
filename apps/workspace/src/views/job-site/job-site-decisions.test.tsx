import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

import { isOpenChangeProposalDecision, isOpenDisagreementDecision, isOpenRequestDecision, JobSiteChangeProposalDecision, JobSiteDecisionCollection, JobSiteDecisionsSurface } from "./job-site-decisions";

const proposalPayload = {
  affectedStepIds: [],
  changeSummary: "Sostituire il materiale previsto con quello concordato.",
  collaboratorParticipantIds: [],
  conditions: null,
  economicDeltaMinor: null,
  estimatedCompletionAt: null,
  previousPriceMinor: null,
  priceMode: "NO_PRICE_CHANGE",
  rangeMaximumMinor: null,
  rangeMinimumMinor: null,
  reason: "Il materiale iniziale non è più disponibile.",
  scheduleImpact: null,
  schemaVersion: 1,
};

describe("JobSite decisions presentation", () => {
  it("deriva gli elementi aperti esclusivamente dagli stati azionabili reali", () => {
    expect(isOpenRequestDecision("OPEN")).toBe(true);
    expect(isOpenRequestDecision("RESPONDED")).toBe(true);
    expect(isOpenRequestDecision("RESOLVED")).toBe(false);
    expect(isOpenDisagreementDecision("IN_DISCUSSION")).toBe(true);
    expect(isOpenDisagreementDecision("CLOSED_WITHOUT_AGREEMENT")).toBe(false);
    expect(isOpenChangeProposalDecision({ currentVersion: { id: "version", payload: proposalPayload, version: 1 }, status: "PROPOSED" })).toBe(true);
    expect(isOpenChangeProposalDecision({ currentVersion: null, status: "PROPOSED" })).toBe(false);
    expect(isOpenChangeProposalDecision({ currentVersion: { id: "version", payload: proposalPayload, version: 1 }, status: "ACCEPTED" })).toBe(false);
  });

  it("mostra prima le decisioni aperte e mantiene lo storico consultabile", () => {
    const html = renderToStaticMarkup(<JobSiteDecisionsSurface openCount={2}>
      <JobSiteDecisionCollection description="Contesto" emptyDescription="Nessun elemento aperto." id="richieste" openItems={[<article key="open">Richiesta da gestire</article>]} openTitle="Richieste aperte" secondaryItems={[<article key="closed">Richiesta conclusa</article>]} secondaryTitle="Richieste concluse" title="Richieste e risposte" />
      <JobSiteDecisionCollection description="Contesto" emptyDescription="Nessun elemento aperto." id="modifiche" openItems={[]} openTitle="Proposte da valutare" secondaryItems={[]} secondaryTitle="Altre proposte" title="Proposte di modifica" />
      <JobSiteDecisionCollection description="Contesto" emptyDescription="Nessun elemento aperto." id="disaccordi" openItems={[<article key="disagreement">Disaccordo da gestire</article>]} openTitle="Disaccordi aperti" secondaryItems={[]} secondaryTitle="Disaccordi conclusi" title="Disaccordi" />
    </JobSiteDecisionsSurface>);

    expect(html).toContain('id="decisioni"');
    expect(html).toContain('id="richieste"');
    expect(html).toContain('id="modifiche"');
    expect(html).toContain('id="disaccordi"');
    expect(html).toContain("2 decisioni aperte");
    expect(html.indexOf("Richiesta da gestire")).toBeLessThan(html.indexOf("Richiesta conclusa"));
    expect(html).toContain("<details");
    expect(html).toContain("Nessun elemento aperto.");
  });

  it("mantiene la creazione secondaria chiusa dietro una CTA contestuale", () => {
    const html = renderToStaticMarkup(<JobSiteDecisionCollection
      creation={{
        content: <form><label htmlFor="titolo-richiesta">Titolo</label><input id="titolo-richiesta" /></form>,
        description: "Apri il modulo quando serve una risposta dall'altra parte.",
        triggerLabel: "Apri una richiesta",
      }}
      description="Contesto"
      emptyDescription="Nessun elemento aperto."
      id="richieste"
      openItems={[]}
      openTitle="Richieste aperte"
      secondaryItems={[]}
      secondaryTitle="Richieste concluse"
      title="Richieste e risposte"
    />);

    expect(html).toContain("Apri una richiesta");
    expect(html).toContain("Apri il modulo quando serve una risposta dall&#x27;altra parte.");
    expect(html).toContain('aria-expanded="false"');
  });

  it("rende una proposta con stato, attore e prossimo passo umani senza esporre enum o ID", () => {
    const html = renderToStaticMarkup(<JobSiteChangeProposalDecision
      actionsEndpoint="/api/actions-internal"
      base="/api/job-sites/internal-id"
      proposal={{
        currentVersion: { id: "version-internal-id", payload: proposalPayload, version: 1 },
        id: "proposal-internal-id",
        representedSide: "ORGANIZATION_MEMBER",
        status: "PROPOSED",
      }}
      revision={4}
      viewer="ORGANIZATION"
    />);

    expect(html).toContain("Proposta iniziale");
    expect(html).toContain("In attesa del Cliente");
    expect(html).toContain("Deve intervenire:</dt><dd>Cliente");
    expect(html).toContain("attendi la decisione del Cliente");
    expect(html).not.toContain("PROPOSED");
    expect(html).not.toContain("proposal-internal-id");
    expect(html).not.toContain("version-internal-id");
  });
});
