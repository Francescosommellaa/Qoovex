import type { Metadata } from "next";
import { IconBuildingCommunity, IconTarget, IconTools } from "@tabler/icons-react";
import { CtaBand } from "@/components/cta-band";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { Section, SectionHeading } from "@/components/section";
import { SiteShell } from "../site-chrome";

export const metadata: Metadata = {
  title: "Chi siamo - La missione di Qoovex",
  description:
    "Qoovex nasce per aiutare piccole imprese edili e clienti a documentare un lavoro con chiarezza, dalla creazione del cantiere alla cronologia condivisa.",
  alternates: { canonical: "/chi-siamo" },
  openGraph: {
    title: "Chi siamo - Qoovex",
    description: "Aiutiamo imprese edili e clienti a documentare un lavoro con chiarezza.",
    url: "/chi-siamo",
    type: "article",
  },
};

const values = [
  {
    icon: IconTarget,
    title: "Semplice e operativo",
    body: "Ogni schermata deve chiarire lo stato del lavoro e il prossimo passo, senza complessità inutili.",
  },
  {
    icon: IconTools,
    title: "Pensato per il cantiere",
    body: "Partiamo dal lavoro reale delle piccole imprese edili, non da un modello astratto.",
  },
  {
    icon: IconBuildingCommunity,
    title: "Chiaro con tutti",
    body: "Impresa e cliente devono capire ciò che è stato condiviso, con gli stessi riferimenti.",
  },
];

export default function ChiSiamoPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Chi siamo"
        title="Documentare un lavoro edile, con chiarezza"
        description="Qoovex aiuta piccole imprese edili e clienti a documentare un lavoro dalla creazione del cantiere alla sua conclusione, organizzando avanzamento, modifiche, prove e richieste."
        current="Chi siamo"
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <div className="space-y-5 text-pretty leading-relaxed text-muted-foreground">
            <p className="text-lg text-foreground">
              Crediamo che documentare un lavoro non debba essere un peso.
            </p>
            <p>
              Nelle piccole imprese edili il contesto di un lavoro si disperde spesso tra messaggi,
              foto e telefonate. Qoovex raccoglie questi elementi in un unico spazio operativo, così
              l&apos;avanzamento resta leggibile per chi lavora e per il cliente.
            </p>
            <p>
              Manteniamo il prodotto onesto: descriviamo ciò che fa oggi e teniamo separate le
              direzioni future. Qoovex organizza e documenta, ma non certifica il lavoro, non
              garantisce i pagamenti e non sostituisce consulenti o tecnici.
            </p>
          </div>
          <div className="grid gap-4">
            {values.map((value, index) => (
              <Reveal key={value.title} delay={index * 60}>
                <div className="flex gap-4 rounded-xl border border-border bg-card p-5">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40 text-foreground">
                    <value.icon className="size-5" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{value.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {value.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="muted" bordered>
        <SectionHeading
          align="center"
          eyebrow="La nostra missione"
          title="Un riferimento condiviso per ogni lavoro"
          description="Vogliamo che impresa e cliente guardino allo stesso quadro del lavoro: cosa è stato fatto, cosa è stato condiviso e cosa richiede ancora attenzione."
        />
      </Section>

      <CtaBand
        title="Costruiamo chiarezza, insieme"
        description="Attiva l'ambiente Azienda e inizia a documentare il tuo primo lavoro con Qoovex."
      />
    </SiteShell>
  );
}
