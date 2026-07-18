import type { Metadata } from "next";
import {
  IconArrowRight,
  IconCode,
  IconDeviceDesktop,
  IconLayoutDashboard,
  IconMailCheck,
  IconShieldLock,
} from "@tabler/icons-react";
import { Badge } from "@qoovex/ui/components/badge";
import { buttonVariants } from "@qoovex/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@qoovex/ui/components/card";
import { primaryCtaLabel, workspaceUrl } from "../site-config";
import { SiteShell } from "../site-chrome";

export const metadata: Metadata = {
  title: "Novità | Qoovex",
  description:
    "Aggiornamenti verificati su prodotto, interfaccia e risorse pubbliche di Qoovex.",
};

const latestUpdate = {
  category: "Accesso e sicurezza",
  date: "2026-07-18",
  dateLabel: "18 luglio 2026",
  description:
    "Accesso, registrazione, recupero password, inviti e configurazione Azienda condividono ora una gerarchia più coerente. Anche i percorsi MFA sono più leggibili, mantenendo invariati i controlli di sicurezza e i contratti di autenticazione.",
  title: "Un percorso più chiaro, dall'ingresso alla sicurezza account.",
} as const;

const updates = [
  {
    category: "Sito pubblico",
    date: "2026-07-17",
    dateLabel: "17 luglio 2026",
    description:
      "La navigazione pubblica riunisce prodotto, pricing, contatti e risorse. Le nuove pagine aiutano a capire il perimetro di Qoovex prima di entrare nel workspace.",
    icon: IconDeviceDesktop,
    title: "Più contesto prima di iniziare una prova",
  },
  {
    category: "Interfaccia",
    date: "2026-07-16",
    dateLabel: "16 luglio 2026",
    description:
      "Web, catalogo e workspace condividono ora la stessa foundation visiva, con tema chiaro, scuro o di sistema, focus visibile e comportamenti coerenti su tastiera e touch.",
    icon: IconCode,
    title: "Una foundation unica in tutte le superfici Qoovex",
  },
  {
    category: "Dashboard",
    date: "2026-07-14",
    dateLabel: "14 luglio 2026",
    description:
      "La dashboard organizza le situazioni per stato, motivo, contesto e prossima azione. Gli errori di una sezione restano isolati, mentre accesso e permessi continuano a essere verificati a livello di pagina.",
    icon: IconLayoutDashboard,
    title: "La priorità parte dalle situazioni che richiedono attenzione",
  },
  {
    category: "Notifiche",
    date: "2026-07-13",
    dateLabel: "13 luglio 2026",
    description:
      "Preferenze, promemoria e riepiloghi email aiutano a seguire ciò che richiede attenzione senza trasformare le scadenze in requisiti normativi preimpostati.",
    icon: IconMailCheck,
    title: "Promemoria e riepiloghi seguono le preferenze dell'Azienda",
  },
] as const;

export default function UpdatesPage() {
  return (
    <SiteShell>
      <section className="relative isolate -mt-20 overflow-hidden border-b pt-20">
        <div aria-hidden="true" className="marketing-hero-grid absolute inset-0 -z-10" />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
          <Badge variant="outline">Aggiornamenti verificati</Badge>
          <h1 className="mt-6 max-w-5xl text-5xl leading-[0.98] font-semibold tracking-[-0.055em] text-balance sm:text-6xl lg:text-7xl">
            Tutto ciò che cambia, senza doverlo cercare.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Novità di prodotto, interfaccia e risorse pubbliche raccontate in
            ordine cronologico e con un perimetro concreto.
          </p>
        </div>
      </section>

      <section className="border-b bg-muted/25">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                Ultimo aggiornamento
              </p>
              <time className="mt-2 block text-sm text-muted-foreground" dateTime={latestUpdate.date}>
                {latestUpdate.dateLabel}
              </time>
            </div>
            <Badge variant="secondary">{latestUpdate.category}</Badge>
          </div>

          <Card className="grid gap-0 py-0 lg:grid-cols-[0.82fr_1.18fr]">
            <div className="flex min-h-72 flex-col justify-between bg-foreground p-6 text-background sm:p-8 lg:min-h-96">
              <IconShieldLock aria-hidden="true" className="size-8 text-background/55" />
              <p className="max-w-sm font-mono text-xs leading-5 tracking-[0.14em] text-background/55 uppercase">
                Accesso · Recupero · Inviti · MFA
              </p>
            </div>
            <div className="flex flex-col justify-center py-10 sm:py-14">
              <CardHeader>
                <CardTitle className="max-w-2xl text-3xl tracking-[-0.04em] text-balance sm:text-5xl">
                  {latestUpdate.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="mt-6">
                <CardDescription className="max-w-2xl text-base leading-7 sm:text-lg">
                  {latestUpdate.description}
                </CardDescription>
              </CardContent>
            </div>
          </Card>
        </div>
      </section>

      <section className="border-b" aria-labelledby="updates-archive-title">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.55fr_1.45fr]">
            <div className="max-w-sm">
              <p className="font-mono text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                Archivio
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl" id="updates-archive-title">
                Gli ultimi passi, in ordine.
              </h2>
              <p className="mt-5 leading-7 text-muted-foreground">
                Ogni voce descrive uno stato verificato nel repository. Non è
                una roadmap e non anticipa funzionalità non disponibili.
              </p>
            </div>

            <ol className="border-b">
              {updates.map(({ category, date, dateLabel, description, icon: Icon, title }) => (
                <li className="border-t py-8" key={date}>
                  <article className="grid gap-5 sm:grid-cols-[8.5rem_1fr] sm:gap-8">
                    <div>
                      <time className="font-mono text-xs text-muted-foreground" dateTime={date}>
                        {dateLabel}
                      </time>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-xl border bg-muted/35">
                          <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
                        </span>
                        <Badge variant="outline">{category}</Badge>
                      </div>
                      <h3 className="mt-6 max-w-2xl text-2xl font-semibold tracking-[-0.025em] text-balance">
                        {title}
                      </h3>
                      <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
                        {description}
                      </p>
                    </div>
                  </article>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section aria-labelledby="updates-closing-title" className="bg-muted/30">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 px-4 py-14 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div>
            <Badge variant="outline">Provalo nel tuo contesto</Badge>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.035em] text-balance" id="updates-closing-title">
              Le novità contano quando rendono il lavoro più leggibile.
            </h2>
          </div>
          <a
            className={buttonVariants({ size: "lg" })}
            data-cursor-label="Prova"
            data-cursor-magnetic="true"
            data-link="plain"
            href={workspaceUrl}
          >
            {primaryCtaLabel}
            <IconArrowRight data-icon="inline-end" />
          </a>
        </div>
      </section>
    </SiteShell>
  );
}
