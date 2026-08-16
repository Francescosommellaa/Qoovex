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
import { signInUrl } from "../site-config";

export const metadata: Metadata = {
  title: "Qoovex per i clienti - Segui il lavoro che ti riguarda",
  description:
    "Segui ciò che viene condiviso sul tuo lavoro e gestisci richieste, decisioni e dichiarazioni documentate in un unico posto ordinato.",
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
    title: "Vedi il lavoro condiviso",
    body: "Trovi ciò che l'impresa condivide e le attività scambiate tra le parti; le note interne dell'Azienda restano separate.",
  },
  {
    icon: IconTimeline,
    title: "Un avanzamento leggibile",
    body: "La Panoramica mostra stato e prossimo passo; la cronologia condivisa aiuta a ricostruire cosa è successo.",
  },
  {
    icon: IconMessage2,
    title: "Richieste che non si perdono",
    body: "Puoi aprire o rispondere a una richiesta nel lavoro corretto e vedere chi deve intervenire.",
  },
  {
    icon: IconReceipt,
    title: "Decisioni e pagamenti documentati",
    body: "Puoi rivedere il riepilogo iniziale, valutare le proposte e dichiarare un pagamento richiesto, senza spostare denaro su Qoovex.",
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
          description="Qoovex ordina ciò che le parti condividono e decidono nel lavoro. Non certifica il lavoro né garantisce i pagamenti."
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
        title="Hai già accesso a un lavoro?"
        description="Accedi al Workspace per ritrovare i lavori a cui hai già aderito. Per un nuovo invito, usa il collegamento ricevuto dall'Azienda."
        primaryHref={signInUrl}
        primaryLabel="Accedi al Workspace"
        secondaryHref={null}
      />
    </SiteShell>
  );
}
