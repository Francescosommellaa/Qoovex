import type { Metadata } from "next";
import { IconLock, IconServer, IconShieldLock, IconUserCheck } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { CtaBand } from "@/components/cta-band";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { Section, SectionHeading } from "@/components/section";
import { legalLinks, signUpLabel, signUpUrl } from "../site-config";
import { SiteShell } from "../site-chrome";

export const metadata: Metadata = {
  title: "Fiducia e riservatezza - Come Qoovex protegge i dati",
  description:
    "Isolamento tra Aziende, autorizzazione lato server, condivisione mediata e nessun accesso pubblico ai contenuti. Trasparenza sui limiti del prodotto.",
  alternates: { canonical: "/fiducia" },
  openGraph: {
    title: "Fiducia e riservatezza su Qoovex",
    description:
      "Isolamento tra Aziende, autorizzazione lato server e condivisione mediata dei contenuti.",
    url: "/fiducia",
    type: "article",
  },
};

const principles = [
  {
    icon: IconShieldLock,
    title: "Isolamento tra Aziende",
    body: "I dati di un'Azienda restano separati da quelli delle altre. Ogni accesso è verificato lato server.",
  },
  {
    icon: IconUserCheck,
    title: "Autorizzazione lato server",
    body: "Ruolo, permessi e ambito sono determinati dal server, non dall'interfaccia.",
  },
  {
    icon: IconServer,
    title: "Archiviazione privata",
    body: "I documenti sono conservati in modo privato. Download e condivisioni sono mediati, non pubblici.",
  },
  {
    icon: IconLock,
    title: "Condivisione esplicita",
    body: "Note, aggiornamenti e file dell'Azienda diventano visibili al cliente solo quando vengono condivisi.",
  },
];

const limits = [
  "Qoovex non certifica il lavoro e non ne verifica la qualità.",
  "Qoovex non garantisce i pagamenti e non funge da deposito di garanzia.",
  "Qoovex non sostituisce consulenti, tecnici o professionisti abilitati.",
  "Gli stati e i contenuti sono inseriti dagli utenti e restano da verificare.",
];

export default function FiduciaPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Fiducia e riservatezza"
        title="Protezione dei dati e trasparenza sui limiti"
        description="Trattiamo con cura i dati inseriti dagli utenti e siamo chiari su ciò che Qoovex non fa. La riservatezza è una scelta di progettazione, non un'aggiunta."
        current="Fiducia"
      />

      <Section>
        <SectionHeading
          eyebrow="Come proteggiamo i dati"
          title="Principi di riservatezza"
          description="Questi principi descrivono l'impostazione del prodotto. Per gli aspetti contrattuali fanno fede i documenti legali."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {principles.map((item, index) => (
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

      <Section tone="muted" bordered>
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <SectionHeading
            align="start"
            eyebrow="Cosa Qoovex non fa"
            title="Trasparenza sui limiti"
            description="Preferiamo essere chiari: Qoovex organizza e documenta, ma non certifica né garantisce."
          />
          <ul className="space-y-3">
            {limits.map((limit) => (
              <li
                key={limit}
                className="rounded-lg border border-border bg-background/60 p-4 text-sm leading-relaxed text-muted-foreground"
              >
                {limit}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Documenti"
          title="Approfondisci nelle pagine legali"
          description="Le condizioni complete sono descritte nei documenti dedicati."
        />
        <div className="flex flex-wrap gap-3">
          {legalLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {link.label}
            </a>
          ))}
        </div>
      </Section>

      <CtaBand
        title="Documenta il lavoro con riservatezza"
        description="Attiva l'ambiente Azienda: note, aggiornamenti e file possono restare interni oppure essere condivisi con il cliente."
        primaryHref={signUpUrl}
        primaryLabel={signUpLabel}
      />
    </SiteShell>
  );
}
