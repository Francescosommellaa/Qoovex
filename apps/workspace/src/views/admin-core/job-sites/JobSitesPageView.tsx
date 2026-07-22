import { IconBuilding, IconCalendar, IconMapPin } from "@tabler/icons-react";
import { Badge } from "@qoovex/ui/components/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@qoovex/ui/components/empty";
import { JobSiteCreateDialog } from "./JobSiteCreateDialog";
import { JobSiteDetailsDialog } from "./JobSiteDetailsDialog";
import { WorkspacePage, WorkspacePageHeader, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";
import { formatDate, recordStatusLabels, statusTone } from "@/views/workspace/workspace-format";
import type { WorkspaceCapabilities, WorkspaceJobSiteRecord } from "@/views/workspace/workspace-records";

export function JobSitesPageView({ jobSites, capabilities, initialCreateOpen = false }: { jobSites: WorkspaceJobSiteRecord[]; capabilities: WorkspaceCapabilities; initialCreateOpen?: boolean }) {
  const resultLabel = jobSites.length === 1 ? "1 cantiere" : `${jobSites.length} cantieri`;

  return (
    <WorkspacePage>
      <WorkspacePageHeader
        title="Cantieri"
        description="Consulta le informazioni essenziali e apri il cantiere per documenti, attività e persone collegate."
        action={capabilities.canCreateJobSites ? <JobSiteCreateDialog className="h-10 w-full sm:h-8 sm:w-auto" initialOpen={initialCreateOpen} /> : undefined}
      />

      {!jobSites.length ? (
        <Card>
          <CardContent>
            <Empty className="min-h-64 py-10">
              <EmptyHeader>
                <EmptyMedia variant="icon"><IconBuilding aria-hidden="true" /></EmptyMedia>
                <EmptyTitle>Nessun cantiere</EmptyTitle>
                <EmptyDescription>Crea un cantiere per raccogliere documenti, scadenze e attività.</EmptyDescription>
              </EmptyHeader>
              {capabilities.canCreateJobSites ? <EmptyContent><JobSiteCreateDialog /></EmptyContent> : null}
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <Card size="sm">
          <CardHeader className="border-b">
            <CardTitle><h2>Elenco cantieri</h2></CardTitle>
            <CardDescription>Committente, luogo e periodo registrati per ogni cantiere.</CardDescription>
            <CardAction><Badge variant="outline">{resultLabel}</Badge></CardAction>
          </CardHeader>
          <CardContent>
            <ul aria-label="Cantieri disponibili" className="divide-y divide-border">
              {jobSites.map((jobSite) => (
                <li className="py-4 first:pt-0 last:pb-0" key={jobSite.id}>
                  <article className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-4 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
                      <IconBuilding aria-hidden="true" className="size-5 text-muted-foreground" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="[overflow-wrap:anywhere] text-base font-medium leading-snug text-foreground">{jobSite.name}</h3>
                        <WorkspaceState label={recordStatusLabels[jobSite.status]} tone={statusTone(jobSite.status)} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{jobSite.clientName || "Committente non indicato"}</p>

                      <dl className="mt-3 grid min-w-0 gap-2 text-sm md:grid-cols-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <dt className="sr-only">Indirizzo</dt>
                          <IconMapPin aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                          <dd className="min-w-0 truncate text-muted-foreground">{jobSite.address || "Indirizzo non registrato"}</dd>
                        </div>
                        <div className="flex min-w-0 items-center gap-2">
                          <dt className="sr-only">Periodo</dt>
                          <IconCalendar aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                          <dd className="min-w-0 truncate text-muted-foreground">{formatDate(jobSite.startDate)} – {formatDate(jobSite.endDate)}</dd>
                        </div>
                      </dl>
                    </div>

                    <JobSiteDetailsDialog
                      canManage={capabilities.canManageCore}
                      className="col-span-2 h-10 w-full sm:col-span-1 sm:col-start-2 sm:w-fit lg:col-start-auto lg:h-8 lg:justify-self-end"
                      jobSite={jobSite}
                    />
                  </article>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </WorkspacePage>
  );
}
