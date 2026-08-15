import Link from "next/link";
import { buttonVariants } from "@qoovex/ui/components/button";
import { WorkQueueItem, WorkQueueItemActions, WorkQueueItemContent, WorkQueueItemDescription, WorkQueueItemTitle } from "@qoovex/ui/components/work-queue-item";
import type { ClientHomeWorkItem, ClientHomeWorkItemKind } from "@shared/lib/client-home-work-queue";
import type { ProductStatePresentation } from "@shared/lib/product-state-presentation";
import { WorkspacePanel, WorkspaceState } from "./WorkspacePrimitives";

const workItemPresentation = {
  CHANGE_PROPOSAL_DECISION: { actionLabel: "Apri modifica", state: { label: "Decisione richiesta", tone: "warning" }, title: "Valuta una proposta di modifica" },
  CLOSURE_CONFIRMATION: { actionLabel: "Apri chiusura", state: { label: "Conferma richiesta", tone: "warning" }, title: "Conferma la chiusura" },
  DISAGREEMENT_RESPONSE: { actionLabel: "Apri disaccordo", state: { label: "Risposta richiesta", tone: "warning" }, title: "Rispondi a un disaccordo" },
  INITIAL_AGREEMENT_CONFIRMATION: { actionLabel: "Apri riepilogo", state: { label: "Conferma richiesta", tone: "warning" }, title: "Conferma il riepilogo iniziale" },
  PAYMENT_DECLARATION: { actionLabel: "Apri pagamento", state: { label: "Dichiarazione richiesta", tone: "warning" }, title: "Dichiara il pagamento effettuato" },
  POST_CLOSURE_REQUEST_RESPONSE: { actionLabel: "Apri richiesta", state: { label: "Risposta richiesta", tone: "warning" }, title: "Rispondi a una richiesta dopo la chiusura" },
  REOPENING_CONFIRMATION: { actionLabel: "Apri riapertura", state: { label: "Conferma richiesta", tone: "warning" }, title: "Valuta la riapertura del lavoro" },
  REQUEST_RESPONSE: { actionLabel: "Apri richiesta", state: { label: "Risposta richiesta", tone: "warning" }, title: "Rispondi a una richiesta" },
  STEP_CONFIRMATION: { actionLabel: "Apri step", state: { label: "Conferma richiesta", tone: "warning" }, title: "Verifica uno step completato" },
} satisfies Record<ClientHomeWorkItemKind, { actionLabel: string; state: ProductStatePresentation; title: string }>;

function formatItemCount(count: number): string {
  return count === 1 ? "1 attività" : `${count} attività`;
}

export function ClientHomeWorkQueue({ items }: { items: readonly ClientHomeWorkItem[] }) {
  return <WorkspacePanel title="Da fare" description="Qui trovi solo le azioni che puoi svolgere ora nei tuoi lavori.">
    {items.length ? <div className="space-y-4">
      <p className="text-sm font-medium text-foreground">{formatItemCount(items.length)}</p>
      <ul className="space-y-3" aria-label="Azioni da fare">
        {items.map((item) => {
          const presentation = workItemPresentation[item.kind];
          return <li key={item.id}><WorkQueueItem>
            <WorkQueueItemContent>
              <WorkQueueItemTitle>{presentation.title}</WorkQueueItemTitle>
              <WorkQueueItemDescription><span className="font-medium text-foreground">{item.jobSiteName}</span> · {item.detail}</WorkQueueItemDescription>
              <dl className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs"><div className="flex items-center gap-2"><dt className="font-medium text-foreground">Stato</dt><dd><WorkspaceState state={presentation.state} /></dd></div><div className="flex items-center gap-1"><dt className="font-medium text-foreground">Deve intervenire:</dt><dd>Tu</dd></div></dl>
            </WorkQueueItemContent>
            <WorkQueueItemActions><Link className={buttonVariants({ size: "sm", variant: "outline" })} href={item.href}>{presentation.actionLabel}</Link></WorkQueueItemActions>
          </WorkQueueItem></li>;
        })}
      </ul>
    </div> : <p className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">Al momento non è richiesto nessun tuo intervento. Puoi consultare i tuoi lavori.</p>}
  </WorkspacePanel>;
}
