import {
  IconAlertCircle,
  IconBuilding,
  IconBuildingCommunity,
  IconCircleCheck,
  IconClock,
  IconFileAlert,
  IconUsers,
} from "@tabler/icons-react";
import { Badge } from "@qoovex/ui/components/badge";
import { buttonVariants } from "@qoovex/ui/components/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { cn } from "@qoovex/ui/lib/utils";
import Link from "next/link";
import { WorkspacePage, WorkspacePageHeader, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";
import { WorkspacePageIdentity } from "@/views/workspace/WorkspacePageIdentity";
import { documentStatusLabels, formatDate, statusTone } from "@/views/workspace/workspace-format";
import type { WorkspaceCapabilities, WorkspaceDocumentOverviewRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";
import { documentDetailsHref } from "@shared/lib/document-routes";
import { DocumentCreateDialog } from "./DocumentCreateDialog";

const areas = [
  { label: "Azienda", ownerType: "ORGANIZATION", href: "/documents/company", icon: IconBuildingCommunity },
  { label: "Lavoratori", ownerType: "WORKER", href: "/documents/workers", icon: IconUsers },
  { label: "Cantieri", ownerType: "JOB_SITE", href: "/documents/job-sites", icon: IconBuilding },
] as const;

const statusCards = [
  { label: "Mancanti", status: "MISSING", icon: IconFileAlert },
  { label: "Scaduti", status: "EXPIRED", icon: IconAlertCircle },
  { label: "In scadenza", status: "EXPIRING_SOON", icon: IconClock },
  { label: "Da verificare", status: "TO_REVIEW", icon: IconFileAlert },
  { label: "Presenti", status: "PRESENT", icon: IconCircleCheck },
] as const;

export function DocumentOverviewView({
  overview,
  capabilities,
  workers,
  jobSites,
  activeView,
}: {
  overview: WorkspaceDocumentOverviewRecord;
  capabilities: WorkspaceCapabilities;
  workers: WorkspaceWorkerRecord[];
  jobSites: WorkspaceJobSiteRecord[];
  activeView?: "attention";
}) {
  return (
    <WorkspacePage>
      <WorkspacePageIdentity label="Documenti" />
      <WorkspacePageHeader
        title="Documenti"
        description={activeView ? "Documenti scaduti, mancanti, in scadenza o da verificare nello scope autorizzato." : "Controlla per macroarea cosa è presente, cosa manca e quale situazione richiede il prossimo passo."}
        action={<div className="flex flex-wrap gap-2">{activeView ? <Link className={buttonVariants({ variant: "outline" })} href="/documents">Vista completa</Link> : null}{capabilities.canCreateDocuments ? <DocumentCreateDialog canManageTypes={capabilities.canManageDocumentSettings} jobSites={jobSites} origin="documents" workers={workers} /> : null}</div>}
      />

      {!activeView ? <section aria-labelledby="document-areas-title" className="grid gap-3">
        <div><h2 className="text-lg font-medium" id="document-areas-title">Macroaree</h2><p className="mt-1 text-sm text-muted-foreground">Ogni documento conserva una sola destinazione operativa.</p></div>
        <div className="grid gap-3 md:grid-cols-3">
          {areas.map((area) => {
            const Icon = area.icon;
            return <Card key={area.ownerType} size="sm"><CardHeader><span aria-hidden="true" className="grid size-9 place-items-center rounded-lg bg-muted"><Icon className="size-5" /></span><CardTitle><h3>{area.label}</h3></CardTitle><CardDescription>{overview.byOwner[area.ownerType]} documenti registrati</CardDescription></CardHeader><CardContent><Link className={cn(buttonVariants({ variant: "outline" }), "w-full")} href={area.href}>Apri {area.label.toLocaleLowerCase("it-IT")}</Link></CardContent></Card>;
          })}
        </div>
      </section> : null}

      {!activeView ? <section aria-labelledby="document-status-title" className="grid gap-3">
        <div><h2 className="text-lg font-medium" id="document-status-title">Stato operativo</h2><p className="mt-1 text-sm text-muted-foreground">Conteggi calcolati lato server sullo scope autorizzato.</p></div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {statusCards.map((item) => { const Icon = item.icon; return <Card key={item.status} size="sm"><CardContent className="grid gap-2"><Icon aria-hidden="true" className="size-5 text-muted-foreground" /><strong className="text-2xl font-semibold tabular-nums">{item.status === "MISSING" ? overview.missingCount : overview.byStatus[item.status]}</strong><span className="text-sm text-muted-foreground">{item.label}</span></CardContent></Card>; })}
        </div>
        {overview.unclassifiedCount ? <Card size="sm"><CardHeader><CardTitle><h3>Da classificare</h3></CardTitle><CardDescription>{overview.unclassifiedCount} elementi legacy richiedono una classificazione confermata.</CardDescription><CardAction><Link className={buttonVariants({ variant: "outline", size: "sm" })} href="/settings/documents#unclassified">Apri la coda</Link></CardAction></CardHeader></Card> : null}
      </section> : null}

      <section aria-labelledby="document-attention-title" className="grid gap-3">
        <div><h2 className="text-lg font-medium" id="document-attention-title">{activeView ? "Documenti da controllare" : "Richiede attenzione"}</h2><p className="mt-1 text-sm text-muted-foreground">Una coda ordinata per scadenza e aggiornamento, filtrata lato server.</p></div>
        <Card size="sm">
          <CardContent className="grid gap-2">
            {!overview.attention.length && !overview.missing.length ? <p className="py-6 text-center text-sm text-muted-foreground">Nessun elemento richiede attenzione nello scope corrente.</p> : null}
            {overview.attention.map((document) => <article className="flex min-w-0 flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between" key={document.id}><div className="min-w-0"><div className="flex flex-wrap gap-2"><WorkspaceState label={documentStatusLabels[document.status]} tone={statusTone(document.status)} /><Badge variant="outline">{document.categoryLabel}</Badge></div><h3 className="mt-2 [overflow-wrap:anywhere] font-medium">{document.documentTypeName ?? "Da classificare"}</h3><p className="mt-1 text-xs text-muted-foreground">{document.worker?.displayName ?? document.jobSite?.name ?? "Azienda"} · Scadenza registrata: {formatDate(document.expiryDate)}</p></div><Link className={buttonVariants({ variant: "outline", size: "sm" })} href={documentDetailsHref(document)}>Apri documento</Link></article>)}
            {overview.missing.map((item) => <article className="flex min-w-0 flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between" key={item.id}><div><WorkspaceState label="Mancante" tone="danger" /><h3 className="mt-2 font-medium">{item.documentTypeName}</h3><p className="mt-1 text-xs text-muted-foreground">{item.ownerLabel} · requisito configurato: {item.requirementName}</p></div>{capabilities.canCreateDocuments ? <Link className={buttonVariants({ variant: "outline", size: "sm" })} href={`/documents/new?origin=${item.ownerType === "WORKER" ? "worker" : item.ownerType === "JOB_SITE" ? "job-site" : "documents"}${item.workerId ? `&workerId=${item.workerId}` : ""}${item.jobSiteId ? `&jobSiteId=${item.jobSiteId}` : ""}`}>Aggiungi documento</Link> : null}</article>)}
          </CardContent>
        </Card>
      </section>

      {!activeView ? <Card size="sm"><CardHeader><CardTitle><h2>Prossimo passo operativo</h2></CardTitle><CardDescription>{overview.missingCount ? "Apri una macroarea e completa prima gli elementi mancanti configurati." : overview.byStatus.EXPIRED ? "Verifica i documenti scaduti e registra l'aggiornamento necessario." : overview.byStatus.TO_REVIEW ? "Controlla gli elementi da verificare e aggiorna il loro stato." : "Mantieni aggiornate le scadenze registrate e prepara i pacchetti quando serve una revisione."}</CardDescription><CardAction><Link className={buttonVariants({ variant: "outline", size: "sm" })} href="/document-packages">Pacchetti e condivisioni</Link></CardAction></CardHeader></Card> : null}
    </WorkspacePage>
  );
}
