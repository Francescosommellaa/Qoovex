"use client";

import { useState } from "react";
import { Button } from "@qoovex/ui";
import { SectionHeader } from "../app/sirio-content";

// ─── Helper locali ───────────────────────────────────────────────

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

function TokenTag({ token }: { token: string }) {
  return (
    <span
      style={{
        fontFamily: "monospace",
        fontSize: "0.6rem",
        color: "var(--color-text-faint)",
        background: "var(--color-surface-offset)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-sm)",
        padding: "2px 6px",
      }}
    >
      {token}
    </span>
  );
}

// ─── Sezione ─────────────────────────────────────────────────────

export function SezioneButton() {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function simulateLoad(id: string) {
    setLoadingId(id);
    setTimeout(() => setLoadingId(null), 2000);
  }

  return (
    <section id="button" className="sirio-section">
      <SectionHeader label="Button" id="button" />

      {/* Varianti */}
      <Row label="Variants">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
      </Row>

      {/* Sizes */}
      <Row label="Sizes — md (default)">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </Row>

      {/* Sizes per variante */}
      <Row label="Sizes — secondary">
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

      {/* Stato disabled */}
      <Row label="State — disabled">
        <Button variant="primary" disabled>
          Primary
        </Button>
        <Button variant="secondary" disabled>
          Secondary
        </Button>
        <Button variant="ghost" disabled>
          Ghost
        </Button>
        <Button variant="destructive" disabled>
          Destructive
        </Button>
      </Row>

      {/* Stato loading */}
      <Row label="State — loading (click to trigger)">
        {(["primary", "secondary", "ghost", "destructive"] as const).map(
          (v) => (
            <Button
              key={v}
              variant={v}
              loading={loadingId === v}
              onClick={() => simulateLoad(v)}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </Button>
          ),
        )}
      </Row>

      {/* Combinazione sizes × varianti */}
      <Row label="Matrix — all variants × all sizes">
        {(["primary", "secondary", "ghost", "destructive"] as const).map((v) =>
          (["sm", "md", "lg"] as const).map((s) => (
            <Button key={`${v}-${s}`} variant={v} size={s}>
              {v} {s}
            </Button>
          )),
        )}
      </Row>
    </section>
  );
}
