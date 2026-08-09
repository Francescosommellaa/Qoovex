import type { Metadata } from "next";
import {
  IconArrowRight,
  IconCamera,
  IconFileInvoice,
  IconHistory,
  IconLock,
  IconMessage2,
  IconPencil,
  IconPhoto,
  IconShare,
} from "@tabler/icons-react";
import { Badge } from "@qoovex/ui/components/badge";
import { buttonVariants } from "@qoovex/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { cn } from "@qoovex/ui/lib/utils";
import { CtaBand } from "@/components/cta-band";
import {
  ConfirmedUpdateCard,
  ReceiptCard,
  RequestAwaitingReply,
  WorkspaceTimeline,
} from "@/components/demo-visuals";
import { FaqAccordion } from "@/components/faq-accordion";
import { ProductFrame } from "@/components/product-frame";
import { Reveal } from "@/components/reveal";
import { Section, SectionHeading } from "@/components/section";
import { homeFaq } from "./content";
import { SiteShell } from "./site-chrome";
import { primaryCtaHref, primaryCtaLabel, publicSiteUrl, signInLabel, signInUrl } from "./site-config";

export const metadata: Metadata = {
  title: "Qoovex - Uno spazio condiviso per impresa e cliente",
  description:
    "Qoovex raccoglie aggiornamenti, modifiche, prove e richieste in una cronologia chiara per l'impresa e per il cliente.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Qoovex - Uno spazio condiviso per impresa e cliente",
    description:
      "Aggiornamenti, modifiche e prove restano nello stesso posto, per l'impresa e per il cliente.",
    url: publicSiteUrl,
    type: "website",
  },
};

const problems = [
  {
    icon: IconPhoto,
    title: "Foto disperse tra più telefoni",
    body: "Le immagini del cantiere finiscono in chat diverse e diventano difficili da ritrovare.",
  },
  {
    icon: IconMessage2,
    title: "Modifiche concordate nei messaggi",
    body: "Le decisioni prese a voce o in chat si perdono quando servono davvero.",
  },
  {
    icon: IconFileInvoice,
    title: "Ricevute separate dal contesto",
    body: "Documenti e pagamenti restano scollegati dal lavoro a cui si riferiscono.",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "L'impresa organizza il lavoro",
    body: "Il cantiere raccoglie aggiornamenti, step e persone coinvolte in un unico posto.",
  },
  {
    step: "02",
    title: "Condivide ciò che il cliente deve vedere",
    body: "Ogni contenuto resta interno finché non viene condiviso in modo esplicito.",
  },
  {
    step: "03",
    title: "Entrambi ricostruiscono cosa è stato condiviso",
    body: "Modifiche, prove e richieste restano collegate al lavoro e alla loro cronologia.",
  },
];

const linkedInfo = [
  { icon: IconCamera, label: "Fotografie collegate all'aggiornamento" },
  { icon: IconPencil, label: "Modifiche con lo stato della decisione" },
  { icon: IconFileInvoice, label: "Prove e documenti allegati agli step" },
  { icon: IconHistory, label: "Cronologia di ciò che è stato condiviso" },
];

// Direzione di prodotto approvata, non ancora disponibile nel prodotto.
const currentDirection = [
  {
    title: "Timeline condivisa in tempo reale",
    body: "Impresa e cliente sulla stessa cronologia del lavoro, con ciò che è stato condiviso sempre allineato.",
  },
  {
    title: "Negoziazioni tracciate",
    body: "Richieste e controproposte con lo stato della decisione, collegate allo step a cui si riferiscono.",
  },
  {
    title: "Pagamenti documentati",
    body: "Riepiloghi pronti per revisione che collegano un importo dichiarato al lavoro documentato.",
  },
  {
    title: "Chiusura reciproca",
    body: "Un momento condiviso in cui entrambe le parti confermano ciò che risulta dal lavoro.",
  },
];

export default function HomePage() {
  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div aria-hidden className="marketing-hero-grid pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-28">
          <div className="max-w-2xl">
            <Badge variant="outline">Uno spazio condiviso per impresa e cliente</Badge>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Il lavoro è in cantiere. Tutto ciò che lo racconta resta in ordine.
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Qoovex raccoglie aggiornamenti, modifiche, prove e richieste in una cronologia chiara
              per l&apos;impresa e per il cliente.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a className={cn(buttonVariants({ size: "lg" }))} href={primaryCtaHref}>
                {primaryCtaLabel}
                <IconArrowRight
                  data-icon="inline-end"
                  className="transition-transform duration-200 group-hover/button:translate-x-0.5"
                />
              </a>
              <a className={cn(buttonVariants({ variant: "ghost", size: "lg" }))} href={signInUrl}>
                {signInLabel}
              </a>
            </div>
          </div>
          <Reveal className="lg:pl-4">
            <ProductFrame
              title="Ristrutturazione appartamento"
              subtitle="Vista condivisa · impresa e cliente"
            >
              <WorkspaceTimeline />
            </ProductFrame>
          </Reveal>
        </div>
      </section>

      {/* Problema */}
      <Section bordered aria-labelledby="problema-title">
        <SectionHeading
          titleId="problema-title"
          eyebrow="Il problema"
          title="Le informazioni importanti finiscono in troppi posti"
          description="WhatsApp, telefonate, email, fotografie, ricevute e memoria delle persone. Quando serve ricostruire una decisione, il contesto non c'è più."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {problems.map((problem, index) => (
            <Reveal key={problem.title} delay={index * 80}>
              <Card className="h-full">
                <CardHeader>
                  <problem.icon aria-hidden className="size-5 text-muted-foreground" />
                  <CardTitle className="mt-2">{problem.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{problem.body}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Cambio di prospettiva */}
      <Section bordered tone="muted" aria-labelledby="prospettiva-title">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <SectionHeading
            titleId="prospettiva-title"
            eyebrow="Il cambio di prospettiva"
            title="Aggiorni una volta. Il resto resta collegato."
            description="Il cliente segue il lavoro senza rincorrere messaggi e fotografie. L'impresa lavora con più ordine senza introdurre un gestionale complicato."
          />
          <Reveal className="grid gap-3">
            <ConfirmedUpdateCard />
            <RequestAwaitingReply />
          </Reveal>
        </div>
      </Section>

      {/* Come funziona */}
      <Section bordered aria-labelledby="come-funziona-title">
        <SectionHeading
          titleId="come-funziona-title"
          eyebrow="Come funziona"
          title="Un flusso semplice, dallo stesso spazio"
          description="Distingue sempre ciò che resta interno all'impresa da ciò che viene condiviso in modo esplicito."
        />
        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {howItWorks.map((item, index) => (
            <Reveal as="li" key={item.step} delay={index * 80}>
              <Card className="h-full">
                <CardHeader>
                  <span className="font-accent text-sm text-muted-foreground">{item.step}</span>
                  <CardTitle className="mt-2">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.body}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </ol>
        <div className="mt-8">
          <a
            className={cn(buttonVariants({ variant: "outline" }))}
            href="/come-funziona"
          >
            Vedi il flusso completo
            <IconArrowRight data-icon="inline-end" className="transition-transform duration-200 group-hover/button:translate-x-0.5" />
          </a>
        </div>
      </Section>

      {/* Esperienza impresa / cliente */}
      <Section bordered tone="muted" aria-labelledby="esperienza-title">
        <SectionHeading
          titleId="esperienza-title"
          eyebrow="Per chi lavora e per chi segue i lavori"
          title="Due punti di vista, lo stesso lavoro"
        />
        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          <Reveal>
            <Card className="h-full">
              <CardHeader>
                <Badge variant="secondary" className="w-fit">
                  Per le imprese
                </Badge>
                <CardTitle className="mt-3">Un solo registro del lavoro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Aggiorna una volta e usa gli stessi contenuti per informare il cliente, gestire le
                  modifiche e rendere evidente il prossimo passo.
                </p>
                <a
                  className="group inline-flex items-center gap-1 text-sm font-medium hover:underline"
                  href="/imprese"
                >
                  Per le imprese
                  <IconArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </a>
              </CardContent>
            </Card>
          </Reveal>
          <Reveal delay={80}>
            <Card className="h-full">
              <CardHeader>
                <Badge variant="secondary" className="w-fit">
                  Per i clienti
                </Badge>
                <CardTitle className="mt-3">Solo ciò che è condiviso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Segui i lavori sui tuoi immobili, capisci cosa è cambiato e ritrova file, prove e
                  informazioni in un unico posto.
                </p>
                <a
                  className="group inline-flex items-center gap-1 text-sm font-medium hover:underline"
                  href="/clienti"
                >
                  Per i clienti
                  <IconArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </a>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </Section>

      {/* Informazioni collegate + esempi operativi */}
      <Section bordered aria-labelledby="collegate-title">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              titleId="collegate-title"
              eyebrow="Informazioni che restano collegate"
              title="Aggiornamenti, modifiche e prove nello stesso posto"
              description="Ogni contenuto è collegato al cantiere e alla sua cronologia, così è più facile capire cosa è stato condiviso e cosa richiede una risposta."
            />
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {linkedInfo.map((item) => (
                <li key={item.label} className="flex items-start gap-3 text-sm">
                  <item.icon aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
          <Reveal>
            <ProductFrame title="Richieste" subtitle="Cosa richiede attenzione">
              <div className="grid gap-3">
                <RequestAwaitingReply />
                <ConfirmedUpdateCard />
              </div>
            </ProductFrame>
          </Reveal>
        </div>
      </Section>

      {/* Principi di fiducia */}
      <Section bordered tone="muted" aria-labelledby="fiducia-title">
        <SectionHeading
          titleId="fiducia-title"
          eyebrow="Fiducia e controllo"
          title="La condivisione è sempre esplicita"
          description="Qoovex documenta ciò che le parti inseriscono. Non certifica lavori o documenti e non movimenta denaro."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: IconLock,
              title: "Interno e condiviso",
              body: "Ciò che è interno all'impresa resta interno finché non viene condiviso.",
            },
            {
              icon: IconShare,
              title: "Aziende isolate",
              body: "Ogni azienda vede soltanto il proprio spazio e i lavori autorizzati.",
            },
            {
              icon: IconHistory,
              title: "Cronologia ordinata",
              body: "Ciò che è stato condiviso resta ricostruibile nel tempo dalle parti.",
            },
          ].map((item, index) => (
            <Reveal key={item.title} delay={index * 80}>
              <Card className="h-full">
                <CardHeader>
                  <item.icon aria-hidden className="size-5 text-muted-foreground" />
                  <CardTitle className="mt-2">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.body}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
        <div className="mt-8">
          <a className={cn(buttonVariants({ variant: "outline" }))} href="/fiducia">
            Fiducia e privacy
            <IconArrowRight data-icon="inline-end" className="transition-transform duration-200 group-hover/button:translate-x-0.5" />
          </a>
        </div>
      </Section>

      {/* Direzione di prodotto (current) - non ancora disponibile */}
      <Section bordered aria-labelledby="job-site-title">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <div>
            <SectionHeading
              titleId="job-site-title"
              eyebrow="Direzione di prodotto"
              title="Dove sta andando Qoovex"
              description="Qoovex è la direzione approvata del prodotto. Queste capacità sono in sviluppo e non sono ancora disponibili: le raccontiamo per trasparenza, non come funzioni attive."
            />
            <div className="mt-6">
              <Badge variant="secondary">In sviluppo · non ancora disponibile</Badge>
            </div>
            <ul className="mt-8 grid gap-4">
              {currentDirection.map((item) => (
                <li key={item.title} className="border-l-2 border-border pl-4">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </li>
              ))}
            </ul>
          </div>
          <Reveal>
            <ProductFrame
              title="Anteprima direzione"
              subtitle="Esempio illustrativo, non una funzione attiva"
            >
              <div className="grid gap-3">
                <ReceiptCard />
                <ConfirmedUpdateCard />
              </div>
            </ProductFrame>
          </Reveal>
        </div>
      </Section>

      {/* FAQ essenziali */}
      <Section bordered tone="muted" aria-labelledby="faq-title">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeading
            titleId="faq-title"
            eyebrow="Domande frequenti"
            title="Le risposte essenziali"
            description="Le domande più comuni su cosa fa Qoovex e cosa non fa."
          />
          <div>
            <FaqAccordion items={homeFaq} />
            <div className="mt-6">
              <a
                className="group inline-flex items-center gap-1 text-sm font-medium hover:underline"
                href="/faq"
              >
                Tutte le domande frequenti
                <IconArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </div>
      </Section>

      <CtaBand
        title="Porta ordine nel prossimo cantiere"
        description="Scopri come Qoovex tiene insieme aggiornamenti, modifiche e prove per l'impresa e per il cliente."
      />
    </SiteShell>
  );
}
