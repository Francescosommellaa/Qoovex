import Link from "next/link";
import { buttonVariants } from "@qoovex/ui/components/button";
import { WorkQueueItem, WorkQueueItemActions, WorkQueueItemContent, WorkQueueItemDescription, WorkQueueItemTitle } from "@qoovex/ui/components/work-queue-item";
import { getOrganizationHomeWorkQueueGroup, organizationHomeWorkQueueGroups, type OrganizationHomeWorkItem, type OrganizationHomeWorkItemKind, type OrganizationHomeWorkQueueGroup } from "@shared/lib/organization-home-work-queue";
import { WorkspacePanel, WorkspaceState } from "./WorkspacePrimitives";

const workItemPresentation = {
  BLOCKING_REQUEST: { actionLabel: "Apri richiesta", actor: "Azienda", state: { label: "Blocca la chiusura", tone: "warning" }, title: "Richiesta da risolvere" },
  CHANGE_PROPOSAL_REVIEW: { actionLabel: "Apri modifica", actor: "Azienda", state: { label: "Da valutare", tone: "warning" }, title: "Proposta del cliente da valutare" },
  CLIENT_INVITATION_PENDING: { actionLabel: "Apri invito", actor: "Cliente", state: { label: "Invito inviato", tone: "info" }, title: "In attesa dell'accettazione del cliente" },
  CLOSURE_CLIENT_CONFIRMATION: { actionLabel: "Apri chiusura", actor: "Cliente", state: { label: "Chiusura da confermare", tone: "warning" }, title: "In attesa della conferma del cliente" },
  CLOSURE_CONFIRMATION: { actionLabel: "Apri chiusura", actor: "Azienda", state: { label: "Conferma finale richiesta", tone: "warning" }, title: "Conferma della chiusura richiesta" },
  INITIAL_AGREEMENT_PENDING: { actionLabel: "Apri riepilogo", actor: "Cliente", state: { label: "In attesa del cliente", tone: "warning" }, title: "Riepilogo iniziale in attesa" },
  INVITE_PRIMARY_CLIENT: { actionLabel: "Invita il cliente", actor: "Azienda", state: { label: "Azione disponibile", tone: "warning" }, title: "Invita il cliente principale" },
  PAYMENT_DECLARATION_REVIEW: { actionLabel: "Apri pagamento", actor: "Azienda", state: { label: "Da rivedere", tone: "warning" }, title: "Dichiarazione di pagamento da rivedere" },
  PREPARE_INITIAL_AGREEMENT: { actionLabel: "Prepara il riepilogo", actor: "Azienda", state: { label: "Azione disponibile", tone: "warning" }, title: "Prepara il riepilogo iniziale" },
  REQUEST_NEEDS_RESPONSE: { actionLabel: "Apri richiesta", actor: "Azienda", state: { label: "Richiesta aperta", tone: "warning" }, title: "Richiesta da gestire" },
  STEP_CHANGES_REQUESTED: { actionLabel: "Apri step", actor: "Azienda", state: { label: "Modifiche richieste", tone: "warning" }, title: "Step da aggiornare" },
  STEP_CLIENT_REVIEW: { actionLabel: "Apri step", actor: "Cliente", state: { label: "Pronto per il controllo", tone: "info" }, title: "Step in attesa del cliente" },
} satisfies Record<OrganizationHomeWorkItemKind, { actionLabel: string; actor: string; state: { label: string; tone: "info" | "warning" }; title: string }>;

const workQueueGroupPresentation = {
  ACTION_REQUIRED: { description: "Azioni che l'Azienda può eseguire ora.", emptyDescription: "Non ci sono azioni immediate dell'Azienda.", title: "Richiede te" },
  AWAITING_CLIENT: { description: "Elementi fermi finché il cliente non interviene.", emptyDescription: "Nessuna attività è in attesa del cliente.", title: "Attende cliente" },
  REVIEW: { description: "Elementi da controllare nel contesto del cantiere.", emptyDescription: "Nessun elemento da verificare al momento.", title: "Da verificare" },
} satisfies Record<OrganizationHomeWorkQueueGroup, { description: string; emptyDescription: string; title: string }>;

function formatItemCount(count: number): string {
  return `${count} attività`;
}

export function OrganizationHomeWorkQueue({ items }: { items: readonly OrganizationHomeWorkItem[] }) {
  const groupedItems = new Map<OrganizationHomeWorkQueueGroup, Array<OrganizationHomeWorkItem>>(
    organizationHomeWorkQueueGroups.map((group) => [group, []]),
  );
  for (const item of items) groupedItems.get(getOrganizationHomeWorkQueueGroup(item.kind))?.push(item);

  return <WorkspacePanel title="Cosa richiede attenzione" description="Apri il punto esatto del cantiere per gestire l'attività o verificare chi deve intervenire.">
    <div className="space-y-6">
      {organizationHomeWorkQueueGroups.map((group) => {
        const groupItems = groupedItems.get(group) ?? [];
        const groupPresentation = workQueueGroupPresentation[group];
        const headingId = `organization-home-work-queue-${group.toLowerCase()}`;
        return <section aria-labelledby={headingId} className="space-y-3" key={group}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <div>
              <h3 className="text-sm font-semibold" id={headingId}>{groupPresentation.title}</h3>
              <p className="text-sm text-muted-foreground">{groupPresentation.description}</p>
            </div>
            <p className="text-sm font-medium text-foreground">{formatItemCount(groupItems.length)}</p>
          </div>
          {groupItems.length ? <ul className="space-y-3" aria-label={groupPresentation.title}>
            {groupItems.map((item) => {
              const presentation = workItemPresentation[item.kind];
              return <li key={item.id}><WorkQueueItem priority={item.priority}>
                <WorkQueueItemContent>
                  <WorkQueueItemTitle>{presentation.title}</WorkQueueItemTitle>
                  <WorkQueueItemDescription><span className="font-medium text-foreground">{item.jobSiteName}</span> · {item.detail}</WorkQueueItemDescription>
                  <dl className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs"><div className="flex items-center gap-2"><dt className="font-medium text-foreground">Stato</dt><dd><WorkspaceState state={presentation.state} /></dd></div><div className="flex items-center gap-1"><dt className="font-medium text-foreground">Deve intervenire:</dt><dd>{presentation.actor}</dd></div></dl>
                </WorkQueueItemContent>
                <WorkQueueItemActions><Link className={buttonVariants({ size: "sm", variant: "outline" })} href={item.href}>{presentation.actionLabel}</Link></WorkQueueItemActions>
              </WorkQueueItem></li>;
            })}
          </ul> : <p className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">{groupPresentation.emptyDescription}</p>}
        </section>;
      })}
    </div>
  </WorkspacePanel>;
}
