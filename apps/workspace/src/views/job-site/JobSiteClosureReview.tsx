import type { ReactNode } from "react";
import type { ClosureStatus, ConsentDecision, JobSiteParticipantKind, JobSiteRequestStatus, ReopeningStatus } from "@qoovex/db";
import type { ChangeProposalStatus, DisputeStatus, JobSiteStepStatus, PaymentRequestStatus } from "@qoovex/types";
import { formatEuroFromMinorUnits } from "@shared/lib/money";
import {
  presentChangeProposalStatus,
  presentClosureStatus,
  presentDisputeStatus,
  presentJobSiteStepStatus,
  presentPaymentRequestStatus,
  presentProcessDefinition,
  presentProcessStatus,
  presentReopeningStatus,
} from "@shared/lib/product-state-presentation";
import { WorkspacePanel, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";
import { ClosureConfirmationActions, ReopeningConfirmationActions } from "@/views/job-site/JobSiteForms";

type ClosureReadiness = {
  openDisputes: readonly { id: string; status: DisputeStatus; title: string }[];
  openPayments: readonly { amountMinor: bigint | string; id: string; reason: string; status: PaymentRequestStatus }[];
  openProcesses: readonly { definitionKey: string; id: string; status: "PENDING" | "RUNNING" | "WAITING" | "COMPLETED" | "FAILED" | "CANCELLED" }[];
  openProposals: readonly { id: string; status: ChangeProposalStatus }[];
  openRequests: readonly { id: string; status: JobSiteRequestStatus; title: string }[];
  openSteps: readonly { id: string; status: JobSiteStepStatus; title: string }[];
  steps: readonly { id: string; status: JobSiteStepStatus; title: string }[];
};

type ClosureSnapshot = {
  jobSite: { address: string | null; estimatedCompletionAt: string | null; name: string };
  participants: readonly { kind: "CLIENT" | "ORGANIZATION_MEMBER"; publicRoleLabel: string | null }[];
  payments: readonly { amountMinor: string; status: string }[];
  statement: string;
  steps: readonly { status: string; title: string }[];
};

type ReviewEntry = { detail: string; href: string; label: string; state: "open" | "complete" | "attention" };

type ClosureConfirmation = {
  consents: readonly { decision: ConsentDecision; participant: { kind: JobSiteParticipantKind } }[];
  id: string;
  proposedAt: Date;
  status: ClosureStatus;
};

type ClosureViewer = "CLIENT" | "ORGANIZATION";

const knownStepStatuses = new Set<JobSiteStepStatus>(["NOT_STARTED", "IN_PROGRESS", "WAITING", "WORK_COMPLETED", "CHANGES_REQUESTED", "CONFIRMED", "CANCELLED"]);
const knownPaymentStatuses = new Set<PaymentRequestStatus>(["DRAFT", "REQUESTED", "TRANSFER_DECLARED", "UNDER_REVIEW", "CONFIRMED", "DISPUTED", "CANCELLED"]);

const reviewState = {
  attention: { label: "Richiede attenzione", tone: "warning" },
  complete: { label: "Completato", tone: "good" },
  open: { label: "Ancora aperto", tone: "warning" },
} as const;

const closureState = {
  complete: { label: "Conferma registrata", tone: "good" },
  pending: { label: "Deve confermare", tone: "warning" },
  proposed: { label: "Ha proposto la chiusura", tone: "info" },
  rejected: { label: "Non ha confermato", tone: "neutral" },
} as const;

function formatDate(value: string | null) {
  if (!value) return "Non indicata";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Non indicata" : new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function ReviewGroup({ entries, title }: { entries: readonly ReviewEntry[]; title: string }) {
  return <section aria-label={title} className="space-y-3">
    <h3 className="font-medium">{title}</h3>
    <ul className="divide-y rounded-md border">
      {entries.map((entry) => <li className="flex flex-wrap items-start justify-between gap-3 p-3" key={`${entry.href}-${entry.label}`}>
        <div className="min-w-0"><p className="font-medium">{entry.label}</p><p className="mt-1 text-sm text-muted-foreground">{entry.detail}</p><a className="mt-2 inline-block text-sm font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" href={entry.href}>Apri per gestire</a></div>
        <WorkspaceState state={reviewState[entry.state]} />
      </li>)}
    </ul>
  </section>;
}

function SnapshotDetail({ label, children }: { children: ReactNode; label: string }) {
  return <div><dt className="text-sm font-medium">{label}</dt><dd className="mt-1 text-sm text-muted-foreground">{children}</dd></div>;
}

export function getClosureBlockers(readiness: ClosureReadiness): ReviewEntry[] {
  const entries: ReviewEntry[] = [];
  for (const step of readiness.openSteps) {
    entries.push({ detail: presentJobSiteStepStatus(step.status).label, href: "#step", label: step.title, state: "open" });
  }
  for (const proposal of readiness.openProposals) {
    entries.push({ detail: presentChangeProposalStatus(proposal.status).label, href: "#modifiche", label: "Modifica in attesa di decisione", state: "attention" });
  }
  for (const request of readiness.openRequests) {
    entries.push({ detail: request.status === "RESPONDED" ? "Risposta ricevuta: l'autore deve chiuderla o ritirarla." : "In attesa di una risposta o della sua chiusura.", href: "#richieste", label: request.title, state: "open" });
  }
  for (const payment of readiness.openPayments) {
    entries.push({ detail: `${formatEuroFromMinorUnits(payment.amountMinor)} · ${presentPaymentRequestStatus(payment.status).label}`, href: "#pagamenti", label: payment.reason, state: "attention" });
  }
  for (const dispute of readiness.openDisputes) {
    entries.push({ detail: presentDisputeStatus(dispute.status).label, href: "#impostazioni", label: dispute.title, state: "attention" });
  }
  for (const process of readiness.openProcesses) {
    const isPayment = process.definitionKey === "PAYMENT_REQUEST@1";
    entries.push({ detail: presentProcessStatus(process.status).label, href: isPayment ? "#pagamenti" : "#modifiche", label: presentProcessDefinition(process.definitionKey).label, state: "attention" });
  }
  return entries;
}

export function JobSiteClosureReadinessReview({ readiness }: { readiness: ClosureReadiness }) {
  const blockers = getClosureBlockers(readiness);
  const summary = [
    { label: "Step", value: readiness.steps.length ? `${readiness.steps.length - readiness.openSteps.length} conclusi o annullati su ${readiness.steps.length}` : "Nessuno step previsto" },
    { label: "Richieste", value: blockers.filter((item) => item.href === "#richieste").length ? "Ci sono richieste aperte" : "Nessuna richiesta aperta" },
    { label: "Disaccordi", value: blockers.filter((item) => item.href === "#impostazioni").length ? "Ci sono disaccordi aperti" : "Nessun disaccordo aperto" },
    { label: "Pagamenti documentati", value: blockers.filter((item) => item.href === "#pagamenti").length ? "Ci sono pagamenti da gestire" : "Nessun pagamento da gestire" },
  ];

  return <WorkspacePanel title="Verifica prima della chiusura" description={blockers.length ? "La chiusura non può essere proposta finché restano gli elementi elencati qui sotto." : "Non risultano elementi aperti tra quelli verificati dal lifecycle. Puoi proporre la chiusura reciproca."}>
    <dl className="grid gap-3 sm:grid-cols-2">{summary.map((item) => <SnapshotDetail key={item.label} label={item.label}>{item.value}</SnapshotDetail>)}</dl>
    {blockers.length ? <div className="mt-5"><ReviewGroup entries={blockers} title="Elementi da risolvere prima della chiusura" /></div> : <div className="mt-5 flex flex-wrap items-center gap-3 rounded-md border p-3"><WorkspaceState state={reviewState.complete} /><p className="text-sm">La proposta registrerà il riepilogo attuale del lavoro e verrà poi confermata dalle parti secondo il flusso esistente.</p></div>}
  </WorkspacePanel>;
}

function presentSnapshotStepStatus(status: string) {
  return knownStepStatuses.has(status as JobSiteStepStatus) ? presentJobSiteStepStatus(status as JobSiteStepStatus) : { label: "Stato non disponibile", tone: "neutral" as const };
}

function presentSnapshotPaymentStatus(status: string) {
  return knownPaymentStatuses.has(status as PaymentRequestStatus) ? presentPaymentRequestStatus(status as PaymentRequestStatus) : { label: "Stato non disponibile", tone: "neutral" as const };
}

export function JobSiteClosureSnapshotReview({ snapshot }: { snapshot: ClosureSnapshot }) {
  return <WorkspacePanel title="Riepilogo della chiusura" description="Questa è la fotografia registrata quando è stata proposta la chiusura.">
    <dl className="grid gap-4 sm:grid-cols-2">
      <SnapshotDetail label="Lavoro"><span className="font-medium text-foreground">{snapshot.jobSite.name}</span></SnapshotDetail>
      {snapshot.jobSite.address ? <SnapshotDetail label="Indirizzo del lavoro">{snapshot.jobSite.address}</SnapshotDetail> : null}
      <SnapshotDetail label="Conclusione stimata">{formatDate(snapshot.jobSite.estimatedCompletionAt)}</SnapshotDetail>
      <SnapshotDetail label="Stato registrato">{snapshot.statement}</SnapshotDetail>
    </dl>
    <section aria-labelledby="closure-summary-open-items" className="mt-5 border-t pt-5"><h3 className="font-medium" id="closure-summary-open-items">Elementi aperti al momento della proposta</h3><p className="mt-2 text-sm text-muted-foreground">Nessun step, modifica, richiesta, pagamento o disaccordo aperto è incluso in questo riepilogo.</p></section>
    {snapshot.steps.length ? <section aria-labelledby="closure-summary-steps" className="mt-5 border-t pt-5"><h3 className="font-medium" id="closure-summary-steps">Step del lavoro</h3><ul className="mt-2 divide-y rounded-md border">{snapshot.steps.map((step, index) => <li className="flex items-center justify-between gap-3 p-3" key={`${step.title}-${index}`}><span className="text-sm">{step.title}</span><WorkspaceState state={presentSnapshotStepStatus(step.status)} /></li>)}</ul></section> : null}
    {snapshot.payments.length ? <section aria-labelledby="closure-summary-payments" className="mt-5 border-t pt-5"><h3 className="font-medium" id="closure-summary-payments">Pagamenti documentati</h3><ul className="mt-2 divide-y rounded-md border">{snapshot.payments.map((payment, index) => <li className="flex items-center justify-between gap-3 p-3" key={`${payment.amountMinor}-${index}`}><span className="text-sm">{formatEuroFromMinorUnits(payment.amountMinor)}</span><WorkspaceState state={presentSnapshotPaymentStatus(payment.status)} /></li>)}</ul></section> : null}
    {snapshot.participants.length ? <section aria-labelledby="closure-summary-participants" className="mt-5 border-t pt-5"><h3 className="font-medium" id="closure-summary-participants">Partecipanti nel riepilogo</h3><ul className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">{snapshot.participants.map((participant, index) => <li className="rounded-md border px-2 py-1" key={`${participant.kind}-${participant.publicRoleLabel ?? "none"}-${index}`}>{participant.publicRoleLabel || (participant.kind === "CLIENT" ? "Cliente" : "Partecipante dell'Azienda")}</li>)}</ul></section> : null}
  </WorkspacePanel>;
}

function consentFor(record: { consents: readonly { decision: ConsentDecision; participant: { kind: JobSiteParticipantKind } }[] }, kind: JobSiteParticipantKind) {
  return record.consents.find((consent) => consent.participant.kind === kind) ?? null;
}

function actorState(closure: ClosureConfirmation, kind: JobSiteParticipantKind) {
  const consent = consentFor(closure, kind);
  if (consent?.decision === "ACCEPTED") return closureState.complete;
  if (consent?.decision === "REJECTED") return closureState.rejected;
  return kind === "ORGANIZATION_MEMBER" && closure.status === "PENDING_CLIENT_CONFIRMATION" ? closureState.proposed : closureState.pending;
}

function nextClosureStep(closure: ClosureConfirmation, viewer: ClosureViewer) {
  const clientConsent = consentFor(closure, "CLIENT");
  const organizationConsent = consentFor(closure, "ORGANIZATION_MEMBER");
  if (closure.status === "FINALIZED") return "Entrambe le parti hanno confermato il riepilogo. Il lavoro risulta chiuso.";
  if (closure.status === "REJECTED") {
    const rejectedBy = clientConsent?.decision === "REJECTED" ? "Il Cliente" : organizationConsent?.decision === "REJECTED" ? "L'Azienda" : "Una delle parti";
    return `${rejectedBy} non ha confermato la chiusura. Il lavoro resta attivo.`;
  }
  if (closure.status === "PENDING_CLIENT_CONFIRMATION") return viewer === "CLIENT"
    ? "Il tuo intervento è necessario: conferma il riepilogo mostrato sopra oppure indica che non vuoi confermare la chiusura."
    : "In attesa della conferma del Cliente. Dopo la sua conferma, l'Azienda dovrà registrare la conferma finale.";
  if (closure.status === "CLIENT_CONFIRMED") return viewer === "ORGANIZATION"
    ? "Il Cliente ha già confermato. Il tuo intervento è necessario: la tua conferma chiuderà il lavoro."
    : "La tua conferma è già registrata. In attesa della conferma finale dell'Azienda; dopo, il lavoro risulterà chiuso.";
  return "Questa proposta di chiusura non richiede altre azioni da questa pagina.";
}

export function JobSiteClosureConfirmation({ actionsEndpoint, closure, revision, viewer }: { actionsEndpoint: string; closure: ClosureConfirmation; revision: number; viewer: ClosureViewer }) {
  const currentUserMustAct = (viewer === "CLIENT" && closure.status === "PENDING_CLIENT_CONFIRMATION") || (viewer === "ORGANIZATION" && closure.status === "CLIENT_CONFIRMED");
  return <section className="space-y-3 py-3" aria-label="Stato delle conferme di chiusura">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-medium">Conferme della chiusura</h3><p className="mt-1 text-sm text-muted-foreground">Proposta inviata dall'Azienda il {formatDate(closure.proposedAt.toISOString())}.</p></div><WorkspaceState state={presentClosureStatus(closure.status)} /></div>
    <ul className="divide-y rounded-md border" aria-label="Conferme delle parti">
      <li className="flex flex-wrap items-center justify-between gap-3 p-3"><span className="text-sm font-medium">Azienda</span><WorkspaceState state={actorState(closure, "ORGANIZATION_MEMBER")} /></li>
      <li className="flex flex-wrap items-center justify-between gap-3 p-3"><span className="text-sm font-medium">Cliente</span><WorkspaceState state={actorState(closure, "CLIENT")} /></li>
    </ul>
    <p className="text-sm text-muted-foreground">{nextClosureStep(closure, viewer)}</p>
    {currentUserMustAct ? <ClosureConfirmationActions closureId={closure.id} endpoint={actionsEndpoint} revision={revision} viewer={viewer} /> : null}
  </section>;
}

type ReopeningProposal = {
  consents: readonly { decision: ConsentDecision; participant: { id: string; kind: JobSiteParticipantKind } }[];
  id: string;
  proposedAt: Date;
  proposedByParticipantId: string;
  reason: string;
  status: ReopeningStatus;
};

function reopeningProposer(proposal: ReopeningProposal) {
  return proposal.consents.find((consent) => consent.participant.id === proposal.proposedByParticipantId)?.participant.kind ?? null;
}

function participantLabel(kind: JobSiteParticipantKind | null) {
  if (kind === "CLIENT") return "Cliente";
  if (kind === "ORGANIZATION_MEMBER") return "Azienda";
  return "Una delle parti";
}

function reopeningActorState(proposal: ReopeningProposal, kind: JobSiteParticipantKind) {
  const consent = consentFor(proposal, kind);
  if (consent?.decision === "ACCEPTED") return closureState.complete;
  if (consent?.decision === "REJECTED") return closureState.rejected;
  return closureState.pending;
}

function nextReopeningStep(proposal: ReopeningProposal, viewer: ClosureViewer) {
  const proposer = reopeningProposer(proposal);
  const counterparty = proposer === "CLIENT" ? "dell'Azienda" : proposer === "ORGANIZATION_MEMBER" ? "del Cliente" : "dell'altra parte";
  const currentKind: JobSiteParticipantKind = viewer === "CLIENT" ? "CLIENT" : "ORGANIZATION_MEMBER";
  if (proposal.status === "FINALIZED") return "La riapertura è stata completata. Il cantiere è di nuovo nelle sezioni operative.";
  if (proposal.status === "REJECTED") return "La proposta non è stata confermata. Il cantiere resta nello stato attuale.";
  if (proposal.status === "PROPOSED") return proposer === currentKind
    ? `La tua proposta è in attesa della decisione ${counterparty}.`
    : `Il tuo intervento è necessario. Se confermi, il cantiere tornerà alle sezioni operative.`;
  if (proposal.status === "COUNTERPARTY_CONFIRMED") return "Una conferma è stata registrata. Lo stato del cantiere si sta aggiornando; aggiorna la pagina per verificare le sezioni disponibili.";
  return "Questa proposta non richiede altre azioni da questa pagina.";
}

export function canCurrentUserConfirmReopening(proposal: ReopeningProposal, viewer: ClosureViewer) {
  const proposer = reopeningProposer(proposal);
  const currentKind: JobSiteParticipantKind = viewer === "CLIENT" ? "CLIENT" : "ORGANIZATION_MEMBER";
  return proposal.status === "PROPOSED" && proposer !== null && proposer !== currentKind;
}

export function JobSiteReopeningConfirmation({ actionsEndpoint, proposal, revision, viewer }: { actionsEndpoint: string; proposal: ReopeningProposal; revision: number; viewer: ClosureViewer }) {
  const proposer = reopeningProposer(proposal);
  const currentUserMustAct = canCurrentUserConfirmReopening(proposal, viewer);

  return <section className="space-y-3 py-3" aria-label="Stato della riapertura">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-medium">Proposta di riapertura</h3><p className="mt-1 text-sm text-muted-foreground">Proposta da {participantLabel(proposer)} il {formatDate(proposal.proposedAt.toISOString())}.</p></div><WorkspaceState state={presentReopeningStatus(proposal.status)} /></div>
    <dl className="grid gap-3 rounded-md border p-3 sm:grid-cols-2"><SnapshotDetail label="Motivazione">{proposal.reason}</SnapshotDetail><SnapshotDetail label="Cosa succede con entrambe le conferme">Il cantiere torna alle sezioni operative.</SnapshotDetail></dl>
    <ul className="divide-y rounded-md border" aria-label="Conferme della riapertura"><li className="flex flex-wrap items-center justify-between gap-3 p-3"><span className="text-sm font-medium">Azienda</span><WorkspaceState state={reopeningActorState(proposal, "ORGANIZATION_MEMBER")} /></li><li className="flex flex-wrap items-center justify-between gap-3 p-3"><span className="text-sm font-medium">Cliente</span><WorkspaceState state={reopeningActorState(proposal, "CLIENT")} /></li></ul>
    <p className="text-sm text-muted-foreground">{nextReopeningStep(proposal, viewer)}</p>
    {currentUserMustAct ? <ReopeningConfirmationActions endpoint={actionsEndpoint} reopeningProposalId={proposal.id} revision={revision} /> : null}
  </section>;
}
