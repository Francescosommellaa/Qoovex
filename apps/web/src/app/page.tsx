import qoovexIcon from "@qoovex/brand/logo-Icon/qoovex-icona-nera-no-sfondo.svg";
import { Badge, Card, Container, Heading, Section, Stack, Text } from "@qoovex/ui/web";
import Link from "next/link";

import {
  CTASection,
  FeatureGrid,
  HeroSection,
  TrustBar
} from "../components/marketing";
import "../components/marketing/marketing.css";

/* eslint-disable @next/next/no-img-element -- Qoovex brand SVGs are canonical assets and must be rendered directly. */

type StaticSvgImport = string | { src: string };

const qoovexIconAsset = qoovexIcon as StaticSvgImport;
const qoovexIconSrc =
  typeof qoovexIconAsset === "string" ? qoovexIconAsset : qoovexIconAsset.src;

export default function RootPage() {
  return (
    <main className="marketing-page">
      <HeroSection
        eyebrow="Qoovex Event Operations"
        title="Prepara il servizio prima che diventi urgenza."
        description="Qoovex trasforma eventi, regole interne e verifiche operative in quantità, briefing e task leggibili da cucina, sala e direzione."
        primaryAction={<a className="web-action-link" data-variant="primary" href="mailto:ciao@qoovex.com">Richiedi accesso</a>}
        secondaryAction={<a className="web-action-link" href="#scope">Leggi lo scope</a>}
        trustLine="Il sistema propone. Lo chef decide."
        proofs={[
          { label: "Centro", value: "Pre-Service" },
          { label: "Output", value: "Numeri verificabili" },
          { label: "Vincolo", value: "Nessun dato inventato" }
        ]}
        visual={
          <Card className="marketing-preview" variant="glass" padding="lg" radius="lg">
            <Stack direction="row" align="center" justify="between" gap="4">
              <img src={qoovexIconSrc} width={42} height={42} alt="" aria-hidden="true" />
              <Badge tone="warning">Domani · 12:30</Badge>
            </Stack>
            <Stack gap="2">
              <Heading as="h2" size="heading-md">Comunione Rossi</Heading>
              <Text tone="muted">22 bambini · menu cotoletta · 1 senza lattosio</Text>
            </Stack>
            <div className="marketing-preview__metrics">
              {[
                ["Richiesto", "25"],
                ["Approvato", "35"],
                ["Prodotto", "38"]
              ].map(([label, value]) => (
                <Card key={label} padding="sm" radius="md">
                  <Text size="caption" tone="muted">{label}</Text>
                  <strong data-qv-numeric>{value}</strong>
                </Card>
              ))}
            </div>
          </Card>
        }
      />
      <section id="scope" aria-label="Capacità principali">
        <FeatureGrid
          features={[
            {
              icon: "01",
              title: "Regole interne verificabili",
              description: "Ogni quantità mostra input, formula, margine, arrotondamento e fonte."
            },
            {
              icon: "02",
              title: "Briefing prima del servizio",
              description: "Cucina, sala e direzione leggono la stessa realtà operativa con priorità diverse."
            },
            {
              icon: "03",
              title: "Task approvati, non rumore",
              description: "La brigata vede solo ciò che è stato deciso e assegnato prima del servizio."
            }
          ]}
        />
      </section>
      <Section aria-label="Fiducia operativa" spacing="sm">
        <Container>
          <TrustBar
            label="Progettato per"
            items={["Eventi strutturati", "Cucina e sala", "Tenant e ruoli", "Supporto auditabile"]}
          />
        </Container>
      </Section>
      <CTASection
        variant="accent"
        title="Una risposta numerica prima, la regola subito sotto."
        description="Qoovex non sostituisce la decisione dello chef: rende visibili dati, regole e conseguenze operative."
        primaryAction={<a className="web-action-link" data-variant="subtle" href="mailto:ciao@qoovex.com">Parla con Qoovex</a>}
        secondaryAction={<Link className="web-action-link" href="/legal">Apri documenti legali</Link>}
      />
    </main>
  );
}
