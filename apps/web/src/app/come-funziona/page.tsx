import type { Metadata } from "next";
import { IconEye, IconLock, IconClock, IconHistory } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { CtaBand } from "@/components/cta-band";
import { WorkspaceTimeline } from "@/components/demo-visuals";
import { PageHero } from "@/components/page-hero";
import { ProductFrame } from "@/components/product-frame";
import { Reveal } from "@/components/reveal";
import { Section, SectionHeading } from "@/components/section";
import { SiteShell } from "../site-chrome";
import { signUpLabel, signUpUrl } from "../site-config";

export const metadata: Metadata = {
  title: "Come funziona Qoovex - Dal cantiere alla cronologia condivisa",
  description:
    "L'impresa organizza il lavoro, raccoglie gli aggiornamenti e condivide ciò che il cliente deve vedere. Modifiche, prove e richieste restano collegate al cantiere.",
  alternates: { canonical: "/come-funziona" },
  openGraph: {
    title: "Come funziona Qoovex",
    description:
      "Un flusso semplice per documentare un lavoro edile e condividere con il cliente solo ciò che serve.",
    url: "/come-funziona",
    type: "article",
  },
};

const steps = [
  {
    step: "01",
    title: "L'impresa crea e organizza il lavoro",
    body: "Il cantiere raccoglie in un unico spazio le persone coinvolte, gli step e gli aggiornamenti.",
  },
  {
    step: "02",
    title: "Raccoglie gli aggiornamenti importanti",
    body: "Note, fotografie e decisioni vengono registrate mentre il lavoro procede.",
  },
  {
    step: "03",
    title: "Condivide ciò che il cliente deve vedere",
    body: "Note, aggiornamenti e file possono restare interni oppure essere condivisi; richieste e decisioni sono visibili alle parti coinvolte.",
  },
  {
    step: "04",
    title: "Modifiche e richieste restano contestualizzate",
    body: "Una modifica proposta o una richiesta resta collegata al lavoro a cui si riferisce.",
  },
  {
    step: "05",
    title: "Fotografie e file non si perdono nelle chat",
    body: "I file restano nel cantiere o collegati alla richiesta, proposta, disaccordo o dichiarazione di pagamento a cui si riferiscono.",
  },
  {
    step: "06",
    title: "Entrambe le parti ricostruiscono ciò che è stato condiviso",
    body: "La cronologia rende più facile capire cosa è successo e cosa è ancora aperto.",
  },
];

const distinctions = [
  {
    icon: IconLock,
    title: "Resta interno",
    body: "Note di cantiere, promemoria e materiali di lavoro dell'impresa.",
  },
  {
    icon: IconEye,
    title: "Viene condiviso",
    body: "Aggiornamenti e file condivisi, insieme alle richieste e alle decisioni che coinvolgono entrambe le parti.",
  },
  {
    icon: IconClock,
    title: "Richiede una risposta",
    body: "Una modifica o una richiesta in attesa di conferma da una delle parti.",
  },
  {
    icon: IconHistory,
    title: "Resta nella cronologia",
    body: "Ciò che è stato condiviso resta ricostruibile nel tempo.",
  },
];

export default function ComeFunzionaPage() {
  return (
    <SiteShell>
      <PageHero
        current="Come funziona"
        eyebrow="Come funziona"
        title="Dal cantiere a una cronologia che entrambi possono ricostruire"
        description="Qoovex segue un flusso semplice: l'impresa organizza e documenta il lavoro, condivide ciò che serve e mantiene richieste, decisioni e passaggi di chiusura collegati allo stesso cantiere."
      />

      <Section bordered aria-labelledby="flusso-title">
        <SectionHeading
          titleId="flusso-title"
          eyebrow="Il flusso"
          title="Sei passaggi, dallo stesso spazio"
        />
        <ol className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((item, index) => (
            <Reveal as="li" key={item.step} delay={(index % 3) * 80}>
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
      </Section>

      <Section bordered tone="muted" aria-labelledby="distinzione-title">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              titleId="distinzione-title"
              eyebrow="Interno, condiviso, in attesa, cronologia"
              title="Interno, condiviso o in attesa: il contesto resta chiaro"
              description="Qoovex distingue sempre ciò che resta interno all'impresa da ciò che viene condiviso, ciò che richiede una risposta e ciò che resta nella cronologia."
            />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {distinctions.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <item.icon aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Reveal>
            <ProductFrame
              title="Ristrutturazione appartamento"
              subtitle="Cronologia · interno e condiviso a confronto"
            >
              <WorkspaceTimeline />
            </ProductFrame>
          </Reveal>
        </div>
      </Section>

      <Section aria-labelledby="limiti-title">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-card p-6 sm:p-8">
          <h2 id="limiti-title" className="text-xl font-semibold tracking-tight">
            Cosa il flusso non include
          </h2>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            Questo flusso non descrive firme qualificate, servizi di escrow, pagamenti in-app o
            certificazioni. Qoovex documenta ciò che le parti inseriscono e condividono: non
            certifica lavori o documenti e non movimenta denaro.
          </p>
        </div>
      </Section>

      <CtaBand
        title="Vedi come si applica al tuo lavoro"
        description="Scopri come impresa e cliente seguono lo stesso cantiere da due punti di vista diversi."
        primaryHref={signUpUrl}
        primaryLabel={signUpLabel}
      />
    </SiteShell>
  );
}
