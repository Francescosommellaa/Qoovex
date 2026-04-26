"use client";

import { useState, type ReactNode } from "react";
import {
  ArrowsOut,
  BellRinging,
  ChefHat,
  ClockCountdown,
  ListChecks,
  SidebarSimple,
  Warning,
} from "@phosphor-icons/react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  Modal,
  ModalBody,
  ModalClose,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@qoovex/ui";
import type { ModalPlacement, ModalSize, ModalTone } from "@qoovex/ui";
import { SectionHeader } from "../app/sirio-content";
import { ShowcaseBlock } from "./showcase-block";

interface ModalExample {
  label: string;
  title: string;
  description: string;
  placement: ModalPlacement;
  size: ModalSize;
  tone: ModalTone;
  icon: ReactNode;
}

const MODAL_EXAMPLES: ModalExample[] = [
  {
    label: "Responsive",
    title: "Nuova ricetta",
    description: "Bottom sheet su mobile, dialog centrato da tablet in su.",
    placement: "responsive",
    size: "md",
    tone: "primary",
    icon: <ChefHat size={16} aria-hidden="true" />,
  },
  {
    label: "Center",
    title: "Conferma pubblicazione",
    description: "Dialog desktop classico per conferme e contenuti brevi.",
    placement: "center",
    size: "sm",
    tone: "success",
    icon: <BellRinging size={16} aria-hidden="true" />,
  },
  {
    label: "Bottom",
    title: "Azioni rapide",
    description: "Sheet che sale dal basso, utile per mobile e azioni contestuali.",
    placement: "bottom",
    size: "md",
    tone: "neutral",
    icon: <ListChecks size={16} aria-hidden="true" />,
  },
  {
    label: "Right",
    title: "Dettagli piano",
    description: "Side sheet per pannelli laterali, filtri e dettagli persistenti.",
    placement: "right",
    size: "md",
    tone: "warning",
    icon: <SidebarSimple size={16} aria-hidden="true" />,
  },
];

const SHEET_TASKS = [
  "Controlla mise en place",
  "Aggiorna allergeni menu",
  "Conferma linea calda",
  "Invia lista spesa",
] as const;

function AccentIcon({ tone, children }: { tone: ModalTone; children: ReactNode }) {
  return (
    <span
      className={[
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full border",
        tone === "primary" &&
          "border-(--modal-tone-primary-border) bg-(--modal-tone-primary-soft) text-primary",
        tone === "success" &&
          "border-(--modal-tone-success-border) bg-(--modal-tone-success-soft) text-success",
        tone === "warning" &&
          "border-(--modal-tone-warning-border) bg-(--modal-tone-warning-soft) text-warning",
        tone === "error" &&
          "border-(--modal-tone-error-border) bg-(--modal-tone-error-soft) text-error",
        tone === "neutral" &&
          "border-(--modal-tone-neutral-border) bg-(--modal-tone-neutral-soft) text-text-muted",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}

function ModalDemoBody({ tone }: { tone: ModalTone }) {
  return (
    <ModalBody className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-surface-2 p-3">
          <p className="font-display text-(length:--text-lg) text-text">12</p>
          <p className="text-(length:--text-xs) text-text-faint">task aperti</p>
        </div>
        <div className="rounded-lg border border-border bg-surface-2 p-3">
          <p className="font-display text-(length:--text-lg) text-text">4</p>
          <p className="text-(length:--text-xs) text-text-faint">chef attivi</p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-(--modal-accent-border) bg-(--modal-accent-soft) p-3">
        <AccentIcon tone={tone}>
          <ClockCountdown size={16} aria-hidden="true" />
        </AccentIcon>
        <div>
          <p className="font-display text-(length:--text-base) font-semibold text-text">
            Servizio serale
          </p>
          <p className="sirio-preview-text">
            Il contenuto resta scrollabile dentro il pannello quando supera
            l&apos;altezza disponibile.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {SHEET_TASKS.map((task) => (
          <div
            key={task}
            className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-(length:--text-sm) text-text-muted"
          >
            {task}
          </div>
        ))}
      </div>
    </ModalBody>
  );
}

function ModalExampleCard({ example }: { example: ModalExample }) {
  return (
    <Card variant="panel" tone={example.tone}>
      <CardBody className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <AccentIcon tone={example.tone}>{example.icon}</AccentIcon>
          <div className="min-w-0">
            <p className="sirio-token-label">{example.placement}</p>
            <h3 className="font-display text-(length:--text-base) font-semibold text-text">
              {example.label}
            </h3>
            <p className="sirio-preview-text">{example.description}</p>
          </div>
        </div>

        <Modal
          placement={example.placement}
          size={example.size}
          tone={example.tone}
          title={example.title}
          description={example.description}
          defaultSheetSnap={example.placement === "bottom" ? "peek" : "default"}
          sheetHandleLabel={`Ridimensiona ${example.label}`}
          trigger={
            <Button size="sm" variant="secondary">
              Apri {example.label}
            </Button>
          }
          footer={
            <>
              <ModalClose className="h-9 w-auto px-4 text-(length:--text-xs) font-medium">
                Annulla
              </ModalClose>
              <Button size="sm">Conferma</Button>
            </>
          }
        >
          <ModalDemoBody tone={example.tone} />
        </Modal>
      </CardBody>
    </Card>
  );
}

function ControlledModalDemo() {
  const [open, setOpen] = useState(false);

  return (
    <Card variant="bento" tone="error">
      <CardBody className="flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <AccentIcon tone="error">
            <Warning size={16} weight="bold" aria-hidden="true" />
          </AccentIcon>
          <div>
            <p className="sirio-token-label">alertdialog controllato</p>
            <h3 className="font-display text-(length:--text-lg) font-semibold text-text">
              Azione distruttiva
            </h3>
            <p className="sirio-preview-text">
              `open` e `onOpenChange` coprono flussi controllati, conferme e
              stepper.
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="destructive"
          onClick={() => setOpen(true)}
        >
          Elimina menu
        </Button>

        <Modal
          open={open}
          onOpenChange={setOpen}
          role="alertdialog"
          placement="center"
          size="sm"
          tone="error"
          title="Eliminare questo menu?"
          description="L'azione non puo` essere annullata. I QR code collegati verranno disattivati."
          footer={
            <>
              <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
                Mantieni
              </Button>
              <Button size="sm" variant="destructive" onClick={() => setOpen(false)}>
                Elimina
              </Button>
            </>
          }
        >
          <ModalBody className="flex flex-col gap-3">
            <Badge tone="error" variant="soft">
              Conferma richiesta
            </Badge>
            <p className="sirio-preview-text">
              Usa `alertdialog` solo quando la scelta richiede attenzione
              immediata.
            </p>
          </ModalBody>
        </Modal>
      </CardBody>
    </Card>
  );
}

function CompoundModalDemo() {
  return (
    <Card variant="surface" tone="primary">
      <CardBody className="flex flex-col gap-5">
        <div>
          <p className="sirio-token-label">slots</p>
          <h3 className="font-display text-(length:--text-lg) font-semibold text-text">
            Header, body e footer manuali
          </h3>
          <p className="sirio-preview-text">
            Quando serve una composizione custom, gli slot espongono la stessa
            struttura del componente base.
          </p>
        </div>

        <Modal
          placement="fullscreen"
          size="full"
          tone="primary"
          aria-label="Editor ricetta"
          showCloseButton={false}
          trigger={
            <Button size="sm" iconRight={<ArrowsOut size={14} aria-hidden="true" />}>
              Apri editor fullscreen
            </Button>
          }
        >
          <ModalHeader>
            <div className="qv-modal__heading">
              <ModalTitle>Editor ricetta</ModalTitle>
              <ModalDescription>
                Variante fullscreen per flussi lunghi, wizard e layout a piu`
                colonne.
              </ModalDescription>
            </div>
            <ModalClose />
          </ModalHeader>

          <ModalBody className="grid gap-4 lg:grid-cols-[1fr_18rem]">
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="sirio-token-label">contenuto principale</p>
              <h4 className="font-display text-(length:--text-lg) font-semibold text-text">
                Cacio e pepe
              </h4>
              <p className="mt-2 text-(length:--text-sm) leading-7 text-text-muted">
                Qui vivrebbe un form complesso: ingredienti, step, allergeni e
                valori nutrizionali.
              </p>
            </div>
            <aside className="rounded-xl border border-border bg-surface-2 p-4">
              <p className="sirio-token-label">sidebar</p>
              <div className="mt-3 flex flex-col gap-2">
                <Badge tone="primary">Bozza</Badge>
                <Badge tone="success">Allergeni verificati</Badge>
                <Badge tone="warning">Costo mancante</Badge>
              </div>
            </aside>
          </ModalBody>

          <ModalFooter>
            <Button size="sm" variant="ghost">
              Salva bozza
            </Button>
            <Button size="sm">Pubblica</Button>
          </ModalFooter>
        </Modal>
      </CardBody>
    </Card>
  );
}

export function SezioneModal() {
  return (
    <section id="modal" className="sirio-section">
      <SectionHeader label="Modal / Sheet" id="modal" />

      <ShowcaseBlock
        label="Placement"
        description="La prop `placement` copre dialog centrato, bottom sheet, side sheet e comportamento responsive mobile/desktop. Su mobile il bottom sheet si puo` trascinare tra peek, default ed expanded."
      >
        {MODAL_EXAMPLES.map((example) => (
          <ModalExampleCard key={example.placement} example={example} />
        ))}
      </ShowcaseBlock>

      <ShowcaseBlock
        label="Flussi avanzati"
        description="Il componente supporta stato controllato, `alertdialog`, fullscreen e composizione manuale degli slot."
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
      >
        <ControlledModalDemo />
        <CompoundModalDemo />
      </ShowcaseBlock>
    </section>
  );
}
