"use client";

import type { ReactNode } from "react";
import {
  BellRinging,
  CheckCircle,
  Flame,
  Info,
  Lightning,
} from "@phosphor-icons/react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  Divider,
  Toast,
  ToastProvider,
  useToast,
} from "@qoovex/ui";
import type { ToastVariant } from "@qoovex/ui";
import { SectionHeader } from "../app/sirio-content";
import { ShowcaseBlock } from "./showcase-block";

interface ToastExample {
  variant: ToastVariant;
  label: string;
  title: string;
  description: string;
  icon: ReactNode;
}

const TOAST_EXAMPLES: ToastExample[] = [
  {
    variant: "success",
    label: "Success",
    title: "Menu pubblicato",
    description: "Il QR code e` pronto per essere condiviso in sala.",
    icon: <CheckCircle size={16} weight="bold" aria-hidden="true" />,
  },
  {
    variant: "info",
    label: "Info",
    title: "Nuova ricetta importata",
    description: "Controlla ingredienti e porzioni prima di salvarla.",
    icon: <Info size={16} weight="bold" aria-hidden="true" />,
  },
  {
    variant: "warning",
    label: "Warning",
    title: "Allergeni da verificare",
    description: "Mancano dati su frutta a guscio e lattosio.",
    icon: <Lightning size={16} weight="bold" aria-hidden="true" />,
  },
  {
    variant: "error",
    label: "Error",
    title: "Pubblicazione bloccata",
    description: "Completa i campi obbligatori del menu.",
    icon: <Flame size={16} weight="bold" aria-hidden="true" />,
  },
];

const STACK_EXAMPLES: ToastExample[] = [
  {
    variant: "success",
    label: "Task",
    title: "Task completato",
    description: "Marco ha chiuso la preparazione della linea fredda.",
    icon: <CheckCircle size={16} weight="bold" aria-hidden="true" />,
  },
  {
    variant: "info",
    label: "Team",
    title: "Nuovo membro invitato",
    description: "L'invito e` stato inviato al reparto sala.",
    icon: <BellRinging size={16} aria-hidden="true" />,
  },
  {
    variant: "warning",
    label: "Menu",
    title: "Prezzo menu mancante",
    description: "Aggiungi il prezzo prima di pubblicare.",
    icon: <Lightning size={16} weight="bold" aria-hidden="true" />,
  },
  {
    variant: "error",
    label: "Errore",
    title: "Salvataggio non riuscito",
    description: "Riprova tra qualche secondo.",
    icon: <Flame size={16} weight="bold" aria-hidden="true" />,
  },
];

const CARD_TONES: Record<ToastVariant, "primary" | "success" | "warning" | "error"> = {
  success: "success",
  info: "primary",
  warning: "warning",
  error: "error",
};

function ToastActionsDemo() {
  const { toast, dismissToast } = useToast();

  function showExample(example: ToastExample) {
    toast({
      title: example.title,
      description: example.description,
      variant: example.variant,
      icon: example.icon,
    });
  }

  function showStack() {
    STACK_EXAMPLES.forEach((example) => {
      toast({
        title: example.title,
        description: example.description,
        variant: example.variant,
        icon: example.icon,
      });
    });
  }

  function showPersistentToast() {
    toast({
      title: "Piano di lavoro aggiornato",
      description: "La notifica resta aperta finche` non viene chiusa.",
      variant: "info",
      duration: 0,
      action: (
        <Button size="xs" variant="ghost">
          Apri
        </Button>
      ),
    });
  }

  return (
    <Card variant="panel" tone="primary">
      <CardBody className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {TOAST_EXAMPLES.map((example) => (
            <Button
              key={example.variant}
              size="sm"
              variant={example.variant === "error" ? "destructive" : "secondary"}
              onClick={() => showExample(example)}
            >
              {example.label}
            </Button>
          ))}
        </div>

        <Divider spacing="sm" />

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={showStack}>
            Mostra stack max 3
          </Button>
          <Button size="sm" variant="secondary" onClick={showPersistentToast}>
            Persistente
          </Button>
          <Button size="sm" variant="ghost" onClick={() => dismissToast()}>
            Chiudi tutto
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

function StaticToastPreview() {
  return (
    <Card variant="surface" tone="success">
      <CardBody className="flex flex-col gap-4">
        <Toast
          title="New location created successfully!"
          variant="success"
          onDismiss={() => undefined}
        />
        <Toast
          title="Allergeni aggiornati"
          description="La scheda menu e` stata sincronizzata."
          variant="info"
        />
        <Badge tone="success" variant="soft">
          Preview statica stile screenshot
        </Badge>
      </CardBody>
    </Card>
  );
}

function ToastVariantsPreview() {
  return (
    <>
      {TOAST_EXAMPLES.map((example) => (
        <Card
          key={example.variant}
          variant="surface"
          tone={CARD_TONES[example.variant]}
        >
          <CardBody className="flex flex-col gap-4">
            <Toast
              title={example.title}
              description={example.description}
              variant={example.variant}
              icon={example.icon}
            />
            <p className="sirio-token-label">{example.variant}</p>
          </CardBody>
        </Card>
      ))}
    </>
  );
}

export function SezioneToast() {
  return (
    <ToastProvider maxToasts={3} position="top-right">
      <section id="toast" className="sirio-section">
        <SectionHeader label="Toast" id="toast" />

        <ShowcaseBlock
          label="Interazione"
          description="Il provider mostra al massimo tre notifiche visibili, con auto-dismiss e animazione di uscita."
        >
          <ToastActionsDemo />
          <StaticToastPreview />
        </ShowcaseBlock>

        <ShowcaseBlock
          label="Varianti"
          description="Ogni variante usa un tono semantico per icona, glow e bordo, mantenendo la card scura come nello stile Qoovex."
          className="grid grid-cols-1 gap-4 xl:grid-cols-2"
        >
          <ToastVariantsPreview />
        </ShowcaseBlock>
      </section>
    </ToastProvider>
  );
}
