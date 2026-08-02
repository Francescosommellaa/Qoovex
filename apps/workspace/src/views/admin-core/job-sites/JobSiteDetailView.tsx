import Link from "next/link";
import {
  IconArrowLeft,
  IconBuilding,
  IconCalendar,
  IconCalendarDue,
  IconChecklist,
  IconChevronDown,
  IconDownload,
  IconFileDescription,
  IconMapPin,
  IconNotes,
  IconPackageExport,
  IconPhotoPlus,
  IconSettings,
  IconUserCheck,
  IconUsers,
} from "@tabler/icons-react";
import { Badge } from "@qoovex/ui/components/badge";
import { buttonVariants } from "@qoovex/ui/components/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@qoovex/ui/components/empty";
import { cn } from "@qoovex/ui/lib/utils";
import type { JobSiteUserAssignmentResponse, JobSiteWorkerAssignmentResponse, MissingDocumentRequirementItem } from "@qoovex/types";
import { JobSiteArchiveButton } from "./JobSiteArchiveButton";
import { JobSiteForm } from "./JobSiteForm";
import { JobSiteQuickActions } from "./JobSiteQuickActions";
import { DocumentCategoryList } from "@/views/admin-core/documents/DocumentCategoryList";
import { DashboardAssignmentDialog } from "@/views/dashboard/DashboardAssignmentDialog";
import { WorkspacePageIdentity } from "@/views/workspace/WorkspacePageIdentity";
import { WorkspacePage, WorkspacePageHeader, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";
import {
  deadlineStatusLabels,
  evidenceTypeLabels,
  formatDate,
  recordStatusLabels,
  statusTone,
} from "@/views/workspace/workspace-format";
import type {
  WorkspaceCapabilities,
  WorkspaceChecklistRecord,
  WorkspaceDeadlineRecord,
  WorkspaceDocumentPackageRecord,
  WorkspaceDocumentRecord,
  WorkspaceEvidenceRecord,
  WorkspaceJobSiteRecord,
} from "@/views/workspace/workspace-records";

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

export function JobSiteDetailView({
  jobSite,
  documents,
  missingDocuments,
  deadlines,
  evidence,
  checklists,
  packages,
  userAssignments,
  workerAssignments,
  capabilities,
  returnToDashboard = false,
}: {
  jobSite: WorkspaceJobSiteRecord;
  documents: WorkspaceDocumentRecord[];
  missingDocuments: MissingDocumentRequirementItem[];
  deadlines: WorkspaceDeadlineRecord[];
  evidence: WorkspaceEvidenceRecord[];
  checklists: WorkspaceChecklistRecord[];
  packages: WorkspaceDocumentPackageRecord[];
  userAssignments: JobSiteUserAssignmentResponse[];
  workerAssignments: JobSiteWorkerAssignmentResponse[];
  capabilities: WorkspaceCapabilities;
  returnToDashboard?: boolean;
}) {
  const hasQuickActions = capabilities.canCreateDocuments || capabilities.canUploadEvidence || capabilities.canCreateDeadlines || capabilities.canManageChecklists || capabilities.canManagePackages;
  const openChecklistItems = checklists.reduce((total, checklist) => total + (checklist.items?.filter((item) => item.status !== "DONE").length ?? 0), 0);
  const responsiblePeopleLabel = userAssignments.length ? userAssignments.map((item) => item.userLabel).join(", ") : "Non assegnato";

  return (
    <WorkspacePage>
      <WorkspacePageIdentity label={jobSite.name} />
      <WorkspacePageHeader
        title={jobSite.name}
        description={jobSite.clientName || "Committente non indicato"}
        action={(
          <Link className={cn(buttonVariants({ variant: "outline" }), "h-10 sm:h-8")} data-link="plain" href={returnToDashboard ? "/dashboard" : "/job-sites"}>
            <IconArrowLeft aria-hidden="true" />
            {returnToDashboard ? "Torna alla Panoramica" : "Torna ai cantieri"}
          </Link>
        )}
      />

      <Card size="sm">
        <CardHeader className="border-b">
          <CardTitle><h2>Riepilogo cantiere</h2></CardTitle>
          <CardDescription>Luogo, periodo e informazioni operative registrate.</CardDescription>
          <CardAction><WorkspaceState label={recordStatusLabels[jobSite.status]} tone={statusTone(jobSite.status)} /></CardAction>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-lg border bg-muted/40"><IconBuilding aria-hidden="true" className="size-6 text-muted-foreground" /></div>
            <div className="min-w-0"><p className="[overflow-wrap:anywhere] text-base font-medium">{jobSite.name}</p><p className="mt-1 text-sm text-muted-foreground">{jobSite.clientName || "Committente non indicato"}</p></div>
          </div>

          <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div className="min-w-0 lg:col-span-2"><dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><IconMapPin aria-hidden="true" className="size-4" />Indirizzo</dt><dd className="mt-1 [overflow-wrap:anywhere] font-medium">{jobSite.address || "Non registrato"}</dd></div>
            <div><dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><IconCalendar aria-hidden="true" className="size-4" />Data inizio</dt><dd className="mt-1 font-medium">{formatDate(jobSite.startDate)}</dd></div>
            <div><dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><IconCalendar aria-hidden="true" className="size-4" />Data fine</dt><dd className="mt-1 font-medium">{formatDate(jobSite.endDate)}</dd></div>
            {capabilities.canReadAssignments ? <div className="min-w-0 lg:col-span-2"><dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><IconUserCheck aria-hidden="true" className="size-4" />Collaboratori del cantiere</dt><dd className="mt-1 [overflow-wrap:anywhere] font-medium">{responsiblePeopleLabel}</dd></div> : null}
            <div><dt className="text-xs font-medium text-muted-foreground">Creato</dt><dd className="mt-1 font-medium">{formatDate(jobSite.createdAt)}</dd></div>
            <div><dt className="text-xs font-medium text-muted-foreground">Ultimo aggiornamento</dt><dd className="mt-1 font-medium">{formatDate(jobSite.updatedAt)}</dd></div>
          </dl>

          <div className="rounded-lg bg-muted/60 p-3">
            <div className="flex items-center gap-2 text-sm font-medium"><IconNotes aria-hidden="true" className="size-4 text-muted-foreground" />Note operative</div>
            <p className="mt-2 whitespace-pre-wrap [overflow-wrap:anywhere] text-sm leading-relaxed text-muted-foreground">{jobSite.notes || "Nessuna nota operativa registrata."}</p>
          </div>
        </CardContent>
      </Card>

      {capabilities.canReadAssignments ? (
        <Card size="sm">
          <CardHeader className="border-b">
            <CardTitle><h2>Collaboratori del cantiere</h2></CardTitle>
            <CardDescription>Collaboratori con accesso operativo assegnato a questo cantiere.</CardDescription>
            <CardAction><Badge variant="outline"><IconUserCheck aria-hidden="true" />{userAssignments.length}</Badge></CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <span className="block text-xs font-medium text-muted-foreground">Collaboratori assegnati</span>
              <strong className="mt-1 block [overflow-wrap:anywhere] text-sm font-medium">{responsiblePeopleLabel}</strong>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {capabilities.canManageAssignments ? (
                <DashboardAssignmentDialog
                  contextId={jobSite.id}
                  contextKind="JOB_SITE"
                  contextLabel={jobSite.name}
                  excludedUserIds={userAssignments.map((item) => item.userId)}
                  primaryAction
                  responsibilityLabel={responsiblePeopleLabel}
                  triggerLabel={userAssignments.length ? "Aggiungi collaboratore" : "Assegna collaboratore"}
                />
              ) : null}
              <Link className={buttonVariants({ size: "sm", variant: "outline" })} href="/access"><IconUsers aria-hidden="true" />Vedi assegnazioni</Link>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {hasQuickActions ? (
        <Card size="sm">
          <CardHeader className="border-b"><CardTitle><h2>Azioni operative</h2></CardTitle><CardDescription>I nuovi elementi manterranno il collegamento con questo cantiere.</CardDescription></CardHeader>
          <CardContent><JobSiteQuickActions capabilities={capabilities} jobSite={jobSite} /></CardContent>
        </Card>
      ) : null}

      <div className="grid min-w-0 gap-6 lg:grid-cols-2 lg:items-start">
        <Card className="min-w-0" size="sm">
          <CardHeader className="border-b">
            <CardTitle><h2>Documenti per categoria</h2></CardTitle>
            <CardDescription>Documenti presenti, mancanti e da verificare nel contesto del cantiere.</CardDescription>
            <CardAction><Badge variant="outline"><IconFileDescription aria-hidden="true" />{documents.length + missingDocuments.length}</Badge></CardAction>
          </CardHeader>
          <CardContent><DocumentCategoryList documents={documents} missing={missingDocuments} /></CardContent>
        </Card>


        <Card className="min-w-0" size="sm">
          <CardHeader className="border-b"><CardTitle><h2>Scadenze collegate</h2></CardTitle><CardDescription>Date operative associate a questo cantiere.</CardDescription><CardAction><Badge variant="outline"><IconCalendarDue aria-hidden="true" />{deadlines.length}</Badge></CardAction></CardHeader>
          <CardContent>{!deadlines.length ? <RelatedEmpty description="Non risultano date operative associate a questo cantiere." icon={IconCalendarDue} title="Nessuna scadenza collegata" /> : <ul className="m-0 grid list-none gap-2 p-0">{deadlines.map((deadline) => <li className="flex min-w-0 flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between" key={deadline.id}><div className="min-w-0"><strong className="block [overflow-wrap:anywhere] text-sm font-medium">{deadline.title}</strong><span className="mt-1 block text-xs text-muted-foreground">Scadenza registrata: <time dateTime={deadline.dueDate}>{formatDate(deadline.dueDate)}</time></span></div><WorkspaceState label={deadlineStatusLabels[deadline.status]} tone={statusTone(deadline.status)} /></li>)}</ul>}</CardContent>
        </Card>

        <Card className="min-w-0" size="sm">
          <CardHeader className="border-b"><CardTitle><h2>Checklist</h2></CardTitle><CardDescription>{openChecklistItems} {openChecklistItems === 1 ? "voce aperta" : "voci aperte"}.</CardDescription><CardAction><Badge variant="outline"><IconChecklist aria-hidden="true" />{checklists.length}</Badge></CardAction></CardHeader>
          <CardContent>{!checklists.length ? <RelatedEmpty description="Non risultano checklist visibili per questo cantiere." icon={IconChecklist} title="Nessuna checklist" /> : <ul className="m-0 grid list-none gap-2 p-0">{checklists.map((checklist) => <li className="flex min-w-0 flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between" key={checklist.id}><div className="min-w-0"><strong className="block [overflow-wrap:anywhere] text-sm font-medium">{checklist.name}</strong><span className="mt-1 block text-xs text-muted-foreground">{checklist.items?.filter((item) => item.status === "DONE").length ?? 0} completate su {checklist.items?.length ?? 0}</span></div><Link className={buttonVariants({ variant: "outline", size: "sm" })} href={`/checklists/${checklist.id}`}>Apri checklist</Link></li>)}</ul>}</CardContent>
        </Card>

        <Card className="min-w-0" size="sm">
          <CardHeader className="border-b"><CardTitle><h2>Prove collegate</h2></CardTitle><CardDescription>Foto, file e note operative associate al cantiere.</CardDescription><CardAction><Badge variant="outline"><IconPhotoPlus aria-hidden="true" />{evidence.length}</Badge></CardAction></CardHeader>
          <CardContent>{!evidence.length ? <RelatedEmpty description="Non risultano prove associate a questo cantiere." icon={IconPhotoPlus} title="Nessuna prova collegata" /> : <ul className="m-0 grid list-none gap-2 p-0">{evidence.slice(0, 8).map((item) => <li className="flex min-w-0 flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between" key={item.id}><div className="min-w-0"><strong className="block [overflow-wrap:anywhere] text-sm font-medium">{item.title}</strong><span className="mt-1 block text-xs text-muted-foreground">{evidenceTypeLabels[item.type]}{item.originalFileName ? ` · ${item.originalFileName}` : ""}</span></div>{item.hasFile ? <a className={buttonVariants({ variant: "outline", size: "sm" })} href={`/api/evidence/${item.id}/download`}><IconDownload aria-hidden="true" />Scarica</a> : null}</li>)}</ul>}</CardContent>
        </Card>
      </div>

      {capabilities.canReadAssignments ? (
        <Card size="sm">
          <CardHeader className="border-b"><CardTitle><h2>Lavoratori assegnati</h2></CardTitle><CardDescription>Profili operativi collegati al cantiere, separati dagli accessi dei Collaboratori.</CardDescription><CardAction><Badge variant="outline"><IconUsers aria-hidden="true" />{workerAssignments.length}</Badge></CardAction></CardHeader>
          <CardContent className="grid gap-3">{!workerAssignments.length ? <RelatedEmpty description="Non risultano lavoratori assegnati a questo cantiere." icon={IconUsers} title="Nessun lavoratore assegnato" /> : <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">{workerAssignments.map((item) => <li className="rounded-lg border p-3" key={item.id}><strong className="block text-sm font-medium">{item.workerDisplayName}</strong><span className="mt-1 block text-xs text-muted-foreground">Mansione: {item.workerRoleLabel || "non indicata"}</span></li>)}</ul>}<div><Link className={buttonVariants({ variant: "outline", size: "sm" })} href="/access"><IconUsers aria-hidden="true" />Gestisci lavoratori assegnati</Link></div></CardContent>
        </Card>
      ) : null}

      {capabilities.canManagePackages ? (
        <Card size="sm">
          <CardHeader className="border-b"><CardTitle><h2>Condivisioni preparate</h2></CardTitle><CardDescription>Pacchetti documentali collegati al cantiere.</CardDescription><CardAction><Badge variant="outline"><IconPackageExport aria-hidden="true" />{packages.length}</Badge></CardAction></CardHeader>
          <CardContent>{!packages.length ? <RelatedEmpty description="Non risultano condivisioni preparate per questo cantiere." icon={IconPackageExport} title="Nessuna condivisione" /> : <ul className="m-0 grid list-none gap-2 p-0">{packages.map((item) => <li className="flex min-w-0 flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between" key={item.id}><div className="min-w-0"><strong className="block [overflow-wrap:anywhere] text-sm font-medium">{item.title}</strong><span className="mt-1 block text-xs text-muted-foreground">{item.items?.length ?? 0} elementi</span></div><Link className={buttonVariants({ variant: "outline", size: "sm" })} href={`/document-packages/${item.id}`}>Apri condivisione</Link></li>)}</ul>}</CardContent>
        </Card>
      ) : null}

      {capabilities.canManageCore ? (
        <Card size="sm">
          <CardHeader className="border-b"><CardTitle><h2 className="flex items-center gap-2"><IconSettings aria-hidden="true" className="size-4" />Gestione cantiere</h2></CardTitle><CardDescription>Modifica le informazioni registrate oppure archivia il cantiere.</CardDescription></CardHeader>
          <CardContent className="grid gap-3">
            <details className="group rounded-lg border bg-background"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-3 py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">Modifica informazioni<IconChevronDown aria-hidden="true" className="size-4 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none" /></summary><div className="border-t p-3 sm:p-4"><JobSiteForm jobSite={jobSite} mode="update" /></div></details>
            <details className="group rounded-lg border border-destructive/30 bg-background"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-3 py-3 text-sm font-medium text-destructive focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-destructive/20 [&::-webkit-details-marker]:hidden">Zona riservata<IconChevronDown aria-hidden="true" className="size-4 transition-transform group-open:rotate-180 motion-reduce:transition-none" /></summary><div className="border-t border-destructive/20 p-3 sm:p-4"><JobSiteArchiveButton jobSiteId={jobSite.id} redirectToList /></div></details>
          </CardContent>
        </Card>
      ) : null}
    </WorkspacePage>
  );
}
