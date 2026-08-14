import { describe, expect, it } from "vitest";
import {
  presentTimelineEvent,
  timelineEventTypes,
  type TimelineEventPresentationInput,
} from "./timeline-event-presentation";

function event(overrides: Partial<TimelineEventPresentationInput> = {}): TimelineEventPresentationInput {
  return {
    type: "WORK_UPDATE",
    actorKind: "ORGANIZATION_MEMBER",
    title: "Avanzamento facciata",
    body: "Completata la posa sul lato nord.",
    payload: { schemaVersion: 1 },
    occurredAt: new Date("2026-08-12T08:30:00.000Z"),
    createdAt: new Date("2026-08-12T08:31:00.000Z"),
    ...overrides,
  };
}

describe("timeline event presentation", () => {
  it("covers every canonical timeline event with human copy", () => {
    expect(timelineEventTypes).toHaveLength(30);

    for (const type of timelineEventTypes) {
      const presentation = presentTimelineEvent(event({ type, title: "Evento Qoovex", body: null }));
      expect(presentation.title).not.toBe(type);
      expect(presentation.description.length).toBeGreaterThan(0);
      expect(presentation.kind).toBeTruthy();
    }
  });

  it("uses user-authored content without exposing metadata or internal identifiers", () => {
    const presentation = presentTimelineEvent(event({
      payload: {
        schemaVersion: 1,
        relatedId: "internal-record-id",
        metadata: { privateCode: "TECHNICAL_VALUE" },
      },
    }));

    expect(presentation).toMatchObject({
      title: "Aggiornamento lavori",
      description: "Completata la posa sul lato nord.",
      actor: "Azienda",
    });
    expect(presentation.details).toContainEqual({ label: "Titolo", value: "Avanzamento facciata" });
    expect(JSON.stringify(presentation)).not.toContain("internal-record-id");
    expect(JSON.stringify(presentation)).not.toContain("TECHNICAL_VALUE");
  });

  it("presents step transitions with the existing state presentation layer", () => {
    const presentation = presentTimelineEvent(event({
      type: "STEP_READY_FOR_REVIEW",
      title: "Evento Qoovex",
      body: null,
      payload: { schemaVersion: 1, previousStatus: "IN_PROGRESS", nextStatus: "WORK_COMPLETED", stepId: "internal-step-id" },
    }));

    expect(presentation.description).toBe("Il lavoro dello step è pronto per la conferma del cliente.");
    expect(presentation.details).toEqual([
      { label: "Stato precedente", value: "In corso" },
      { label: "Nuovo stato", value: "Lavoro completato, da confermare" },
    ]);
    expect(JSON.stringify(presentation)).not.toContain("internal-step-id");
  });

  it("gives a proposal version human context instead of exposing a bare number", () => {
    const presentation = presentTimelineEvent(event({
      type: "CHANGE_COUNTERED",
      title: "Evento Qoovex",
      body: null,
      payload: { schemaVersion: 1, proposalId: "internal-proposal-id", version: 3 },
    }));

    expect(presentation.details).toEqual([
      { label: "Proposta", value: "Proposta aggiornata" },
    ]);
    expect(JSON.stringify(presentation)).not.toContain("internal-proposal-id");
  });

  it("formats payment amounts through the centralized money presentation layer", () => {
    const presentation = presentTimelineEvent(event({
      type: "PAYMENT_REQUESTED",
      title: "Evento Qoovex",
      body: null,
      payload: { schemaVersion: 1, paymentRequestId: "internal-payment-id", amountMinor: "125000" },
    }));

    expect(presentation.details).toEqual([{ label: "Importo", value: "1.250,00 €" }]);
    expect(JSON.stringify(presentation)).not.toContain("amountMinor");
    expect(JSON.stringify(presentation)).not.toContain("internal-payment-id");
  });

  it("derives meaningful copy from known decisions and outcomes", () => {
    expect(presentTimelineEvent(event({
      type: "WORK_UPDATE",
      title: "Evento Qoovex",
      body: null,
      payload: { schemaVersion: 1, agreementVersionId: "internal-id", decision: "ACCEPTED" },
    }))).toMatchObject({
      title: "Riepilogo iniziale confermato",
      description: "Il cliente ha confermato il riepilogo iniziale del cantiere.",
    });

    expect(presentTimelineEvent(event({
      type: "PAYMENT_DISPUTED",
      title: "Evento Qoovex",
      body: null,
      payload: { schemaVersion: 1, outcome: "AMOUNT_MISMATCH" },
    })).details).toEqual([{ label: "Esito della verifica", value: "Importo non corrispondente" }]);

    expect(presentTimelineEvent(event({
      type: "ISSUE_REPORTED",
      title: "Evento Qoovex",
      body: null,
      payload: { schemaVersion: 1, status: "IN_DISCUSSION", message: "Verifica in corso" },
    })).details).toEqual([
      { label: "Messaggio", value: "Verifica in corso" },
      { label: "Stato", value: "Confronto in corso" },
    ]);
  });

  it("presenta gli aggiornamenti sul disaccordo senza attribuire una decisione a Qoovex", () => {
    const presentation = presentTimelineEvent(event({
      type: "ISSUE_REPORTED",
      title: "Evento Qoovex",
      body: null,
      payload: { schemaVersion: 1, disputeId: "internal-disagreement-id", action: "AGREE", message: "Confermiamo la nuova data.", status: "IN_DISCUSSION" },
    }));

    expect(presentation).toMatchObject({
      title: "Accordo registrato sul disaccordo",
      description: "L'accordo si completa con le conferme previste da entrambe le parti.",
    });
    expect(JSON.stringify(presentation)).not.toContain("internal-disagreement-id");
    expect(JSON.stringify(presentation)).not.toMatch(/Qoovex.*(?:decide|arbitr)/i);
  });

  it("formats occurrence date and identifies the actor without showing technical values", () => {
    expect(presentTimelineEvent(event({ actorKind: "CLIENT" }))).toMatchObject({
      actor: "Cliente",
      occurredAtLabel: "12 ago 2026, 10:30",
    });
    expect(presentTimelineEvent(event({ actorKind: "SYSTEM" })).actor).toBe("Sistema");
    expect(presentTimelineEvent(event({ actorName: "Giulia Bianchi" })).actor).toBe("Giulia Bianchi");
  });

  it("uses a neutral fallback for unknown event and actor values", () => {
    const presentation = presentTimelineEvent(event({
      type: "FUTURE_INTERNAL_EVENT",
      actorKind: "FUTURE_ACTOR",
      title: "Evento Qoovex",
      body: null,
      payload: { secretId: "do-not-render" },
    }));

    expect(presentation).toEqual({
      title: "Aggiornamento del cantiere",
      description: "È stato registrato un aggiornamento. I dettagli sono disponibili nelle sezioni pertinenti del cantiere.",
      actor: "Autore non disponibile",
      occurredAtLabel: "12 ago 2026, 10:30",
      kind: "system",
      sectionId: "timeline",
      tone: "neutral",
      details: [],
    });
    expect(JSON.stringify(presentation)).not.toContain("FUTURE_INTERNAL_EVENT");
    expect(JSON.stringify(presentation)).not.toContain("FUTURE_ACTOR");
    expect(JSON.stringify(presentation)).not.toContain("do-not-render");
  });
});
