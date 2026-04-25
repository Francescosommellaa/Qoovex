"use client";

import type { ReactNode } from "react";
import {
  CheckCircle,
  ClockCountdown,
  Flame,
  Info,
  Leaf,
  WarningCircle,
} from "@phosphor-icons/react";
import { Badge, Card, CardBody } from "@qoovex/ui";
import type { BadgeTone, BadgeVariant } from "@qoovex/ui";
import { SectionHeader } from "../app/sirio-content";

interface ShowcaseBlockProps {
  label: string;
  description: string;
  children: ReactNode;
  className?: string;
}

interface ToneExample {
  tone: BadgeTone;
  label: string;
  description: string;
  icon: ReactNode;
}

const TONE_EXAMPLES: ToneExample[] = [
  {
    tone: "neutral",
    label: "Bozza",
    description: "Stato informativo senza urgenza o enfasi semantica.",
    icon: <Info size={13} weight="bold" aria-hidden="true" />,
  },
  {
    tone: "primary",
    label: "Workspace",
    description: "Evidenzia contesto attivo, piano o feature principale.",
    icon: <CheckCircle size={13} weight="bold" aria-hidden="true" />,
  },
  {
    tone: "success",
    label: "Pronto",
    description: "Conferma completamento, validazione o disponibilita.",
    icon: <Leaf size={13} weight="bold" aria-hidden="true" />,
  },
  {
    tone: "warning",
    label: "Da verificare",
    description: "Segnala attenzione senza bloccare l'azione.",
    icon: <WarningCircle size={13} weight="bold" aria-hidden="true" />,
  },
  {
    tone: "error",
    label: "Critico",
    description: "Stato bloccante o rischio operativo da risolvere.",
    icon: <Flame size={13} weight="bold" aria-hidden="true" />,
  },
];

const VARIANTS: BadgeVariant[] = ["soft", "outline", "filled"];

function ShowcaseBlock({
  label,
  description,
  children,
  className,
}: ShowcaseBlockProps) {
  return (
    <div className="mb-10">
      <div className="mb-4 max-w-3xl">
        <p className="sirio-row__label">{label}</p>
        <p className="sirio-preview-text">{description}</p>
      </div>
      <div
        className={
          className ??
          "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5"
        }
      >
        {children}
      </div>
    </div>
  );
}

function ToneCard({ example }: { example: ToneExample }) {
  return (
    <Card variant="surface" tone={example.tone}>
      <CardBody className="flex flex-col gap-4">
        <Badge tone={example.tone} iconLeft={example.icon}>
          {example.label}
        </Badge>
        <p className="sirio-preview-text">{example.description}</p>
      </CardBody>
    </Card>
  );
}

export function SezioneBadge() {
  return (
    <section id="badge" className="sirio-section">
      <SectionHeader label="Badge" id="badge" />

      <ShowcaseBlock
        label="Toni semantici"
        description="Il tono comunica lo stato del contenuto: neutro, primario, positivo, attenzione o errore."
      >
        {TONE_EXAMPLES.map((example) => (
          <ToneCard key={example.tone} example={example} />
        ))}
      </ShowcaseBlock>

      <ShowcaseBlock
        label="Varianti"
        description="Soft e outline sono leggere; filled serve solo quando il badge deve dominare la riga."
        className="grid grid-cols-1 gap-4 lg:grid-cols-3"
      >
        {VARIANTS.map((variant) => (
          <Card key={variant} variant="panel">
            <CardBody className="flex flex-col gap-4">
              <p className="sirio-token-label">{variant}</p>
              <div className="flex flex-wrap gap-2">
                {TONE_EXAMPLES.map((example) => (
                  <Badge
                    key={example.tone}
                    variant={variant}
                    tone={example.tone}
                  >
                    {example.label}
                  </Badge>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </ShowcaseBlock>

      <ShowcaseBlock
        label="Size e composizione"
        description="Le icone restano decorative e seguono il peso funzionale solo per check, alert e stati operativi."
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
      >
        <Card variant="surface">
          <CardBody className="flex flex-wrap items-center gap-3">
            <Badge size="sm" tone="neutral">
              Piccolo
            </Badge>
            <Badge size="md" tone="primary">
              Medio
            </Badge>
            <Badge size="lg" tone="success">
              Grande
            </Badge>
          </CardBody>
        </Card>

        <Card variant="surface" tone="warning">
          <CardBody className="flex flex-wrap items-center gap-3">
            <Badge
              tone="warning"
              variant="outline"
              iconLeft={<ClockCountdown size={13} aria-hidden="true" />}
            >
              Servizio 18:00
            </Badge>
            <Badge
              tone="success"
              variant="filled"
              iconLeft={
                <CheckCircle size={13} weight="bold" aria-hidden="true" />
              }
            >
              Menu pubblicato
            </Badge>
          </CardBody>
        </Card>
      </ShowcaseBlock>
    </section>
  );
}
