import type { Metadata } from "next";
import { IconFolders, IconShieldLock, IconTimeline, IconUsers } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { CtaBand } from "@/components/cta-band";
import { WorkspaceTimeline } from "@/components/demo-visuals";
import { PageHero } from "@/components/page-hero";
import { ProductFrame } from "@/components/product-frame";
import { Reveal } from "@/components/reveal";
import { Section, SectionHeading } from "@/components/section";
import { SiteShell } from "../site-chrome";

export const metadata: Metadata = {
  title: "Qoovex per le imprese edili - Organizza e documenta il lavoro",
  description:
    "Uno spazio operativo per piccole imprese edili: organizza i cantieri, raccogli gli aggiornamenti e condividi con il cliente solo ciò che serve.",
  alternates: { canonical: "/imprese" },
  openGraph: {
    title: "Qoovex per le imprese edili",
    description:
      "Organizza i cantieri, raccogli gli aggiornamenti e condividi con il cliente in modo tracciabile.",
    url: "/imprese",
    type: "article",
  },
};

const capabilities = [
  {
    icon: IconFolders,
    title: "Un cantiere per ogni lavoro",
    body: "Persone, step e aggiornamenti restano insieme, così ritrovi il contesto senza cercare tra chat e messaggi.",
  },
  {
    icon: IconTimeline,
    title: "Avanzamento sempre leggibile",
    body: "La cronologia mostra cosa è stato fatto, cosa è in attesa e cosa richiede attenzione.",
  },
  {
    icon: IconUsers,
    title: "Titolare e collaboratori",
    body: "Oggi l'Azienda ha due ruoli: titolare e collaboratore. Il server determina chi vede e può fare cosa.",
  },
  {
    icon: IconShieldLock,
    title: "Condivisione esplicita",
    body: "Ogni contenuto resta interno finché non decidi di condividerlo. Nessun download è pubblico.",
  },
];

const dailyJobs = [
  "Aprire un cantiere e invitare chi lavora al lavoro",
  "Registrare note, foto e decisioni mentre il cantiere procede",
  "Preparare un riepilogo pronto per la revisione del cliente",
  "Tenere insieme modifiche, prove e richieste collegate al lavoro",
];

export default function ImpresePage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Per le imprese"
        title="Organizza il lavoro e documenta ciò che conta"
        description="Qoovex aiuta le piccole imprese edili a tenere insieme cantieri, aggiornamenti e condivisioni, con un avanzamento sempre leggibile per te e per il cliente."
        current="Imprese"
      />

      <Section>
        <SectionHeading
          eyebrow="Cosa organizzi"
          title="Il cantiere come spazio operativo"
          description="Le capacità descritte qui riflettono lo stato attuale del prodotto: ruoli titolare e collaboratore, condivisione esplicita e cronologia leggibile."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {capabilities.map((item, index) => (
            <Reveal key={item.title} delay={index * 60}>
              <Card className="h-full">
                <CardHeader>
                  <div className="mb-2 flex size-9 items-center justify-center rounded-md border border-border bg-muted/40 text-foreground">
                    <item.icon className="size-5" aria-hidden />
                  </div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="muted">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              align="start"
              eyebrow="Nel lavoro di ogni giorno"
              title="Meno dispersione, più contesto"
              description="Gli aggiornamenti restano collegati al cantiere invece di frammentarsi tra strumenti diversi."
            />
            <ul className="space-y-3">
              {dailyJobs.map((job) => (
                <li key={job} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground/40" />
                  {job}
                </li>
              ))}
            </ul>
          </div>
          <Reveal>
            <ProductFrame title="Cantiere · Ristrutturazione Via Verdi">
              <WorkspaceTimeline />
            </ProductFrame>
          </Reveal>
        </div>
      </Section>

      <CtaBand
        title="Porta ordine nei tuoi cantieri"
        description="Attiva l'ambiente Azienda e inizia a documentare il primo lavoro."
      />
    </SiteShell>
  );
}
