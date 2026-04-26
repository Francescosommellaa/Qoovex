"use client";

import { useState } from "react";
import {
  ArrowRight,
  ChefHat,
  Plus,
  Trash,
  FloppyDisk,
  ArrowLeft,
  Sparkle,
  PaperPlaneTilt,
  UploadSimple,
  BookOpen,
} from "@phosphor-icons/react";
import { Button } from "@qoovex/ui";
import { SectionHeader } from "../app/sirio-content";
import { ShowcaseRow as Row } from "./showcase-block";

// ─── Controlled demo per lo swapLabel ─────────────────────────────────────────

type ActionState = "idle" | "loading" | "done";

function ActionButton({
  label,
  doneLabel,
  variant = "primary",
}: {
  label: string;
  doneLabel: string;
  variant?: "primary" | "secondary" | "ghost" | "destructive";
}) {
  const [state, setState] = useState<ActionState>("idle");

  function handleClick() {
    if (state !== "idle") return;
    setState("loading");
    setTimeout(() => {
      setState("done");
      setTimeout(() => setState("idle"), 1800);
    }, 1200);
  }

  return (
    <Button
      variant={variant}
      loading={state === "loading"}
      swapLabel={{ idle: label, active: doneLabel }}
      swapActive={state === "done"}
      onClick={handleClick}
    >
      {label}
    </Button>
  );
}

// ─── Sezione ──────────────────────────────────────────────────────────────────

export function SezioneButton() {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function simulateLoad(id: string) {
    setLoadingId(id);
    setTimeout(() => setLoadingId(null), 2000);
  }

  return (
    <section id="button" className="sirio-section">
      <SectionHeader label="Button" id="button" />

      <Row label="Variants">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
      </Row>

      <Row label="Sizes">
        <Button variant="primary" size="xs">
          XSmall
        </Button>
        <Button variant="primary" size="sm">
          Small
        </Button>
        <Button variant="primary" size="md">
          Medium
        </Button>
        <Button variant="primary" size="lg">
          Large
        </Button>
      </Row>

      <Row label="Icon left">
        <Button variant="primary" size="sm" iconLeft={<ChefHat size={12} />}>
          Nuovo piano
        </Button>
        <Button
          variant="primary"
          size="md"
          iconLeft={<Plus size={14} weight="bold" />}
        >
          Aggiungi ricetta
        </Button>
        <Button variant="primary" size="lg" iconLeft={<FloppyDisk size={16} />}>
          Salva menu
        </Button>
        <Button
          variant="secondary"
          size="md"
          iconLeft={<ArrowLeft size={14} />}
        >
          Indietro
        </Button>
        <Button
          variant="destructive"
          size="md"
          iconLeft={<Trash size={14} weight="bold" />}
        >
          Elimina ricetta
        </Button>
      </Row>

      <Row label="Icon right">
        <Button
          variant="primary"
          size="sm"
          iconRight={<ArrowRight size={12} />}
        >
          Continua
        </Button>
        <Button
          variant="primary"
          size="md"
          iconRight={<ArrowRight size={14} />}
        >
          Vai al menu
        </Button>
        <Button
          variant="secondary"
          size="md"
          iconRight={<ArrowRight size={14} />}
        >
          Esplora ricette
        </Button>
      </Row>

      <Row label="Icon swap — hover (desktop only, CSS-driven)">
        <Button
          variant="primary"
          size="md"
          iconSwap={{
            from: <ChefHat size={14} />,
            to: <ArrowRight size={14} />,
          }}
        >
          Crea ricetta
        </Button>
        <Button
          variant="primary"
          size="lg"
          iconSwap={{
            from: <FloppyDisk size={16} />,
            to: <ArrowRight size={16} />,
          }}
        >
          Salva e continua
        </Button>
        <Button
          variant="secondary"
          size="md"
          iconSwap={{
            from: <Sparkle size={14} />,
            to: <ArrowRight size={14} />,
          }}
        >
          Esplora menu
        </Button>
        <Button
          variant="destructive"
          size="md"
          iconSwap={{
            from: <Trash size={14} weight="bold" />,
            to: <ArrowRight size={14} />,
          }}
        >
          Elimina
        </Button>
      </Row>

      <Row label="Swap label — click confirmation (stato: idle → loading → done → idle)">
        <ActionButton label="Invia" doneLabel="Inviato ✓" />
        <ActionButton label="Pubblica menu" doneLabel="Pubblicato ✓" />
        <ActionButton
          label="Salva ricetta"
          doneLabel="Salvato ✓"
          variant="secondary"
        />
        <ActionButton
          label="Elimina"
          doneLabel="Eliminato ✓"
          variant="destructive"
        />
      </Row>

      <Row label="Swap label — varianti e dimensioni">
        <ActionButton label="Salva" doneLabel="Salvato ✓" variant="primary" />
        <Button
          variant="ghost"
          size="sm"
          swapLabel={{ idle: "Aggiungi alla lista", active: "Aggiunto ✓" }}
          swapActive={false}
        >
          Aggiungi alla lista
        </Button>
        <Button
          variant="secondary"
          size="xs"
          swapLabel={{ idle: "Copia link", active: "Copiato ✓" }}
          swapActive={false}
        >
          Copia link
        </Button>
      </Row>

      <Row label="Caption — testo informativo sotto o sopra">
        <Button
          variant="primary"
          size="md"
          iconLeft={<UploadSimple size={14} />}
          caption="Max 10 MB · JPG, PNG, WebP"
          captionPosition="bottom"
        >
          Carica immagine
        </Button>
        <Button
          variant="secondary"
          size="md"
          iconLeft={<BookOpen size={14} />}
          caption="Visibile a tutti nella sezione Esplora"
          captionPosition="bottom"
        >
          Pubblica ricetta
        </Button>
        <Button
          variant="primary"
          size="md"
          iconLeft={<PaperPlaneTilt size={14} />}
          caption="Invio confermato via email"
          captionPosition="top"
        >
          Invia ordine
        </Button>
        <Button
          variant="ghost"
          size="sm"
          caption="Operazione irreversibile"
          captionPosition="bottom"
        >
          Svuota archivio
        </Button>
      </Row>

      <Row label="Caption + swap label — combinati">
        <ActionButton label="Conferma ordine" doneLabel="Ordine confermato ✓" />
      </Row>

      <Row label="State — disabled">
        <Button
          variant="primary"
          disabled
          iconLeft={<Plus size={14} weight="bold" />}
        >
          Primary
        </Button>
        <Button
          variant="secondary"
          disabled
          iconLeft={<Plus size={14} weight="bold" />}
        >
          Secondary
        </Button>
        <Button variant="ghost" disabled>
          Ghost
        </Button>
        <Button
          variant="destructive"
          disabled
          iconLeft={<Trash size={14} weight="bold" />}
        >
          Destructive
        </Button>
      </Row>

      <Row label="State — loading">
        {(["primary", "secondary", "ghost", "destructive"] as const).map(
          (variant) => (
            <Button
              key={variant}
              variant={variant}
              loading={loadingId === variant}
              onClick={() => simulateLoad(variant)}
            >
              {variant.charAt(0).toUpperCase() + variant.slice(1)}
            </Button>
          ),
        )}
      </Row>

      <Row label="State — swap active (label fisso, solo per preview)">
        <Button
          variant="primary"
          swapLabel={{ idle: "Salva ricetta", active: "Salvato ✓" }}
          swapActive={true}
        >
          Salva ricetta
        </Button>
        <Button
          variant="secondary"
          swapLabel={{ idle: "Copia link", active: "Copiato ✓" }}
          swapActive={true}
        >
          Copia link
        </Button>
        <Button
          variant="ghost"
          size="xs"
          swapLabel={{ idle: "OKLCH", active: "copiato ✓" }}
          swapActive={true}
          style={{ fontFamily: "monospace" }}
        >
          OKLCH
        </Button>
      </Row>

      <Row label="Matrix — varianti × dimensioni">
        {(["primary", "secondary", "ghost", "destructive"] as const).map(
          (variant) =>
            (["xs", "sm", "md", "lg"] as const).map((size) => (
              <Button key={`${variant}-${size}`} variant={variant} size={size}>
                {variant} {size}
              </Button>
            )),
        )}
      </Row>
    </section>
  );
}
