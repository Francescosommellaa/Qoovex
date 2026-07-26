import {
  IconAlertCircle,
  IconArchive,
  IconArrowLeft,
  IconCircleCheck,
  IconClock,
  IconFileDescription,
  IconFileOff,
  IconFilter,
  IconSearch,
  IconUpload,
} from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Badge } from "@qoovex/ui/components/badge";
import { buttonVariants } from "@qoovex/ui/components/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@qoovex/ui/components/empty";
import { cn } from "@qoovex/ui/lib/utils";
import Link from "next/link";
import { WorkspacePage, WorkspacePageHeader, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";
import { documentStatusLabels, formatDate, ownerLabel, statusTone } from "@/views/workspace/workspace-format";
import type { WorkspaceCapabilities, WorkspaceDocumentRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";
import { documentDetailsHref } from "@shared/lib/document-routes";
import styles from "./DocumentsPageView.module.css";
import { DocumentDetailsDialog } from "./DocumentDetailsDialog";
import { ArchivedDocumentActions } from "./ArchivedDocumentActions";
import { DocumentCreateDialog } from "./DocumentCreateDialog";

const filters = [
  { label: "Tutti", status: undefined },
  { label: "Da verificare", status: "TO_REVIEW" },
  { label: "Mancanti", status: "MISSING" },
  { label: "Scaduti", status: "EXPIRED" },
  { label: "In scadenza", status: "EXPIRING_SOON" },
  { label: "Presenti", status: "PRESENT" },
] as const;

const archiveFilters = [
  { label: "Tutti", ownerType: undefined },
  { label: "Azienda", ownerType: "ORGANIZATION" },
  { label: "Lavoratori", ownerType: "WORKER" },
  { label: "Cantieri", ownerType: "JOB_SITE" },
] as const;

const documentPresentation = {
  PRESENT: { icon: IconCircleCheck, tone: "bg-success/10 text-success" },
  MISSING: { icon: IconFileOff, tone: "bg-destructive/10 text-destructive" },
  EXPIRED: { icon: IconAlertCircle, tone: "bg-destructive/10 text-destructive" },
  EXPIRING_SOON: { icon: IconClock, tone: "bg-warning/15 text-warning-foreground" },
  TO_REVIEW: { icon: IconSearch, tone: "bg-info/10 text-info" },
  ARCHIVED: { icon: IconFileDescription, tone: "bg-muted text-muted-foreground" },
} as const satisfies Record<WorkspaceDocumentRecord["status"], { icon: typeof IconFileDescription; tone: string }>;

function filterHref(status: (typeof filters)[number]["status"], preserveDashboardOrigin: boolean, intentUpload: boolean) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (preserveDashboardOrigin) params.set("origin", "dashboard");
  if (intentUpload) params.set("intent", "upload");
  const query = params.toString();
  return query ? `/documents?${query}` : "/documents";
}

function archiveHref(preserveDashboardOrigin: boolean) {
  return preserveDashboardOrigin ? "/documents/archive?origin=dashboard" : "/documents/archive";
}

function archiveFilterHref(ownerType: (typeof archiveFilters)[number]["ownerType"], preserveDashboardOrigin: boolean) {
  const params = new URLSearchParams();
  if (ownerType) params.set("ownerType", ownerType);
  if (preserveDashboardOrigin) params.set("origin", "dashboard");
  const query = params.toString();
  return query ? `/documents/archive?${query}` : "/documents/archive";
}

function documentHref(document: WorkspaceDocumentRecord, preserveDashboardOrigin: boolean, intentUpload: boolean) {
  const params = new URLSearchParams();
  if (preserveDashboardOrigin) params.set("from", "dashboard");
  if (intentUpload) params.set("intent", "upload");
  return documentDetailsHref(document, params);
}

export function DocumentsPageView({
  documents,
  workers,
  jobSites,
  activeStatus,
  capabilities,
  returnToDashboard = false,
  originDashboard = false,
  intentUpload = false,
  archiveMode = false,
  archiveOwnerType,
  notice,
}: {
  documents: WorkspaceDocumentRecord[];
  workers: WorkspaceWorkerRecord[];
  jobSites: WorkspaceJobSiteRecord[];
  activeStatus?: string;
  capabilities: WorkspaceCapabilities;
  returnToDashboard?: boolean;
  originDashboard?: boolean;
  intentUpload?: boolean;
  archiveMode?: boolean;
  archiveOwnerType?: "ORGANIZATION" | "WORKER" | "JOB_SITE";
  notice?: string;
}) {
  const preserveDashboardOrigin = returnToDashboard || originDashboard;
  const activeFilter = filters.find((filter) => filter.status === activeStatus) ?? filters[0]!;
  const activeArchiveFilter = archiveFilters.find((filter) => filter.ownerType === archiveOwnerType) ?? archiveFilters[0]!;
  const resultLabel = documents.length === 1 ? "1 documento" : `${documents.length} documenti`;

  return (
    <WorkspacePage>
      <WorkspacePageHeader
        title={archiveMode ? "Archivio documenti" : "Documenti"}
        description={archiveMode ? "Consulta i documenti fuori dalle viste operative, ripristinali oppure eliminali definitivamente." : intentUpload ? "Scegli il documento a cui aggiungere un nuovo file, senza modificare le informazioni già registrate." : "Controlla ciò che è presente, individua ciò che richiede attenzione e apri subito il prossimo passo."}
        action={
          <div className="grid w-full grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end">
            {archiveMode ? <Link className={cn(buttonVariants({ variant: "outline" }), "h-10 sm:h-8")} data-link="plain" href="/documents"><IconArrowLeft />Torna ai documenti</Link> : preserveDashboardOrigin ? <Link className={cn(buttonVariants({ variant: "outline" }), "h-10 sm:h-8")} data-link="plain" href="/dashboard"><IconArrowLeft />Torna a Da fare</Link> : null}
            {!archiveMode && capabilities.canCreateDocuments ? <DocumentCreateDialog canManageTypes={capabilities.canManageDocumentSettings} className="h-10 sm:h-8" jobSites={jobSites} origin="documents" workers={workers} /> : null}
          </div>
        }
      />

      {notice === "restored" ? <Alert variant="success"><IconCircleCheck /><AlertTitle>Documento ripristinato</AlertTitle><AlertDescription>Il documento è tornato tra gli elementi da verificare.</AlertDescription></Alert> : null}
      {notice === "deleted" ? <Alert variant="success"><IconCircleCheck /><AlertTitle>Documento eliminato</AlertTitle><AlertDescription>Metadati e file del documento sono stati eliminati definitivamente.</AlertDescription></Alert> : null}
      {notice === "cleanup-pending" ? <Alert variant="warning"><IconAlertCircle /><AlertTitle>Documento eliminato</AlertTitle><AlertDescription>I dati sono stati rimossi. La pulizia dei file privati non è terminata e resta registrata per il controllo operativo.</AlertDescription></Alert> : null}

      {!archiveMode && intentUpload ? (
        <Alert className={styles.intent} variant="info">
          <IconUpload />
          <AlertTitle>Aggiungi un file a un documento</AlertTitle>
          <AlertDescription>Apri il documento corretto: nella scheda troverai l’azione per caricare una nuova versione.</AlertDescription>
        </Alert>
      ) : null}

      {archiveMode ? (
        <Card className={styles.filtersCard} size="sm">
          <CardHeader className="border-b">
            <CardTitle><h2>Vista documenti</h2></CardTitle>
            <CardDescription>Filtra l’archivio usando il contesto registrato.</CardDescription>
            <CardAction><Badge variant="outline">{resultLabel}</Badge></CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <nav aria-label="Filtra documenti archiviati per contesto" className={styles.filters}>
              {archiveFilters.map((filter) => {
                const active = filter.ownerType === activeArchiveFilter.ownerType;
                return (
                  <Link
                    aria-current={active ? "page" : undefined}
                    className={cn(buttonVariants({ size: "sm", variant: active ? "default" : "ghost" }), styles.filter)}
                    data-link="plain"
                    href={archiveFilterHref(filter.ownerType, preserveDashboardOrigin)}
                    key={filter.label}
                  >
                    {filter.ownerType === undefined ? <IconFilter aria-hidden="true" /> : null}
                    {filter.label}
                  </Link>
                );
              })}
            </nav>
          </CardContent>
        </Card>
      ) : <Card className={styles.filtersCard} size="sm">
        <CardHeader className="border-b">
          <CardTitle><h2>Vista documenti</h2></CardTitle>
          <CardDescription>Filtra l’elenco usando lo stato registrato.</CardDescription>
          <CardAction><Badge variant="outline">{resultLabel}</Badge></CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <nav aria-label="Filtra documenti per stato" className={styles.filters}>
            {filters.map((filter) => {
              const active = filter.status === activeFilter.status;
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={cn(buttonVariants({ size: "sm", variant: active ? "default" : "ghost" }), styles.filter)}
                  data-link="plain"
                  href={filterHref(filter.status, preserveDashboardOrigin, intentUpload)}
                  key={filter.label}
                >
                  {filter.status === undefined ? <IconFilter aria-hidden="true" /> : null}
                  {filter.label}
                </Link>
              );
            })}
          </nav>
          {!intentUpload && capabilities.canManageArchivedDocuments ? (
            <Link className={cn(buttonVariants({ size: "sm", variant: "outline" }), styles.archiveLink)} data-link="plain" href={archiveHref(preserveDashboardOrigin)}>
              <IconArchive aria-hidden="true" />Archivio documenti
            </Link>
          ) : null}
        </CardContent>
      </Card>}

      {!documents.length ? (
        <Card className={styles.results}>
          <CardContent>
            <Empty className="min-h-64 py-10">
              <EmptyHeader>
                <EmptyMedia variant="icon"><IconFileDescription /></EmptyMedia>
                <EmptyTitle>{archiveMode ? archiveOwnerType ? `Nessun documento archiviato per ${activeArchiveFilter.label.toLocaleLowerCase("it-IT")}` : "Archivio vuoto" : activeFilter.status ? `Nessun documento ${activeFilter.label.toLocaleLowerCase("it-IT")}` : "Nessun documento"}</EmptyTitle>
                <EmptyDescription>{archiveMode ? archiveOwnerType ? "Non ci sono elementi archiviati con questo contesto. Puoi tornare alla vista completa dell’archivio." : "I documenti archiviati compariranno qui e potranno essere ripristinati o eliminati definitivamente." : activeFilter.status ? "Non ci sono elementi con questo stato. Puoi tornare alla vista completa oppure registrare un nuovo documento." : "Aggiungi il primo documento per iniziare a vedere cosa è presente, scaduto o da verificare."}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <div className="flex flex-wrap justify-center gap-2">
                  {archiveMode ? <Link className={buttonVariants({ variant: "outline" })} data-link="plain" href={archiveOwnerType ? archiveFilterHref(undefined, preserveDashboardOrigin) : "/documents"}>{archiveOwnerType ? "Mostra tutto l’archivio" : "Torna ai documenti"}</Link> : activeFilter.status ? <Link className={buttonVariants({ variant: "outline" })} data-link="plain" href={filterHref(undefined, preserveDashboardOrigin, intentUpload)}>Mostra tutti</Link> : null}
                  {!archiveMode && capabilities.canCreateDocuments ? <DocumentCreateDialog canManageTypes={capabilities.canManageDocumentSettings} jobSites={jobSites} origin="documents" workers={workers} /> : null}
                </div>
              </EmptyContent>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <section aria-labelledby="documents-list-title" className={styles.results}>
          <div className="mb-3 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-medium" id="documents-list-title">{archiveMode ? archiveOwnerType ? `Elementi archiviati · ${activeArchiveFilter.label}` : "Elementi archiviati" : activeFilter.label}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{resultLabel} {documents.length === 1 ? "ordinato" : "ordinati"} dall’aggiornamento più recente.</p>
            </div>
            {intentUpload ? <Badge variant="info"><IconUpload />Selezione file</Badge> : null}
          </div>

          <div className="grid gap-3">
            {documents.map((document) => {
              const presentation = documentPresentation[document.status];
              const StatusIcon = presentation.icon;
              return (
                <Card className={styles.documentCard} data-status={document.status} key={document.id} size="sm">
                  <CardContent className="grid min-w-0 gap-4 sm:grid-cols-[auto_minmax(0,1fr)] lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
                    <div aria-hidden="true" className={cn("grid size-10 place-items-center rounded-lg", presentation.tone)}><StatusIcon className="size-5" /></div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <WorkspaceState label={documentStatusLabels[document.status]} tone={statusTone(document.status)} />
                        <span className="text-xs text-muted-foreground">{archiveMode ? <>Archiviato: {document.archivedAt ? <time dateTime={document.archivedAt}>{formatDate(document.archivedAt)}</time> : "Data non registrata"}</> : <>Scadenza: {document.expiryDate ? <time dateTime={document.expiryDate}>{formatDate(document.expiryDate)}</time> : "Non registrata"}</>}</span>
                      </div>
                      <h3 className="mt-2 [overflow-wrap:anywhere] text-base font-medium leading-snug text-foreground">{document.title}</h3>
                      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                        <div className="min-w-0"><dt className="text-xs font-medium text-muted-foreground">Contesto</dt><dd className="mt-0.5 [overflow-wrap:anywhere] font-medium">{ownerLabel(document.ownerType, document.workerId, document.jobSiteId, workers, jobSites)}</dd></div>
                        <div><dt className="text-xs font-medium text-muted-foreground">Ultimo aggiornamento</dt><dd className="mt-0.5 font-medium"><time dateTime={document.updatedAt}>{formatDate(document.updatedAt)}</time></dd></div>
                      </dl>
                    </div>
                    {archiveMode && capabilities.canManageArchivedDocuments ? (
                      <div className="grid gap-2 sm:col-start-2 lg:col-start-auto lg:min-w-72 lg:justify-self-end">
                        <DocumentDetailsDialog
                          canUploadDocumentVersions={false}
                          className="h-10 w-full"
                          contextLabel={ownerLabel(document.ownerType, document.workerId, document.jobSiteId, workers, jobSites)}
                          document={document}
                          includeFiles={false}
                          intentUpload={false}
                          readOnly
                        />
                        <ArchivedDocumentActions
                          documentId={document.id}
                          documentTitle={document.title}
                          preserveDashboardOrigin={preserveDashboardOrigin}
                        />
                      </div>
                    ) : (
                      <DocumentDetailsDialog
                        canUploadDocumentVersions={capabilities.canUploadDocumentVersions}
                        className="h-10 w-full sm:col-start-2 sm:w-fit lg:col-start-auto lg:justify-self-end"
                        contextLabel={ownerLabel(document.ownerType, document.workerId, document.jobSiteId, workers, jobSites)}
                        document={document}
                        fullPageHref={documentHref(document, preserveDashboardOrigin, intentUpload)}
                        intentUpload={intentUpload}
                      />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </WorkspacePage>
  );
}
