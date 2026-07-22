import Link from "next/link";
import {
  IconArrowLeft,
  IconAt,
  IconBuilding,
  IconCalendarDue,
  IconCalendarPlus,
  IconChevronDown,
  IconDownload,
  IconFileDescription,
  IconFilePlus,
  IconNotes,
  IconPhone,
  IconPhotoPlus,
  IconSettings,
  IconUserCheck,
  IconUsers,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback } from "@qoovex/ui/components/avatar";
import { Badge } from "@qoovex/ui/components/badge";
import { buttonVariants } from "@qoovex/ui/components/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@qoovex/ui/components/empty";
import { cn } from "@qoovex/ui/lib/utils";
import type { WorkerUserLinkResponse } from "@qoovex/types";
import { WorkerArchiveButton } from "./WorkerArchiveButton";
import { WorkerForm } from "./WorkerForm";
import { documentDetailsHref } from "@shared/lib/document-routes";
import { jobSiteDetailsHref } from "@shared/lib/job-site-routes";
import { WorkspacePage, WorkspacePageHeader, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";
import { WorkspacePageIdentity } from "@/views/workspace/WorkspacePageIdentity";
import {
  deadlineStatusLabels,
  documentStatusLabels,
  evidenceTypeLabels,
  formatDate,
  recordStatusLabels,
  statusTone,
} from "@/views/workspace/workspace-format";
import type {
  WorkspaceCapabilities,
  WorkspaceDeadlineRecord,
  WorkspaceDocumentRecord,
  WorkspaceEvidenceRecord,
  WorkspaceJobSiteRecord,
  WorkspaceWorkerRecord,
} from "@/views/workspace/workspace-records";

function workerInitials(displayName: string) {
  return displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toLocaleUpperCase("it-IT");
}

function RelatedEmpty({ description, icon: Icon, title }: { description: string; icon: typeof IconFileDescription; title: string }) {
  return (
    <Empty className="min-h-40 border">
      <EmptyHeader>
        <EmptyMedia variant="icon"><Icon aria-hidden="true" /></EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function WorkerDetailView({
  worker,
  documents,
  deadlines,
  evidence,
  jobSites,
  userLinks,
  capabilities,
  returnToDashboard = false,
}: {
  worker: WorkspaceWorkerRecord;
  documents: WorkspaceDocumentRecord[];
  deadlines: WorkspaceDeadlineRecord[];
  evidence: WorkspaceEvidenceRecord[];
  jobSites: WorkspaceJobSiteRecord[];
  userLinks: WorkerUserLinkResponse[];
  capabilities: WorkspaceCapabilities;
  returnToDashboard?: boolean;
}) {
  const hasQuickActions = capabilities.canCreateDocuments || capabilities.canUploadEvidence || capabilities.canCreateDeadlines;

  return (
    <WorkspacePage>
      <WorkspacePageIdentity label={worker.displayName} />
      <WorkspacePageHeader
        title={worker.displayName}
        description={worker.roleLabel || "Mansione non indicata"}
        action={(
          <Link
            className={cn(buttonVariants({ variant: "outline" }), "h-10 sm:h-8")}
            data-link="plain"
            href={returnToDashboard ? "/dashboard" : "/workers"}
          >
            <IconArrowLeft aria-hidden="true" />
            {returnToDashboard ? "Torna a Da fare" : "Torna ai lavoratori"}
          </Link>
        )}
      />

      <Card size="sm">
        <CardHeader className="border-b">
          <CardTitle><h2>Riepilogo lavoratore</h2></CardTitle>
          <CardDescription>Contatti, mansione e informazioni operative registrate.</CardDescription>
          <CardAction><WorkspaceState label={recordStatusLabels[worker.status]} tone={statusTone(worker.status)} /></CardAction>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
            <Avatar className="size-12" size="lg">
              <AvatarFallback className="font-medium text-foreground">{workerInitials(worker.displayName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="[overflow-wrap:anywhere] text-base font-medium">{worker.displayName}</p>
              <p className="mt-1 text-sm text-muted-foreground">{worker.roleLabel || "Mansione non indicata"}</p>
            </div>
          </div>

          <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div className="min-w-0">
              <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><IconAt aria-hidden="true" className="size-4" />Email</dt>
              <dd className="mt-1 min-w-0 [overflow-wrap:anywhere] font-medium">
                {worker.email ? <a data-link="quiet" href={`mailto:${worker.email}`}>{worker.email}</a> : "Non registrata"}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><IconPhone aria-hidden="true" className="size-4" />Telefono</dt>
              <dd className="mt-1 min-w-0 [overflow-wrap:anywhere] font-medium">
                {worker.phone ? <a data-link="quiet" href={`tel:${worker.phone}`}>{worker.phone}</a> : "Non registrato"}
              </dd>
            </div>
            <div><dt className="text-xs font-medium text-muted-foreground">Aggiunto</dt><dd className="mt-1 font-medium">{formatDate(worker.createdAt)}</dd></div>
            <div><dt className="text-xs font-medium text-muted-foreground">Ultimo aggiornamento</dt><dd className="mt-1 font-medium">{formatDate(worker.updatedAt)}</dd></div>
          </dl>

          <div className="rounded-lg bg-muted/60 p-3">
            <div className="flex items-center gap-2 text-sm font-medium"><IconNotes aria-hidden="true" className="size-4 text-muted-foreground" />Note operative</div>
            <p className="mt-2 whitespace-pre-wrap [overflow-wrap:anywhere] text-sm leading-relaxed text-muted-foreground">{worker.notes || "Nessuna nota operativa registrata."}</p>
          </div>
        </CardContent>
      </Card>

      {hasQuickActions ? (
        <Card size="sm">
          <CardHeader className="border-b">
            <CardTitle><h2>Azioni operative</h2></CardTitle>
            <CardDescription>I nuovi elementi manterranno il collegamento con questo lavoratore.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {capabilities.canCreateDocuments ? <Link className={cn(buttonVariants(), "h-10 sm:h-8")} href={`/documents/new?origin=worker&workerId=${worker.id}`}><IconFilePlus aria-hidden="true" />Aggiungi documento</Link> : null}
            {capabilities.canUploadEvidence ? <Link className={cn(buttonVariants({ variant: "outline" }), "h-10 sm:h-8")} href={`/evidence/new?origin=worker&workerId=${worker.id}`}><IconPhotoPlus aria-hidden="true" />Aggiungi prova</Link> : null}
            {capabilities.canCreateDeadlines ? <Link className={cn(buttonVariants({ variant: "outline" }), "h-10 sm:h-8")} href={`/deadlines/new?origin=worker&workerId=${worker.id}`}><IconCalendarPlus aria-hidden="true" />Aggiungi scadenza</Link> : null}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid min-w-0 gap-6 lg:grid-cols-2 lg:items-start">
        <Card className="min-w-0" size="sm">
          <CardHeader className="border-b">
            <CardTitle><h2>Documenti collegati</h2></CardTitle>
            <CardDescription>Documenti registrati per questo lavoratore.</CardDescription>
            <CardAction><Badge variant="outline"><IconFileDescription aria-hidden="true" />{documents.length}</Badge></CardAction>
          </CardHeader>
          <CardContent>
            {!documents.length ? (
              <RelatedEmpty description="Non risultano documenti associati a questo profilo." icon={IconFileDescription} title="Nessun documento collegato" />
            ) : (
              <ul className="m-0 grid list-none gap-2 p-0">
                {documents.map((document) => (
                  <li className="flex min-w-0 flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between" key={document.id}>
                    <div className="min-w-0"><strong className="block [overflow-wrap:anywhere] text-sm font-medium">{document.title}</strong><span className="mt-1 block text-xs text-muted-foreground">Scadenza registrata: {formatDate(document.expiryDate)}</span></div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2"><WorkspaceState label={documentStatusLabels[document.status]} tone={statusTone(document.status)} /><Link className={buttonVariants({ variant: "outline", size: "sm" })} href={documentDetailsHref(document)}>Apri documento</Link></div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0" size="sm">
          <CardHeader className="border-b">
            <CardTitle><h2>Scadenze collegate</h2></CardTitle>
            <CardDescription>Date operative associate a questo lavoratore.</CardDescription>
            <CardAction><Badge variant="outline"><IconCalendarDue aria-hidden="true" />{deadlines.length}</Badge></CardAction>
          </CardHeader>
          <CardContent>
            {!deadlines.length ? (
              <RelatedEmpty description="Non risultano date operative associate a questo profilo." icon={IconCalendarDue} title="Nessuna scadenza collegata" />
            ) : (
              <ul className="m-0 grid list-none gap-2 p-0">
                {deadlines.map((deadline) => (
                  <li className="flex min-w-0 flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between" key={deadline.id}>
                    <div className="min-w-0"><strong className="block [overflow-wrap:anywhere] text-sm font-medium">{deadline.title}</strong><span className="mt-1 block text-xs text-muted-foreground">Scadenza registrata: <time dateTime={deadline.dueDate}>{formatDate(deadline.dueDate)}</time></span></div>
                    <WorkspaceState label={deadlineStatusLabels[deadline.status]} tone={statusTone(deadline.status)} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0" size="sm">
          <CardHeader className="border-b">
            <CardTitle><h2>Cantieri assegnati</h2></CardTitle>
            <CardDescription>Cantieri visibili collegati al lavoratore.</CardDescription>
            <CardAction><Badge variant="outline"><IconBuilding aria-hidden="true" />{jobSites.length}</Badge></CardAction>
          </CardHeader>
          <CardContent>
            {!jobSites.length ? (
              <RelatedEmpty description="Non risultano cantieri assegnati visibili." icon={IconBuilding} title="Nessun cantiere assegnato" />
            ) : (
              <ul className="m-0 grid list-none gap-2 p-0">
                {jobSites.map((site) => (
                  <li className="flex min-w-0 flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between" key={site.id}>
                    <div className="min-w-0"><strong className="block [overflow-wrap:anywhere] text-sm font-medium">{site.name}</strong><span className="mt-1 block text-xs text-muted-foreground">{site.clientName || "Committente non indicato"}</span></div>
                    <Link className={buttonVariants({ variant: "outline", size: "sm" })} href={jobSiteDetailsHref(site)}>Apri cantiere</Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0" size="sm">
          <CardHeader className="border-b">
            <CardTitle><h2>Prove collegate</h2></CardTitle>
            <CardDescription>Foto, file e note operative associate al profilo.</CardDescription>
            <CardAction><Badge variant="outline"><IconPhotoPlus aria-hidden="true" />{evidence.length}</Badge></CardAction>
          </CardHeader>
          <CardContent>
            {!evidence.length ? (
              <RelatedEmpty description="Non risultano prove associate a questo profilo." icon={IconPhotoPlus} title="Nessuna prova collegata" />
            ) : (
              <ul className="m-0 grid list-none gap-2 p-0">
                {evidence.slice(0, 8).map((item) => (
                  <li className="flex min-w-0 flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between" key={item.id}>
                    <div className="min-w-0"><strong className="block [overflow-wrap:anywhere] text-sm font-medium">{item.title}</strong><span className="mt-1 block text-xs text-muted-foreground">{evidenceTypeLabels[item.type]}{item.originalFileName ? ` · ${item.originalFileName}` : ""}</span></div>
                    {item.hasFile ? <a className={buttonVariants({ variant: "outline", size: "sm" })} href={`/api/evidence/${item.id}/download`}><IconDownload aria-hidden="true" />Scarica</a> : null}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {capabilities.canReadAssignments ? (
        <Card size="sm">
          <CardHeader className="border-b">
            <CardTitle><h2>Accesso collegato</h2></CardTitle>
            <CardDescription>Account associato al profilo per applicare lo scope personale.</CardDescription>
            <CardAction><Badge variant="outline"><IconUserCheck aria-hidden="true" />{userLinks.length}</Badge></CardAction>
          </CardHeader>
          <CardContent className="grid gap-3">
            {!userLinks.length ? (
              <RelatedEmpty description="Non risulta un account associato a questo profilo." icon={IconUsers} title="Nessun accesso collegato" />
            ) : (
              <ul className="m-0 grid list-none gap-2 p-0">
                {userLinks.map((link) => <li className="rounded-lg border p-3" key={link.id}><strong className="block text-sm font-medium">{link.userLabel}</strong><span className="mt-1 block [overflow-wrap:anywhere] text-xs text-muted-foreground">{link.userEmail}</span></li>)}
              </ul>
            )}
            <div><Link className={buttonVariants({ variant: "outline", size: "sm" })} href="/access"><IconUsers aria-hidden="true" />Gestisci accesso</Link></div>
          </CardContent>
        </Card>
      ) : null}

      {capabilities.canManageCore ? (
        <Card size="sm">
          <CardHeader className="border-b">
            <CardTitle><h2 className="flex items-center gap-2"><IconSettings aria-hidden="true" className="size-4" />Gestione lavoratore</h2></CardTitle>
            <CardDescription>Modifica le informazioni registrate oppure archivia il profilo.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <details className="group rounded-lg border bg-background">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-3 py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
                Modifica informazioni
                <IconChevronDown aria-hidden="true" className="size-4 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none" />
              </summary>
              <div className="border-t p-3 sm:p-4"><WorkerForm mode="update" worker={worker} /></div>
            </details>
            <details className="group rounded-lg border border-destructive/30 bg-background">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-3 py-3 text-sm font-medium text-destructive focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-destructive/20 [&::-webkit-details-marker]:hidden">
                Zona riservata
                <IconChevronDown aria-hidden="true" className="size-4 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
              </summary>
              <div className="border-t border-destructive/20 p-3 sm:p-4"><WorkerArchiveButton redirectToList workerId={worker.id} /></div>
            </details>
          </CardContent>
        </Card>
      ) : null}
    </WorkspacePage>
  );
}
