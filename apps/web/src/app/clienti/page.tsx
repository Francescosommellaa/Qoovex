import type { Metadata } from "next";
import { IconEye, IconMessage2, IconReceipt, IconTimeline } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { CtaBand } from "@/components/cta-band";
import { ReceiptCard, RequestAwaitingReply } from "@/components/demo-visuals";
import { PageHero } from "@/components/page-hero";
import { ProductFrame } from "@/components/product-frame";
import { Reveal } from "@/components/reveal";
import { Section, SectionHeading } from "@/components/section";
import { SiteShell } from "../site-chrome";

export const metadata: Metadata = {
  title: "Qoovex per i clienti - Segui il lavoro che ti riguarda",
  description:
    "Vedi ciò che l'impresa condivide sul tuo lavoro: avanzamento, aggiornamenti, richieste e riepiloghi, in un unico posto ordinato.",
  alternates: { canonical: "/clienti" },
  openGraph: {
    title: "Qoovex per i clienti",
    description: "Segui l'avanzamento del tuo lavoro con ciò che l'impresa condivide con te.",
    url: "/clienti",
    type: "article",
  },
};

const benefits = [
  {
    icon: IconEye,
    title: "Vedi solo ciò che è condiviso",
    body: "L'impresa decide cosa mostrarti. Quello che vedi è ordinato e collegato al lavoro.",
  },
  {
    icon: IconTimeline,
    title: "Un avanzamento leggibile",
    body: "La cronologia ti aiuta a capire a che punto è il lavoro e cosa è già stato fatto.",
  },
  {
    icon: IconMessage2,
    title: "Richieste che non si perdono",
    body: "Le richieste restano collegate al lavoro, così è chiaro cosa è ancora in attesa di risposta.",
  },
  {
    icon: IconReceipt,
    title: "Riepiloghi documentati",
    body: "I contenuti condivisi restano disponibili come riferimento, inserito dall'impresa.",
  },
];

export default function ClientiPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Per i clienti"
        title="Segui il lavoro che ti riguarda"
        description="Quando l'impresa lavora su Qoovex, tu ricevi un quadro ordinato del lavoro: avanzamento, aggiornamenti condivisi e richieste, senza inseguire messaggi sparsi."
        current="Clienti"
      />

      <Section>
        <SectionHeading
          eyebrow="Cosa vedi"
          title="Chiarezza su ciò che è stato condiviso"
          description="Qoovex non certifica il lavoro né garantisce i pagamenti: mostra in modo ordinato ciò che l'impresa condivide con te."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {benefits.map((item, index) => (
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
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <Reveal>
            <ProductFrame title="Richiesta condivisa">
              <RequestAwaitingReply />
            </ProductFrame>
          </Reveal>
          <Reveal delay={80}>
            <ProductFrame title="Riepilogo condiviso">
              <ReceiptCard />
            </ProductFrame>
          </Reveal>
        </div>
      </Section>

      <CtaBand
        title="Hai ricevuto un invito?"
        description="Accedi per vedere ciò che l'impresa ha condiviso con te sul tuo lavoro."
      />
    </SiteShell>
  );
}
