import Link from "next/link";
import {
  IconArrowLeft,
  IconCalendarDue,
  IconChevronDown,
  IconClock,
  IconFileDescription,
  IconNotes,
  IconSettings,
  IconUpload,
} from "@tabler/icons-react";
import { Badge } from "@qoovex/ui/components/badge";
import { documentSensitivityLabels } from "@qoovex/types";
import { buttonVariants } from "@qoovex/ui/components/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@qoovex/ui/components/empty";
import { cn } from "@qoovex/ui/lib/utils";
import { DocumentArchiveButton } from "./DocumentArchiveButton";
import { DocumentForm } from "./DocumentForm";
import { DocumentVersionList } from "./DocumentVersionList";
import { DocumentVersionUploadForm } from "./DocumentVersionUploadForm";
import { WorkspacePage, WorkspacePageHeader, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";
import { WorkspacePageIdentity } from "@/views/workspace/WorkspacePageIdentity";
import { deadlineStatusLabels, documentStatusLabels, formatDate, ownerLabel, statusTone } from "@/views/workspace/workspace-format";
import type { WorkspaceCapabilities, WorkspaceDeadlineRecord, WorkspaceDocumentRecord, WorkspaceDocumentTypeRecord, WorkspaceDocumentVersionRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";
import { OperationalArtifactStatus } from "@entities/operational-process/ui/OperationalArtifactStatus";
import { ArtifactTimeline } from "@widgets/artifact-timeline/ui/ArtifactTimeline";

export function DocumentDetailView({
  document,
  versions,
  deadlines,
  documentTypes,
  workers,
  jobSites,
  capabilities,
  returnToDashboard = false,
}: {
  document: WorkspaceDocumentRecord;
  versions: WorkspaceDocumentVersionRecord[];
  deadlines: WorkspaceDeadlineRecord[];
  documentTypes: WorkspaceDocumentTypeRecord[];
  workers: WorkspaceWorkerRecord[];
  jobSites: WorkspaceJobSiteRecord[];
  capabilities: WorkspaceCapabilities;
  returnToDashboard?: boolean;
}) {
  const contextLabel = ownerLabel(document.ownerType, document.workerId, document.jobSiteId, workers, jobSites);
  const canManage = capabilities.canUpdateDocuments || capabilities.canManageCore;

  return (
    <WorkspacePage>
      <WorkspacePageIdentity label={document.title} />
      <WorkspacePageHeader
        title={document.title}
        description={`${contextLabel} · Scadenza registrata: ${formatDate(document.expiryDate)}`}
        action={
          <Link className={cn(buttonVariants({ variant: "outline" }), "h-10 sm:h-8")} data-link="plain" href={returnToDashboard ? "/dashboard" : "/documents"}>
            <IconArrowLeft />{returnToDashboard ? "Torna alla Panoramica" : "Torna ai documenti"}
          </Link>
        }
      />

      <OperationalArtifactStatus artifactId={document.id} artifactType="DOCUMENT" />

      <Card size="sm">
        <CardHeader className="border-b">
          <CardTitle><h2>Riepilogo documento</h2></CardTitle>
          <CardDescription>Informazioni registrate e contesto operativo corrente.</CardDescription>
          <CardAction><WorkspaceState label={documentStatusLabels[document.status]} tone={statusTone(document.status)} /></CardAction>
        </CardHeader>
        <CardContent className="grid gap-4">
          <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div><dt className="text-xs font-medium text-muted-foreground">Macroarea</dt><dd className="mt-1 font-medium">{document.ownerType === "ORGANIZATION" ? "Azienda" : document.ownerType === "WORKER" ? "Lavoratori" : "Cantieri"}</dd></div>
            <div><dt className="text-xs font-medium text-muted-foreground">Categoria</dt><dd className="mt-1 font-medium">{document.categoryLabel}</dd></div>
            <div><dt className="text-xs font-medium text-muted-foreground">Tipo documento</dt><dd className="mt-1 font-medium">{document.documentTypeName ?? "Da classificare"}</dd></div>
            <div><dt className="text-xs font-medium text-muted-foreground">Sensibilità</dt><dd className="mt-1 font-medium">{documentSensitivityLabels[document.sensitivity]}</dd></div>
            <div className="min-w-0"><dt className="text-xs font-medium text-muted-foreground">Contesto</dt><dd className="mt-1 [overflow-wrap:anywhere] font-medium">{contextLabel}</dd></div>
            <div><dt className="text-xs font-medium text-muted-foreground">Scadenza registrata</dt><dd className="mt-1 font-medium">{document.expiryDate ? <time dateTime={document.expiryDate}>{formatDate(document.expiryDate)}</time> : "Non registrata"}</dd></div>
            <div><dt className="text-xs font-medium text-muted-foreground">Creato</dt><dd className="mt-1 font-medium">{document.createdAt ? <time dateTime={document.createdAt}>{formatDate(document.createdAt)}</time> : "Non registrato"}</dd></div>
            <div><dt className="text-xs font-medium text-muted-foreground">Ultimo aggiornamento</dt><dd className="mt-1 font-medium"><time dateTime={document.updatedAt}>{formatDate(document.updatedAt)}</time></dd></div>
          </dl>
          <div className="rounded-lg bg-muted/60 p-3">
            <div className="flex items-center gap-2 text-sm font-medium"><IconNotes className="size-4 text-muted-foreground" />Note operative</div>
            <p className="mt-2 whitespace-pre-wrap [overflow-wrap:anywhere] text-sm leading-relaxed text-muted-foreground">{document.notes || "Nessuna nota operativa registrata."}</p>
          </div>
        </CardContent>
      </Card>

      <div className={cn("grid gap-6", capabilities.canUploadDocumentVersions && "lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start")}>
        <div className="grid min-w-0 gap-6">
          <Card size="sm">
            <CardHeader className="border-b">
              <CardTitle><h2>File caricati</h2></CardTitle>
              <CardDescription>Download protetto e versioni attive del documento.</CardDescription>
              <CardAction><Badge variant="outline"><IconFileDescription />{versions.length} file</Badge></CardAction>
            </CardHeader>
            <CardContent><DocumentVersionList canArchive={capabilities.canManageCore} canDownload={capabilities.canReadDocumentFiles} canReview={capabilities.canVerifyDocuments} documentId={document.id} versions={versions} /></CardContent>
          </Card>

          <Card size="sm">
            <CardHeader className="border-b">
              <CardTitle><h2>Scadenze collegate</h2></CardTitle>
              <CardDescription>Date operative associate a questo documento.</CardDescription>
              <CardAction><Badge variant="outline"><IconCalendarDue />{deadlines.length}</Badge></CardAction>
            </CardHeader>
            <CardContent>
              {!deadlines.length ? (
                <Empty className="min-h-40 border">
                  <EmptyHeader><EmptyMedia variant="icon"><IconClock /></EmptyMedia><EmptyTitle>Nessuna scadenza collegata</EmptyTitle><EmptyDescription>Non risultano date operative associate a questo documento.</EmptyDescription></EmptyHeader>
                </Empty>
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
        </div>

        {capabilities.canUploadDocumentVersions ? (
          <Card className="lg:sticky lg:top-20" size="sm">
            <CardHeader className="border-b"><CardTitle><h2 className="flex items-center gap-2"><IconUpload className="size-4" />Aggiungi file</h2></CardTitle><CardDescription>Carica una nuova versione. Il documento resterà da verificare.</CardDescription></CardHeader>
            <CardContent><DocumentVersionUploadForm documentId={document.id} returnToDashboard={returnToDashboard} /></CardContent>
          </Card>
        ) : null}
      </div>

      <ArtifactTimeline artifactId={document.id} artifactType="DOCUMENT" />

      {canManage ? (
        <Card size="sm">
          <CardHeader className="border-b"><CardTitle><h2 className="flex items-center gap-2"><IconSettings className="size-4" />Gestione documento</h2></CardTitle><CardDescription>Modifica le informazioni registrate oppure archivia il documento.</CardDescription></CardHeader>
          <CardContent className="grid gap-3">
            {capabilities.canUpdateDocuments ? (
              <details className="group rounded-lg border bg-background">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-3 py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
                  Modifica informazioni
                  <IconChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none" />
                </summary>
                <div className="border-t p-3 sm:p-4"><DocumentForm document={document} documentTypes={documentTypes} jobSites={jobSites} mode="update" workers={workers} /></div>
              </details>
            ) : null}
            {capabilities.canManageCore ? (
              <details className="group rounded-lg border border-destructive/30 bg-background">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-3 py-3 text-sm font-medium text-destructive focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-destructive/20 [&::-webkit-details-marker]:hidden">
                  Zona riservata
                  <IconChevronDown className="size-4 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
                </summary>
                <div className="border-t border-destructive/20 p-3 sm:p-4"><DocumentArchiveButton documentId={document.id} redirectToList /></div>
              </details>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </WorkspacePage>
  );
}
