import type { NotificationSeverity, NotificationSourceType, NotificationType } from "@qoovex/types";
import type { ClientHomeWorkItemKind } from "./client-home-work-queue";
import type { OrganizationHomeWorkItemKind } from "./organization-home-work-queue";
import type { ProductStatePresentation } from "./product-state-presentation";

type WorkItemPresentation = {
  actionLabel: string;
  state: ProductStatePresentation;
  title: string;
};

export type OrganizationWorkItemPresentation = WorkItemPresentation & {
  actor: "Azienda" | "Cliente";
};

const organizationWorkItems = {
  BLOCKING_REQUEST: { actionLabel: "Apri richiesta", actor: "Azienda", state: { label: "Blocca la chiusura", tone: "warning" }, title: "Richiesta da risolvere" },
  CHANGE_PROPOSAL_REVIEW: { actionLabel: "Apri proposta", actor: "Azienda", state: { label: "Decisione richiesta", tone: "warning" }, title: "Valuta la proposta del cliente" },
  CLIENT_INVITATION_PENDING: { actionLabel: "Apri invito", actor: "Cliente", state: { label: "Invito inviato", tone: "info" }, title: "Attendi l'accettazione del cliente" },
  CLOSURE_CLIENT_CONFIRMATION: { actionLabel: "Apri chiusura", actor: "Cliente", state: { label: "Conferma richiesta", tone: "warning" }, title: "Attendi la conferma del cliente" },
  CLOSURE_CONFIRMATION: { actionLabel: "Apri chiusura", actor: "Azienda", state: { label: "Conferma richiesta", tone: "warning" }, title: "Conferma la chiusura" },
  INITIAL_AGREEMENT_PENDING: { actionLabel: "Apri riepilogo", actor: "Cliente", state: { label: "Conferma richiesta", tone: "warning" }, title: "Attendi la conferma del riepilogo" },
  INVITE_PRIMARY_CLIENT: { actionLabel: "Invita il cliente", actor: "Azienda", state: { label: "Azione disponibile", tone: "warning" }, title: "Invita il cliente principale" },
  PAYMENT_DECLARATION_REVIEW: { actionLabel: "Apri pagamento", actor: "Azienda", state: { label: "Revisione richiesta", tone: "warning" }, title: "Controlla la dichiarazione di pagamento" },
  PREPARE_INITIAL_AGREEMENT: { actionLabel: "Prepara il riepilogo", actor: "Azienda", state: { label: "Azione disponibile", tone: "warning" }, title: "Prepara il riepilogo iniziale" },
  REQUEST_NEEDS_RESPONSE: { actionLabel: "Apri richiesta", actor: "Azienda", state: { label: "Risposta richiesta", tone: "warning" }, title: "Rispondi alla richiesta" },
  STEP_CHANGES_REQUESTED: { actionLabel: "Apri step", actor: "Azienda", state: { label: "Modifiche richieste", tone: "warning" }, title: "Aggiorna lo step" },
  STEP_CLIENT_REVIEW: { actionLabel: "Apri step", actor: "Cliente", state: { label: "Conferma richiesta", tone: "warning" }, title: "Attendi il controllo del cliente" },
} satisfies Record<OrganizationHomeWorkItemKind, OrganizationWorkItemPresentation>;

const clientWorkItems = {
  CHANGE_PROPOSAL_DECISION: { actionLabel: "Apri proposta", state: { label: "Decisione richiesta", tone: "warning" }, title: "Valuta la proposta di modifica" },
  CLOSURE_CONFIRMATION: { actionLabel: "Apri chiusura", state: { label: "Conferma richiesta", tone: "warning" }, title: "Conferma la chiusura" },
  DISAGREEMENT_RESPONSE: { actionLabel: "Apri disaccordo", state: { label: "Risposta richiesta", tone: "warning" }, title: "Rispondi al disaccordo" },
  INITIAL_AGREEMENT_CONFIRMATION: { actionLabel: "Apri riepilogo", state: { label: "Conferma richiesta", tone: "warning" }, title: "Conferma il riepilogo iniziale" },
  PAYMENT_DECLARATION: { actionLabel: "Apri pagamento", state: { label: "Dichiarazione richiesta", tone: "warning" }, title: "Dichiara il pagamento effettuato" },
  POST_CLOSURE_REQUEST_RESPONSE: { actionLabel: "Apri richiesta", state: { label: "Risposta richiesta", tone: "warning" }, title: "Rispondi alla richiesta dopo la chiusura" },
  REOPENING_CONFIRMATION: { actionLabel: "Apri riapertura", state: { label: "Decisione richiesta", tone: "warning" }, title: "Valuta la riapertura del lavoro" },
  REQUEST_RESPONSE: { actionLabel: "Apri richiesta", state: { label: "Risposta richiesta", tone: "warning" }, title: "Rispondi alla richiesta" },
  STEP_CONFIRMATION: { actionLabel: "Apri step", state: { label: "Conferma richiesta", tone: "warning" }, title: "Controlla lo step completato" },
} satisfies Record<ClientHomeWorkItemKind, WorkItemPresentation>;

export function presentOrganizationWorkItem(kind: OrganizationHomeWorkItemKind): OrganizationWorkItemPresentation {
  return organizationWorkItems[kind];
}

export function presentClientWorkItem(kind: ClientHomeWorkItemKind): WorkItemPresentation {
  return clientWorkItems[kind];
}

export type JobSiteNotificationPresentation = {
  message: string;
  severity: NotificationSeverity;
  sourceType: NotificationSourceType;
  title: string;
  type: NotificationType;
};

function actorName(side: "CLIENT" | "ORGANIZATION_MEMBER") {
  return side === "CLIENT" ? "Il cliente" : "L'Azienda";
}

export function presentJobSiteNotification(action: string, actorSide: "CLIENT" | "ORGANIZATION_MEMBER"): JobSiteNotificationPresentation {
  const actor = actorName(actorSide);
  if (action.includes("PAYMENT_TRANSFER_DECLARE")) return { type: "PAYMENT_ACTIVITY", sourceType: "PAYMENT_REQUEST", severity: "ATTENTION", title: "Pagamento dichiarato dal cliente", message: "Il cliente ha dichiarato di aver effettuato il pagamento. Controlla i dettagli e l'eventuale ricevuta." };
  if (action.includes("PAYMENT_REQUEST_CREATE")) return { type: "PAYMENT_ACTIVITY", sourceType: "PAYMENT_REQUEST", severity: "ATTENTION", title: "Richiesta di pagamento ricevuta", message: "L'Azienda ha registrato una richiesta di pagamento. Aprila per vedere importo e motivo." };
  if (action.includes("PAYMENT_RECEIPT_CONFIRM")) return { type: "PAYMENT_ACTIVITY", sourceType: "PAYMENT_REQUEST", severity: "INFO", title: "Dichiarazione di pagamento aggiornata", message: "L'Azienda ha registrato l'esito della revisione. Apri il pagamento per controllare lo stato attuale." };
  if (action.includes("PAYMENT")) return { type: "PAYMENT_ACTIVITY", sourceType: "PAYMENT_REQUEST", severity: "INFO", title: "Pagamento aggiornato", message: `${actor} ha aggiornato un pagamento documentato.` };
  if (action.includes("DISPUTE_CREATE")) return { type: "DISPUTE_ACTIVITY", sourceType: "DISPUTE", severity: "ATTENTION", title: "Nuovo disaccordo", message: `${actor} ha aperto un disaccordo. Aprilo per leggere il contesto e rispondere.` };
  if (action.includes("DISPUTE")) return { type: "DISPUTE_ACTIVITY", sourceType: "DISPUTE", severity: "INFO", title: "Disaccordo aggiornato", message: `${actor} ha aggiornato un disaccordo. Aprilo per controllare lo stato attuale.` };
  if (action.includes("INITIAL_AGREEMENT_PUBLISH")) return { type: "JOB_SITE_ACTIVITY", sourceType: "JOB_SITE", severity: "ATTENTION", title: "Riepilogo iniziale pubblicato", message: "L'Azienda ha pubblicato il riepilogo iniziale. Controlla la versione mostrata e confermala oppure chiedi correzioni." };
  if (action.includes("INITIAL_AGREEMENT_CONFIRM")) return { type: "JOB_SITE_ACTIVITY", sourceType: "JOB_SITE", severity: "INFO", title: "Decisione sul riepilogo ricevuta", message: "Il cliente ha inviato la sua decisione sul riepilogo iniziale. Aprilo per controllare lo stato attuale." };
  if (action.includes("JOB_SITE_REQUEST_CREATE")) return { type: "JOB_SITE_ACTIVITY", sourceType: "JOB_SITE", severity: "ATTENTION", title: "Nuova richiesta", message: `${actor} ha aperto una richiesta. Aprila per leggere il contesto e rispondere.` };
  if (action.includes("JOB_SITE_REQUEST")) return { type: "JOB_SITE_ACTIVITY", sourceType: "JOB_SITE", severity: "INFO", title: "Richiesta aggiornata", message: `${actor} ha aggiornato una richiesta. Aprila per controllare lo stato attuale.` };
  if (action.includes("CHANGE_PROPOSAL_CREATE") || action.includes("CHANGE_PROPOSAL_COUNTER")) return { type: "JOB_SITE_ACTION_REQUIRED", sourceType: "CHANGE_PROPOSAL", severity: "ATTENTION", title: "Proposta di modifica ricevuta", message: `${actor} ha inviato una proposta di modifica. Aprila per confrontare le condizioni e decidere.` };
  if (action.includes("PROPOSAL") || action.includes("CHANGE")) return { type: "JOB_SITE_ACTION_REQUIRED", sourceType: "CHANGE_PROPOSAL", severity: "INFO", title: "Proposta di modifica aggiornata", message: `${actor} ha aggiornato una proposta. Aprila per controllare lo stato attuale.` };
  if (action.includes("CLOSURE_PROPOSE")) return { type: "JOB_SITE_ACTIVITY", sourceType: "JOB_SITE", severity: "ATTENTION", title: "Chiusura proposta", message: `${actor} ha proposto la chiusura del lavoro. Apri la review per controllare cosa resta aperto e decidere.` };
  if (action.includes("JOB_SITE_CLOSE")) return { type: "JOB_SITE_ACTIVITY", sourceType: "JOB_SITE", severity: "INFO", title: "Chiusura aggiornata", message: `${actor} ha inviato una decisione sulla chiusura. Aprila per controllare chi deve intervenire adesso.` };
  if (action.includes("POST_CLOSURE_REQUEST_CREATE")) return { type: "JOB_SITE_ACTIVITY", sourceType: "JOB_SITE", severity: "ATTENTION", title: "Nuova richiesta dopo la chiusura", message: `${actor} ha aperto una richiesta dopo la chiusura. Aprila per leggere il contesto e rispondere.` };
  if (action.includes("REOPENING_PROPOSE")) return { type: "JOB_SITE_ACTIVITY", sourceType: "JOB_SITE", severity: "ATTENTION", title: "Riapertura proposta", message: `${actor} ha proposto di riaprire il workspace del lavoro. Apri la proposta per valutarla.` };
  if (action.includes("JOB_SITE_REOPEN")) return { type: "JOB_SITE_ACTIVITY", sourceType: "JOB_SITE", severity: "INFO", title: "Riapertura aggiornata", message: `${actor} ha inviato una decisione sulla riapertura. Aprila per controllare lo stato attuale.` };
  if (action.includes("STEP_STATUS_TRANSITION")) return { type: "JOB_SITE_ACTIVITY", sourceType: "JOB_SITE", severity: "ATTENTION", title: "Step aggiornato", message: `${actor} ha aggiornato uno step. Aprilo per controllare lo stato e l'eventuale azione richiesta.` };
  if (action.includes("ATTACHMENT")) return { type: "JOB_SITE_ACTIVITY", sourceType: "JOB_SITE", severity: "INFO", title: "Nuovo file nel cantiere", message: `${actor} ha aggiunto un file. Aprilo nel contesto a cui appartiene.` };
  if (action.includes("EXPORT")) return { type: "EXPORT_READY", sourceType: "EXPORT", severity: "INFO", title: "Esportazione aggiornata", message: "L'esportazione dei dati del cantiere è stata aggiornata. Aprila per controllarne lo stato." };
  return { type: "JOB_SITE_ACTIVITY", sourceType: "JOB_SITE", severity: "INFO", title: "Cantiere aggiornato", message: `${actor} ha aggiornato il cantiere. Apri l'aggiornamento per vedere cosa è cambiato.` };
}
