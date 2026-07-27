import { IconAlertTriangle, IconArrowRight, IconCircleCheck, IconClock, IconGitBranch, IconInbox } from "@tabler/icons-react";
import Link from "next/link";
import type { OperationalCenterResponse, OperationalProcessSummary } from "@qoovex/types";
import { Badge } from "@qoovex/ui/components/badge";
import { buttonVariants } from "@qoovex/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { cn } from "@qoovex/ui/lib/utils";
import { UniversalIntakeMenu } from "@features/operational-engine/ui/UniversalIntakeMenu";
import { WorkspaceEmptyState, WorkspacePage, WorkspacePageHeader, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";

const statusLabels: Record<OperationalProcessSummary["status"], string> = {
  RECEIVED: "Ricevuto", READY: "Pronto", RUNNING: "In corso", WAITING_FOR_DECISION: "Decisione richiesta",
  BLOCKED: "Bloccato", RETRY_SCHEDULED: "Retry pianificato", COMPLETED: "Completato",
  COMPLETED_WITH_EXCEPTIONS: "Completato con eccezioni", TECHNICAL_FAILURE: "Errore tecnico",
};

function ProcessList({ items, empty }: { items: OperationalProcessSummary[]; empty: string }) {
  if (!items.length) return <WorkspaceEmptyState title="Nessun processo" description={empty} />;
  return <div className="divide-y">{items.map((process) => (
    <article className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center" key={process.id}>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2"><h3 className="font-medium">{process.title}</h3><WorkspaceState label={statusLabels[process.status]} tone={process.status === "TECHNICAL_FAILURE" ? "danger" : process.status === "BLOCKED" || process.status === "WAITING_FOR_DECISION" ? "warning" : process.status === "COMPLETED" ? "good" : "info"} /></div>
        <p className="mt-1 text-sm text-muted-foreground">{process.summary ?? "Il processo conserva il contesto minimo e il prossimo passo verificabile."}</p>
        <p className="mt-2 text-xs text-muted-foreground">{process.openDecisionCount} decisioni · {process.openExceptionCount} eccezioni</p>
      </div>
      <Link className={cn(buttonVariants({ variant: "outline", size: "sm" }), "min-h-10 sm:min-h-8")} href={process.href}>Apri<IconArrowRight /></Link>
    </article>
  ))}</div>;
}

export function OperationalCenterView({ data }: { data: OperationalCenterResponse }) {
  const metrics = [
    { label: "Decisioni", value: data.counts.decisions, icon: IconInbox },
    { label: "Eccezioni", value: data.counts.exceptions, icon: IconAlertTriangle },
    { label: "Bloccati", value: data.counts.blocked, icon: IconClock },
    { label: "In lavorazione", value: data.counts.running, icon: IconGitBranch },
  ];
  return <WorkspacePage>
    <WorkspacePageHeader title="Centro operativo" description="Decisioni, eccezioni e processi nei soli contesti che puoi consultare. Le route di controllo avanzato restano disponibili nelle aree di dominio." action={<UniversalIntakeMenu role={data.organization.role} />} />
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><Badge variant="outline">{data.organization.roleLabel}</Badge><Badge variant="outline">{data.organization.viewLabel}</Badge><span>{data.organization.name}</span></div>
    <section aria-label="Riepilogo operativo" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(({ label, value, icon: Icon }) => <Card key={label}><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p></div><Icon className="size-5 text-muted-foreground" /></CardContent></Card>)}
    </section>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,.65fr)]">
      <Card><CardHeader><CardTitle>Processi attivi</CardTitle><CardDescription>Stato, blocchi e prossimo passo della lavorazione persistente.</CardDescription></CardHeader><CardContent><ProcessList items={data.activeProcesses} empty="I nuovi ingressi e il controllo continuo compariranno qui." /></CardContent></Card>
      <div className="grid content-start gap-6">
        <Card><CardHeader><CardTitle>Decisioni richieste</CardTitle><CardDescription>Conferme esplicite: Qoovex non sceglie al posto tuo.</CardDescription></CardHeader><CardContent>{data.decisions.length ? <div className="grid gap-3">{data.decisions.map((decision) => <Link className="rounded-lg border p-3 transition-colors hover:bg-muted/50" href={`/operations/${decision.processId}`} key={decision.id}><p className="font-medium">{decision.question}</p><p className="mt-1 text-sm text-muted-foreground">{decision.explanation}</p></Link>)}</div> : <p className="text-sm text-muted-foreground">Nessuna decisione aperta.</p>}</CardContent></Card>
        <Card><CardHeader><CardTitle>Eccezioni aperte</CardTitle><CardDescription>Condizioni che richiedono attenzione o una modifica nel dominio.</CardDescription></CardHeader><CardContent>{data.exceptions.length ? <div className="grid gap-3">{data.exceptions.map((exception) => <Link className="rounded-lg border p-3 transition-colors hover:bg-muted/50" href={`/operations/${exception.processId}`} key={exception.id}><p className="flex items-center gap-2 font-medium"><IconAlertTriangle className="size-4" />{exception.title}</p><p className="mt-1 text-sm text-muted-foreground">{exception.nextStep}</p></Link>)}</div> : <p className="flex items-center gap-2 text-sm text-muted-foreground"><IconCircleCheck className="size-4" />Nessuna eccezione aperta.</p>}</CardContent></Card>
      </div>
    </div>
    <Card><CardHeader><CardTitle>Risultati recenti</CardTitle><CardDescription>Timeline utente separata dagli eventi tecnici interni.</CardDescription></CardHeader><CardContent><ProcessList items={data.recentResults} empty="Nessun processo completato in questa vista." /></CardContent></Card>
  </WorkspacePage>;
}
