import Link from "next/link";
import {
  IconArrowUpRight,
  IconBell,
  IconCalendar,
  IconCalendarDue,
  IconCircleCheck,
  IconEdit,
} from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Badge } from "@qoovex/ui/components/badge";
import { buttonVariants } from "@qoovex/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { cn } from "@qoovex/ui/lib/utils";
import { DeadlineArchiveButton } from "./DeadlineArchiveButton";
import { WorkspaceEmptyState, WorkspacePage, WorkspacePageHeader, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";
import { deadlineStatusLabels, formatDate, statusTone } from "@/views/workspace/workspace-format";
import type { WorkspaceCapabilities, WorkspaceDeadlineRecord, WorkspaceDocumentRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";

const sourceLabels = {
  MANUAL: "Inserita manualmente",
  DOCUMENT: "Da documento",
  CHECKLIST: "Da checklist",
  OTHER: "Altra origine",
} as const;

function relationDetails(
  deadline: WorkspaceDeadlineRecord,
  documents: WorkspaceDocumentRecord[],
  workers: WorkspaceWorkerRecord[],
  jobSites: WorkspaceJobSiteRecord[],
) {
  if (deadline.documentId) {
    const document = documents.find((item) => item.id === deadline.documentId);
    return { type: "Documento", label: document?.title ?? "Documento collegato", href: `/documents/${deadline.documentId}` };
  }
  if (deadline.workerId) {
    const worker = workers.find((item) => item.id === deadline.workerId);
    return { type: "Lavoratore", label: worker?.displayName ?? "Lavoratore collegato", href: `/workers/${deadline.workerId}` };
  }
  if (deadline.jobSiteId) {
    const jobSite = jobSites.find((item) => item.id === deadline.jobSiteId);
    return { type: "Cantiere", label: jobSite?.name ?? "Cantiere collegato", href: `/job-sites/${deadline.jobSiteId}` };
  }
  return { type: "Azienda", label: "Scadenza senza contesto collegato", href: null };
}

function dateParts(value: string) {
  const parts = new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short", year: "numeric" }).formatToParts(new Date(value));
  return {
    day: parts.find((part) => part.type === "day")?.value ?? "",
    month: parts.find((part) => part.type === "month")?.value.replace(".", "") ?? "",
    year: parts.find((part) => part.type === "year")?.value ?? "",
  };
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function DeadlinesPageView({
  deadlines,
  documents,
  workers,
  jobSites,
  capabilities,
  returnToDashboard = false,
  updatedId,
}: {
  deadlines: WorkspaceDeadlineRecord[];
  documents: WorkspaceDocumentRecord[];
  workers: WorkspaceWorkerRecord[];
  jobSites: WorkspaceJobSiteRecord[];
  capabilities: WorkspaceCapabilities;
  returnToDashboard?: boolean;
  updatedId?: string;
}) {
  const expiredCount = deadlines.filter((deadline) => deadline.status === "EXPIRED").length;
  const expiringCount = deadlines.filter((deadline) => deadline.status === "EXPIRING_SOON").length;
  const completedCount = deadlines.filter((deadline) => deadline.status === "DONE").length;

  return (
    <WorkspacePage>
      <WorkspacePageHeader
        title="Scadenze"
        description="Una linea temporale delle date registrate, con contesto, promemoria e azioni operative. Le scadenze normative non vengono calcolate automaticamente."
        action={<div className="flex flex-wrap gap-2">
          {returnToDashboard ? <Link className={buttonVariants({ variant: "outline" })} href="/dashboard">Torna a Da fare</Link> : <Link className={buttonVariants({ variant: "outline" })} href="/calendar"><IconCalendar />Apri calendario</Link>}
          {capabilities.canCreateDeadlines ? <Link className={buttonVariants()} href="/deadlines/new"><IconCalendarDue />Aggiungi scadenza</Link> : null}
        </div>}
      />

      {updatedId ? <Alert variant="success"><IconCircleCheck /><AlertTitle>Scadenza salvata</AlertTitle><AlertDescription>I dettagli sono aggiornati nella timeline e nel calendario operativo.</AlertDescription></Alert> : null}

      <Card size="sm">
        <CardContent className="grid gap-4 sm:grid-cols-3 sm:divide-x sm:divide-border">
          <div className="flex items-center justify-between gap-3 sm:pr-4"><div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Scadute</p><strong className="mt-1 block text-2xl font-semibold tabular-nums">{expiredCount}</strong></div><WorkspaceState label="Da controllare" tone={expiredCount ? "danger" : "neutral"} /></div>
          <div className="flex items-center justify-between gap-3 sm:px-4"><div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">In scadenza</p><strong className="mt-1 block text-2xl font-semibold tabular-nums">{expiringCount}</strong></div><WorkspaceState label="Prossimi 30 giorni" tone={expiringCount ? "warning" : "neutral"} /></div>
          <div className="flex items-center justify-between gap-3 sm:pl-4"><div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Completate</p><strong className="mt-1 block text-2xl font-semibold tabular-nums">{completedCount}</strong></div><WorkspaceState label="Registrate" tone={completedCount ? "good" : "neutral"} /></div>
        </CardContent>
      </Card>

      {!deadlines.length ? (
        <Card><CardContent><WorkspaceEmptyState title="Nessuna scadenza" description="Registra una scadenza per costruire la timeline delle date da controllare." /></CardContent></Card>
      ) : (
        <section aria-labelledby="deadlines-timeline-title">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium" id="deadlines-timeline-title">Linea temporale</h2>
              <p className="mt-1 text-sm text-muted-foreground">{deadlines.length} {deadlines.length === 1 ? "scadenza ordinata" : "scadenze ordinate"} dalla data più vicina.</p>
            </div>
            <Badge variant="outline"><IconCalendarDue />Ordine cronologico</Badge>
          </div>

          <ol className="relative m-0 grid list-none gap-4 p-0 before:absolute before:bottom-6 before:left-3 before:top-6 before:w-px before:bg-border sm:before:left-36">
            {deadlines.map((deadline) => {
              const date = dateParts(deadline.dueDate);
              const relation = relationDetails(deadline, documents, workers, jobSites);
              const highlighted = deadline.id === updatedId;
              return (
                <li className="relative grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-3 sm:grid-cols-[7.5rem_1.5rem_minmax(0,1fr)]" key={deadline.id}>
                  <time className="col-span-2 mb-1 pl-9 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:col-span-1 sm:mb-0 sm:pr-3 sm:pt-4 sm:text-right" dateTime={deadline.dueDate}>
                    <span className="mr-1 text-xl font-semibold leading-none text-foreground sm:mr-0 sm:block sm:text-2xl">{date.day}</span>
                    <span>{date.month} {date.year}</span>
                  </time>
                  <span aria-hidden="true" className={cn("z-10 mt-4 size-6 rounded-full border-4 border-background bg-muted ring-1 ring-border", deadline.status === "EXPIRED" && "bg-destructive", deadline.status === "EXPIRING_SOON" && "bg-warning", deadline.status === "DONE" && "bg-success")} />
                  <Card className={cn("min-w-0", highlighted && "ring-2 ring-success/40")} size="sm">
                    <CardHeader className="border-b">
                      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <CardTitle><h3 className="[overflow-wrap:anywhere]">{deadline.title}</h3></CardTitle>
                          <CardDescription className="mt-1">Scadenza registrata: {formatDate(deadline.dueDate)}</CardDescription>
                        </div>
                        <WorkspaceState label={deadlineStatusLabels[deadline.status]} tone={statusTone(deadline.status)} />
                      </div>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <dl className="grid gap-3 text-sm sm:grid-cols-3">
                        <div className="min-w-0"><dt className="text-xs font-medium text-muted-foreground">Contesto</dt><dd className="mt-1 [overflow-wrap:anywhere] font-medium">{relation.label}</dd><dd className="mt-0.5 text-xs text-muted-foreground">{relation.type}</dd></div>
                        <div><dt className="text-xs font-medium text-muted-foreground">Origine</dt><dd className="mt-1 font-medium">{sourceLabels[deadline.sourceType]}</dd></div>
                        <div><dt className="flex items-center gap-1 text-xs font-medium text-muted-foreground"><IconBell className="size-3.5" />Promemoria</dt><dd className="mt-1 font-medium">{deadline.remindAt ? formatDateTime(deadline.remindAt) : "Non impostato"}</dd></div>
                      </dl>
                      <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                        {relation.href ? <Link className={buttonVariants({ variant: "outline", size: "sm" })} href={relation.href}><IconArrowUpRight />Apri contesto</Link> : null}
                        {capabilities.canCreateDeadlines ? <Link className={buttonVariants({ variant: "outline", size: "sm" })} href={`/deadlines/${deadline.id}`}><IconEdit />Modifica</Link> : null}
                        {capabilities.canCreateDeadlines ? <DeadlineArchiveButton deadlineId={deadline.id} title={deadline.title} /> : null}
                      </div>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </WorkspacePage>
  );
}
