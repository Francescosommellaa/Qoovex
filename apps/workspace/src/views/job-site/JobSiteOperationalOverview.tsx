import Link from "next/link";
import { IconArrowRight, IconUsers } from "@tabler/icons-react";
import { buttonVariants } from "@qoovex/ui/components/button";
import {
  WorkQueueItem,
  WorkQueueItemActions,
  WorkQueueItemContent,
  WorkQueueItemDescription,
  WorkQueueItemTitle,
} from "@qoovex/ui/components/work-queue-item";
import type { JobSiteOverviewItem, JobSiteOverviewPresentation } from "@shared/lib/job-site-overview";
import { WorkspacePanel, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";

function OverviewItem({ item, primary = false }: { item: JobSiteOverviewItem; primary?: boolean }) {
  return <WorkQueueItem priority={item.priority}>
    <WorkQueueItemContent>
      <WorkQueueItemTitle>{item.title}</WorkQueueItemTitle>
      <WorkQueueItemDescription>{item.description}</WorkQueueItemDescription>
      <dl className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs">
        <div className="flex items-center gap-2"><dt className="font-medium text-foreground">Stato</dt><dd><WorkspaceState state={item.state} /></dd></div>
        <div className="flex items-center gap-1"><dt className="font-medium text-foreground">Deve intervenire:</dt><dd>{item.actor}</dd></div>
      </dl>
    </WorkQueueItemContent>
    {item.href && item.actionLabel ? <WorkQueueItemActions><Link className={buttonVariants({ size: "sm", variant: primary ? "default" : "outline" })} href={item.href}>{item.actionLabel}<IconArrowRight aria-hidden="true" /></Link></WorkQueueItemActions> : null}
  </WorkQueueItem>;
}

export function JobSiteOperationalOverview({ overview }: { overview: JobSiteOverviewPresentation }) {
  return <WorkspacePanel title="Panoramica operativa" description="Stato, prossimo passo e informazioni essenziali del lavoro.">
    <div className="space-y-6">
      <section aria-labelledby="job-site-overview-status" className="space-y-2">
        <h2 className="text-sm font-semibold" id="job-site-overview-status">Stato attuale</h2>
        <WorkspaceState state={overview.status} />
        {overview.status.description ? <p className="text-sm text-muted-foreground">{overview.status.description}</p> : null}
      </section>

      {overview.nextStep ? <section aria-labelledby="job-site-overview-next-step" className="space-y-3">
        <h2 className="text-sm font-semibold" id="job-site-overview-next-step">Prossimo passo</h2>
        <OverviewItem item={overview.nextStep} primary />
      </section> : null}

      {overview.attention.length ? <section aria-labelledby="job-site-overview-attention" className="space-y-3">
        <div><h2 className="text-sm font-semibold" id="job-site-overview-attention">Altri elementi aperti</h2><p className="text-sm text-muted-foreground">Sintesi degli elementi da seguire nelle rispettive sezioni.</p></div>
        <ul className="space-y-3">{overview.attention.map((item) => <li key={item.key}><OverviewItem item={item} /></li>)}</ul>
      </section> : null}

      {overview.progress ? <section aria-labelledby="job-site-overview-progress" className="space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-sm font-semibold" id="job-site-overview-progress">Avanzamento degli step</h2><p className="text-sm font-medium">{overview.progress.complete} su {overview.progress.total} conclusi o annullati</p></div>
        <progress aria-describedby={overview.progress.current ? "job-site-overview-current-step" : undefined} className="h-2 w-full accent-primary" max={overview.progress.total} value={overview.progress.complete}>{overview.progress.complete} su {overview.progress.total}</progress>
        {overview.progress.current ? <p className="text-sm text-muted-foreground" id="job-site-overview-current-step">Step corrente: {overview.progress.current}.</p> : <p className="text-sm text-muted-foreground">Tutti gli step risultano conclusi o annullati.</p>}
      </section> : null}

      <div className="grid gap-6 border-t pt-5 md:grid-cols-2">
        {overview.details.length ? <section aria-labelledby="job-site-overview-details"><h2 className="text-sm font-semibold" id="job-site-overview-details">Dati essenziali</h2><dl className="mt-3 grid gap-3">{overview.details.map((detail) => <div key={detail.label}><dt className="text-xs font-medium text-muted-foreground">{detail.label}</dt><dd className="mt-1 text-sm">{detail.value}</dd></div>)}</dl></section> : null}
        {overview.people.length ? <section aria-labelledby="job-site-overview-people"><div className="flex items-center gap-2"><IconUsers aria-hidden="true" className="size-4" /><h2 className="text-sm font-semibold" id="job-site-overview-people">Persone principali</h2></div><ul className="mt-3 space-y-3">{overview.people.map((person) => <li key={`${person.name}-${person.detail}`}><p className="text-sm font-medium">{person.name}</p><p className="text-xs text-muted-foreground">{person.detail}</p></li>)}</ul></section> : null}
      </div>
    </div>
  </WorkspacePanel>;
}
