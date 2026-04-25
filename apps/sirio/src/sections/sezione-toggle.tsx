"use client";

import { useState, type ReactNode } from "react";
import {
  BellRinging,
  CheckCircle,
  Flame,
  Lightning,
  Moon,
  Sun,
} from "@phosphor-icons/react";
import { Card, CardBody, Divider, Toggle } from "@qoovex/ui";
import type { ToggleTone } from "@qoovex/ui";
import { SectionHeader } from "../app/sirio-content";

interface ShowcaseBlockProps {
  label: string;
  description: string;
  children: ReactNode;
  className?: string;
}

interface ToggleExample {
  tone: ToggleTone;
  label: string;
  description: string;
  icon: ReactNode;
}

const TOGGLE_EXAMPLES: ToggleExample[] = [
  {
    tone: "primary",
    label: "Notifiche workspace",
    description: "Aggiornamenti sui task completati dal team.",
    icon: <BellRinging size={16} aria-hidden="true" />,
  },
  {
    tone: "success",
    label: "Menu pubblicato",
    description: "Rende visibile il menu digitale ai clienti.",
    icon: <CheckCircle size={16} weight="bold" aria-hidden="true" />,
  },
  {
    tone: "warning",
    label: "Avviso allergeni",
    description: "Mostra un controllo extra prima della pubblicazione.",
    icon: <Lightning size={16} weight="bold" aria-hidden="true" />,
  },
  {
    tone: "error",
    label: "Blocco servizio",
    description: "Stato operativo critico, da usare con parsimonia.",
    icon: <Flame size={16} weight="bold" aria-hidden="true" />,
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

function ControlledToggleDemo() {
  const [checked, setChecked] = useState(true);

  return (
    <Card variant="panel" tone={checked ? "success" : "neutral"}>
      <CardBody className="flex flex-col gap-4">
        <Toggle
          checked={checked}
          onCheckedChange={setChecked}
          tone="success"
          label="Piano attivo"
          description="Demo controllata con stato React locale."
        />
        <Divider spacing="sm" />
        <p className="sirio-preview-text">
          Stato corrente: {checked ? "attivo" : "disattivo"}.
        </p>
      </CardBody>
    </Card>
  );
}

function ThemeToggleDemo() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <Card variant="panel" tone="primary">
      <CardBody className="flex flex-col gap-4">
        <Toggle
          checked={darkMode}
          onCheckedChange={setDarkMode}
          tone="primary"
          label="Tema interfaccia"
          description={darkMode ? "Dark mode attiva." : "Light mode attiva."}
          iconUnchecked={<Sun size={12} weight="bold" aria-hidden="true" />}
          iconChecked={<Moon size={12} weight="bold" aria-hidden="true" />}
        />
        <p className="sirio-preview-text">
          Il thumb cambia icona e si espande durante lo switch.
        </p>
      </CardBody>
    </Card>
  );
}

export function SezioneToggle() {
  return (
    <section id="toggle" className="sirio-section">
      <SectionHeader label="Toggle" id="toggle" />

      <ShowcaseBlock
        label="Stati base"
        description="Toggle usa role switch, stato controllabile e token semantici condivisi per il track attivo."
        className="grid grid-cols-1 gap-4 lg:grid-cols-3"
      >
        <Card variant="surface">
          <CardBody className="flex flex-col gap-4">
            <Toggle label="Bozza privata" defaultChecked={false} />
            <Toggle label="Condividi con il team" defaultChecked />
            <Toggle label="Disabilitato" disabled />
          </CardBody>
        </Card>

        <ControlledToggleDemo />
        <ThemeToggleDemo />
      </ShowcaseBlock>

      <ShowcaseBlock
        label="Toni semantici"
        description="Il tono indica il tipo di azione, non uno stile decorativo arbitrario."
        className="grid grid-cols-1 gap-4 xl:grid-cols-4"
      >
        {TOGGLE_EXAMPLES.map((example) => (
          <Card key={example.tone} variant="surface" tone={example.tone}>
            <CardBody className="flex flex-col gap-4">
              <span className="inline-flex size-9 items-center justify-center rounded-full border border-(--card-accent-border) bg-(--card-accent-soft) text-(--card-accent)">
                {example.icon}
              </span>
              <Toggle
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
        description="La scala resta compatta: sm per toolbar, md per form, lg per superfici operative."
        className="grid grid-cols-1 gap-4 lg:grid-cols-3"
      >
        <Card variant="surface">
          <CardBody>
            <Toggle size="sm" label="Small" defaultChecked />
          </CardBody>
        </Card>
        <Card variant="surface">
          <CardBody>
            <Toggle size="md" label="Medium" defaultChecked />
          </CardBody>
        </Card>
        <Card variant="surface">
          <CardBody>
            <Toggle size="lg" label="Large" defaultChecked />
          </CardBody>
        </Card>
      </ShowcaseBlock>
    </section>
  );
}
