import Link from "next/link";
import { buttonVariants } from "@qoovex/ui/components/button";
import { WorkQueueItem, WorkQueueItemActions, WorkQueueItemContent, WorkQueueItemDescription, WorkQueueItemTitle } from "@qoovex/ui/components/work-queue-item";
import { presentOrganizationWorkItem } from "@shared/lib/job-site-operational-presentation";
import { getOrganizationHomeWorkQueueGroup, organizationHomeWorkQueueGroups, type OrganizationHomeWorkItem, type OrganizationHomeWorkQueueGroup } from "@shared/lib/organization-home-work-queue";
import { WorkspacePanel, WorkspaceState } from "./WorkspacePrimitives";

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
              const presentation = presentOrganizationWorkItem(item.kind);
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
