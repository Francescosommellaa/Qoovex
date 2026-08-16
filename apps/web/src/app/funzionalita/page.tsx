import type { Metadata } from "next";
import {
  IconArrowRight,
  IconClipboardCheck,
  IconFolders,
  IconHistory,
  IconMessage2,
  IconReceipt,
  IconShare,
} from "@tabler/icons-react";
import { Badge } from "@qoovex/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { CtaBand } from "@/components/cta-band";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { Section, SectionHeading } from "@/components/section";
import { SiteShell } from "../site-chrome";
import { signUpLabel, signUpUrl } from "../site-config";

export const metadata: Metadata = {
  title: "Funzionalità di Qoovex - Cantiere, cronologia e condivisione",
  description:
    "Le capacità attuali di Qoovex: cantiere come spazio operativo, cronologia leggibile, condivisione esplicita, richieste e riepiloghi documentati.",
  alternates: { canonical: "/funzionalita" },
  openGraph: {
    title: "Funzionalità di Qoovex",
    description: "Cantiere, cronologia, condivisione esplicita, richieste e riepiloghi documentati.",
    url: "/funzionalita",
    type: "article",
  },
};

const current = [
  {
    icon: IconFolders,
    title: "Cantiere come spazio del lavoro",
    body: "Un lavoro raccoglie persone, step e aggiornamenti in un unico posto ordinato.",
  },
  {
    icon: IconHistory,
    title: "Cronologia leggibile",
    body: "Ogni voce mostra cosa è stato fatto e quando, così l'avanzamento resta chiaro.",
  },
  {
    icon: IconShare,
    title: "Condivisione esplicita",
    body: "Note, aggiornamenti e file dell'Azienda possono restare interni oppure essere condivisi. Nessun accesso pubblico.",
  },
  {
    icon: IconMessage2,
    title: "Richieste collegate",
    body: "Le richieste restano attaccate al lavoro, con lo stato da verificare sempre visibile.",
  },
  {
    icon: IconReceipt,
    title: "Riepiloghi documentati",
    body: "Un riepilogo pronto per la revisione raccoglie ciò che è stato condiviso.",
  },
  {
    icon: IconClipboardCheck,
    title: "Ruoli titolare e collaboratore",
    body: "L'autorizzazione è decisa dal server in base al ruolo nell'Azienda.",
  },
];

const sharedLifecycle = [
  "Partecipazione del cliente ai lavori autorizzati",
  "Timeline condivisa tra impresa e cliente",
  "Richieste, proposte e pagamenti documentati",
  "Chiusura reciproca e attività post-chiusura",
];

export default function FunzionalitaPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Funzionalità"
        title="Ciò che Qoovex fa oggi, con chiarezza"
        description="Queste capacità riflettono lo stato attuale del Workspace e restano separate da ciò che Qoovex non fa: non certifica lavori e non gestisce denaro."
        current="Funzionalità"
      />

      <Section>
        <SectionHeading
          eyebrow="Disponibile oggi"
          title="Le capacità attuali"
          description="Nessuna di queste funzioni certifica il lavoro, garantisce pagamenti o sostituisce consulenti e tecnici."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {current.map((item, index) => (
            <Reveal key={item.title} delay={index * 50}>
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
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <SectionHeading
            align="start"
            eyebrow="Lungo tutto il lavoro"
            title="Dall'accordo iniziale alla chiusura"
            description="Il Workspace collega ogni passaggio al cantiere corretto. Le informazioni restano inserite e confermate dagli utenti: Qoovex non le certifica."
          />
          <ul className="grid gap-3 sm:grid-cols-2">
            {sharedLifecycle.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-lg border border-dashed border-border bg-background/60 p-4 text-sm leading-relaxed text-muted-foreground"
              >
                <Badge variant="secondary" className="mt-0.5 shrink-0">
                  Nel Workspace
                </Badge>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section>
        <Reveal>
          <div className="flex flex-col items-start gap-4 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="max-w-2xl">
              <h2 className="text-xl font-semibold tracking-tight">Vuoi vedere il flusso completo?</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                La pagina Come funziona mostra il percorso dal cantiere alla cronologia condivisa.
              </p>
            </div>
            <a
              className="group inline-flex items-center gap-2 text-sm font-medium text-foreground underline-offset-4 hover:underline"
              href="/come-funziona"
            >
              Vai a Come funziona
              <IconArrowRight
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden
              />
            </a>
          </div>
        </Reveal>
      </Section>

      <CtaBand
        title="Pronto a documentare il primo lavoro?"
        description="Attiva l'ambiente Azienda e organizza il tuo primo cantiere su Qoovex."
        primaryHref={signUpUrl}
        primaryLabel={signUpLabel}
      />
    </SiteShell>
  );
}
