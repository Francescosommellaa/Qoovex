import type {
  DashboardContextItem,
  DashboardPackageItem,
  DashboardResponse,
  DashboardSituation,
  DashboardSituationKind,
} from "@qoovex/types";
import {
  IconAlertCircle,
  IconArrowRight,
  IconCalendarDue,
  IconCheck,
  IconClock,
  IconFileOff,
  IconFolderOpen,
  IconSearch,
  IconShare3,
} from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Badge } from "@qoovex/ui/components/badge";
import { buttonVariants } from "@qoovex/ui/components/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@qoovex/ui/components/empty";
import { cn } from "@qoovex/ui/lib/utils";
import Link from "next/link";
import type { WorkspaceResult } from "@/views/workspace/workspace-flow-context";
import { DashboardAssignmentDialog } from "./DashboardAssignmentDialog";
import styles from "./DashboardView.module.css";

const situationPresentation = {
  EXPIRED: { badge: "destructive", icon: IconAlertCircle, tone: "bg-destructive/10 text-destructive" },
  EXPIRING_SOON: { badge: "warning", icon: IconClock, tone: "bg-warning/15 text-warning-foreground" },
  MISSING: { badge: "outline", icon: IconFileOff, tone: "bg-muted text-foreground" },
  TO_REVIEW: { badge: "info", icon: IconSearch, tone: "bg-info/10 text-info" },
} as const satisfies Record<DashboardSituationKind, { badge: "destructive" | "warning" | "outline" | "info"; icon: typeof IconAlertCircle; tone: string }>;

const summaryLinks = [
  { key: "expired", label: "Scadute", description: "Oltre la data registrata", href: "/documents?status=EXPIRED&origin=dashboard", icon: IconAlertCircle, kind: "EXPIRED" },
  { key: "expiringSoon", label: "In scadenza", description: "Da controllare a breve", href: "/documents?status=EXPIRING_SOON&origin=dashboard", icon: IconClock, kind: "EXPIRING_SOON" },
  { key: "missing", label: "Mancanti", description: "Contenuto non presente", href: "/documents?status=MISSING&origin=dashboard", icon: IconFileOff, kind: "MISSING" },
  { key: "toReview", label: "Da verificare", description: "Pronte per il controllo", href: "/documents?status=TO_REVIEW&origin=dashboard", icon: IconSearch, kind: "TO_REVIEW" },
] as const;

const resultLabels: Record<WorkspaceResult, string> = {
  "document-created": "Documento salvato.",
  "file-uploaded": "File caricato. Il documento resta da verificare.",
  "evidence-created": "Prova registrata nel contesto scelto.",
  "share-created": "Condivisione preparata per il controllo.",
  "invitation-sent": "Invito inviato.",
};

function withDashboardOrigin(href: string) {
  if (!href.startsWith("/") || href.startsWith("//")) return "/dashboard";
  return `${href}${href.includes("?") ? "&" : "?"}origin=dashboard`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("it-IT", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function DashboardHeader({ data }: { data: DashboardResponse }) {
  return (
    <header className={cn("flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between", styles.intro)}>
      <div className="min-w-0">
        <p className="text-sm font-medium text-muted-foreground">{data.organization.name}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Da fare</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Priorità, motivi e prossime azioni nei contesti che puoi consultare.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline">{data.organization.roleLabel}</Badge>
        <Badge variant="outline">{data.organization.viewLabel}</Badge>
        <span>Aggiornato alle <time dateTime={data.generatedAt}>{formatTime(data.generatedAt)}</time></span>
      </div>
    </header>
  );
}

function SectionError({ message }: { message: string }) {
  return (
    <Alert variant="destructive">
      <IconAlertCircle />
      <AlertTitle>Sezione non disponibile</AlertTitle>
      <AlertDescription>
        <p>{message}</p>
        <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "mt-3")} data-link="plain" href="/dashboard">Riprova</Link>
      </AlertDescription>
    </Alert>
  );
}

function SituationItem({ item, updated }: { item: DashboardSituation; updated: boolean }) {
  const presentation = situationPresentation[item.kind];
  const SituationIcon = presentation.icon;

  return (
    <article className={cn("grid gap-4 border-t px-4 py-5 first:border-t-0 sm:px-5", styles.queueItem)} data-kind={item.kind} data-updated={updated || undefined}>
      <div className="flex min-w-0 items-start gap-3">
        <div aria-hidden="true" className={cn("grid size-9 shrink-0 place-items-center rounded-lg", presentation.tone)}><SituationIcon className="size-4" /></div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant={presentation.badge}>{item.statusLabel}</Badge>
            {item.date ? <time className="text-xs tabular-nums text-muted-foreground" dateTime={item.date}>{formatDate(item.date)}</time> : null}
          </div>
          <h3 className="mt-2 text-base font-medium leading-snug text-foreground">{item.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.reason}</p>
          <p className="mt-2 text-sm font-medium leading-relaxed text-foreground">{item.consequence}</p>
        </div>
      </div>
      <dl className="grid gap-3 rounded-lg bg-muted/60 p-3 text-sm sm:grid-cols-2">
        <div className="min-w-0"><dt className="text-xs font-medium text-muted-foreground">Contesto</dt><dd className="mt-0.5 [overflow-wrap:anywhere] font-medium">{item.contextLabel}</dd></div>
        <div className="min-w-0">
          <dt className="text-xs font-medium text-muted-foreground">Responsabile</dt>
          <dd className="mt-1 flex flex-wrap items-center gap-2 font-medium">
            <span>{item.responsibility.label}</span>
            {item.responsibility.assignmentHref && item.contextId && (item.contextKind === "WORKER" || item.contextKind === "JOB_SITE") ? (
              <DashboardAssignmentDialog
                contextId={item.contextId}
                contextKind={item.contextKind}
                contextLabel={item.contextLabel}
                responsibilityLabel={item.responsibility.label}
              />
            ) : null}
          </dd>
        </div>
      </dl>
      <div className="flex flex-wrap items-center gap-3">
        <Link className={cn(buttonVariants({ size: "sm" }), styles.situationAction)} data-link="plain" href={withDashboardOrigin(item.action.href)}>{item.action.label}<IconArrowRight data-icon="inline-end" /></Link>
        {updated ? <Badge role="status" variant="success"><IconCheck data-icon="inline-start" />Aggiornato ora</Badge> : null}
      </div>
    </article>
  );
}

function PackageItem({ item }: { item: DashboardPackageItem }) {
  return (
    <article className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-t py-4 first:border-t-0 first:pt-0 last:pb-0">
      <div aria-hidden="true" className="grid size-8 place-items-center rounded-lg bg-success/10 text-success"><IconShare3 className="size-4" /></div>
      <div className="min-w-0">
        <Badge variant="success">{item.statusLabel}</Badge>
        <h3 className="mt-2 [overflow-wrap:anywhere] text-sm font-medium">{item.title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{item.itemCount} {item.itemCount === 1 ? "elemento" : "elementi"} · {item.shareLabel}</p>
        <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "mt-3")} data-link="plain" href={item.action.href}>{item.action.label}</Link>
      </div>
    </article>
  );
}

function ContextItem({ item }: { item: DashboardContextItem }) {
  return (
    <li className="flex flex-col gap-2 border-t py-3 first:border-t-0 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0"><strong className="block [overflow-wrap:anywhere] text-sm font-medium">{item.label}</strong><span className="text-xs text-muted-foreground">{item.situationCount} {item.situationCount === 1 ? "situazione" : "situazioni"}</span></div>
      <Link className="shrink-0 text-sm font-medium" data-link="quiet" href={item.action.href}>{item.action.label}</Link>
    </li>
  );
}

function SummaryCards({ data }: { data: DashboardResponse }) {
  return (
    <section aria-labelledby="operational-summary" className={styles.summary}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div><h2 className="text-sm font-medium" id="operational-summary">Situazioni aperte</h2><p className="mt-0.5 text-sm text-muted-foreground">La coda segue urgenza e stato registrato.</p></div>
        <Badge variant={data.attention.total > 0 ? "secondary" : "success"}>{data.attention.total} {data.attention.total === 1 ? "situazione" : "situazioni"}</Badge>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {summaryLinks.map((item) => {
          const count = data.attention.counts[item.key];
          const Icon = item.icon;
          const card = (
            <Card className="h-full" data-kind={item.kind} size="sm">
              <CardHeader>
                <CardDescription>{item.label}</CardDescription>
                <CardAction><Icon className={cn("size-4", situationPresentation[item.kind].tone.split(" ").at(-1))} /></CardAction>
                <CardTitle className="font-mono text-2xl">{count}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">{item.description}</CardContent>
            </Card>
          );
          return count > 0 ? <Link aria-label={`${count} ${item.label.toLocaleLowerCase("it-IT")}`} className={styles.summaryLink} data-link="plain" href={item.href} key={item.key}>{card}</Link> : <div className="opacity-70" key={item.key}>{card}</div>;
        })}
      </div>
    </section>
  );
}

export function DashboardView({ data, updatedId, result }: { data: DashboardResponse; updatedId?: string | null; result?: WorkspaceResult | null }) {
  const errorFor = (section: DashboardResponse["errors"][number]["section"]) => data.errors.find((error) => error.section === section);
  const attentionError = errorFor("attention");
  const sharingError = errorFor("sharing");
  const deadlinesError = errorFor("deadlines");
  const contextsError = errorFor("contexts");
  const fullError = Boolean(attentionError && deadlinesError && (!data.availability.sharing || sharingError));

  if (fullError) {
    return (
      <div className={cn("mx-auto flex w-full max-w-[96rem] flex-col gap-5", styles.page)}>
        <DashboardHeader data={data} />
        <Alert className={styles.primary} variant="destructive">
          <IconAlertCircle />
          <AlertTitle>Non riusciamo a caricare la situazione operativa</AlertTitle>
          <AlertDescription><p>I dati non sono stati modificati. Riprova tra poco.</p><Link className={cn(buttonVariants({ variant: "secondary" }), "mt-3")} data-link="plain" href="/dashboard">Riprova</Link></AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={cn("mx-auto flex w-full max-w-[96rem] flex-col gap-5 sm:gap-6", styles.page)}>
      <DashboardHeader data={data} />

      {result ? <Alert className={styles.feedback} role="status" variant="success"><IconCheck /><AlertTitle>Operazione completata</AlertTitle><AlertDescription>{resultLabels[result]}</AlertDescription></Alert> : null}

      {!attentionError ? <SummaryCards data={data} /> : null}

      {data.firstUse ? (
        <Card className={styles.primary}>
          <CardContent>
            <Empty className="py-8 sm:py-12">
              <EmptyHeader><EmptyMedia variant="icon"><IconFolderOpen /></EmptyMedia><EmptyTitle>Inizia dal primo documento</EmptyTitle><EmptyDescription>Aggiungi il primo documento e, se lo hai già, carica subito il file.</EmptyDescription></EmptyHeader>
              <EmptyContent>
                <Link className={buttonVariants()} data-link="plain" href="/documents/new?origin=dashboard">Aggiungi documento</Link>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1"><Link data-link="quiet" href="/workers/new?origin=dashboard">Aggiungi un lavoratore</Link><Link data-link="quiet" href="/job-sites/new?origin=dashboard">Aggiungi un cantiere</Link></div>
              </EmptyContent>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <div className={cn("grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.72fr)]", styles.primary)}>
          <section aria-labelledby="attention-title" className="min-w-0">
            <Card className="min-w-0">
              <CardHeader className="border-b">
                <CardTitle><h2 id="attention-title">Da fare ora</h2></CardTitle>
                <CardDescription>Le priorità principali con motivo, contesto e prossima azione.</CardDescription>
                {data.attention.total > data.attention.situations.length ? <CardAction><Link className="text-sm font-medium" data-link="quiet" href="/documents?from=dashboard">Vedi tutte</Link></CardAction> : null}
              </CardHeader>
              <CardContent className="px-0">
                {attentionError ? <div className="px-4 sm:px-5"><SectionError message={attentionError.message} /></div> : data.attention.situations.length ? (
                  <div>{data.attention.situations.map((item) => <SituationItem item={item} key={item.id} updated={Boolean(updatedId && (item.id === updatedId || item.id.endsWith(updatedId)))} />)}</div>
                ) : (
                  <Empty className="py-10"><EmptyHeader><EmptyMedia variant="icon"><IconCheck /></EmptyMedia><EmptyTitle>Nessuna azione immediata</EmptyTitle><EmptyDescription>Le prossime scadenze e i pacchetti restano disponibili nelle sezioni vicine.</EmptyDescription></EmptyHeader></Empty>
                )}
              </CardContent>
            </Card>
          </section>

          <aside className={cn("grid min-w-0 content-start gap-4", styles.secondary)} aria-label="Informazioni di supporto">
            {data.availability.sharing ? (
              <Card>
                <CardHeader><CardTitle><h2>Pronto da condividere</h2></CardTitle><CardDescription>Pacchetti disponibili per revisione.</CardDescription><CardAction><IconShare3 className="size-4 text-muted-foreground" /></CardAction></CardHeader>
                <CardContent>{sharingError ? <SectionError message={sharingError.message} /> : data.readyPackages.length ? <div>{data.readyPackages.map((item) => <PackageItem item={item} key={item.id} />)}</div> : <p className="text-sm text-muted-foreground">Nessun pacchetto pronto per revisione.</p>}<Link className="mt-4 inline-flex text-sm font-medium" data-link="quiet" href="/document-packages?from=dashboard">Vedi tutti i pacchetti</Link></CardContent>
              </Card>
            ) : null}

            <Card>
              <CardHeader><CardTitle><h2>Prossime scadenze</h2></CardTitle><CardDescription>Date registrate nei contesti visibili.</CardDescription><CardAction><IconCalendarDue className="size-4 text-muted-foreground" /></CardAction></CardHeader>
              <CardContent>
                {deadlinesError ? <SectionError message={deadlinesError.message} /> : data.upcomingDeadlines.length ? (
                  <ol className="m-0 list-none p-0">{data.upcomingDeadlines.map((deadline) => <li className="grid gap-1 border-t py-3 first:border-t-0 first:pt-0 last:pb-0" key={deadline.id}><time className="text-xs font-medium tabular-nums text-muted-foreground" dateTime={deadline.dueDate}>{formatDate(deadline.dueDate)}</time><strong className="[overflow-wrap:anywhere] text-sm font-medium">{deadline.title}</strong><span className="text-xs text-muted-foreground">{deadline.timingLabel} · {deadline.contextLabel}</span><Link className="mt-1 w-fit text-sm font-medium" data-link="quiet" href={deadline.action.href}>Apri</Link></li>)}</ol>
                ) : <p className="text-sm text-muted-foreground">Nessuna scadenza registrata da mostrare.</p>}
                <Link className="mt-4 inline-flex text-sm font-medium" data-link="quiet" href="/deadlines?from=dashboard">Vedi tutte le scadenze</Link>
              </CardContent>
            </Card>
          </aside>
        </div>
      )}

      {!data.firstUse && data.availability.contexts ? (
        <section aria-labelledby="contexts-title" className={styles.contexts}>
          <Card>
            <CardHeader><CardTitle><h2 id="contexts-title">Dove intervenire</h2></CardTitle><CardDescription>Contesti con situazioni visibili per il tuo ruolo.</CardDescription>{data.organization.role === "OWNER" || data.organization.role === "ADMIN" ? <CardAction><Link className="text-sm font-medium" data-link="quiet" href="/access?from=dashboard">Assegnazioni cantieri</Link></CardAction> : null}</CardHeader>
            <CardContent>{contextsError ? <SectionError message={contextsError.message} /> : data.contexts.length ? <ul className="m-0 list-none p-0">{data.contexts.map((item) => <ContextItem item={item} key={item.id} />)}</ul> : <p className="text-sm text-muted-foreground">Nessuna risorsa assegnata alle situazioni visibili.</p>}</CardContent>
          </Card>
        </section>
      ) : null}
    </div>
  );
}
