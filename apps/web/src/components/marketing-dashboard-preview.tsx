import {
  IconAlertTriangle,
  IconBell,
  IconBuilding,
  IconCalendarDue,
  IconCheck,
  IconChecks,
  IconChevronRight,
  IconClock,
  IconFileText,
  IconFolder,
  IconLayoutDashboard,
  IconPackage,
  IconSearch,
  IconUsers,
} from "@tabler/icons-react";
import { Badge } from "@qoovex/ui/components/badge";
import { Card, CardContent } from "@qoovex/ui/components/card";

const navigationItems = [
  { label: "Panoramica", icon: IconLayoutDashboard, active: true, count: null },
  { label: "Documenti", icon: IconFileText, active: false, count: "27" },
  { label: "Scadenze", icon: IconCalendarDue, active: false, count: "4" },
  { label: "Cantieri", icon: IconBuilding, active: false, count: "4" },
  { label: "Lavoratori", icon: IconUsers, active: false, count: "12" },
  { label: "Pacchetti", icon: IconPackage, active: false, count: "2" },
] as const;

const metrics = [
  {
    label: "Da verificare",
    value: "6",
    detail: "in 3 contesti",
    icon: IconClock,
    tone: "info" as const,
  },
  {
    label: "Mancanti",
    value: "3",
    detail: "richiedono raccolta",
    icon: IconAlertTriangle,
    tone: "warning" as const,
  },
  {
    label: "In scadenza",
    value: "4",
    detail: "nei prossimi 30 giorni",
    icon: IconCalendarDue,
    tone: "warning" as const,
  },
  {
    label: "Pronti per revisione",
    value: "2",
    detail: "pacchetti preparati",
    icon: IconChecks,
    tone: "success" as const,
  },
] as const;

const priorities = [
  {
    title: "Documento identità da verificare",
    context: "Cantiere Aurora · Marco B.",
    reason: "È presente una versione precedente",
    action: "Controlla versione",
    state: "Da verificare",
    tone: "info" as const,
    icon: IconClock,
  },
  {
    title: "Prova formazione mancante",
    context: "Squadra impianti · 3 persone",
    reason: "Elemento non ancora caricato",
    action: "Richiedi prova",
    state: "Mancante",
    tone: "warning" as const,
    icon: IconAlertTriangle,
  },
  {
    title: "Pacchetto accessi preparato",
    context: "Cantiere Aurora · 12 elementi",
    reason: "Contenuti raccolti per la revisione",
    action: "Apri pacchetto",
    state: "Pronto per revisione",
    tone: "success" as const,
    icon: IconCheck,
  },
] as const;

const upcomingItems = [
  { date: "18 lug", title: "Polizza mezzi", context: "Cantiere Aurora" },
  { date: "21 lug", title: "Documento lavoratore", context: "Squadra impianti" },
  { date: "24 lug", title: "Pacchetto ingressi", context: "Cantiere Nord" },
] as const;

const recentActivity = [
  "Nuova versione caricata per Marco B.",
  "Checklist cantiere aggiornata da Giulia R.",
  "Pacchetto accessi preparato per la revisione",
] as const;

export function MarketingDashboardPreview() {
  return (
    <div
      aria-label="Anteprima dimostrativa della dashboard Qoovex con indicatori, priorità operative, prossime scadenze e attività recenti"
      className="h-[44rem] min-w-0 overflow-hidden bg-background sm:h-[46rem] lg:h-[43rem]"
      data-selection="none"
      role="img"
    >
      <div className="flex min-h-full">
        <aside className="hidden w-52 shrink-0 flex-col border-r bg-muted/20 p-4 lg:flex">
          <div className="flex items-center gap-2 border-b pb-4">
            <span className="grid size-8 place-items-center rounded-lg bg-foreground text-xs font-semibold text-background">
              ED
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">Edilnova Demo</p>
              <p className="truncate text-xs text-muted-foreground">Azienda dimostrativa</p>
            </div>
          </div>

          <nav className="mt-4 space-y-1" aria-label="Navigazione dimostrativa">
            {navigationItems.map(({ active, count, icon: Icon, label }) => (
              <div
                className={active
                  ? "flex items-center gap-2 rounded-lg bg-foreground px-2.5 py-2 text-xs font-medium text-background"
                  : "flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-muted-foreground"
                }
                key={label}
              >
                <Icon className="size-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {count ? <span className="font-mono text-[0.65rem] opacity-70">{count}</span> : null}
              </div>
            ))}
          </nav>

          <div className="mt-auto rounded-lg border bg-background p-3">
            <p className="text-xs font-medium">Quadro documentale</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[67%] rounded-full bg-success" />
            </div>
            <div className="mt-2 flex justify-between text-[0.65rem] text-muted-foreground">
              <span>18 presenti</span>
              <span>9 da seguire</span>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex min-h-14 items-center justify-between gap-4 border-b px-4 sm:px-6">
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">Edilnova Demo / Panoramica</p>
            </div>
            <div className="flex items-center gap-2">
              <div
                aria-hidden="true"
                className="hidden h-8 w-44 items-center gap-2 rounded-lg border bg-muted/25 px-3 text-xs text-muted-foreground md:flex"
              >
                <IconSearch className="size-3.5" />
                Cerca un contesto
              </div>
              <span className="grid size-8 place-items-center rounded-lg border bg-background text-muted-foreground">
                <IconBell className="size-4" />
              </span>
              <Badge variant="outline">Dati dimostrativi</Badge>
            </div>
          </header>

          <main className="space-y-5 p-4 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono text-[0.65rem] tracking-[0.14em] text-muted-foreground uppercase">Oggi</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">Situazioni operative</h2>
                <p className="mt-1 max-w-xl text-xs leading-5 text-muted-foreground sm:text-sm">
                  Stato, motivo e prossima azione nei contesti che richiedono attenzione.
                </p>
              </div>
              <p className="text-xs text-muted-foreground">Ultimo aggiornamento · 09:42</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
              {metrics.map(({ detail, icon: Icon, label, tone, value }) => (
                <Card className="min-w-0" key={label} size="sm">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs leading-4 text-muted-foreground">{label}</p>
                      <Badge className="size-6 justify-center p-0" variant={tone}>
                        <Icon className="size-3.5" />
                      </Badge>
                    </div>
                    <p className="mt-4 font-mono text-2xl font-semibold tracking-tight sm:text-3xl">{value}</p>
                    <p className="mt-1 truncate text-[0.65rem] text-muted-foreground sm:text-xs">{detail}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-3 xl:grid-cols-[1.35fr_0.65fr]">
              <Card>
                <CardContent className="p-0">
                  <div className="flex items-center justify-between border-b px-4 py-3 sm:px-5">
                    <div>
                      <h3 className="text-sm font-medium">Priorità operative</h3>
                      <p className="mt-0.5 text-[0.65rem] text-muted-foreground sm:text-xs">Ordinate per attenzione richiesta</p>
                    </div>
                    <Badge variant="outline">3 aperte</Badge>
                  </div>
                  <div className="divide-y">
                    {priorities.map(({ action, context, icon: Icon, reason, state, title, tone }) => (
                      <article className="grid gap-3 px-4 py-3.5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:px-5" key={title}>
                        <span className="hidden size-8 place-items-center rounded-lg bg-muted text-muted-foreground sm:grid">
                          <Icon className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="truncate text-xs font-medium sm:text-sm">{title}</h4>
                            <Badge variant={tone}>{state}</Badge>
                          </div>
                          <p className="mt-1 truncate text-[0.65rem] text-muted-foreground sm:text-xs">{context}</p>
                          <p className="mt-1 text-[0.65rem] text-muted-foreground/75">{reason}</p>
                        </div>
                        <span className="flex items-center gap-1 text-[0.65rem] font-medium sm:justify-end sm:text-xs">
                          {action}
                          <IconChevronRight className="size-3.5" />
                        </span>
                      </article>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="hidden gap-3 sm:grid sm:grid-cols-2 xl:grid-cols-1">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">Prossime scadenze</h3>
                      <IconCalendarDue className="size-4 text-muted-foreground" />
                    </div>
                    <div className="mt-3 divide-y">
                      {upcomingItems.map((item) => (
                        <div className="grid grid-cols-[3.25rem_1fr] gap-2 py-2.5 first:pt-0" key={`${item.date}-${item.title}`}>
                          <span className="font-mono text-[0.65rem] font-medium text-muted-foreground">{item.date}</span>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium">{item.title}</p>
                            <p className="mt-0.5 truncate text-[0.65rem] text-muted-foreground">{item.context}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <IconFolder className="size-4 text-muted-foreground" />
                      <h3 className="text-sm font-medium">Quadro documentale</h3>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-[67%] rounded-full bg-success" />
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div><p className="font-mono text-sm font-semibold">18</p><p className="text-[0.6rem] text-muted-foreground">presenti</p></div>
                      <div><p className="font-mono text-sm font-semibold">6</p><p className="text-[0.6rem] text-muted-foreground">da verificare</p></div>
                      <div><p className="font-mono text-sm font-semibold">3</p><p className="text-[0.6rem] text-muted-foreground">mancanti</p></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="hidden md:block">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Attività recenti</h3>
                  <span className="text-xs text-muted-foreground">Oggi</span>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  {recentActivity.map((activity, index) => (
                    <div className="flex gap-2 rounded-lg border bg-muted/20 p-3" key={activity}>
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-success" />
                      <div>
                        <p className="text-xs leading-5">{activity}</p>
                        <p className="mt-1 font-mono text-[0.6rem] text-muted-foreground">09:{42 - index * 7}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
