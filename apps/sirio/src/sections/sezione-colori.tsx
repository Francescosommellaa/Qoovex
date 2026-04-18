"use client";

import { useState, useEffect } from "react";
import { Button } from "@qoovex/ui";
import { SectionHeader } from "../app/sirio-content";

type ColorToken = {
  token: string;
  oklch: string;
  label: string;
};

type ColorGroup = {
  title: string;
  tokens: ColorToken[];
};

const COLOR_GROUPS: ColorGroup[] = [
  {
    title: "Superfici",
    tokens: [
      { token: "--color-bg", oklch: "oklch(0.1 0 0)", label: "Background" },
      { token: "--color-surface", oklch: "oklch(0.12 0 0)", label: "Surface" },
      {
        token: "--color-surface-2",
        oklch: "oklch(0.14 0 0)",
        label: "Surface 2",
      },
      {
        token: "--color-surface-offset",
        oklch: "oklch(0.16 0 0)",
        label: "Surface Offset",
      },
      {
        token: "--color-surface-dynamic",
        oklch: "oklch(0.19 0 0)",
        label: "Surface Dynamic",
      },
    ],
  },
  {
    title: "Bordi",
    tokens: [
      {
        token: "--color-border",
        oklch: "oklch(1 0 0 / 0.08)",
        label: "Border",
      },
      {
        token: "--color-divider",
        oklch: "oklch(1 0 0 / 0.05)",
        label: "Divider",
      },
    ],
  },
  {
    title: "Testo",
    tokens: [
      { token: "--color-text", oklch: "oklch(0.94 0 0)", label: "Text" },
      {
        token: "--color-text-muted",
        oklch: "oklch(0.94 0 0 / 0.5)",
        label: "Text Muted",
      },
      {
        token: "--color-text-faint",
        oklch: "oklch(0.94 0 0 / 0.25)",
        label: "Text Faint",
      },
      {
        token: "--color-text-inverse",
        oklch: "oklch(0.1 0 0)",
        label: "Text Inverse",
      },
    ],
  },
  {
    title: "Primary — Ink Slate",
    tokens: [
      {
        token: "--color-primary",
        oklch: "oklch(0.42 0.05 240)",
        label: "Primary",
      },
      {
        token: "--color-primary-hover",
        oklch: "oklch(0.36 0.06 240)",
        label: "Primary Hover",
      },
      {
        token: "--color-primary-active",
        oklch: "oklch(0.3 0.06 240)",
        label: "Primary Active",
      },
      {
        token: "--color-primary-highlight",
        oklch: "oklch(0.42 0.05 240 / 0.14)",
        label: "Primary Highlight",
      },
    ],
  },
  {
    title: "Success",
    tokens: [
      {
        token: "--color-success",
        oklch: "oklch(0.65 0.15 152)",
        label: "Success",
      },
      {
        token: "--color-success-hover",
        oklch: "oklch(0.58 0.16 152)",
        label: "Success Hover",
      },
      {
        token: "--color-success-active",
        oklch: "oklch(0.5 0.16 152)",
        label: "Success Active",
      },
      {
        token: "--color-success-highlight",
        oklch: "oklch(0.65 0.15 152 / 0.12)",
        label: "Success Highlight",
      },
    ],
  },
  {
    title: "Warning",
    tokens: [
      {
        token: "--color-warning",
        oklch: "oklch(0.72 0.16 65)",
        label: "Warning",
      },
      {
        token: "--color-warning-hover",
        oklch: "oklch(0.65 0.17 65)",
        label: "Warning Hover",
      },
      {
        token: "--color-warning-active",
        oklch: "oklch(0.57 0.17 65)",
        label: "Warning Active",
      },
      {
        token: "--color-warning-highlight",
        oklch: "oklch(0.72 0.16 65 / 0.12)",
        label: "Warning Highlight",
      },
    ],
  },
  {
    title: "Error",
    tokens: [
      { token: "--color-error", oklch: "oklch(0.52 0.22 22)", label: "Error" },
      {
        token: "--color-error-hover",
        oklch: "oklch(0.46 0.22 22)",
        label: "Error Hover",
      },
      {
        token: "--color-error-active",
        oklch: "oklch(0.4 0.22 22)",
        label: "Error Active",
      },
      {
        token: "--color-error-highlight",
        oklch: "oklch(0.62 0.22 22 / 0.14)",
        label: "Error Highlight",
      },
    ],
  },
];

// Canvas converts OKLCH → sRGB reliably across all modern browsers.
function parseColorFormats(
  oklchStr: string,
): { hex: string; rgb: string } | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = oklchStr;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  const alpha = +(a / 255).toFixed(2);
  const h = (n: number) => n.toString(16).padStart(2, "0");
  return {
    hex:
      alpha === 1 ? `#${h(r)}${h(g)}${h(b)}` : `#${h(r)}${h(g)}${h(b)}${h(a)}`,
    rgb:
      alpha === 1
        ? `rgb(${r}, ${g}, ${b})`
        : `rgba(${r}, ${g}, ${b}, ${alpha})`,
  };
}

// Fallback for HTTP contexts and mobile WebViews where navigator.clipboard is absent.
async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  const el = document.createElement("textarea");
  el.value = text;
  el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0;";
  document.body.appendChild(el);
  el.focus();
  el.select();
  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(el);
  }
}

type CopiedFormat = "OKLCH" | "HEX" | "RGB" | null;

function ColorChip({ token, oklch, label }: ColorToken) {
  const [copiedFormat, setCopiedFormat] = useState<CopiedFormat>(null);
  const [formats, setFormats] = useState<{ hex: string; rgb: string } | null>(
    null,
  );

  useEffect(() => {
    setFormats(parseColorFormats(oklch));
  }, [oklch]);

  function copy(text: string, format: CopiedFormat) {
    if (!text) return;
    copyToClipboard(text).then(() => {
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 1600);
    });
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
        width: "100%",
      }}
    >
      <div
        style={{
          height: "56px",
          borderRadius: "var(--radius-md)",
          background: `var(${token}, ${oklch})`,
          border: "1px solid var(--color-border)",
        }}
      />

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
            fontSize: "0.58rem",
            color: "var(--color-text-faint)",
            fontFamily: "monospace",
            opacity: 0.55,
            marginBottom: "var(--space-2)",
          }}
        >
          {oklch}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "var(--space-2)",
          padding: "var(--space-2) 0",
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copy(oklch, "OKLCH")}
          style={{
            flex: 1,
            fontFamily: "monospace",
            fontSize: "0.7rem",
            transition: "all 0.2s ease",
          }}
        >
          {copiedFormat === "OKLCH" ? "Copiato" : "OKLCH"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copy(formats?.hex ?? "", "HEX")}
          disabled={!formats}
          style={{
            flex: 1,
            fontFamily: "monospace",
            fontSize: "0.7rem",
            transition: "all 0.2s ease",
          }}
        >
          {copiedFormat === "HEX" ? "Copiato" : "HEX"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copy(formats?.rgb ?? "", "RGB")}
          disabled={!formats}
          style={{
            flex: 1,
            fontFamily: "monospace",
            fontSize: "0.7rem",
            transition: "all 0.2s ease",
          }}
        >
          {copiedFormat === "RGB" ? "Copiato" : "RGB"}
        </Button>
      </div>
    </div>
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
        . Copia ogni colore nel formato che preferisci.
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
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "var(--space-6)",
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
