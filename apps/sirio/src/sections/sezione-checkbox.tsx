"use client";

import { useState, type ReactNode } from "react";
import {
  BellRinging,
  CheckCircle,
  Flame,
  ForkKnife,
  Lightning,
} from "@phosphor-icons/react";
import { Badge, Card, CardBody, Checkbox, Divider, Radio } from "@qoovex/ui";
import type { CheckboxTone, RadioTone } from "@qoovex/ui";
import { SectionHeader } from "../app/sirio-content";

interface ShowcaseBlockProps {
  label: string;
  description: string;
  children: ReactNode;
  className?: string;
}

interface ChoiceToneExample {
  tone: CheckboxTone;
  label: string;
  description: string;
  icon: ReactNode;
}

const CHECKBOX_TONES: ChoiceToneExample[] = [
  {
    tone: "primary",
    label: "Ricetta pubblica",
    description: "Visibile nella sezione Esplora.",
    icon: <BellRinging size={16} aria-hidden="true" />,
  },
  {
    tone: "success",
    label: "Menu validato",
    description: "Pronto per essere condiviso via QR.",
    icon: <CheckCircle size={16} weight="bold" aria-hidden="true" />,
  },
  {
    tone: "warning",
    label: "Controllo allergeni",
    description: "Richiede attenzione prima della pubblicazione.",
    icon: <Lightning size={16} weight="bold" aria-hidden="true" />,
  },
  {
    tone: "error",
    label: "Blocco operativo",
    description: "Usalo solo per stati critici.",
    icon: <Flame size={16} weight="bold" aria-hidden="true" />,
  },
];

const RADIO_OPTIONS: Array<{
  value: string;
  label: string;
  description: string;
  tone: RadioTone;
}> = [
  {
    value: "cucina",
    label: "Cucina",
    description: "Team operativo principale.",
    tone: "primary",
  },
  {
    value: "sala",
    label: "Sala",
    description: "Collaborazione su servizio e menu.",
    tone: "success",
  },
  {
    value: "pastry",
    label: "Pasticceria",
    description: "Preparazioni dedicate e batch.",
    tone: "warning",
  },
];

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
          "grid grid-cols-1 gap-4 md:grid-cols-2"
        }
      >
        {children}
      </div>
    </div>
  );
}

function ControlledCheckboxDemo() {
  const [checked, setChecked] = useState(true);

  return (
    <Card variant="panel" tone={checked ? "success" : "neutral"}>
      <CardBody className="flex flex-col gap-4">
        <Checkbox
          checked={checked}
          onCheckedChange={setChecked}
          tone="success"
          label="Lista ingredienti verificata"
          description="Demo controllata con stato React locale."
        />
        <Divider spacing="sm" />
        <p className="sirio-preview-text">
          Stato corrente: {checked ? "completa" : "da controllare"}.
        </p>
      </CardBody>
    </Card>
  );
}

function RadioGroupDemo() {
  const [selectedTeam, setSelectedTeam] = useState("cucina");

  return (
    <Card variant="panel" tone="primary">
      <CardBody className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <ForkKnife size={18} aria-hidden="true" />
          <p className="font-display text-(length:--text-base) font-semibold text-text">
            Reparto responsabile
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {RADIO_OPTIONS.map((option) => (
            <Radio
              key={option.value}
              name="team"
              value={option.value}
              checked={selectedTeam === option.value}
              onCheckedChange={(checked) => {
                if (checked) setSelectedTeam(option.value);
              }}
              tone={option.tone}
              label={option.label}
              description={option.description}
            />
          ))}
        </div>
        <Badge tone="primary" variant="soft">
          Selezione: {selectedTeam}
        </Badge>
      </CardBody>
    </Card>
  );
}

export function SezioneCheckbox() {
  return (
    <section id="checkbox" className="sirio-section">
      <SectionHeader label="Checkbox & Radio" id="checkbox" />

      <ShowcaseBlock
        label="Checkbox"
        description="Checkbox usa input nativo, stile custom e stato indeterminate senza SVG inline."
        className="grid grid-cols-1 gap-4 lg:grid-cols-3"
      >
        <Card variant="surface">
          <CardBody className="flex flex-col gap-4">
            <Checkbox label="Bozza privata" defaultChecked={false} />
            <Checkbox label="Condividi con il team" defaultChecked />
            <Checkbox label="Selezione parziale" indeterminate />
            <Checkbox label="Disabilitato" disabled />
          </CardBody>
        </Card>

        <ControlledCheckboxDemo />
        <RadioGroupDemo />
      </ShowcaseBlock>

      <ShowcaseBlock
        label="Toni semantici"
        description="I toni comunicano il peso operativo della scelta, mantenendo lo stato non selezionato neutro."
        className="grid grid-cols-1 gap-4 xl:grid-cols-4"
      >
        {CHECKBOX_TONES.map((example) => (
          <Card key={example.tone} variant="surface" tone={example.tone}>
            <CardBody className="flex flex-col gap-4">
              <span className="inline-flex size-9 items-center justify-center rounded-full border border-(--card-accent-border) bg-(--card-accent-soft) text-(--card-accent)">
                {example.icon}
              </span>
              <Checkbox
                tone={example.tone}
                defaultChecked={example.tone !== "error"}
                label={example.label}
                description={example.description}
              />
            </CardBody>
          </Card>
        ))}
      </ShowcaseBlock>

      <ShowcaseBlock
        label="Size"
        description="La scala segue input e toggle: sm per liste dense, md default, lg per card operative."
        className="grid grid-cols-1 gap-4 lg:grid-cols-3"
      >
        <Card variant="surface">
          <CardBody className="flex flex-col gap-4">
            <Checkbox size="sm" label="Checkbox small" defaultChecked />
            <Radio size="sm" label="Radio small" defaultChecked name="small" />
          </CardBody>
        </Card>
        <Card variant="surface">
          <CardBody className="flex flex-col gap-4">
            <Checkbox size="md" label="Checkbox medium" defaultChecked />
            <Radio size="md" label="Radio medium" defaultChecked name="medium" />
          </CardBody>
        </Card>
        <Card variant="surface">
          <CardBody className="flex flex-col gap-4">
            <Checkbox size="lg" label="Checkbox large" defaultChecked />
            <Radio size="lg" label="Radio large" defaultChecked name="large" />
          </CardBody>
        </Card>
      </ShowcaseBlock>
    </section>
  );
}
