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
} from "@phosphor-icons/react";
import { Button } from "@qoovex/ui";
import { SectionHeader } from "../app/sirio-content";

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "var(--space-8)" }}>
      <p
        style={{
          fontSize: "0.65rem",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-text-faint)",
          marginBottom: "var(--space-3)",
          fontFamily: "monospace",
        }}
      >
        {label}
      </p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "var(--space-3)",
          alignItems: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
}

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

      <Row label="Sizes - primary">
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

      <Row label="Sizes - secondary">
        <Button variant="secondary" size="sm">
          Small
        </Button>
        <Button variant="secondary" size="md">
          Medium
        </Button>
        <Button variant="secondary" size="lg">
          Large
        </Button>
      </Row>

      <Row label="Icon left">
        <Button variant="primary" size="sm" iconLeft={<ChefHat size={12} />}>
          Nuovo piano
        </Button>
        <Button variant="primary" size="md" iconLeft={<Plus size={14} />}>
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
        <Button variant="ghost" size="md" iconLeft={<ChefHat size={14} />}>
          Il mio profilo
        </Button>
        <Button variant="destructive" size="md" iconLeft={<Trash size={14} />}>
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
          variant="primary"
          size="lg"
          iconRight={<ArrowRight size={16} />}
        >
          Prossimo step
        </Button>
        <Button
          variant="secondary"
          size="md"
          iconRight={<ArrowRight size={14} />}
        >
          Esplora ricette
        </Button>
        <Button variant="ghost" size="md" iconRight={<ArrowRight size={14} />}>
          Scopri di piu
        </Button>
      </Row>

      <Row label="Icon swap">
        <Button
          variant="primary"
          size="sm"
          iconSwap={{
            from: <Plus size={12} />,
            to: <ArrowRight size={12} />,
          }}
        >
          Aggiungi
        </Button>

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
          variant="ghost"
          size="md"
          iconSwap={{
            from: <ChefHat size={14} />,
            to: <ArrowRight size={14} />,
          }}
        >
          Scopri di piu
        </Button>

        <Button
          variant="destructive"
          size="md"
          iconSwap={{
            from: <Trash size={14} />,
            to: <ArrowRight size={14} />,
          }}
        >
          Elimina
        </Button>
      </Row>

      <Row label="State - disabled">
        <Button variant="primary" disabled iconLeft={<Plus size={14} />}>
          Primary
        </Button>
        <Button variant="secondary" disabled iconLeft={<Plus size={14} />}>
          Secondary
        </Button>
        <Button variant="ghost" disabled>
          Ghost
        </Button>
        <Button variant="destructive" disabled iconLeft={<Trash size={14} />}>
          Destructive
        </Button>
      </Row>

      <Row label="State - loading">
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

      <Row label="Matrix - variants x sizes">
        {(["primary", "secondary", "ghost", "destructive"] as const).map(
          (variant) =>
            (["sm", "md", "lg"] as const).map((size) => (
              <Button key={`${variant}-${size}`} variant={variant} size={size}>
                {variant} {size}
              </Button>
            )),
        )}
      </Row>
    </section>
  );
}
