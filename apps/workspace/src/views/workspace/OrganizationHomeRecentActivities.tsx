import Link from "next/link";
import { buttonVariants } from "@qoovex/ui/components/button";
import type { OrganizationHomeRecentActivity } from "@shared/lib/organization-home-recent-activity";
import { WorkspaceEmptyState, WorkspacePanel } from "./WorkspacePrimitives";

export function OrganizationHomeRecentActivities({ activities }: { activities: readonly OrganizationHomeRecentActivity[] }) {
  return <WorkspacePanel title="Attività recenti" description="Cosa è successo nei cantieri accessibili. Le attività che richiedono un intervento restano nella coda sopra.">
    {activities.length ? <ul aria-label="Attività recenti" className="divide-y">
      {activities.map((activity) => <li className="py-4 first:pt-0 last:pb-0" key={activity.id}>
        <article className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground">{activity.presentation.title}</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{activity.presentation.description}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{activity.jobSiteName}</span>
              <span aria-hidden="true">·</span>
              <span>{activity.presentation.actor}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={activity.occurredAt}>{activity.presentation.occurredAtLabel}</time>
            </div>
          </div>
          <Link aria-label={`Apri ${activity.presentation.title} nel cantiere ${activity.jobSiteName}`} className={buttonVariants({ size: "sm", variant: "outline" })} href={activity.href}>Apri nel cantiere</Link>
        </article>
      </li>)}
    </ul> : <WorkspaceEmptyState title="Nessuna attività recente" description="Gli aggiornamenti dei cantieri compariranno qui quando saranno disponibili." />}
  </WorkspacePanel>;
}
