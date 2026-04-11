"use client";

import { useState } from "react";
import { SectionHeader } from "../app/page";

type ColorToken = {
  token: string;
  value: string;
  label: string;
  textColor?: string;
};

type ColorGroup = {
  title: string;
  tokens: ColorToken[];
};

const COLOR_GROUPS: ColorGroup[] = [
  {
    title: "Superfici",
    tokens: [
      { token: "--color-bg", value: "#1a1a1a", label: "Background" },
      { token: "--color-surface", value: "#1f1f1f", label: "Surface" },
      { token: "--color-surface-2", value: "#242424", label: "Surface 2" },
      {
        token: "--color-surface-offset",
        value: "#292929",
        label: "Surface Offset",
      },
      {
        token: "--color-surface-dynamic",
        value: "#303030",
        label: "Surface Dynamic",
      },
    ],
  },
  {
    title: "Bordi",
    tokens: [
      {
        token: "--color-border",
        value: "rgba(255,255,255,0.08)",
        label: "Border",
      },
      {
        token: "--color-divider",
        value: "rgba(255,255,255,0.05)",
        label: "Divider",
      },
    ],
  },
  {
    title: "Testo",
    tokens: [
      { token: "--color-text", value: "#f0f0f0", label: "Text" },
      {
        token: "--color-text-muted",
        value: "rgba(240,240,240,0.50)",
        label: "Text Muted",
      },
      {
        token: "--color-text-faint",
        value: "rgba(240,240,240,0.25)",
        label: "Text Faint",
      },
      {
        token: "--color-text-inverse",
        value: "#1a1a1a",
        label: "Text Inverse",
        textColor: "#f0f0f0",
      },
    ],
  },
  {
    title: "Primary — Corallo Tartare",
    tokens: [
      { token: "--color-primary", value: "#FF6B6B", label: "Primary" },
      {
        token: "--color-primary-hover",
        value: "#ff5252",
        label: "Primary Hover",
      },
      {
        token: "--color-primary-active",
        value: "#e03e3e",
        label: "Primary Active",
      },
      {
        token: "--color-primary-highlight",
        value: "rgba(255,107,107,0.12)",
        label: "Primary Highlight",
      },
    ],
  },
  {
    title: "Feedback",
    tokens: [
      { token: "--color-success", value: "#4caf7d", label: "Success" },
      {
        token: "--color-success-highlight",
        value: "rgba(76,175,125,0.12)",
        label: "Success Highlight",
      },
      { token: "--color-warning", value: "#f5a623", label: "Warning" },
      {
        token: "--color-warning-highlight",
        value: "rgba(245,166,35,0.12)",
        label: "Warning Highlight",
      },
      { token: "--color-error", value: "#ff4d4d", label: "Error" },
      {
        token: "--color-error-highlight",
        value: "rgba(255,77,77,0.12)",
        label: "Error Highlight",
      },
    ],
  },
];

function ColorChip({ token, value, label, textColor }: ColorToken) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(token).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="sirio-token-chip"
      title={`Copia ${token}`}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
        background: "none",
        border: "none",
        padding: 0,
        textAlign: "left",
        width: "100%",
      }}
    >
      {/* Swatch */}
      <div
        style={{
          height: "56px",
          borderRadius: "var(--radius-md)",
          background: `var(${token}, ${value})`,
          border: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition:
            "transform var(--transition-fast), box-shadow var(--transition-fast)",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = "scale(1.02)";
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            "var(--shadow-md)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        }}
      >
        {copied && (
          <span
            style={{
              fontSize: "0.65rem",
              fontWeight: 600,
              color: textColor ?? "var(--color-text)",
              background: "oklch(0 0 0 / 0.4)",
              padding: "3px 8px",
              borderRadius: "var(--radius-full)",
              backdropFilter: "blur(4px)",
            }}
          >
            copiato ✓
          </span>
        )}
      </div>
      {/* Info */}
      <div>
        <div
          style={{
            fontSize: "var(--text-sm)",
            fontWeight: 500,
            color: "var(--color-text)",
            marginBottom: "1px",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: "0.65rem",
            color: "var(--color-text-faint)",
            fontFamily: "monospace",
            lineHeight: 1.4,
          }}
        >
          {token}
        </div>
        <div
          style={{
            fontSize: "0.6rem",
            color: "var(--color-text-faint)",
            fontFamily: "monospace",
            opacity: 0.6,
          }}
        >
          {value}
        </div>
      </div>
    </button>
  );
}

export function SezioneColori() {
  return (
    <section id="colori" className="sirio-section">
      <SectionHeader label="Colori" id="colori" />
      <p
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--color-text-muted)",
          lineHeight: 1.7,
          maxWidth: "58ch",
          marginBottom: "var(--space-8)",
        }}
      >
        Tutti i colori sono definiti in OKLCH in{" "}
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
          packages/ui/styles/tokens.css
        </code>
        . Clicca su un chip per copiare il nome del token.
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-8)",
        }}
      >
        {COLOR_GROUPS.map((group) => (
          <div key={group.title}>
            <h3
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                color: "var(--color-text-muted)",
                marginBottom: "var(--space-4)",
                letterSpacing: "0.04em",
              }}
            >
              {group.title}
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: "var(--space-4)",
              }}
            >
              {group.tokens.map((t) => (
                <ColorChip key={t.token} {...t} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
