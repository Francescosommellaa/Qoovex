import Link from "next/link";
import { IconAlertTriangle, IconArchive, IconBuilding, IconChevronLeft, IconChevronRight, IconSearch } from "@tabler/icons-react";
import { Badge } from "@qoovex/ui/components/badge";
import { buttonVariants } from "@qoovex/ui/components/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { Input } from "@qoovex/ui/components/input";
import { cn } from "@qoovex/ui/lib/utils";
import { jobSiteOperationalPhaseLabels, legacyJobSiteOperationalPhaseLabel } from "@qoovex/types";
import type { JobSiteListResponse } from "@qoovex/types";
import { JobSiteCreateDialog } from "./JobSiteCreateDialog";
import { WorkspaceJobSitePhaseIcon, WorkspacePage, WorkspacePageHeader, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";
import type { WorkspaceCapabilities } from "@/views/workspace/workspace-records";
import { formatDate } from "@/views/workspace/workspace-format";

const attentionLabels = {
  MISSING_DOCUMENTS: "Documenti mancanti",
  EXPIRED_DOCUMENTS: "Documenti scaduti",
  DOCUMENTS_TO_REVIEW: "Documenti da verificare",
  OPEN_CHECKLIST_ITEMS: "Checklist aperte",
  OVERDUE_DEADLINES: "Scadenze superate",
  UPCOMING_DEADLINES: "Scadenze vicine",
  NO_MANAGER: "Collaboratore non assegnato",
  NO_WORKERS: "Lavoratori assenti",
  READY_PACKAGES: "Pacchetto pronto",
} as const;

const phaseShortcuts = ["DRAFT", "PREPARATION", "IN_PROGRESS", "PAUSED", "CLOSING", "COMPLETED"] as const;

function queryHref(basePath: string, query: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) if (value !== undefined && value !== "") params.set(key, String(value));
  const suffix = params.toString();
  return suffix ? `${basePath}?${suffix}` : basePath;
}

export function JobSitesPageView({ response, capabilities, archived = false, filters }: { response: JobSiteListResponse; capabilities: WorkspaceCapabilities; archived?: boolean; filters: { search?: string; phase?: string; attention?: string } }) {
  const basePath = archived ? "/job-sites/archive" : "/job-sites/all";
  return (
    <WorkspacePage>
      <WorkspacePageHeader
        title={archived ? "Archivio cantieri" : "Tutti i cantieri"}
        description={archived ? "Consulta i cantieri archiviati senza modificare relazioni, file o condivisioni." : "Cerca e filtra l'elenco operativo completo per fase e segnali di attenzione."}
        action={!archived && capabilities.canCreateJobSites ? <JobSiteCreateDialog className="h-10 w-full sm:h-8 sm:w-auto" /> : undefined}
      />

      <nav aria-label="Viste cantieri" className="-mx-1 overflow-x-auto px-1">
        <div className="flex min-w-max gap-1 rounded-lg border bg-muted/30 p-1">
          <Link aria-current={!archived && !filters.phase ? "page" : undefined} className={buttonVariants({ size: "sm", variant: !archived && !filters.phase ? "default" : "ghost" })} href={queryHref("/job-sites/all", { search: filters.search, attention: filters.attention })}>Tutti</Link>
          {phaseShortcuts.map((phase) => <Link aria-current={!archived && filters.phase === phase ? "page" : undefined} className={buttonVariants({ size: "sm", variant: !archived && filters.phase === phase ? "default" : "ghost" })} href={queryHref("/job-sites/all", { search: filters.search, attention: filters.attention, phase })} key={phase}>{jobSiteOperationalPhaseLabels[phase]}</Link>)}
          <Link aria-current={archived ? "page" : undefined} className={buttonVariants({ size: "sm", variant: archived ? "default" : "ghost" })} href="/job-sites/archive"><IconArchive aria-hidden="true" />Archiviati</Link>
        </div>
      </nav>

      <Card size="sm">
        <CardHeader className="border-b"><CardTitle><h2>Filtri server</h2></CardTitle><CardDescription>Nome, committente e indirizzo vengono cercati sul server.</CardDescription></CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-[minmax(0,1fr)_13rem_14rem_auto]" method="get">
            <label className="grid gap-1 text-sm font-medium"><span>Ricerca</span><span className="relative"><IconSearch aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" defaultValue={filters.search} name="search" placeholder="Nome, committente, indirizzo" /></span></label>
            <label className="grid gap-1 text-sm font-medium"><span>Fase</span><select className="h-10 rounded-md border bg-background px-3 text-sm" defaultValue={filters.phase ?? ""} name="phase"><option value="">Tutte le fasi</option>{Object.entries(jobSiteOperationalPhaseLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="grid gap-1 text-sm font-medium"><span>Attenzione</span><select className="h-10 rounded-md border bg-background px-3 text-sm" defaultValue={filters.attention ?? ""} name="attention"><option value="">Qualsiasi situazione</option>{Object.entries(attentionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <button className={cn(buttonVariants(), "h-10 self-end")} type="submit">Applica</button>
          </form>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader className="border-b"><CardTitle><h2>{archived ? "Cantieri archiviati" : "Elenco operativo"}</h2></CardTitle><CardDescription>{response.total === 1 ? "1 risultato" : `${response.total} risultati`} · pagina {response.page} di {response.totalPages}</CardDescription><CardAction><Badge variant="outline">{response.total}</Badge></CardAction></CardHeader>
        <CardContent>
          {!response.items.length ? <div className="rounded-lg border border-dashed p-8 text-center"><IconBuilding aria-hidden="true" className="mx-auto size-6 text-muted-foreground" /><p className="mt-3 font-medium">Nessun cantiere trovato</p><p className="mt-1 text-sm text-muted-foreground">Modifica i filtri oppure crea il primo cantiere operativo.</p></div> : (
            <ul aria-label="Cantieri disponibili" className="divide-y divide-border">
              {response.items.map((item) => <li className="py-4 first:pt-0 last:pb-0" key={item.id}><article className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(19rem,1.1fr)_auto] lg:items-center"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><WorkspaceJobSitePhaseIcon phase={item.operationalPhase} /><h3 className="[overflow-wrap:anywhere] font-medium">{item.name}</h3><WorkspaceState label={item.operationalPhase ? jobSiteOperationalPhaseLabels[item.operationalPhase] : legacyJobSiteOperationalPhaseLabel} tone={item.operationalPhase === "PAUSED" ? "warning" : item.operationalPhase === "COMPLETED" ? "good" : "info"} /></div><p className="mt-1 text-sm text-muted-foreground">{item.clientName || "Committente non indicato"} · {item.address || "Indirizzo non registrato"}</p></div><div className="min-w-0"><dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4"><div><dt className="text-muted-foreground">Documenti</dt><dd className="font-medium tabular-nums">{item.summary.missingDocuments + item.summary.expiredDocuments + item.summary.documentsToReview} da gestire</dd></div><div><dt className="text-muted-foreground">Checklist</dt><dd className="font-medium tabular-nums">{item.summary.openChecklistItems + item.summary.checklistItemsToReview} aperte</dd></div><div><dt className="text-muted-foreground">Persone</dt><dd className="font-medium tabular-nums">{item.summary.managerCount} resp. · {item.summary.workerCount} lav.</dd></div><div><dt className="text-muted-foreground">Prossima scadenza</dt><dd className="truncate font-medium">{item.summary.nextDeadline ? formatDate(item.summary.nextDeadline.dueDate) : "Nessuna"}</dd></div></dl><div className="mt-2 flex min-w-0 flex-wrap gap-1.5">{item.summary.attentionStates.length ? item.summary.attentionStates.slice(0, 3).map((state) => <Badge key={state} variant={state === "EXPIRED_DOCUMENTS" || state === "OVERDUE_DEADLINES" ? "destructive" : "outline"}>{attentionLabels[state]}</Badge>) : <Badge variant="success">Nessuna criticita rilevata</Badge>}{item.summary.attentionStates.length > 3 ? <Badge variant="outline">+{item.summary.attentionStates.length - 3}</Badge> : null}</div></div><Link className={cn(buttonVariants({ size: "sm", variant: "outline" }), "h-10 lg:h-8")} href={`/job-sites/${item.id}`}>{item.summary.attentionScore > 0 ? <IconAlertTriangle aria-hidden="true" /> : <IconBuilding aria-hidden="true" />}Apri</Link></article></li>)}
            </ul>
          )}
        </CardContent>
      </Card>

      <nav aria-label="Paginazione cantieri" className="flex items-center justify-between gap-3"><Link aria-disabled={response.page <= 1} className={cn(buttonVariants({ variant: "outline" }), response.page <= 1 && "pointer-events-none opacity-50")} href={queryHref(basePath, { ...filters, page: Math.max(1, response.page - 1) })}><IconChevronLeft aria-hidden="true" />Precedente</Link><span className="text-sm text-muted-foreground">Pagina {response.page} di {response.totalPages}</span><Link aria-disabled={response.page >= response.totalPages} className={cn(buttonVariants({ variant: "outline" }), response.page >= response.totalPages && "pointer-events-none opacity-50")} href={queryHref(basePath, { ...filters, page: Math.min(response.totalPages, response.page + 1) })}>Successiva<IconChevronRight aria-hidden="true" /></Link></nav>
    </WorkspacePage>
  );
}
