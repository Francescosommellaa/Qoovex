import {
  IconArrowRight,
  IconBell,
  IconCalendarDue,
  IconChecklist,
  IconFileCheck,
  IconFolderOpen,
  IconPackage,
  IconQuote,
} from "@tabler/icons-react";
import { Badge } from "@qoovex/ui/components/badge";
import { buttonVariants } from "@qoovex/ui/components/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@qoovex/ui/components/card";
import { IllustrativeVoices } from "@/components/illustrative-voices";
import { MarketingDashboardPreview } from "@/components/marketing-dashboard-preview";
import { primaryCtaLabel, workspaceUrl } from "./site-config";
import { SiteShell } from "./site-chrome";

const sections = [
  { id: "problema", label: "Problema" },
  { id: "storia", label: "Storia" },
  { id: "riprova", label: "Scenari" },
  { id: "cosa", label: "Cosa fa" },
  { id: "faq", label: "FAQ" },
];

const problemStatements = [
  "\u201cI documenti sono sparsi tra chat, email e cartelle.\u201d",
  "\u201cMi accorgo di cosa manca quando ormai è urgente.\u201d",
  "\u201cSo che il file esiste, ma non so se è quello da controllare.\u201d",
] as const;

const illustrativeMetrics = [
  { value: "4", label: "cantieri da seguire" },
  { value: "23", label: "scadenze nel periodo" },
  { value: "7", label: "elementi da verificare" },
] as const;

const productFeatures = [
  {
    icon: IconFolderOpen,
    title: "Un contesto per ogni documento",
    description:
      "Collega file e versioni a cantieri, lavoratori e attività, invece di ricostruire ogni volta dove appartengono.",
  },
  {
    icon: IconCalendarDue,
    title: "Scadenze leggibili",
    description:
      "Riunisci le date da seguire e distingui ciò che è presente, mancante, in scadenza o da verificare.",
  },
  {
    icon: IconChecklist,
    title: "Checklist operative",
    description:
      "Trasforma una raccolta dispersa in passaggi visibili, senza introdurre requisiti normativi preimpostati.",
  },
  {
    icon: IconFileCheck,
    title: "Prove legate al lavoro",
    description:
      "Conserva evidenze e versioni nel contesto in cui servono, così la revisione parte da informazioni ordinate.",
  },
  {
    icon: IconPackage,
    title: "Pacchetti pronti per revisione",
    description:
      "Prepara raccolte consultabili e condividile con accessi circoscritti alle persone autorizzate.",
  },
  {
    icon: IconBell,
    title: "Promemoria con un motivo",
    description:
      "Vedi quale situazione richiede attenzione, perché conta e quale può essere il prossimo passo operativo.",
  },
] as const;

const faqItems = [
  {
    id: "faq-cosa-fa",
    question: "Cosa fa concretamente Qoovex?",
    answer:
      "Organizza documenti, versioni, scadenze, checklist, prove e pacchetti per cantieri e lavoratori. Mostra cosa è presente, cosa manca e cosa richiede una verifica.",
  },
  {
    id: "faq-per-chi",
    question: "Per chi è pensato?",
    answer:
      "Per piccole imprese, subappaltatori, artigiani e consulenti che devono coordinare lavoro documentale tra ufficio, persone e cantieri.",
  },
  {
    id: "faq-conformita",
    question: "Qoovex garantisce la conformità dei documenti?",
    answer:
      "No. Qoovex aiuta a organizzare e preparare contenuti per la revisione, ma non certifica persone o documenti e non sostituisce consulenti o responsabili.",
  },
  {
    id: "faq-condivisione",
    question: "Posso condividere un pacchetto con una persona esterna?",
    answer:
      "Sì. I pacchetti possono essere condivisi tramite collegamenti dedicati; la persona esterna vede soltanto gli elementi inclusi nella condivisione.",
  },
  {
    id: "faq-piani",
    question: "Dove trovo piani e condizioni di accesso?",
    answer:
      "I dettagli commerciali non sono ancora pubblicati in questa pagina. Il percorso di prova consente di valutare il prodotto prima di definire l’accesso più adatto.",
  },
] as const;

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Qoovex",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "Sistema documentale operativo per organizzare documenti, scadenze, checklist, prove e pacchetti di cantieri e lavoratori.",
      audience: {
        "@type": "Audience",
        audienceType:
          "Piccole imprese, subappaltatori, artigiani e consulenti",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ],
};

export default function HomePage() {
  return (
    <SiteShell sections={sections}>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        type="application/ld+json"
      />

      <section
        className="relative isolate -mt-20 overflow-hidden border-b pt-20"
        id="panoramica"
      >
        <div aria-hidden="true" className="marketing-hero-grid absolute inset-0 -z-10" />
        <div className="mx-auto max-w-7xl px-4 pt-20 pb-8 sm:px-6 md:pt-28 md:pb-12 lg:px-8">
          <div className="max-w-3xl">
            <Badge variant="outline">Ordine documentale operativo</Badge>
            <h1 className="mt-6 text-5xl leading-[0.98] font-semibold tracking-[-0.055em] text-balance sm:text-6xl lg:text-7xl">
              Vedi subito cosa c’è, cosa manca e cosa va verificato.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Qoovex riunisce documenti, scadenze e prove di cantiere in uno
              spazio operativo pensato per piccole imprese e subappaltatori.
            </p>
            <a
              className={buttonVariants({ className: "mt-8", size: "lg" })}
              data-cursor-label="Prova"
              data-cursor-magnetic="true"
              data-link="plain"
              href={workspaceUrl}
            >
              {primaryCtaLabel}
              <IconArrowRight data-icon="inline-end" />
            </a>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 md:pb-20 lg:px-8">
          <Card className="overflow-hidden bg-background/90 p-1 shadow-2xl backdrop-blur-sm">
            <div className="overflow-hidden rounded-lg border bg-background">
              <div className="marketing-dashboard-fade">
                <MarketingDashboardPreview />
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section
        className="marketing-section border-b bg-muted/30"
        id="problema"
      >
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
          <div className="max-w-md">
            <p className="font-mono text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Il problema
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">
              Non manca il lavoro. Manca una vista affidabile su ciò che lo
              accompagna.
            </h2>
            <p className="mt-5 leading-7 text-muted-foreground">
              Quando ogni aggiornamento vive in un posto diverso, anche una
              domanda semplice richiede tempo: cosa abbiamo, cosa manca, cosa
              dobbiamo controllare adesso?
            </p>
          </div>
          <div className="grid gap-3">
            {problemStatements.map((statement, index) => (
              <blockquote
                className="flex min-h-24 items-center gap-4 rounded-xl border bg-card p-5 text-lg font-medium tracking-tight sm:p-6 sm:text-xl"
                key={statement}
              >
                <span className="font-mono text-xs text-muted-foreground">
                  0{index + 1}
                </span>
                {statement}
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="marketing-section border-b" id="storia">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="font-mono text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Perché lo facciamo
            </p>
            <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">
              Il cantiere è concreto. Anche il lavoro documentale dovrebbe
              esserlo.
            </h2>
          </div>
          <div className="space-y-5 text-base leading-7 text-muted-foreground sm:text-lg">
            <p>
              Qoovex nasce da una convinzione semplice: le piccole imprese non
              hanno bisogno di un altro archivio da alimentare, ma di un modo
              più leggibile per capire la situazione e preparare il prossimo
              passo.
            </p>
            <p>
              Per questo separiamo ciò che è presente da ciò che manca o va
              verificato. Il sistema organizza; il giudizio resta alle persone
              responsabili.
            </p>
          </div>
        </div>
      </section>

      <section
        className="marketing-section border-b bg-foreground text-background"
        id="riprova"
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div className="max-w-xl">
              <div className="flex items-center gap-4">
                <IllustrativeVoices />
                <span className="font-mono text-xs tracking-[0.14em] text-background/60 uppercase">
                  Profili rappresentativi
                </span>
              </div>
              <IconQuote className="mt-10 size-8 text-background/50" />
              <blockquote className="mt-5 text-2xl leading-tight font-medium tracking-[-0.035em] text-balance sm:text-3xl">
                “Voglio aprire una schermata e capire da dove iniziare, senza
                ricostruire tutto da chat e cartelle.”
              </blockquote>
              <p className="mt-5 text-sm leading-6 text-background/60">
                Frase rappresentativa di un potenziale utilizzatore. Non è una
                testimonianza attribuita a un cliente Qoovex.
              </p>
            </div>

            <div>
              <div className="grid gap-px overflow-hidden rounded-xl border border-background/20 bg-background/20 sm:grid-cols-3">
                {illustrativeMetrics.map((metric) => (
                  <div className="bg-foreground p-6" key={metric.label}>
                    <p className="font-mono text-4xl font-semibold tracking-tight">
                      {metric.value}
                    </p>
                    <p className="mt-2 text-sm text-background/60">
                      {metric.label}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-4 font-mono text-xs leading-5 text-background/50">
                Scenario illustrativo per mostrare il tipo di situazione che
                Qoovex organizza. Non è un dato di utilizzo o un risultato
                cliente.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="marketing-section border-b" id="cosa">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
            <div className="max-w-md">
              <p className="font-mono text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                Cosa fa
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">
                Meno ricerca. Più contesto per decidere cosa fare.
              </h2>
              <p className="mt-5 leading-7 text-muted-foreground">
                Ogni funzione parte da un bisogno operativo concreto, senza
                promettere conformità o sostituire chi deve verificare.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {productFeatures.map(({ description, icon: Icon, title }) => (
                <Card className="min-h-56" key={title}>
                  <CardHeader>
                    <Icon className="size-5 text-muted-foreground" />
                    <CardTitle className="mt-8">{title}</CardTitle>
                    <CardDescription className="leading-6">
                      {description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="marketing-section border-b bg-muted/30" id="inizia">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-[1fr_auto] md:items-center md:py-18 lg:px-8">
          <div>
            <p className="font-mono text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Un punto da cui partire
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.035em] text-balance">
              Porta la situazione documentale in una vista che il team può
              leggere.
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

      <section className="marketing-section border-b" id="faq">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[0.7fr_1.3fr] lg:px-8">
          <div className="max-w-md">
            <p className="font-mono text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
              FAQ
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">
              Risposte chiare, prima di iniziare.
            </h2>
            <p className="mt-5 leading-7 text-muted-foreground">
              Il perimetro del prodotto, senza claim aggiunti o promesse
              implicite.
            </p>
          </div>
          <div className="divide-y rounded-xl border bg-card">
            {faqItems.map((item) => (
              <details className="group p-5 sm:p-6" id={item.id} key={item.id}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium marker:content-none">
                  {item.question}
                  <span
                    aria-hidden="true"
                    className="font-mono text-lg text-muted-foreground transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-2xl pr-8 text-sm leading-6 text-muted-foreground">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="marketing-section" aria-labelledby="closing-title">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 px-4 py-14 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div>
            <Badge variant="outline">Documenti · Scadenze · Prove</Badge>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.035em] text-balance" id="closing-title">
              Il lavoro resta alle persone. La situazione diventa leggibile.
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
