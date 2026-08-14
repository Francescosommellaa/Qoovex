import type { PostClosureRequestStatus, TimelineEventType } from "@qoovex/db";
import type { DisputeStatus, JobSiteStepStatus } from "@qoovex/types";
import { formatEuroFromMinorUnits } from "./money";
import { presentProposalVersion } from "./product-metadata-presentation";
import {
  presentJobSiteStepStatus,
  presentDisputeStatus,
  presentPostClosureRequestStatus,
  presentTimelineEventType,
  type ProductStateTone,
} from "./product-state-presentation";

export type TimelineEventKind = "work" | "message" | "file" | "step" | "change" | "payment" | "issue" | "lifecycle" | "system";
export type TimelineEventSectionId = "archivio" | "chiusura" | "disaccordi" | "file" | "modifiche" | "pagamenti" | "richieste" | "riepilogo" | "step" | "timeline";

export interface TimelineEventPresentationInput {
  type: string;
  actorKind: string;
  actorName?: string | null;
  title: string;
  body: string | null;
  payload: unknown;
  occurredAt: Date | string | null;
  createdAt: Date | string;
}

export interface TimelineEventDetail {
  label: string;
  value: string;
}

export interface TimelineEventPresentation {
  title: string;
  description: string;
  actor: string;
  occurredAtLabel: string;
  kind: TimelineEventKind;
  sectionId: TimelineEventSectionId;
  tone: ProductStateTone;
  details: TimelineEventDetail[];
}

interface TimelineEventDefinition {
  description: string;
  kind: TimelineEventKind;
}

const definitions = {
  JOB_SITE_CREATED: { description: "Lo spazio di lavoro del cantiere è stato creato.", kind: "lifecycle" },
  WORK_UPDATE: { description: "È stato pubblicato un aggiornamento sui lavori.", kind: "work" },
  COMMENT: { description: "È stato aggiunto un commento alla cronologia.", kind: "message" },
  EVIDENCE: { description: "È stata aggiunta un'evidenza al cantiere.", kind: "file" },
  SHARED_EXPENSE: { description: "È stata condivisa una spesa collegata al cantiere.", kind: "payment" },
  SHARED_DOCUMENT: { description: "È stato condiviso un documento nel cantiere.", kind: "file" },
  STEP_CREATED: { description: "È stato aggiunto un nuovo step al piano di lavoro.", kind: "step" },
  STEP_UPDATED: { description: "Lo stato di uno step è stato aggiornato.", kind: "step" },
  STEP_READY_FOR_REVIEW: { description: "Il lavoro dello step è pronto per la conferma del cliente.", kind: "step" },
  STEP_CONFIRMED: { description: "Il cliente ha confermato il lavoro dello step.", kind: "step" },
  STEP_REOPENED: { description: "Il cliente ha richiesto modifiche allo step.", kind: "step" },
  CHANGE_PROPOSED: { description: "È stata presentata una proposta di modifica.", kind: "change" },
  CHANGE_COUNTERED: { description: "È stata registrata una nuova versione della proposta.", kind: "change" },
  CHANGE_ACCEPTED: { description: "La proposta di modifica è stata accettata e applicata.", kind: "change" },
  CHANGE_REJECTED: { description: "La proposta di modifica è stata rifiutata.", kind: "change" },
  CHANGE_WITHDRAWN: { description: "La proposta di modifica è stata ritirata da chi l'aveva presentata.", kind: "change" },
  CLARIFICATION_REQUESTED: { description: "È stato richiesto un chiarimento sul cantiere.", kind: "message" },
  CLARIFICATION_RESPONDED: { description: "È stata inviata una risposta alla richiesta di chiarimento.", kind: "message" },
  ISSUE_REPORTED: { description: "È stato registrato un disaccordo da gestire tra le parti.", kind: "issue" },
  PAYMENT_REQUESTED: { description: "È stata inviata una richiesta di pagamento documentata.", kind: "payment" },
  PAYMENT_TRANSFER_DECLARED: { description: "Il cliente ha dichiarato di aver disposto il trasferimento.", kind: "payment" },
  PAYMENT_CONFIRMED: { description: "L'Azienda ha confermato la ricezione del pagamento dichiarato.", kind: "payment" },
  PAYMENT_DISPUTED: { description: "La dichiarazione di pagamento richiede una verifica o un chiarimento.", kind: "payment" },
  CLOSURE_PROPOSED: { description: "L'Azienda ha proposto la chiusura del cantiere.", kind: "lifecycle" },
  CLOSURE_CONFIRMED: { description: "È stata registrata una conferma della chiusura.", kind: "lifecycle" },
  POST_CLOSURE_REQUESTED: { description: "È stata aperta o aggiornata una richiesta dopo la chiusura.", kind: "message" },
  JOB_SITE_REOPENED: { description: "Entrambe le parti hanno confermato la riapertura del cantiere.", kind: "lifecycle" },
  JOB_SITE_ARCHIVED: { description: "Il cantiere chiuso è stato spostato nell'archivio.", kind: "lifecycle" },
  EXPORT_CREATED: { description: "È stato preparato un archivio scaricabile del cantiere.", kind: "file" },
  SYSTEM_BACKFILL: { description: "Il sistema ha completato un aggiornamento dei dati storici.", kind: "system" },
} satisfies Record<TimelineEventType, TimelineEventDefinition>;

export const timelineEventTypes = Object.keys(definitions) as TimelineEventType[];

const sectionByEventType = {
  JOB_SITE_CREATED: "riepilogo",
  WORK_UPDATE: "timeline",
  COMMENT: "timeline",
  EVIDENCE: "file",
  SHARED_EXPENSE: "pagamenti",
  SHARED_DOCUMENT: "file",
  STEP_CREATED: "step",
  STEP_UPDATED: "step",
  STEP_READY_FOR_REVIEW: "step",
  STEP_CONFIRMED: "step",
  STEP_REOPENED: "step",
  CHANGE_PROPOSED: "modifiche",
  CHANGE_COUNTERED: "modifiche",
  CHANGE_ACCEPTED: "modifiche",
  CHANGE_REJECTED: "modifiche",
  CHANGE_WITHDRAWN: "modifiche",
  CLARIFICATION_REQUESTED: "richieste",
  CLARIFICATION_RESPONDED: "richieste",
  ISSUE_REPORTED: "disaccordi",
  PAYMENT_REQUESTED: "pagamenti",
  PAYMENT_TRANSFER_DECLARED: "pagamenti",
  PAYMENT_CONFIRMED: "pagamenti",
  PAYMENT_DISPUTED: "pagamenti",
  CLOSURE_PROPOSED: "chiusura",
  CLOSURE_CONFIRMED: "chiusura",
  POST_CLOSURE_REQUESTED: "archivio",
  JOB_SITE_REOPENED: "riepilogo",
  JOB_SITE_ARCHIVED: "archivio",
  EXPORT_CREATED: "archivio",
  SYSTEM_BACKFILL: "timeline",
} satisfies Record<TimelineEventType, TimelineEventSectionId>;

const manualEventTypes = new Set<TimelineEventType>([
  "WORK_UPDATE",
  "COMMENT",
  "EVIDENCE",
  "SHARED_EXPENSE",
  "SHARED_DOCUMENT",
  "CLARIFICATION_REQUESTED",
  "CLARIFICATION_RESPONDED",
  "ISSUE_REPORTED",
]);

const paymentOutcomeLabels: Record<string, string> = {
  CONFIRMED_RECEIVED: "Ricezione confermata",
  NOT_RECEIVED: "Pagamento non ricevuto",
  AMOUNT_MISMATCH: "Importo non corrispondente",
  CLARIFICATION_REQUIRED: "Chiarimento richiesto",
};

const actorLabels: Record<string, string> = {
  ORGANIZATION_MEMBER: "Azienda",
  CLIENT: "Cliente",
  SYSTEM: "Sistema",
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function isKnownEventType(value: string): value is TimelineEventType {
  return Object.prototype.hasOwnProperty.call(definitions, value);
}

function formatTimelineDate(value: Date | string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data non disponibile";
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Rome",
  }).format(date);
}

function addDetail(details: TimelineEventDetail[], label: string, value: string | null) {
  if (value && !details.some((detail) => detail.value === value)) details.push({ label, value });
}

function presentStepStatus(value: unknown): string | null {
  const status = text(value);
  return status ? presentJobSiteStepStatus(status as JobSiteStepStatus).label : null;
}

function presentPostClosureStatus(value: unknown): string | null {
  const status = text(value);
  return status ? presentPostClosureRequestStatus(status as PostClosureRequestStatus).label : null;
}

function presentDisputeState(value: unknown): string | null {
  const status = text(value);
  return status ? presentDisputeStatus(status as DisputeStatus).label : null;
}

export function presentTimelineEvent(event: TimelineEventPresentationInput): TimelineEventPresentation {
  const payload = record(event.payload);
  const knownType = isKnownEventType(event.type) ? event.type : null;
  if (!knownType) {
    return {
      title: "Aggiornamento del cantiere",
      description: "È stato registrato un aggiornamento. I dettagli sono disponibili nelle sezioni pertinenti del cantiere.",
      actor: text(event.actorName) ?? actorLabels[event.actorKind] ?? "Autore non disponibile",
      occurredAtLabel: formatTimelineDate(event.occurredAt ?? event.createdAt),
      kind: "system",
      sectionId: "timeline",
      tone: "neutral",
      details: [],
    };
  }

  const definition = definitions[knownType];
  const typePresentation = presentTimelineEventType(knownType);
  const details: TimelineEventDetail[] = [];
  let title = typePresentation.label;
  let description = definition.description;

  if (manualEventTypes.has(knownType)) {
    const authoredTitle = event.title !== "Evento Qoovex" ? text(event.title) : null;
    const titleLabel = knownType === "EVIDENCE" || knownType === "SHARED_DOCUMENT" ? "File" : "Titolo";
    addDetail(details, titleLabel, authoredTitle);
    description = text(event.body) ?? description;
  }

  if (knownType === "JOB_SITE_CREATED") addDetail(details, "Cantiere", text(payload.name));
  if (knownType === "STEP_CREATED") addDetail(details, "Step", text(payload.title));

  if (["STEP_UPDATED", "STEP_READY_FOR_REVIEW", "STEP_CONFIRMED", "STEP_REOPENED"].includes(knownType)) {
    addDetail(details, "Stato precedente", presentStepStatus(payload.previousStatus));
    addDetail(details, "Nuovo stato", presentStepStatus(payload.nextStatus));
  }

  if (["CHANGE_COUNTERED", "CHANGE_WITHDRAWN"].includes(knownType) && typeof payload.version === "number") {
    addDetail(details, "Proposta", presentProposalVersion(payload.version));
  }

  if (knownType === "WORK_UPDATE" && payload.decision === "ACCEPTED") {
    title = "Riepilogo iniziale confermato";
    description = "Il cliente ha confermato il riepilogo iniziale del cantiere.";
  } else if (knownType === "WORK_UPDATE" && payload.action === "RESOLVE") {
    title = "Richiesta risolta";
    description = "La richiesta è stata contrassegnata come risolta.";
    addDetail(details, "Messaggio", text(payload.message));
  } else if (knownType === "WORK_UPDATE" && payload.action === "WITHDRAW") {
    title = "Richiesta ritirata";
    description = "La richiesta è stata ritirata da chi l'aveva aperta.";
    addDetail(details, "Messaggio", text(payload.message));
  } else if (knownType === "WORK_UPDATE" && (payload.status === "RESOLVED_BY_AGREEMENT" || payload.status === "CLOSED_WITHOUT_AGREEMENT")) {
    title = payload.status === "RESOLVED_BY_AGREEMENT" ? "Accordo registrato sul disaccordo" : "Disaccordo chiuso senza accordo";
    description = payload.status === "RESOLVED_BY_AGREEMENT" ? "Le parti hanno registrato un accordo sul disaccordo." : "Le parti hanno chiuso il disaccordo senza registrare un accordo.";
    addDetail(details, "Messaggio", text(payload.message));
    addDetail(details, "Stato", presentDisputeState(payload.status));
  }

  if (knownType === "CLARIFICATION_REQUESTED" && payload.decision === "REJECTED") {
    title = "Revisione del riepilogo richiesta";
    description = "Il cliente ha richiesto una revisione del riepilogo iniziale del cantiere.";
  } else if (knownType === "CLARIFICATION_REQUESTED") {
    addDetail(details, "Richiesta", text(payload.title));
  }

  if (knownType === "CLARIFICATION_RESPONDED") addDetail(details, "Risposta", text(payload.message));

  if (knownType === "ISSUE_REPORTED") {
    if (payload.action === "RESPOND") {
      title = "Posizione aggiunta al disaccordo";
      description = "Una parte ha aggiunto il proprio messaggio al disaccordo.";
    } else if (payload.action === "AGREE") {
      title = "Accordo registrato sul disaccordo";
      description = "L'accordo si completa con le conferme previste da entrambe le parti.";
    } else if (payload.action === "CLOSE_WITHOUT_AGREEMENT") {
      title = "Mancato accordo registrato";
      description = "La chiusura senza accordo si completa con le conferme previste da entrambe le parti.";
    } else if (payload.action === "WITHDRAW") {
      title = "Disaccordo ritirato";
      description = "Il disaccordo è stato ritirato da chi l'aveva aperto.";
    }
    addDetail(details, "Disaccordo", text(payload.title));
    addDetail(details, "Messaggio", text(payload.message));
    addDetail(details, "Stato", presentDisputeState(payload.status));
  }

  if (knownType === "PAYMENT_REQUESTED") {
    const amountMinor = text(payload.amountMinor);
    addDetail(details, "Importo", amountMinor ? formatEuroFromMinorUnits(amountMinor) : null);
  }

  if (knownType === "SHARED_EXPENSE") {
    const amountMinor = text(payload.amountMinor) ?? text(record(payload.metadata).amountMinor);
    addDetail(details, "Importo", amountMinor ? formatEuroFromMinorUnits(amountMinor) : null);
  }

  if (knownType === "PAYMENT_CONFIRMED" || knownType === "PAYMENT_DISPUTED") {
    const outcome = text(payload.outcome);
    addDetail(details, "Esito della verifica", outcome ? paymentOutcomeLabels[outcome] ?? "Esito non disponibile" : null);
  }

  if (knownType === "CLOSURE_CONFIRMED" && payload.closed === true) {
    title = "Cantiere chiuso";
    description = "La chiusura è stata confermata da entrambe le parti.";
  } else if (knownType === "CLOSURE_CONFIRMED" && payload.closed === false) {
    description = "Una parte ha confermato la chiusura, che attende ancora l'altra conferma.";
  }

  if (knownType === "POST_CLOSURE_REQUESTED") {
    addDetail(details, "Richiesta", text(payload.title));
    addDetail(details, "Messaggio", text(payload.message));
    addDetail(details, "Stato", presentPostClosureStatus(payload.status));
  }

  if (knownType === "EXPORT_CREATED") {
    const audience = text(payload.audience);
    addDetail(details, "Destinatario", audience === "CLIENT" ? "Cliente" : audience === "ORGANIZATION" ? "Azienda" : null);
  }

  return {
    title,
    description,
    actor: text(event.actorName) ?? actorLabels[event.actorKind] ?? "Autore non disponibile",
    occurredAtLabel: formatTimelineDate(event.occurredAt ?? event.createdAt),
    kind: definition.kind,
    sectionId: sectionByEventType[knownType],
    tone: typePresentation.tone,
    details,
  };
}
