import type { ReactNode } from "react";
import type { JobSiteRequestStatus } from "@qoovex/db";
import type { ChangeProposalStatus, DisputeStatus, JobSiteParticipantKind } from "@qoovex/types";
import { presentProposalVersion } from "@shared/lib/product-metadata-presentation";
import { presentChangeProposalStatus } from "@shared/lib/product-state-presentation";
import { ChangeProposalComparison } from "./ChangeProposalComparison";
import { ChangeProposalActions, DeleteActionButton } from "./JobSiteForms";
import { WorkspacePanel, WorkspaceState } from "../workspace/WorkspacePrimitives";

type DecisionViewer = "CLIENT" | "ORGANIZATION";

type ProposalForDecision = {
  currentVersion: { id: string; payload: unknown; version: number } | null;
  id: string;
  representedSide: JobSiteParticipantKind;
  status: ChangeProposalStatus;
};

export function isOpenRequestDecision(status: JobSiteRequestStatus) {
  return status === "OPEN" || status === "RESPONDED";
}

export function isOpenDisagreementDecision(status: DisputeStatus) {
  return status === "OPEN" || status === "IN_DISCUSSION";
}

export function isOpenChangeProposalDecision(proposal: Pick<ProposalForDecision, "currentVersion" | "status">) {
  return Boolean(proposal.currentVersion) && (proposal.status === "PROPOSED" || proposal.status === "COUNTERED");
}

function formatDecisionCount(count: number) {
  return count === 1 ? "1 decisione aperta" : `${count} decisioni aperte`;
}

export function JobSiteDecisionsSurface({ children, openCount }: { children: ReactNode; openCount: number }) {
  const state = openCount
    ? { label: formatDecisionCount(openCount), tone: "warning" as const }
    : { label: "Nessuna decisione aperta", tone: "good" as const };

  return <section className="space-y-4" id="decisioni" aria-labelledby="job-site-decisions-title">
    <WorkspacePanel title="Decisioni" description="Richieste, proposte di modifica e disaccordi restano distinti, ma seguono la stessa gerarchia: prima ciò che richiede una scelta, poi lo storico.">
      <div className="space-y-3">
        <h2 className="sr-only" id="job-site-decisions-title">Decisioni del cantiere</h2>
        <WorkspaceState state={state} />
        <p className="text-sm text-muted-foreground">Per ogni elemento trovi il contesto, lo stato, chi deve intervenire e il prossimo passo consentito.</p>
      </div>
    </WorkspacePanel>
    {children}
  </section>;
}

export function JobSiteDecisionCollection({
  creation,
  description,
  emptyDescription,
  id,
  openItems,
  openTitle,
  secondaryItems,
  secondaryTitle,
  title,
}: {
  creation?: ReactNode;
  description: string;
  emptyDescription: string;
  id: string;
  openItems: readonly ReactNode[];
  openTitle: string;
  secondaryItems: readonly ReactNode[];
  secondaryTitle: string;
  title: string;
}) {
  return <section aria-label={title} className={creation ? "grid scroll-mt-20 gap-4 lg:grid-cols-[1fr_22rem]" : "grid scroll-mt-20 gap-4"} id={id}>
    <WorkspacePanel title={title} description={description}>
      <div className="space-y-5">
        <section aria-label={openTitle} className="space-y-2">
          <h3 className="text-sm font-semibold">{openTitle}</h3>
          {openItems.length ? <div className="divide-y">{openItems}</div> : <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">{emptyDescription}</p>}
        </section>
        {secondaryItems.length ? <details className="rounded-md border">
          <summary className="cursor-pointer px-3 py-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">{secondaryTitle} ({secondaryItems.length})</summary>
          <div className="divide-y border-t px-3">{secondaryItems}</div>
        </details> : null}
      </div>
    </WorkspacePanel>
    {creation ? <WorkspacePanel>{creation}</WorkspacePanel> : null}
  </section>;
}

function proposalDecisionActor(proposal: Pick<ProposalForDecision, "representedSide" | "status">, viewer: DecisionViewer) {
  if (proposal.status !== "PROPOSED" && proposal.status !== "COUNTERED") return "Nessuno";
  const decidingSide = proposal.representedSide === "CLIENT" ? "ORGANIZATION_MEMBER" : "CLIENT";
  const viewerSide = viewer === "CLIENT" ? "CLIENT" : "ORGANIZATION_MEMBER";
  if (decidingSide === viewerSide) return "Tu";
  return decidingSide === "CLIENT" ? "Cliente" : "Azienda";
}

function proposalNextStep(proposal: Pick<ProposalForDecision, "currentVersion" | "representedSide" | "status">, viewer: DecisionViewer) {
  if (!proposal.currentVersion) return "I dettagli della proposta non sono disponibili; non risultano azioni eseguibili da questa vista.";
  if (proposal.status === "PROPOSED" || proposal.status === "COUNTERED") {
    const actor = proposalDecisionActor(proposal, viewer);
    if (actor === "Tu") return "Prossimo passo: valuta la proposta mostrata, quindi accettala, rifiutala o prepara una controproposta.";
    return `Prossimo passo: attendi la decisione ${actor === "Cliente" ? "del Cliente" : "dell'Azienda"}.`;
  }
  switch (proposal.status) {
    case "ACCEPTED": return "Nessuna decisione richiesta: la proposta è stata accettata e applicata.";
    case "REJECTED": return "Nessuna decisione richiesta: la proposta è stata rifiutata.";
    case "WITHDRAWN": return "Nessuna decisione richiesta: la proposta è stata ritirata.";
    case "SUPERSEDED": return "Nessuna decisione richiesta: una proposta successiva ha sostituito questa versione.";
    case "EXPIRED": return "Nessuna decisione richiesta: questa proposta non è più disponibile.";
    case "DRAFT": return "La proposta non richiede ancora una decisione dell'altra parte.";
  }
}

export function JobSiteChangeProposalDecision({
  actionsEndpoint,
  attachments,
  base,
  proposal,
  revision,
  viewer,
}: {
  actionsEndpoint: string;
  attachments?: ReactNode;
  base: string;
  proposal: ProposalForDecision;
  revision: number;
  viewer: DecisionViewer;
}) {
  const active = isOpenChangeProposalDecision(proposal);
  const actor = proposalDecisionActor(proposal, viewer);
  const currentUserCanDecide = active && actor === "Tu";
  const currentUserProposed = active && actor !== "Tu";
  const actionState = currentUserCanDecide
    ? { label: "Decisione richiesta", tone: "warning" as const }
    : active
      ? { label: actor === "Cliente" ? "In attesa del Cliente" : "In attesa dell'Azienda", tone: "info" as const }
      : { label: "Nessuna azione richiesta", tone: "neutral" as const };

  return <article className="space-y-3 py-4 first:pt-0">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h3 className="font-medium">{presentProposalVersion(proposal.currentVersion?.version)}</h3><p className="mt-1 text-sm text-muted-foreground">Proposta di modifica alle condizioni del lavoro.</p></div>
      <WorkspaceState state={presentChangeProposalStatus(proposal.status)} />
    </div>
    <dl className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm"><div className="flex items-center gap-2"><dt className="font-medium">Decisione</dt><dd><WorkspaceState state={actionState} /></dd></div><div className="flex items-center gap-1"><dt className="font-medium">Deve intervenire:</dt><dd>{actor}</dd></div></dl>
    {proposal.currentVersion ? <ChangeProposalComparison payload={proposal.currentVersion.payload} /> : <p className="text-sm text-muted-foreground">I dettagli di questa proposta non sono disponibili.</p>}
    <p className="text-sm text-muted-foreground">{proposalNextStep(proposal, viewer)}</p>
    {currentUserCanDecide && proposal.currentVersion ? <ChangeProposalActions actionsEndpoint={actionsEndpoint} counterEndpoint={`${base}/proposals/${proposal.id}`} proposalId={proposal.id} revision={revision} versionId={proposal.currentVersion.id} versionNumber={proposal.currentVersion.version} /> : null}
    {currentUserProposed && proposal.currentVersion ? <DeleteActionButton endpoint={`${base}/proposals/${proposal.id}`} body={{ expectedRevision: revision, expectedCurrentVersion: proposal.currentVersion.version }} label="Ritira proposta" success="Proposta ritirata." confirmMessage="Ritirare questa proposta?" /> : null}
    {attachments}
  </article>;
}
