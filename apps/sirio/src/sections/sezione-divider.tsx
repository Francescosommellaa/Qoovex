"use client";

import { ChefHat, ClockCountdown, Leaf } from "@phosphor-icons/react";
import { Badge, Card, CardBody, Divider } from "@qoovex/ui";
import type { DividerTone } from "@qoovex/ui";
import { SectionHeader } from "../app/sirio-content";
import { ShowcaseBlock } from "./showcase-block";

const TONES: DividerTone[] = [
  "neutral",
  "primary",
  "success",
  "warning",
  "error",
];

export function SezioneDivider() {
  return (
    <section id="divider" className="sirio-section">
      <SectionHeader label="Divider" id="divider" />

      <ShowcaseBlock
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
        label="Separazione semplice"
        description="Divider e` decorativo di default quando non ha label; con contenuto diventa un separatore leggibile."
      >
        <Card variant="surface">
          <CardBody className="flex flex-col">
            <p className="font-display text-(length:--text-base) font-semibold text-text">
              Ricette recenti
            </p>
            <Divider />
            <p className="sirio-preview-text">
              Separazione neutra per liste, pannelli e blocchi compatti.
            </p>
          </CardBody>
        </Card>

        <Card variant="surface" tone="primary">
          <CardBody className="flex flex-col">
            <p className="font-display text-(length:--text-base) font-semibold text-text">
              Piano del servizio
            </p>
            <Divider tone="primary">Workspace</Divider>
            <p className="sirio-preview-text">
              La label resta piccola e non compete con i contenuti principali.
            </p>
          </CardBody>
        </Card>
      </ShowcaseBlock>

      <ShowcaseBlock
        label="Toni e varianti"
        description="I toni colorano solo la linea e la label. Le varianti restano continue: solid per default, strong per enfasi."
        className="grid grid-cols-1 gap-4 xl:grid-cols-5"
      >
        {TONES.map((tone) => (
          <Card key={tone} variant="surface" tone={tone}>
            <CardBody className="flex flex-col">
              <Badge tone={tone} variant="soft">
                {tone}
              </Badge>
              <Divider tone={tone} variant="strong">
                {tone}
              </Divider>
              <p className="sirio-preview-text">
                Separatore semantico per stati e gruppi correlati.
              </p>
            </CardBody>
          </Card>
        ))}
      </ShowcaseBlock>

      <ShowcaseBlock
        label="Verticale"
        description="La variante verticale serve per righe dense, toolbar e meta summary."
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
      >
        <Card variant="panel">
          <CardBody className="flex items-stretch gap-4">
            <div className="flex flex-1 items-center gap-3">
              <ChefHat size={18} aria-hidden="true" />
              <span className="text-(length:--text-sm) text-text-muted">
                Cucina
              </span>
            </div>
            <Divider orientation="vertical" spacing="none" />
            <div className="flex flex-1 items-center gap-3">
              <ClockCountdown size={18} aria-hidden="true" />
              <span className="text-(length:--text-sm) text-text-muted">
                18:00
              </span>
            </div>
            <Divider orientation="vertical" tone="success" spacing="none" />
            <div className="flex flex-1 items-center gap-3">
              <Leaf size={18} aria-hidden="true" />
              <span className="text-(length:--text-sm) text-text-muted">
                Pronto
              </span>
            </div>
          </CardBody>
        </Card>
      </ShowcaseBlock>
    </section>
  );
}

