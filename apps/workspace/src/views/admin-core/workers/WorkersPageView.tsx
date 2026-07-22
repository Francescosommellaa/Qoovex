import {
  IconAt,
  IconPhone,
  IconUsers,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback } from "@qoovex/ui/components/avatar";
import { Badge } from "@qoovex/ui/components/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@qoovex/ui/components/empty";
import { WorkerCreateDialog } from "./WorkerCreateDialog";
import { WorkerDetailsDialog } from "./WorkerDetailsDialog";
import type { WorkerAccessRole } from "./WorkerForm";
import { WorkspacePage, WorkspacePageHeader, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";
import { recordStatusLabels, statusTone } from "@/views/workspace/workspace-format";
import type { WorkspaceCapabilities, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";

function workerInitials(displayName: string) {
  return displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toLocaleUpperCase("it-IT");
}

export function WorkersPageView({ workers, capabilities, initialCreateOpen = false, invitableRoles }: { workers: WorkspaceWorkerRecord[]; capabilities: WorkspaceCapabilities; initialCreateOpen?: boolean; invitableRoles: WorkerAccessRole[] }) {
  const resultLabel = workers.length === 1 ? "1 lavoratore" : `${workers.length} lavoratori`;

  return (
    <WorkspacePage>
      <WorkspacePageHeader
        title="Lavoratori"
        description="Consulta i dati essenziali e apri il profilo per documenti, scadenze e cantieri collegati."
        action={capabilities.canCreateWorkers ? (
          <WorkerCreateDialog className="h-10 w-full sm:h-8 sm:w-auto" initialOpen={initialCreateOpen} invitableRoles={invitableRoles} />
        ) : undefined}
      />

      {!workers.length ? (
        <Card>
          <CardContent>
            <Empty className="min-h-64 py-10">
              <EmptyHeader>
                <EmptyMedia variant="icon"><IconUsers aria-hidden="true" /></EmptyMedia>
                <EmptyTitle>Nessun lavoratore</EmptyTitle>
                <EmptyDescription>Aggiungi un lavoratore per collegare documenti e scadenze.</EmptyDescription>
              </EmptyHeader>
              {capabilities.canCreateWorkers ? (
                <EmptyContent>
                  <WorkerCreateDialog invitableRoles={invitableRoles} />
                </EmptyContent>
              ) : null}
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <Card size="sm">
          <CardHeader className="border-b">
            <CardTitle><h2>Elenco lavoratori</h2></CardTitle>
            <CardDescription>Ruolo operativo e contatti disponibili per ogni persona.</CardDescription>
            <CardAction><Badge variant="outline">{resultLabel}</Badge></CardAction>
          </CardHeader>
          <CardContent>
            <ul aria-label="Lavoratori disponibili" className="divide-y divide-border">
              {workers.map((worker) => (
                <li className="py-4 first:pt-0 last:pb-0" key={worker.id}>
                  <article className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-4 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
                    <Avatar className="size-10" size="lg">
                      <AvatarFallback className="font-medium text-foreground">{workerInitials(worker.displayName)}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="[overflow-wrap:anywhere] text-base font-medium leading-snug text-foreground">{worker.displayName}</h3>
                        <WorkspaceState label={recordStatusLabels[worker.status]} tone={statusTone(worker.status)} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{worker.roleLabel || "Ruolo operativo non indicato"}</p>

                      <dl className="mt-3 grid min-w-0 gap-2 text-sm md:grid-cols-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <dt className="sr-only">Email</dt>
                          <IconAt aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                          <dd className="min-w-0">
                            {worker.email ? (
                              <a className="block truncate" data-link="quiet" href={`mailto:${worker.email}`}>{worker.email}</a>
                            ) : <span className="text-muted-foreground">Email non registrata</span>}
                          </dd>
                        </div>
                        <div className="flex min-w-0 items-center gap-2">
                          <dt className="sr-only">Telefono</dt>
                          <IconPhone aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                          <dd className="min-w-0">
                            {worker.phone ? (
                              <a className="block truncate" data-link="quiet" href={`tel:${worker.phone}`}>{worker.phone}</a>
                            ) : <span className="text-muted-foreground">Telefono non registrato</span>}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <WorkerDetailsDialog
                      canManage={capabilities.canManageCore}
                      className="col-span-2 h-10 w-full sm:col-span-1 sm:col-start-2 sm:w-fit lg:col-start-auto lg:h-8 lg:justify-self-end"
                      worker={worker}
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
