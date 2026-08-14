import type { ClosureStatus, ReopeningStatus } from "@qoovex/db";
import type {
  ChangeProposalStatus,
  DisputeStatus,
  JobSiteStatus,
  JobSiteStepStatus,
  PaymentRequestStatus,
} from "@qoovex/types";
import type { ProductStatePresentation } from "./product-state-presentation";
import {
  presentDisputeStatus,
  presentJobSiteStatus,
  presentJobSiteStepStatus,
  presentPaymentRequestStatus,
} from "./product-state-presentation";

export type JobSiteOverviewPerson = {
  detail: string;
  name: string;
};

export type JobSiteOverviewDetail = {
  label: string;
  value: string;
};

export type JobSiteOverviewItem = {
  actionLabel?: string;
  actor: "Azienda" | "Cliente" | "Nessuno" | "Tu";
  description: string;
  href?: string;
  key: string;
  priority: "attention" | "blocking" | "default";
  state: ProductStatePresentation;
  title: string;
};

export type JobSiteOverviewPresentation = {
  attention: readonly JobSiteOverviewItem[];
  details: readonly JobSiteOverviewDetail[];
  nextStep: JobSiteOverviewItem | null;
  people: readonly JobSiteOverviewPerson[];
  progress: { complete: number; current: string | null; total: number } | null;
  status: ProductStatePresentation;
};

type OverviewRequest = {
  availableActions: readonly unknown[];
  blocking: boolean;
  id: string;
  status: "OPEN" | "RESPONDED" | "RESOLVED" | "WITHDRAWN";
  title: string;
};

type OverviewDisagreement = {
  availableActions: readonly unknown[];
  id: string;
  status: DisputeStatus;
  title: string;
};

type OverviewProposal = {
  id: string;
  representedSide: "CLIENT" | "ORGANIZATION_MEMBER";
  status: ChangeProposalStatus;
};

type OverviewPayment = {
  id: string;
  reason: string;
  status: PaymentRequestStatus;
};

type OverviewStep = {
  id: string;
  status: JobSiteStepStatus;
  title: string;
};

type OverviewReopening = {
  canCurrentUserConfirm: boolean;
  reason: string;
  status: ReopeningStatus;
};

type CommonOverviewInput = {
  closureStatus: ClosureStatus | null;
  details: readonly JobSiteOverviewDetail[];
  disagreements: readonly OverviewDisagreement[];
  payments: readonly OverviewPayment[];
  people: readonly JobSiteOverviewPerson[];
  postClosureRequests: readonly { id: string; status: string; title: string }[];
  proposals: readonly OverviewProposal[];
  reopening: OverviewReopening | null;
  requests: readonly OverviewRequest[];
  status: JobSiteStatus;
  steps: readonly OverviewStep[];
};

export type OrganizationJobSiteOverviewInput = CommonOverviewInput;

export type ClientJobSiteOverviewInput = CommonOverviewInput & {
  initialAgreementCorrectionsRequested: boolean;
  initialAgreementStatus: "DRAFT" | "PENDING_CLIENT_CONFIRMATION" | "CONFIRMED" | "SUPERSEDED" | null;
};

const actionRequired = { label: "Azione richiesta", tone: "warning" } as const satisfies ProductStatePresentation;
const reviewRequired = { label: "Da controllare", tone: "warning" } as const satisfies ProductStatePresentation;
const awaitingClient = { label: "In attesa del Cliente", tone: "info" } as const satisfies ProductStatePresentation;
const awaitingOrganization = { label: "In attesa dell'Azienda", tone: "info" } as const satisfies ProductStatePresentation;
const noActionRequired = { label: "Nessuna azione richiesta", tone: "good" } as const satisfies ProductStatePresentation;
const historyAvailable = { label: "Storico disponibile", tone: "neutral" } as const satisfies ProductStatePresentation;

function progressFromSteps(steps: readonly OverviewStep[]): JobSiteOverviewPresentation["progress"] {
  if (!steps.length) return null;
  const complete = steps.filter((step) => ["CONFIRMED", "CANCELLED"].includes(step.status)).length;
  const current = steps.find((step) => !["CONFIRMED", "CANCELLED"].includes(step.status)) ?? null;
  return { complete, current: current ? `${current.title} · ${presentJobSiteStepStatus(current.status).label}` : null, total: steps.length };
}

function uniqueItems(items: readonly JobSiteOverviewItem[]): JobSiteOverviewItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.key)) return false;
    seen.add(item.key);
    return true;
  });
}

function completePresentation(input: CommonOverviewInput, candidates: readonly JobSiteOverviewItem[]): JobSiteOverviewPresentation {
  const unique = uniqueItems(candidates);
  const nextStep = unique[0] ?? null;
  return {
    attention: unique.filter((item) => item.key !== nextStep?.key).slice(0, 3),
    details: input.details,
    nextStep,
    people: input.people,
    progress: progressFromSteps(input.steps),
    status: presentJobSiteStatus(input.status),
  };
}

function closedCandidates(input: CommonOverviewInput, viewer: "CLIENT" | "ORGANIZATION"): JobSiteOverviewItem[] {
  const candidates: JobSiteOverviewItem[] = [];
  if (input.reopening?.status === "PROPOSED") {
    candidates.push(input.reopening.canCurrentUserConfirm ? {
      actionLabel: "Valuta la riapertura",
      actor: "Tu",
      description: input.reopening.reason,
      href: "#archivio",
      key: "reopening-action",
      priority: "attention",
      state: actionRequired,
      title: "Decidi sulla proposta di riapertura",
    } : {
      actor: viewer === "CLIENT" ? "Azienda" : "Cliente",
      description: "La proposta di riapertura è già stata inviata. Ora deve intervenire l'altra parte.",
      href: "#archivio",
      key: "reopening-waiting",
      priority: "default",
      state: viewer === "CLIENT" ? awaitingOrganization : awaitingClient,
      title: "Riapertura in attesa",
    });
  }
  if (input.reopening?.status === "COUNTERPARTY_CONFIRMED") {
    candidates.push({
      actor: "Nessuno",
      description: "Le conferme previste sono state registrate. Lo stato del cantiere si sta aggiornando.",
      href: "#archivio",
      key: "reopening-updating",
      priority: "default",
      state: { label: "Riapertura in aggiornamento", tone: "info" },
      title: "Verifica lo stato della riapertura",
    });
  }
  const openPostClosureRequests = input.postClosureRequests.filter((request) => ["OPEN", "IN_DISCUSSION"].includes(request.status));
  for (const request of openPostClosureRequests) {
    candidates.push({
      actor: "Nessuno",
      description: "Richiesta aperta dopo la chiusura; consulta il contesto per verificare il prossimo passo.",
      href: "#archivio",
      actionLabel: "Apri la richiesta",
      key: `post-closure:${request.id}`,
      priority: "default",
      state: { label: "Ancora aperta", tone: "warning" },
      title: request.title,
    });
  }
  if (!candidates.length) {
    candidates.push({
      actionLabel: "Apri l'archivio",
      actor: "Nessuno",
      description: "Il lavoro non richiede azioni operative. Riepilogo e storico restano consultabili.",
      href: "#archivio",
      key: "closed-history",
      priority: "default",
      state: historyAvailable,
      title: "Consulta lo storico del lavoro",
    });
  }
  return candidates;
}

export function buildOrganizationJobSiteOverview(input: OrganizationJobSiteOverviewInput): JobSiteOverviewPresentation {
  if (["DRAFT", "WAITING_FOR_CLIENT", "PENDING_INITIAL_CONFIRMATION"].includes(input.status)) {
    return completePresentation(input, []);
  }
  if (["CLOSED", "ARCHIVED"].includes(input.status)) {
    return completePresentation(input, closedCandidates(input, "ORGANIZATION"));
  }

  const candidates: JobSiteOverviewItem[] = [];
  if (input.closureStatus === "CLIENT_CONFIRMED") {
    candidates.push({ actionLabel: "Apri la chiusura", actor: "Tu", description: "Il Cliente ha già confermato. La conferma finale dell'Azienda chiuderà il lavoro.", href: "#chiusura", key: "closure-action", priority: "attention", state: actionRequired, title: "Conferma la chiusura" });
  }
  for (const request of input.requests.filter((request) => request.blocking && request.availableActions.length)) {
    candidates.push({ actionLabel: "Apri la richiesta", actor: "Tu", description: "Questa richiesta è ancora aperta e impedisce di proporre la chiusura.", href: "#richieste", key: `blocking-request:${request.id}`, priority: "blocking", state: { label: "Blocca la chiusura", tone: "warning" }, title: request.title });
  }
  for (const payment of input.payments.filter((payment) => ["TRANSFER_DECLARED", "UNDER_REVIEW"].includes(payment.status))) {
    candidates.push({ actionLabel: "Apri il pagamento", actor: "Tu", description: payment.reason, href: "#pagamenti", key: `payment:${payment.id}`, priority: "attention", state: reviewRequired, title: "Rivedi la dichiarazione del Cliente" });
  }
  for (const proposal of input.proposals.filter((proposal) => ["PROPOSED", "COUNTERED"].includes(proposal.status) && proposal.representedSide === "CLIENT")) {
    candidates.push({ actionLabel: "Apri la modifica", actor: "Tu", description: "Il Cliente ha inviato una proposta di modifica da valutare.", href: "#modifiche", key: `proposal:${proposal.id}`, priority: "attention", state: actionRequired, title: "Valuta la proposta del Cliente" });
  }
  for (const request of input.requests.filter((request) => !request.blocking && request.availableActions.length)) {
    candidates.push({ actionLabel: "Apri la richiesta", actor: "Tu", description: request.title, href: "#richieste", key: `request:${request.id}`, priority: "attention", state: actionRequired, title: "Gestisci una richiesta" });
  }
  for (const disagreement of input.disagreements.filter((disagreement) => disagreement.availableActions.length)) {
    candidates.push({ actionLabel: "Apri il disaccordo", actor: "Tu", description: disagreement.title, href: "#disaccordi", key: `disagreement:${disagreement.id}`, priority: "attention", state: presentDisputeStatus(disagreement.status), title: "Gestisci il disaccordo" });
  }
  for (const step of input.steps.filter((step) => ["NOT_STARTED", "IN_PROGRESS", "WAITING", "CHANGES_REQUESTED"].includes(step.status))) {
    const title = step.status === "NOT_STARTED" ? "Avvia il prossimo step" : step.status === "WAITING" ? "Riprendi lo step" : step.status === "CHANGES_REQUESTED" ? "Aggiorna lo step" : "Prosegui con lo step";
    candidates.push({ actionLabel: "Apri gli step", actor: "Tu", description: step.title, href: "#step", key: `step:${step.id}`, priority: step.status === "CHANGES_REQUESTED" ? "attention" : "default", state: presentJobSiteStepStatus(step.status), title });
  }
  if (input.closureStatus === "PENDING_CLIENT_CONFIRMATION") {
    candidates.push({ actor: "Cliente", description: "La proposta di chiusura è stata inviata e attende la decisione del Cliente.", href: "#chiusura", key: "closure-waiting", priority: "default", state: awaitingClient, title: "Attendi la conferma del Cliente" });
  }
  for (const step of input.steps.filter((step) => step.status === "WORK_COMPLETED")) {
    candidates.push({ actor: "Cliente", description: `${step.title} è pronto per il controllo del Cliente.`, href: "#step", key: `step-waiting:${step.id}`, priority: "default", state: awaitingClient, title: "Attendi il controllo dello step" });
  }
  for (const proposal of input.proposals.filter((proposal) => ["PROPOSED", "COUNTERED"].includes(proposal.status) && proposal.representedSide === "ORGANIZATION_MEMBER")) {
    candidates.push({ actor: "Cliente", description: "La proposta è stata inviata al Cliente e attende la sua decisione.", href: "#modifiche", key: `proposal-waiting:${proposal.id}`, priority: "default", state: awaitingClient, title: "Attendi la decisione sulla modifica" });
  }
  for (const payment of input.payments.filter((payment) => payment.status === "REQUESTED")) {
    candidates.push({ actor: "Cliente", description: payment.reason, href: "#pagamenti", key: `payment-waiting:${payment.id}`, priority: "default", state: awaitingClient, title: "Attendi la dichiarazione del Cliente" });
  }
  for (const request of input.requests.filter((request) => request.availableActions.length === 0 && ["OPEN", "RESPONDED"].includes(request.status))) {
    candidates.push({ actor: "Cliente", description: request.title, href: "#richieste", key: `request-waiting:${request.id}`, priority: "default", state: awaitingClient, title: "Attendi il prossimo aggiornamento" });
  }
  if (!candidates.length) {
    candidates.push({ actionLabel: "Consulta le attività", actor: "Nessuno", description: "Non risultano azioni immediate. Puoi continuare a consultare e documentare il lavoro.", href: "#timeline", key: "active-no-action", priority: "default", state: noActionRequired, title: "Il lavoro può proseguire" });
  }
  return completePresentation(input, candidates);
}

export function buildClientJobSiteOverview(input: ClientJobSiteOverviewInput): JobSiteOverviewPresentation {
  if (input.status === "PENDING_INITIAL_CONFIRMATION") {
    const awaitingConfirmation = input.initialAgreementStatus === "PENDING_CLIENT_CONFIRMATION";
    return completePresentation(input, [awaitingConfirmation ? {
      actionLabel: "Controlla il riepilogo",
      actor: "Tu",
      description: "Controlla la versione mostrata qui sotto e scegli se confermarla o chiedere correzioni.",
      href: "#initial-agreement-review",
      key: "initial-agreement-action",
      priority: "attention",
      state: actionRequired,
      title: "Valuta il riepilogo iniziale",
    } : input.initialAgreementCorrectionsRequested ? {
      actor: "Azienda",
      description: "Hai richiesto correzioni. L'Azienda deve pubblicare una nuova versione prima che tu possa confermare.",
      key: "initial-agreement-waiting",
      priority: "default",
      state: awaitingOrganization,
      title: "Attendi il nuovo riepilogo",
    } : {
      actor: "Azienda",
      description: "L'Azienda deve pubblicare il riepilogo iniziale prima che tu possa controllarlo e confermarlo.",
      key: "initial-agreement-preparation",
      priority: "default",
      state: awaitingOrganization,
      title: "Attendi il riepilogo iniziale",
    }]);
  }
  if (["CLOSED", "ARCHIVED"].includes(input.status)) {
    return completePresentation(input, closedCandidates(input, "CLIENT"));
  }

  const candidates: JobSiteOverviewItem[] = [];
  if (input.closureStatus === "PENDING_CLIENT_CONFIRMATION") {
    candidates.push({ actionLabel: "Apri la chiusura", actor: "Tu", description: "L'Azienda ha proposto la chiusura. Controlla il riepilogo prima di decidere.", href: "#chiusura", key: "closure-action", priority: "attention", state: actionRequired, title: "Valuta la chiusura" });
  }
  for (const request of input.requests.filter((request) => request.blocking && request.availableActions.length)) {
    candidates.push({ actionLabel: "Apri la richiesta", actor: "Tu", description: "Questa richiesta è ancora aperta e impedisce di proporre la chiusura.", href: "#richieste", key: `blocking-request:${request.id}`, priority: "blocking", state: { label: "Blocca la chiusura", tone: "warning" }, title: request.title });
  }
  for (const payment of input.payments.filter((payment) => payment.status === "REQUESTED")) {
    candidates.push({ actionLabel: "Apri il pagamento", actor: "Tu", description: payment.reason, href: "#pagamenti", key: `payment:${payment.id}`, priority: "attention", state: presentPaymentRequestStatus(payment.status), title: "Dichiara il pagamento effettuato" });
  }
  for (const proposal of input.proposals.filter((proposal) => ["PROPOSED", "COUNTERED"].includes(proposal.status) && proposal.representedSide === "ORGANIZATION_MEMBER")) {
    candidates.push({ actionLabel: "Apri la modifica", actor: "Tu", description: "L'Azienda ha inviato una proposta di modifica da valutare.", href: "#modifiche", key: `proposal:${proposal.id}`, priority: "attention", state: actionRequired, title: "Valuta la proposta dell'Azienda" });
  }
  for (const request of input.requests.filter((request) => !request.blocking && request.availableActions.length)) {
    candidates.push({ actionLabel: "Apri la richiesta", actor: "Tu", description: request.title, href: "#richieste", key: `request:${request.id}`, priority: "attention", state: actionRequired, title: "Gestisci una richiesta" });
  }
  for (const disagreement of input.disagreements.filter((disagreement) => disagreement.availableActions.length)) {
    candidates.push({ actionLabel: "Apri il disaccordo", actor: "Tu", description: disagreement.title, href: "#disaccordi", key: `disagreement:${disagreement.id}`, priority: "attention", state: presentDisputeStatus(disagreement.status), title: "Gestisci il disaccordo" });
  }
  for (const step of input.steps.filter((step) => step.status === "WORK_COMPLETED")) {
    candidates.push({ actionLabel: "Apri gli step", actor: "Tu", description: `${step.title} è stato indicato come completato dall'Azienda.`, href: "#step", key: `step:${step.id}`, priority: "attention", state: reviewRequired, title: "Controlla lo step completato" });
  }
  if (input.closureStatus === "CLIENT_CONFIRMED") {
    candidates.push({ actor: "Azienda", description: "La tua conferma è registrata. Ora l'Azienda deve confermare per chiudere il lavoro.", href: "#chiusura", key: "closure-waiting", priority: "default", state: awaitingOrganization, title: "Attendi la conferma finale" });
  }
  for (const payment of input.payments.filter((payment) => ["TRANSFER_DECLARED", "UNDER_REVIEW"].includes(payment.status))) {
    candidates.push({ actor: "Azienda", description: `${payment.reason}: la tua dichiarazione è stata inviata e attende la gestione dell'Azienda.`, href: "#pagamenti", key: `payment-waiting:${payment.id}`, priority: "default", state: awaitingOrganization, title: "Attendi la gestione della dichiarazione" });
  }
  for (const proposal of input.proposals.filter((proposal) => ["PROPOSED", "COUNTERED"].includes(proposal.status) && proposal.representedSide === "CLIENT")) {
    candidates.push({ actor: "Azienda", description: "La tua proposta è stata inviata e attende la decisione dell'Azienda.", href: "#modifiche", key: `proposal-waiting:${proposal.id}`, priority: "default", state: awaitingOrganization, title: "Attendi la decisione sulla modifica" });
  }
  for (const request of input.requests.filter((request) => request.availableActions.length === 0 && ["OPEN", "RESPONDED"].includes(request.status))) {
    candidates.push({ actor: "Azienda", description: request.title, href: "#richieste", key: `request-waiting:${request.id}`, priority: "default", state: awaitingOrganization, title: "Attendi il prossimo aggiornamento" });
  }
  if (!candidates.length) {
    candidates.push({ actionLabel: "Consulta le attività", actor: "Nessuno", description: "Al momento non è richiesto un tuo intervento. Puoi consultare gli aggiornamenti del lavoro.", href: "#timeline", key: "active-no-action", priority: "default", state: noActionRequired, title: "Segui l'avanzamento del lavoro" });
  }
  return completePresentation(input, candidates);
}
