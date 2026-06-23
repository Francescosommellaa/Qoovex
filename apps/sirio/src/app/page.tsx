"use client";

import { ArrowRight, Brain, Calculator, CheckCircle, Desktop, DeviceMobile } from "@phosphor-icons/react";
import {
  Badge,
  Button,
  CalculationTrace,
  Card,
  Container,
  DataPanel,
  Grid,
  Heading,
  MetricCard,
  PageHeader,
  QuantityStatus,
  Section,
  SectionHeader,
  Stack,
  StatusBadge,
  Surface,
  Text
} from "@qoovex/ui/web";
import Link from "next/link";

import { preparationFixture as prep } from "./event-data";

const cycle = ["Insegna", "Struttura", "Calcola", "Propone", "Chef approva", "Brigata produce", "Verifica"];

const scopeCards = [
  {
    eyebrow: "Dentro",
    title: "Conoscenza applicata",
    description: "Eventi, regole, calcoli, briefing, proposte, approvazioni e verifiche."
  },
  {
    eyebrow: "Fuori",
    title: "Controllo continuo",
    description: "KDS, input live obbligatori, CRM, fatture e magazzino contabile completo."
  },
  {
    eyebrow: "Prova",
    title: "Trenta secondi",
    description: "Futuro, anticipabile, approvato, prodotto, mancante, teorico e verificato."
  }
] as const;

const roles = [
  ["Admin", "Direttore", "Accesso completo alla struttura. Invita, revoca e supervisiona sala e cucina."],
  ["Sala", "Capo sala", "Briefing, coperti, bambini, allergeni pertinenti, orari e note di servizio."],
  ["Cucina", "Capo cucina", "Fabbisogni, acquisti, piani, approvazioni, produzione e gestione brigata."],
  ["Task assegnati", "Brigata", "Solo piani approvati. Registra fatto, quantità prodotta, posizione e nota."],
  ["Qoovex", "Super Admin", "Supporto temporaneo con MFA, motivo, banner persistente e audit completo."]
] as const;

const modes = [
  ["Setup", "Insegna le regole", "Grammature, pezzi, vassoi, rese, margini, formule ed eccezioni.", "Usato quando cambia la conoscenza", Calculator],
  ["Pre-Service", "Decide prima", "Intake, calcoli, briefing, criticità, piano preparazioni e approvazione chef.", "Cuore del prodotto", Brain],
  ["Service", "Consulta soltanto", "Allergeni, evento in corso, prossima portata, note critiche e domanda rapida.", "Nessun input continuo", DeviceMobile]
] as const;

const principles = [
  ["01", "Event Spine", "Data, sala e persone mantengono stabile l’identità dell’evento."],
  ["02", "Calculation Trace", "Dato, regola, formula, risultato e provenienza formano una catena leggibile."],
  ["03", "Autorità visibile", "Richiesto non è approvato. Prodotto non è verificato. Lo scostamento resta esplicito."],
  ["04", "Teorico dichiarato", "Ogni rimanenza calcolata porta l’etichetta “teorico” o “da verificare”."]
] as const;

const surfaces = [
  [Desktop, "qoovex.com", "Web", "Marketing."],
  [Desktop, "app.qoovex.com", "Workspace", "Next.js responsive."],
  [DeviceMobile, "iOS · Android", "Mobile", "Futura app Expo."],
  [Calculator, "sirio.qoovex.com", "Sirio", "Scope e design system."]
] as const;

export default function DirectionPage() {
  return (
    <Stack as="div" className="sirio-direction" gap="0">
      <Section className="sirio-direction__intro" spacing="lg">
        <Container>
          <Grid columns={1} desktopColumns={2} gap="8" align="center">
            <Stack gap="6">
              <PageHeader
                align="start"
                eyebrow="Qoovex / Pre-Service Brain"
                title={<>Prima del servizio.<br />Numeri che reggono.</>}
                description="Qoovex trasforma eventi e regole interne in quantità, briefing e preparazioni verificabili. L’AI comprende la domanda. I dati e le regole producono la risposta."
                actions={
                  <div className="sirio-action-row">
                    <Link className="sirio-action-link" data-variant="primary" href="/components">
                      Esplora i componenti <ArrowRight aria-hidden="true" />
                    </Link>
                    <a className="sirio-action-link" href="#scope">Leggi lo scope</a>
                  </div>
                }
              />
              <Grid columns={1} tabletColumns={3} gap="3" aria-label="Prove direzione">
                <MetricCard label="Centro" value="Pre-Service" />
                <MetricCard label="Autorità" value="Lo chef decide" />
                <MetricCard label="Vincolo" value="Nessun numero inventato" />
              </Grid>
            </Stack>
            <DataPanel
              className="sirio-prep-panel"
              variant="glass"
              eyebrow={prep.date}
              title={prep.item}
              description={`${prep.children} bambini · ${prep.location}`}
              actions={<StatusBadge status="warning">Da verificare</StatusBadge>}
              footer={
                <Stack direction="row" align="center" justify="between" gap="4" wrap>
                  <Text size="body-sm" tone="muted">
                    OK — verifica fisica consigliata
                  </Text>
                  <Button variant="secondary" disabled startIcon={<Brain aria-hidden="true" />}>
                    Chiedi a Qoovex
                  </Button>
                </Stack>
              }
            >
              <Stack gap="4">
                <CalculationTrace
                  title="Cotolette bambini"
                  input={`${prep.children} bambini`}
                  rule="1 cad. + 10%"
                  result={String(prep.required)}
                  formula={prep.formula}
                  source="Regola comunioni · arrotonda per eccesso"
                />
                <QuantityStatus
                  items={[
                    { label: "Approvato", value: prep.approved, detail: "Chef", state: "verified" },
                    { label: "Prodotto", value: prep.produced, detail: prep.location, state: "default" },
                    { label: "Assegnato", value: prep.assigned, detail: "Domani", state: "default" },
                    { label: "Extra teoriche", value: prep.theoretical, detail: "Non verificate", state: "theoretical" }
                  ]}
                />
              </Stack>
            </DataPanel>
          </Grid>
        </Container>
      </Section>

      <Section id="scope" spacing="lg">
        <Container>
          <Stack gap="6">
            <SectionHeader
              align="split"
              eyebrow="Tesi"
              title={<>Assistente operativo.<br />Non gestionale live.</>}
              description="Il prodotto prepara persone e reparti prima dell’arrivo degli ospiti. Durante il servizio resta una superficie stabile da consultare, non un altro lavoro da aggiornare."
            />
            <Grid columns={1} tabletColumns={3} gap="4">
              {scopeCards.map((card) => (
                <Card key={card.title} padding="md" radius="lg">
                  <Stack gap="3">
                    <Badge tone="warning">{card.eyebrow}</Badge>
                    <Heading as="h3" size="heading-sm">{card.title}</Heading>
                    <Text tone="muted">{card.description}</Text>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <Stack gap="6">
            <SectionHeader
              align="split"
              eyebrow="Accesso minimo necessario"
              title={<>Una struttura.<br />Quattro viste isolate.</>}
              description="Il dato comune resta coerente, ma ogni reparto riceve soltanto campi, azioni e notifiche pertinenti. I controlli sono applicati lato server."
            />
            <Grid columns={1} tabletColumns={2} desktopColumns={3} gap="4">
              {roles.map(([eyebrow, title, description]) => (
                <Card key={title} padding="md" radius="lg">
                  <Stack gap="3">
                    <Badge tone="accent">{eyebrow}</Badge>
                    <Heading as="h3" size="heading-sm">{title}</Heading>
                    <Text tone="muted">{description}</Text>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <Stack gap="6">
            <SectionHeader
              align="split"
              eyebrow="Supporto auditato"
              title={<>Il codice identifica.<br />Non autentica.</>}
              description="Il dipendente Qoovex cerca la struttura, conferma MFA, dichiara il motivo e apre una sessione di trenta minuti. Ogni azione conserva la sua identità."
            />
            <Surface className="sirio-support-chain" variant="elevated" padding="lg" radius="lg">
              <Stack direction="row" align="center" justify="between" gap="4" wrap>
                <MetricCard label="Ingresso" value="MFA + motivo" description="Codice struttura come identificativo" />
                <Stack direction="row" gap="2" wrap>
                  <StatusBadge status="info">Sessione temporanea</StatusBadge>
                  <StatusBadge status="warning">Banner visibile</StatusBadge>
                  <StatusBadge status="verified">Azioni registrate</StatusBadge>
                  <StatusBadge status="info">Notifica al direttore</StatusBadge>
                </Stack>
              </Stack>
            </Surface>
          </Stack>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <Stack gap="6">
            <SectionHeader
              align="split"
              eyebrow="Ciclo operativo"
              title={<>Dal linguaggio naturale.<br />Alla prova fisica.</>}
              description="Ogni passaggio aggiunge certezza. Nessuna proposta diventa ordine senza la decisione dello chef."
            />
            <Grid as="ol" className="sirio-cycle-list" columns={1} tabletColumns={4} desktopColumns={4} gap="3">
              {cycle.map((step, index) => (
                <li key={step}>
                  <Surface variant="subtle" padding="md" radius="lg">
                    <Stack gap="3">
                      <Text size="data" tone="accent" weight="semibold">{String(index + 1).padStart(2, "0")}</Text>
                      <Text as="strong" size="label" weight="semibold">{step}</Text>
                      {index < cycle.length - 1 ? <ArrowRight aria-hidden="true" /> : <CheckCircle aria-hidden="true" />}
                    </Stack>
                  </Surface>
                </li>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <Stack gap="6">
            <SectionHeader
              align="start"
              eyebrow="Tre modalità"
              title={<>Impara. Prepara.<br />Poi resta essenziale.</>}
            />
            <Grid columns={1} tabletColumns={3} gap="4">
              {modes.map(([eyebrow, title, description, note, Icon]) => (
                <Card key={title} className="sirio-mode-card" data-primary={eyebrow === "Pre-Service" || undefined} padding="md" radius="lg">
                  <Stack gap="4">
                    <Badge tone={eyebrow === "Pre-Service" ? "warning" : "neutral"}>{eyebrow}</Badge>
                    <Icon aria-hidden="true" />
                    <Heading as="h3" size="heading-sm" tone={eyebrow === "Pre-Service" ? "inverse" : "default"}>{title}</Heading>
                    <Text tone={eyebrow === "Pre-Service" ? "inverse" : "muted"}>{description}</Text>
                    <Text size="caption" tone={eyebrow === "Pre-Service" ? "warning" : "muted"}>{note}</Text>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Section>

      <Section className="sirio-principles" spacing="lg">
        <Container>
          <Stack gap="6">
            <SectionHeader
              align="start"
              eyebrow="Direzione grafica"
              title={<>Registro di preparazione.<br />Ogni numero ha una traccia.</>}
            />
            <Grid columns={1} tabletColumns={2} gap="4">
              {principles.map(([number, title, description]) => (
                <Card key={number} className="sirio-principle-card" variant="glass" padding="md" radius="lg">
                  <Stack gap="4">
                    <Text size="data" tone="warning" weight="semibold">{number}</Text>
                    <Heading as="h3" size="heading-sm" tone="inverse">{title}</Heading>
                    <Text tone="inverse">{description}</Text>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <Stack gap="6">
            <SectionHeader
              align="split"
              eyebrow="Superfici future"
              title={<>Una semantica.<br />Rendering adatto.</>}
              description="Token e contratti sono comuni; DOM/CSS e primitive native divergono dove serve."
            />
            <Grid columns={1} tabletColumns={2} desktopColumns={4} gap="4">
              {surfaces.map(([Icon, label, title, description]) => (
                <Card key={label} padding="md" radius="lg">
                  <Stack gap="4">
                    <Icon aria-hidden="true" />
                    <Badge tone="accent">{label}</Badge>
                    <Heading as="h3" size="heading-sm">{title}</Heading>
                    <Text tone="muted">{description}</Text>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Section>

      <Section className="sirio-final" spacing="lg">
        <Container size="reading">
          <Surface variant="elevated" padding="lg" radius="lg">
            <Stack gap="5" align="center">
              <Badge tone="warning">Criterio</Badge>
              <Heading as="h2" size="display-md" balance>
                Risposta secca.<br />Calcolo verificabile.
              </Heading>
              <Link className="sirio-action-link" data-variant="primary" href="/components">
                Apri il catalogo <ArrowRight aria-hidden="true" />
              </Link>
            </Stack>
          </Surface>
        </Container>
      </Section>
    </Stack>
  );
}
