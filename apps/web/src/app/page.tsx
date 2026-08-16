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
import { BrandMark } from "@/components/brand-mark";
import { HeroMockupScroll } from "@/components/hero-mockup-scroll";
import { InteractiveAppMockup } from "@/components/interactive-app-mockup";
import { LinkCta } from "@/components/link-cta";
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
    body: "Note, aggiornamenti e file possono restare interni oppure essere condivisi; richieste e decisioni seguono il loro flusso tra le parti.",
  },
  {
    step: "03",
    title: "Entrambi ricostruiscono cosa è stato condiviso",
    body: "Modifiche, prove e richieste restano collegate al lavoro e alla loro cronologia.",
  },
];

const linkedInfo = [
  { icon: IconCamera, label: "Fotografie e file raccolti nel cantiere" },
  { icon: IconPencil, label: "Modifiche con lo stato della decisione" },
  { icon: IconFileInvoice, label: "Allegati collegati a richieste, proposte e pagamenti" },
  { icon: IconHistory, label: "Cronologia di ciò che è stato condiviso" },
];

const sharedWorkflow = [
  {
    title: "Timeline condivisa",
    body: "Impresa e cliente consultano la stessa cronologia condivisa, mentre le note interne restano separate.",
  },
  {
    title: "Richieste e modifiche tracciate",
    body: "Richieste, proposte e controproposte restano collegate al lavoro e allo stato della decisione.",
  },
  {
    title: "Pagamenti documentati",
    body: "Richieste, dichiarazioni e ricevute restano collegate al cantiere. Qoovex non movimenta né verifica automaticamente il denaro.",
  },
  {
    title: "Chiusura reciproca",
    body: "La chiusura procede con la conferma delle parti e resta registrata nella cronologia del lavoro.",
  },
];

export default function HomePage() {
  return (
    <SiteShell>
      {/* Hero Vercel Style 3-Column Layout */}
      <section className="relative overflow-hidden border-b pb-20 pt-28 sm:pt-36 lg:pb-28 lg:pt-40">
        <div aria-hidden className="marketing-hero-grid pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          {/* 3-Column Vercel Header */}
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_auto_0.9fr] lg:items-center">
            {/* Left Column: Headline & CTAs */}
            <div className="max-w-xl">
              <Badge variant="outline" className="px-3 py-0.5 text-[0.7rem] font-medium backdrop-blur-xs">
                Uno spazio condiviso per impresa e cliente
              </Badge>
              <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Il lavoro è in cantiere. <br className="hidden sm:inline" />
                Tutto ciò che lo racconta resta in ordine.
              </h1>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a className={cn(buttonVariants({ size: "lg" }))} href={primaryCtaHref}>
                  {primaryCtaLabel}
                  <IconArrowRight
                    aria-hidden="true"
                    data-icon="inline-end"
                    className="transition-transform duration-200 group-hover/button:translate-x-0.5"
                  />
                </a>
                <a className={cn(buttonVariants({ variant: "outline", size: "lg" }))} href={signInUrl}>
                  {signInLabel}
                </a>
              </div>
            </div>

            {/* Center Column: Iconic Qoovex Hexagon Emblem with Backlight Glow (matching Vercel screenshot) */}
            <div className="relative flex items-center justify-center py-8 lg:py-0 select-none">
              <div
                aria-hidden
                className="absolute size-72 sm:size-80 lg:size-96 rounded-full bg-foreground/15 blur-3xl pointer-events-none"
              />
              <div className="relative flex items-center justify-center">
                <svg
                  aria-hidden="true"
                  className="size-36 sm:size-48 lg:size-56 text-foreground drop-shadow-2xl transition-transform duration-700 hover:scale-105"
                  focusable="false"
                  viewBox="0 0 1100 1100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M494.574 234.885C528.872 215.038 571.128 215.038 605.426 234.885L794.574 344.335C828.872 364.181 850 400.858 850 440.55V659.45C850 699.142 828.872 735.819 794.574 755.665L605.426 865.115C571.128 884.962 528.872 884.962 494.574 865.115L305.426 755.665C271.128 735.819 250 699.142 250 659.45V440.55C250 400.858 271.128 364.181 305.426 344.335L494.574 234.885Z"
                    fill="currentColor"
                  />
                  <path
                    d="M524.135 402.946C540.14 393.685 559.86 393.685 575.865 402.946L664.135 454.023C680.14 463.284 690 480.4 690 498.923V601.077C690 619.6 680.14 636.716 664.135 645.977L575.865 697.054C559.86 706.315 540.14 706.315 524.135 697.054L435.865 645.977C419.86 636.716 410 619.6 410 601.077V498.923C410 480.4 419.86 463.284 435.865 454.023L524.135 402.946Z"
                    fill="var(--background)"
                  />
                </svg>
              </div>
            </div>

            {/* Right Column: Clean 3-Line Feature Highlight List */}
            <div className="space-y-3 lg:justify-self-end text-sm font-medium text-foreground">
              <p className="flex items-center gap-2.5">
                <span className="size-1.5 rounded-full bg-primary" />
                Per l&apos;impresa e per il cliente
              </p>
              <p className="flex items-center gap-2.5">
                <span className="size-1.5 rounded-full bg-primary" />
                Aggiornamenti, modifiche e prove
              </p>
              <p className="flex items-center gap-2.5">
                <span className="size-1.5 rounded-full bg-primary" />
                Cronologia chiara e ricostruibile
              </p>
            </div>
          </div>

          {/* Full-width Expanding Hero App Mockup */}
          <div className="mt-16 sm:mt-20 lg:mt-24">
            <Reveal className="w-full">
              <HeroMockupScroll className="mx-auto max-w-4xl lg:max-w-5xl">
                <InteractiveAppMockup />
              </HeroMockupScroll>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Problema - Vercel Bento Grid Layout (like screenshot 3) */}
      <Section bordered aria-labelledby="problema-title">
        <SectionHeading
          titleId="problema-title"
          eyebrow="Il problema"
          title="Le informazioni importanti finiscono in troppi posti"
          description="WhatsApp, telefonate, email, fotografie, ricevute e memoria delle persone. Quando serve ricostruire una decisione, il contesto non c'è più."
        />
        <div className="mt-12 bento-grid">
          {/* Bento Card 1 (Span 2) */}
          <Reveal className="bento-col-span-2">
            <div className="vercel-card h-full p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <IconPhoto aria-hidden="true" className="size-5" />
                  </div>
                  <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[0.7rem] font-medium text-rose-600 dark:text-rose-400">
                    Dispersione dati
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold tracking-tight text-foreground">
                  Foto e documenti dispersi tra più telefoni
                </h3>
                <p className="mt-2 text-muted-foreground text-sm leading-relaxed max-w-lg">
                  Le immagini del cantiere finiscono in chat diverse, email o gallerie personali. Diventa difficile ricostruire quando e come è stato documentato un lavoro.
                </p>
              </div>

              {/* Static visual chips inside card */}
              <div className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-border/60">
                <span className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs text-muted-foreground shadow-2xs">
                  <span aria-hidden="true">💬</span> WhatsApp (Chat perse)
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs text-muted-foreground shadow-2xs">
                  <span aria-hidden="true">📧</span> Email e allegati
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shadow-2xs">
                  <span aria-hidden="true">✓</span> Unificato in Qoovex
                </span>
              </div>
            </div>
          </Reveal>

          {/* Bento Card 2 */}
          <Reveal delay={80}>
            <div className="vercel-card h-full p-6 flex flex-col justify-between">
              <div>
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <IconMessage2 aria-hidden="true" className="size-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold tracking-tight text-foreground">
                  Modifiche nei messaggi
                </h3>
                <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                  Le decisioni prese a voce o in chat si dimenticano o generano contestazioni quando servono davvero.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                <span>Stato accordi</span>
                <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">Non tracciato</span>
              </div>
            </div>
          </Reveal>

          {/* Bento Card 3 */}
          <Reveal delay={160}>
            <div className="vercel-card h-full p-6 flex flex-col justify-between">
              <div>
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <IconFileInvoice aria-hidden="true" className="size-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold tracking-tight text-foreground">
                  Ricevute scollegate
                </h3>
                <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                  Documenti e ricevute di pagamento restano isolati dal lavoro e dagli stati di avanzamento reali.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                <span>Contesto</span>
                <span className="font-mono text-foreground font-semibold">Scollegato</span>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Cambio di prospettiva - Asymmetric Overlapping Cards (like screenshot 1) */}
      <Section bordered tone="muted" aria-labelledby="prospettiva-title">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <SectionHeading
              titleId="prospettiva-title"
              eyebrow="Il cambio di prospettiva"
              title="Aggiorni una volta. Il resto resta collegato."
              description="Il cliente segue il lavoro senza rincorrere messaggi e fotografie. L'impresa lavora con più ordine senza introdurre un gestionale complicato."
            />
            <ul className="mt-8 space-y-3">
              {[
                { label: "Cronologia condivisa tra le parti", desc: "Gli aggiornamenti condivisi restano nello stesso registro del lavoro." },
                { label: "Modifiche d'opera tracciate con decisione", desc: "Varianti e costi approvati o in attesa di risposta visibili chiaramente." },
                { label: "Isolamento sicuro delle note interne", desc: "L'impresa lavora con il proprio team senza esporre bozze o promemoria privati." },
              ].map((item) => (
                <li key={item.label} className="rounded-xl border bg-background/80 p-3.5">
                  <p className="font-semibold text-sm text-foreground flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary" />
                    {item.label}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground pl-3.5">{item.desc}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Overlapping Vercel Card Stack (like screenshot 1) */}
          <Reveal className="relative pt-6 pb-6">
            <div className="relative mx-auto max-w-md space-y-3">
              <div className="transform rotate-1">
                <ConfirmedUpdateCard />
              </div>
              <div className="transform -rotate-2 -mt-4 shadow-2xl">
                <RequestAwaitingReply />
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Come funziona - Interactive Step Cards */}
      <Section bordered aria-labelledby="come-funziona-title">
        <SectionHeading
          titleId="come-funziona-title"
          eyebrow="Come funziona"
          title="Un flusso semplice, dallo stesso spazio"
          description="Distingue le note e i file interni dai contenuti condivisi e dalle azioni che coinvolgono entrambe le parti."
        />
        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {howItWorks.map((item, index) => (
            <Reveal as="li" key={item.step} delay={index * 80}>
              <div className="vercel-card h-full p-6">
                <span className="font-accent text-xs font-bold text-primary tracking-widest uppercase">
                  STEP {item.step}
                </span>
                <h3 className="mt-3 text-lg font-bold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
        <div className="mt-8">
          <a
            className={cn(buttonVariants({ variant: "outline" }))}
            href="/come-funziona"
          >
            Vedi il flusso completo
            <IconArrowRight aria-hidden="true" data-icon="inline-end" className="transition-transform duration-200 group-hover/button:translate-x-0.5" />
          </a>
        </div>
      </Section>

      {/* Esperienza impresa / cliente - Asymmetric Vercel Showcase (like screenshot 2) */}
      <Section bordered tone="muted" aria-labelledby="esperienza-title">
        <SectionHeading
          titleId="esperienza-title"
          eyebrow="Per chi lavora e per chi segue i lavori"
          title="Due punti di vista, lo stesso lavoro"
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="vercel-card h-full p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <Badge variant="secondary" className="w-fit">
                  Per le imprese
                </Badge>
                <h3 className="mt-4 text-2xl font-bold text-foreground">Un solo registro del lavoro</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Aggiorna una volta e usa gli stessi contenuti per informare il cliente, gestire le
                  modifiche e rendere evidente il prossimo passo senza dover ripetere tutto nei messaggi.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-border/60">
                <LinkCta href="/imprese">
                  Per le imprese
                </LinkCta>
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="vercel-card h-full p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <Badge variant="secondary" className="w-fit">
                  Per i clienti
                </Badge>
                <h3 className="mt-4 text-2xl font-bold text-foreground">Il contesto condiviso, senza note interne</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Segui i lavori sui tuoi immobili, capisci cosa è cambiato e ritrova file, prove e
                  informazioni condivise in un unico posto ordinato e facile da ritrovare.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-border/60">
                <LinkCta href="/clienti">
                  Per i clienti
                </LinkCta>
              </div>
            </div>
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
              description="Aggiornamenti, decisioni e allegati restano collegati al cantiere, così è più facile capire cosa è stato condiviso e cosa richiede una risposta."
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
          title="Interno e condiviso restano distinti"
          description="L'Azienda controlla la visibilità di note, aggiornamenti e file; le azioni condivise restano nel contesto del lavoro. Qoovex non certifica lavori o documenti e non movimenta denaro."
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
            <IconArrowRight aria-hidden="true" data-icon="inline-end" className="transition-transform duration-200 group-hover/button:translate-x-0.5" />
          </a>
        </div>
      </Section>

      {/* Flusso condiviso disponibile nel Workspace */}
      <Section bordered aria-labelledby="job-site-title">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <div>
            <SectionHeading
              titleId="job-site-title"
              eyebrow="Dal primo accordo alla chiusura"
              title="Il lavoro resta leggibile lungo tutto il percorso"
              description="Timeline, richieste, modifiche, pagamenti documentati e chiusura reciproca vivono nello stesso cantiere. Qoovex registra ciò che le parti inseriscono e confermano, senza certificare il lavoro."
            />
            <div className="mt-6">
              <Badge variant="secondary">Parte del Workspace</Badge>
            </div>
            <ul className="mt-8 grid gap-4">
              {sharedWorkflow.map((item) => (
                <li key={item.title} className="border-l-2 border-border pl-4">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </li>
              ))}
            </ul>
          </div>
          <Reveal>
            <ProductFrame
              title="Esempio di lavoro condiviso"
              subtitle="Dati illustrativi · stati presenti nel Workspace"
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
              <LinkCta href="/faq">
                Tutte le domande frequenti
              </LinkCta>
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
