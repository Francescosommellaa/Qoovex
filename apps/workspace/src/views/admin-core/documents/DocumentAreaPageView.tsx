import { IconAlertCircle, IconBuilding, IconBuildingCommunity, IconCircleCheck, IconFileDescription, IconUser } from "@tabler/icons-react";
import type { DocumentOwnerType, DocumentStatus, MissingDocumentRequirementItem } from "@qoovex/types";
import { documentCategoryRegistry } from "@qoovex/types";
import { Badge } from "@qoovex/ui/components/badge";
import { buttonVariants } from "@qoovex/ui/components/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { cn } from "@qoovex/ui/lib/utils";
import Link from "next/link";
import { WorkspacePage, WorkspacePageHeader, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";
import { WorkspacePageIdentity } from "@/views/workspace/WorkspacePageIdentity";
import { documentStatusLabels, formatDate, statusTone } from "@/views/workspace/workspace-format";
import type { WorkspaceCapabilities, WorkspaceDocumentRecord, WorkspaceDocumentTypeRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";
import { documentDetailsHref } from "@shared/lib/document-routes";
import { DocumentCreateDialog } from "./DocumentCreateDialog";

const statusFilters: Array<{ label: string; status?: DocumentStatus }> = [
  { label: "Tutti" },
  { label: "Mancanti", status: "MISSING" },
  { label: "Scaduti", status: "EXPIRED" },
  { label: "In scadenza", status: "EXPIRING_SOON" },
  { label: "Da verificare", status: "TO_REVIEW" },
  { label: "Presenti", status: "PRESENT" },
];

const areaConfig = {
  ORGANIZATION: { title: "Documenti Azienda", label: "Azienda", description: "Documenti collegati all'Azienda attiva, ordinati per categoria operativa.", icon: IconBuildingCommunity, route: "/documents/company" },
  WORKER: { title: "Documenti Lavoratori", label: "Lavoratori", description: "Individua persone, categorie e stati che richiedono attenzione.", icon: IconUser, route: "/documents/workers" },
  JOB_SITE: { title: "Documenti Cantieri", label: "Cantieri", description: "Controlla categorie configurate, scadenze e documenti per ciascun cantiere.", icon: IconBuilding, route: "/documents/job-sites" },
} as const;

function statusHref(route: string, status?: DocumentStatus) {
  return status ? `${route}?status=${status}` : route;
}

function pageHref(route: string, page: number, status?: DocumentStatus, view?: "attention") {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (view) params.set("view", view);
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `${route}?${search}` : route;
}

function documentContext(document: WorkspaceDocumentRecord) {
  return document.worker?.displayName ?? document.jobSite?.name ?? "Azienda attiva";
}

export function DocumentAreaPageView({
  ownerType,
  documents,
  documentTypes,
  workers,
  jobSites,
  missing,
  capabilities,
  activeStatus,
  activeView,
  page,
  hasNextPage,
}: {
  ownerType: DocumentOwnerType;
  documents: WorkspaceDocumentRecord[];
  documentTypes: WorkspaceDocumentTypeRecord[];
  workers: WorkspaceWorkerRecord[];
  jobSites: WorkspaceJobSiteRecord[];
  missing: MissingDocumentRequirementItem[];
  capabilities: WorkspaceCapabilities;
  activeStatus?: DocumentStatus;
  activeView?: "attention";
  page: number;
  hasNextPage: boolean;
}) {
  const config = areaConfig[ownerType];
  const Icon = config.icon;
  const configuredCategories = [...new Set(documentTypes.filter((item) => item.appliesTo === ownerType && item.categoryKey !== "UNCLASSIFIED").map((item) => item.categoryKey))];
  const categoryKeys = [...new Set([...configuredCategories, ...documents.map((item) => item.categoryKey), ...missing.map((item) => item.categoryKey)])];
  const contexts = ownerType === "WORKER" ? workers.map((item) => ({ id: item.id, label: item.displayName, href: `/workers/${item.id}` })) : ownerType === "JOB_SITE" ? jobSites.map((item) => ({ id: item.id, label: item.name, href: `/job-sites/${item.id}` })) : [];

  return (
    <WorkspacePage>
      <WorkspacePageIdentity label={config.title} />
      <WorkspacePageHeader
        title={config.title}
        description={activeView ? `${config.description} La vista mostra soltanto elementi mancanti o con stato da controllare.` : config.description}
        action={<div className="flex flex-wrap gap-2"><Link className={buttonVariants({ variant: "outline" })} href={activeView ? config.route : "/documents"}>{activeView ? "Vista completa" : "Panoramica"}</Link>{capabilities.canCreateDocuments ? <DocumentCreateDialog canManageTypes={capabilities.canManageDocumentSettings} jobSites={jobSites} origin="documents" workers={workers} /> : null}</div>}
      />

      <Card size="sm"><CardHeader><span aria-hidden="true" className="grid size-9 place-items-center rounded-lg bg-muted"><Icon className="size-5" /></span><CardTitle><h2>{activeView ? `${config.label} da controllare` : config.label}</h2></CardTitle><CardDescription>{documents.length} documenti nella pagina {page} · {missing.length} elementi mancanti configurati</CardDescription></CardHeader><CardContent><nav aria-label={`Filtra ${config.title} per stato`} className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1">{statusFilters.map((filter) => <Link aria-current={!activeView && (filter.status === activeStatus || (!filter.status && !activeStatus)) ? "page" : undefined} className={cn(buttonVariants({ size: "sm", variant: !activeView && (filter.status === activeStatus || (!filter.status && !activeStatus)) ? "default" : "ghost" }), "shrink-0")} href={statusHref(config.route, filter.status)} key={filter.label}>{filter.label}</Link>)}</nav></CardContent></Card>

      {contexts.length ? <section aria-labelledby="context-summary-title" className="grid gap-3"><div><h2 className="text-lg font-medium" id="context-summary-title">Situazione per {ownerType === "WORKER" ? "lavoratore" : "cantiere"}</h2><p className="mt-1 text-sm text-muted-foreground">I conteggi dei documenti riguardano la pagina corrente e derivano dai record già caricati, senza richieste per singola card.</p></div><div className="grid gap-3 lg:grid-cols-2">{contexts.map((context) => { const contextDocuments = documents.filter((document) => (ownerType === "WORKER" ? document.workerId : document.jobSiteId) === context.id); const contextMissing = missing.filter((item) => (ownerType === "WORKER" ? item.workerId : item.jobSiteId) === context.id); const attention = contextDocuments.filter((document) => ["EXPIRED", "EXPIRING_SOON", "TO_REVIEW", "MISSING"].includes(document.status)).length + contextMissing.length; const categories = new Set([...contextDocuments.map((item) => item.categoryLabel), ...contextMissing.map((item) => item.categoryLabel)]); return <Card key={context.id} size="sm"><CardHeader><CardTitle><h3>{context.label}</h3></CardTitle><CardDescription>{contextDocuments.length} documenti in pagina · {categories.size} categorie visibili</CardDescription><CardAction>{attention ? <Badge variant="warning"><IconAlertCircle />{attention} da gestire</Badge> : <Badge variant="success"><IconCircleCheck />Nessuna attenzione</Badge>}</CardAction></CardHeader><CardContent className="grid gap-3"><div className="flex flex-wrap gap-2">{[...categories].slice(0, 4).map((category) => <Badge key={category} variant="outline">{category}</Badge>)}{contextMissing.length ? <Badge variant="destructive">{contextMissing.length} mancanti</Badge> : null}</div><Link className={buttonVariants({ variant: "outline" })} href={context.href}>Apri {ownerType === "WORKER" ? "profilo" : "cantiere"}</Link></CardContent></Card>; })}</div></section> : null}

      <section aria-labelledby="category-documents-title" className="grid gap-3"><div><h2 className="text-lg font-medium" id="category-documents-title">Documenti per categoria</h2><p className="mt-1 text-sm text-muted-foreground">Tipo, macroarea, contesto e stato restano sempre visibili.</p></div>{!documents.length && !missing.length ? <Card size="sm"><CardContent className="py-10 text-center"><IconFileDescription className="mx-auto size-7 text-muted-foreground" /><p className="mt-3 font-medium">Nessun documento in questa vista</p><p className="mt-1 text-sm text-muted-foreground">Cambia filtro oppure aggiungi un documento classificato.</p></CardContent></Card> : categoryKeys.map((categoryKey) => { const category = documentCategoryRegistry[categoryKey]; const categoryDocuments = documents.filter((document) => document.categoryKey === categoryKey); const categoryMissing = missing.filter((item) => item.categoryKey === categoryKey); if (!categoryDocuments.length && !categoryMissing.length) return null; return <Card key={categoryKey} size="sm"><CardHeader><CardTitle><h3>{category.label}</h3></CardTitle><CardDescription>{category.description}</CardDescription><CardAction><Badge variant="outline">{categoryDocuments.length} in pagina · {categoryMissing.length} mancanti</Badge></CardAction></CardHeader><CardContent className="grid gap-2">{categoryDocuments.map((document) => <article className="flex min-w-0 flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between" key={document.id}><div className="min-w-0"><div className="flex flex-wrap gap-2"><WorkspaceState label={documentStatusLabels[document.status]} tone={statusTone(document.status)} /><Badge variant="outline">{config.label} · {category.label}</Badge></div><h4 className="mt-2 [overflow-wrap:anywhere] font-medium">{document.documentTypeName ?? "Da classificare"}</h4><p className="mt-1 text-xs text-muted-foreground">{documentContext(document)} · Scadenza registrata: {formatDate(document.expiryDate)} · Aggiornato: {formatDate(document.updatedAt)}</p></div><Link className={buttonVariants({ variant: "outline", size: "sm" })} href={documentDetailsHref(document)}>Apri documento</Link></article>)}{categoryMissing.map((item) => <article className="flex flex-col gap-2 rounded-lg border border-dashed p-3" key={item.id}><WorkspaceState label="Mancante" tone="danger" /><h4 className="font-medium">{item.documentTypeName}</h4><p className="text-xs text-muted-foreground">{item.ownerLabel} · elemento configurato dall'Azienda</p></article>)}</CardContent></Card>; })}</section>

      {page > 1 || hasNextPage ? <nav aria-label={`Paginazione ${config.title}`} className="flex items-center justify-between gap-3"><span className="text-sm text-muted-foreground">Pagina {page}</span><div className="flex gap-2">{page > 1 ? <Link className={buttonVariants({ variant: "outline", size: "sm" })} href={pageHref(config.route, page - 1, activeStatus, activeView)}>Precedente</Link> : null}{hasNextPage ? <Link className={buttonVariants({ variant: "outline", size: "sm" })} href={pageHref(config.route, page + 1, activeStatus, activeView)}>Successiva</Link> : null}</div></nav> : null}
    </WorkspacePage>
  );
}
