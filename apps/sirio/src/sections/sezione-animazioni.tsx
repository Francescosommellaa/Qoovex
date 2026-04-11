"use client";

import { useState } from "react";
import { SectionHeader } from "../app/page";

const TRANSITIONS = [
  {
    token: "--transition-fast",
    value: "120ms",
    curve: "cubic-bezier(0.16, 1, 0.3, 1)",
    usage: "Hover state, color change, opacity",
  },
  {
    token: "--transition-base",
    value: "180ms",
    curve: "cubic-bezier(0.16, 1, 0.3, 1)",
    usage: "Button press, input focus, sidebar link",
  },
  {
    token: "--transition-slow",
    value: "300ms",
    curve: "cubic-bezier(0.16, 1, 0.3, 1)",
    usage: "Modal open, bottom sheet, page transition",
  },
] as const;

function AnimDemo({
  token,
  value,
  label,
}: {
  token: string;
  value: string;
  label: string;
}) {
  const [active, setActive] = useState(false);

  return (
    <div
      style={{
        padding: "var(--space-5)",
        borderRadius: "var(--radius-lg)",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "monospace",
            fontSize: "0.65rem",
            color: "var(--color-primary)",
            marginBottom: "4px",
          }}
        >
          {token}
        </div>
        <div
          style={{
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            color: "var(--color-text)",
            marginBottom: "2px",
          }}
        >
          {value}
        </div>
        <div style={{ fontSize: "0.65rem", color: "var(--color-text-muted)" }}>
          {label}
        </div>
      </div>
      {/* Demo interattivo */}
      <button
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
        style={{
          padding: "var(--space-3) var(--space-5)",
          borderRadius: "var(--radius-md)",
          border: `1px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`,
          background: active
            ? "var(--color-primary-highlight)"
            : "var(--color-surface-2)",
          color: active ? "var(--color-text)" : "var(--color-text-muted)",
          fontSize: "var(--text-sm)",
          fontWeight: 500,
          transition: `all var(${token})`,
          transform: active ? "scale(1.02)" : "scale(1)",
          cursor: "pointer",
        }}
      >
        Hover qui → {active ? "✓ attivo" : "prova"}
      </button>
    </div>
  );
}

export function SezioneAnimazioni() {
  return (
    <section id="animazioni" className="sirio-section">
      <SectionHeader label="Animazioni & Transizioni" id="animazioni" />
      <p
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--color-text-muted)",
          lineHeight: 1.7,
          maxWidth: "58ch",
          marginBottom: "var(--space-4)",
        }}
      >
        Tutte le transizioni usano la stessa curva di easing{" "}
        <code
          style={{
            fontFamily: "monospace",
            fontSize: "0.8em",
            color: "var(--color-primary)",
            background: "var(--color-primary-highlight)",
            padding: "1px 6px",
            borderRadius: "var(--radius-sm)",
          }}
        >
          cubic-bezier(0.16, 1, 0.3, 1)
        </code>{" "}
        — una ease-out aggressiva che dà reattività immediata con un arresto
        morbido.
      </p>
      <div
        style={{
          padding: "var(--space-4)",
          borderRadius: "var(--radius-md)",
          background: "var(--color-primary-highlight)",
          border: "1px solid var(--color-primary-highlight)",
          marginBottom: "var(--space-8)",
        }}
      >
        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--color-text-muted)",
            fontStyle: "italic",
          }}
        >
          Hover sui pulsanti qui sotto per sentire la differenza tra le tre
          durate.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "var(--space-4)",
          marginBottom: "var(--space-8)",
        }}
      >
        {TRANSITIONS.map((t) => (
          <AnimDemo
            key={t.token}
            token={t.token}
            value={`${t.value} · ease-out`}
            label={t.usage}
          />
        ))}
      </div>

      {/* Regole */}
      <div
        style={{
          padding: "var(--space-5)",
          borderRadius: "var(--radius-lg)",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
        }}
      >
        <div
          style={{
            fontSize: "0.6rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-text-faint)",
          }}
        >
          Regole
        </div>
        {[
          "Anima solo: color, background, border-color, box-shadow, transform, opacity",
          "Non animare mai: width, height, padding, margin (causano reflow)",
          "prefers-reduced-motion: tutte le transizioni collassano a 0.01ms automaticamente",
          "Nessun elemento non-interattivo riceve :hover styles",
        ].map((r) => (
          <div
            key={r}
            style={{
              display: "flex",
              gap: "var(--space-3)",
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                color: "var(--color-primary)",
                fontSize: "0.65rem",
                marginTop: "2px",
                flexShrink: 0,
              }}
            >
              ◈
            </span>
            <span
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-text-muted)",
              }}
            >
              {r}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
