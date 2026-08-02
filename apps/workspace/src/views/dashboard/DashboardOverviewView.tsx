import { IconAlertTriangle, IconAutomation, IconChecklist, IconCircleCheck, IconClockCheck, IconHandStop, IconLock, IconPlayerPlay, IconRobotOff } from "@tabler/icons-react";
import type { DashboardOverview } from "@qoovex/types";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { buttonVariants } from "@qoovex/ui/components/button";
import { cn } from "@qoovex/ui/lib/utils";
import { WorkspaceEmptyState, WorkspacePage, WorkspacePageHeader } from "@/views/workspace/WorkspacePrimitives";
import { DashboardInterventionList } from "./DashboardInterventionList";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function overviewStatus(data: DashboardOverview) {
  if (data.organization.accessMode === "SUPPORT") return {
    title: "Supporto in sola lettura",
    tone: "neutral" as const,
  };
  if (data.completeness === "PARTIAL") return {
    title: "Panoramica parziale",
    tone: "warning" as const,
  };
  if (data.interventionCount === 0) return {
    title: "Nessuna azione richiesta",
    tone: "success" as const,
  };
  return {
    title: `${data.interventionCount} ${data.interventionCount === 1 ? "azione richiesta" : "azioni richieste"}`,
    tone: "warning" as const,
  };
}

export function DashboardOverviewView({ data }: { data: DashboardOverview }) {
  const status = overviewStatus(data);
  const interventionsUnavailable = data.unavailableSections.includes("INTERVENTIONS");
  const handledResultsUnavailable = data.unavailableSections.includes("HANDLED_RESULTS");

  return (
    <WorkspacePage>
      <div className="grid w-full gap-6 lg:gap-8">
        <WorkspacePageHeader
          action={(
            <div className="border-l pl-4 sm:min-w-56">
              <p aria-live="polite" className="flex items-center gap-2 text-sm font-semibold">
                {status.tone === "success" ? <IconCircleCheck aria-hidden="true" className="size-4 text-success" /> : status.tone === "neutral" ? <IconLock aria-hidden="true" className="size-4 text-muted-foreground" /> : <IconAlertTriangle aria-hidden="true" className="size-4 text-warning" />}
                {status.title}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{data.organization.name} · {data.organization.scopeLabel}</p>
            </div>
          )}
          description="Cosa ha completato Qoovex e dove serve una tua scelta."
          title="Panoramica"
        />

        <section aria-labelledby="engine-title" className="overflow-hidden rounded-2xl border bg-card">
          <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-start gap-3">
              <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><IconAutomation className="size-5" /></span>
              <div>
                <h2 className="font-semibold tracking-tight" id="engine-title">Come lavora il motore Qoovex</h2>
                <p className="mt-1 text-sm text-muted-foreground">Usa regole e processi deterministici: non prende decisioni al posto tuo.</p>
              </div>
            </div>
            <div className="w-fit rounded-lg bg-muted px-3 py-2">
              <p className="inline-flex items-center gap-2 text-xs font-semibold"><IconRobotOff aria-hidden="true" className="size-4" />Operational Intelligence: OFF</p>
              <p className="mt-1 text-xs text-muted-foreground">Nessun provider, analisi IA o scrittura IA è attivo.</p>
            </div>
          </div>
          <ol className="grid grid-cols-3 divide-x">
            <li className="flex flex-col gap-2 px-3 py-4 sm:flex-row sm:gap-3 sm:px-5"><IconChecklist aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" /><div><p className="text-sm font-semibold">1. Trova problemi</p><p className="sr-only mt-1 text-sm text-muted-foreground sm:not-sr-only">Documenti mancanti, scadenze e dati da verificare.</p></div></li>
            <li className="flex flex-col gap-2 px-3 py-4 sm:flex-row sm:gap-3 sm:px-5"><IconPlayerPlay aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" /><div><p className="text-sm font-semibold">2. Aggiorna ciò che è certo</p><p className="sr-only mt-1 text-sm text-muted-foreground sm:not-sr-only">Riconcilia stati, scadenze, promemoria e revisioni usando dati già confermati.</p></div></li>
            <li className="flex flex-col gap-2 px-3 py-4 sm:flex-row sm:gap-3 sm:px-5"><IconHandStop aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" /><div><p className="text-sm font-semibold">3. Chiede conferma</p><p className="sr-only mt-1 text-sm text-muted-foreground sm:not-sr-only">Solo per le scelte che non può fare in sicurezza.</p></div></li>
          </ol>
        </section>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.85fr)]">
          <section aria-labelledby="dashboard-interventions-title" className="overflow-hidden rounded-2xl border bg-card">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b px-5 py-5 sm:px-6">
              <div className="grid gap-1">
                <h2 className="text-xl font-semibold tracking-tight" id="dashboard-interventions-title">Cosa serve da te</h2>
                <p className="text-sm leading-6 text-muted-foreground">Blocchi che Qoovex non può risolvere da solo.</p>
              </div>
              {!interventionsUnavailable ? <span className="text-xs font-medium tabular-nums text-muted-foreground">{data.interventionCount} {data.interventionCount === 1 ? "azione" : "azioni"}</span> : null}
            </div>
            <div className="p-4 sm:p-5">
              {interventionsUnavailable ? (
                <Alert variant="warning"><IconAlertTriangle /><AlertTitle>Interventi non disponibili</AlertTitle><AlertDescription>Non è possibile stabilire se esistono altre attività che richiedono il tuo intervento.</AlertDescription></Alert>
              ) : data.interventions.length ? (
                <DashboardInterventionList items={data.interventions} />
              ) : (
                <WorkspaceEmptyState title="Non devi fare nulla" description="Qoovex non ha trovato blocchi che richiedono una tua scelta." />
              )}
            </div>
          </section>

          <section aria-labelledby="dashboard-handled-title" className="overflow-hidden rounded-2xl border bg-card lg:sticky lg:top-6">
            <div className="border-b px-5 py-5">
              <h2 className="text-xl font-semibold tracking-tight" id="dashboard-handled-title">Cosa ha fatto Qoovex</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Operazioni completate e registrate dal motore.</p>
            </div>
            {handledResultsUnavailable ? (
              <div className="p-4"><Alert variant="warning"><IconAlertTriangle /><AlertTitle>Risultati non disponibili</AlertTitle><AlertDescription>La cronologia dei risultati non può essere caricata in questo momento.</AlertDescription></Alert></div>
            ) : data.handledResults.length ? (
              <ol className="divide-y">
                {data.handledResults.map((result) => (
                  <li className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 px-5 py-5" key={`${result.source}:${result.id}`}>
                    <span aria-hidden="true" className="mt-0.5 grid size-8 place-items-center rounded-full bg-success/10 text-success"><IconClockCheck className="size-4" /></span>
                    <div className="min-w-0">
                      <Link className="font-medium leading-5 tracking-tight" data-link="quiet" href={result.href}>{result.title}</Link>
                      {result.summary ? <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-muted-foreground">{result.summary}</p> : null}
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        {result.context ? <span>{result.context.label ?? result.context.type.replace(/_/g, " ")}</span> : null}
                        <time dateTime={result.occurredAt}>{formatDate(result.occurredAt)}</time>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="p-4"><WorkspaceEmptyState title="Nessun risultato recente" description="I risultati significativi appariranno qui quando il motore li avrà registrati." /></div>
            )}
          </section>
        </div>
      </div>
    </WorkspacePage>
  );
}

export function DashboardOverviewUnavailable() {
  return (
    <WorkspacePage>
      <div className="mx-auto grid w-full max-w-4xl gap-8">
        <WorkspacePageHeader description="La pagina non può essere caricata in questo momento." title="Panoramica" />
        <Alert variant="destructive"><IconAlertTriangle /><AlertTitle>Panoramica non disponibile</AlertTitle><AlertDescription>Non è possibile determinare se servono interventi. Riprova tra poco.</AlertDescription></Alert>
        <Link className={cn(buttonVariants({ variant: "outline" }), "w-fit min-h-10")} href="/dashboard">Riprova</Link>
      </div>
    </WorkspacePage>
  );
}
