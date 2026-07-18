import type { Metadata } from "next";
import {
  IconArrowRight,
  IconBell,
  IconCalendarDue,
  IconChecklist,
  IconFileCheck,
  IconFolderOpen,
  IconPackage,
  IconUsersGroup,
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
  title: "Storie operative | Qoovex",
  description:
    "Scenari illustrativi per vedere come imprese, subappaltatori, artigiani e consulenti possono organizzare il lavoro documentale con Qoovex.",
};

const stories = [
  {
    category: "Piccola impresa",
    description:
      "Documenti, versioni e scadenze restano collegati al cantiere corretto, così l'ufficio può partire dalla situazione invece che dalla ricerca dei file.",
    icon: IconFolderOpen,
    title: "Riunire ciò che oggi vive tra cartelle, email e chat",
  },
  {
    category: "Subappaltatore",
    description:
      "Un pacchetto circoscritto raccoglie soltanto gli elementi da condividere e mantiene il resto del workspace fuori dalla consultazione esterna.",
    icon: IconPackage,
    title: "Preparare una consegna documentale leggibile",
  },
  {
    category: "Artigiano",
    description:
      "Le date da seguire confluiscono in una vista unica che distingue ciò che è presente, in scadenza, mancante o ancora da verificare.",
    icon: IconCalendarDue,
    title: "Capire cosa richiede attenzione prima che diventi urgente",
  },
  {
    category: "Consulente",
    description:
      "Checklist e stato documentale preparano il materiale per la revisione senza trasformare il software in una certificazione o in un giudizio professionale.",
    icon: IconChecklist,
    title: "Arrivare alla verifica con il contesto già ordinato",
  },
  {
    category: "Responsabile di cantiere",
    description:
      "Le prove restano associate al lavoro, alle persone e al momento in cui sono state raccolte, invece di diventare allegati senza contesto.",
    icon: IconFileCheck,
    title: "Collegare le evidenze all'attività a cui appartengono",
  },
  {
    category: "Ufficio operativo",
    description:
      "Promemoria e attività recenti rendono visibile il prossimo passo e il motivo per cui una situazione merita attenzione.",
    icon: IconBell,
    title: "Dare al team un punto di partenza condiviso",
  },
] as const;

const featuredSteps = [
  {
    label: "Raccoglie",
    text: "file e versioni nel contesto del cantiere e del lavoratore",
  },
  {
    label: "Distingue",
    text: "ciò che è presente, mancante, in scadenza o da verificare",
  },
  {
    label: "Prepara",
    text: "una vista leggibile e pacchetti circoscritti per la revisione",
  },
] as const;

export default function StoriesPage() {
  return (
    <SiteShell>
      <section className="relative isolate -mt-20 overflow-hidden border-b pt-20">
        <div aria-hidden="true" className="marketing-hero-grid absolute inset-0 -z-10" />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
          <Badge variant="outline">Scenari illustrativi</Badge>
          <h1 className="mt-6 max-w-5xl text-5xl leading-[0.98] font-semibold tracking-[-0.055em] text-balance sm:text-6xl lg:text-7xl">
            Il lavoro cambia. La domanda resta: da dove partiamo?
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Storie operative per vedere come Qoovex può prendere forma nei
            contesti di chi coordina documenti, persone e cantieri.
          </p>
          <p className="mt-4 max-w-2xl font-mono text-xs leading-5 text-muted-foreground">
            Questi contenuti sono scenari rappresentativi, non testimonianze,
            risultati o metriche attribuiti a clienti Qoovex.
          </p>
        </div>
      </section>

      <section className="border-b bg-foreground text-background">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:px-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 text-background/60">
              <IconUsersGroup aria-hidden="true" className="size-5" />
              <span className="font-mono text-xs tracking-[0.16em] uppercase">
                Scenario in evidenza · Impresa con più cantieri
              </span>
            </div>
            <h2 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">
              Una situazione unica prima della prossima riunione operativa.
            </h2>
            <p className="mt-6 max-w-lg text-base leading-7 text-background/65">
              La squadra non deve ricordare dove cercare ogni allegato. Qoovex
              mette nello stesso contesto stato, motivo e prossimo passo; la
              verifica finale resta alle persone responsabili.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-xl border border-background/20 bg-background/20">
            {featuredSteps.map((step, index) => (
              <div className="grid gap-3 bg-foreground p-5 sm:grid-cols-[3rem_8rem_1fr] sm:items-baseline sm:p-6" key={step.label}>
                <span className="font-mono text-xs text-background/45">0{index + 1}</span>
                <strong className="text-sm font-medium">{step.label}</strong>
                <span className="text-sm leading-6 text-background/65">{step.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
            <div className="max-w-md">
              <p className="font-mono text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                Storie operative
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">
                Un prodotto, diversi punti da cui iniziare.
              </h2>
              <p className="mt-5 leading-7 text-muted-foreground">
                Ogni scenario parte da un attrito concreto e mostra il ruolo
                organizzativo del prodotto, senza inventare risultati cliente.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {stories.map(({ category, description, icon: Icon, title }) => (
                <Card className="min-h-64" key={title}>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                      <span className="grid size-10 place-items-center rounded-xl border bg-muted/40">
                        <Icon aria-hidden="true" className="size-5 text-muted-foreground" />
                      </span>
                      <span className="font-mono text-[0.6875rem] tracking-[0.12em] text-muted-foreground uppercase">
                        {category}
                      </span>
                    </div>
                    <CardTitle className="mt-8 text-xl tracking-[-0.025em]">
                      {title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <CardDescription className="leading-6">
                      {description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="stories-closing-title" className="bg-muted/30">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 px-4 py-14 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div>
            <Badge variant="outline">Documenti · Scadenze · Prove</Badge>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.035em] text-balance" id="stories-closing-title">
              Porta il tuo scenario reale in una vista che il team può leggere.
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
