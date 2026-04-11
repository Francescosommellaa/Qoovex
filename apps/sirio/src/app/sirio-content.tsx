"use client";

export const SECTIONS = [
  {
    id: "fondamenta",
    label: "Fondamenta",
    icon: "◆",
    description: "Principi e stack",
  },
  {
    id: "colori",
    label: "Colori",
    icon: "◉",
    description: "Palette e token semantici",
  },
  {
    id: "tipografia",
    label: "Tipografia",
    icon: "T",
    description: "Satoshi + Chillax, type scale",
  },
  { id: "spacing", label: "Spacing", icon: "⊾", description: "Sistema 4px" },
  {
    id: "radius",
    label: "Corner Radius",
    icon: "◻",
    description: "Da sm a full",
  },
  {
    id: "shadows",
    label: "Shadows",
    icon: "◫",
    description: "Elevazione e profondita",
  },
  {
    id: "animazioni",
    label: "Animazioni",
    icon: "◎",
    description: "Easing, durate, transizioni",
  },
  { id: "zindex", label: "Z-index", icon: "⊕", description: "Layer stack" },
  { id: "button", label: "Button", icon: "▷", description: "Varianti e stati" },
  { id: "input", label: "Input", icon: "▭", description: "Text, label, stati" },
  {
    id: "textarea",
    label: "Textarea",
    icon: "▬",
    description: "Multiline input",
  },
  {
    id: "searchbar",
    label: "SearchBar",
    icon: "⊙",
    description: "Ricerca globale",
  },
  {
    id: "card",
    label: "Card",
    icon: "▪",
    description: "Flat, elevated, interactive",
  },
  { id: "badge", label: "Badge", icon: "◦", description: "Status e label" },
  {
    id: "form",
    label: "Form",
    icon: "⊟",
    description: "Composizione completa",
  },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

export function SectionHeader({ label, id }: { label: string; id: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.625rem",
        marginBottom: "var(--space-6)",
        paddingBottom: "var(--space-4)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "0.65rem",
          color: "var(--color-text-faint)",
          letterSpacing: "0.08em",
          userSelect: "none",
        }}
      >
        #{id}
      </span>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: "var(--text-lg)",
          letterSpacing: "-0.02em",
          color: "var(--color-text)",
        }}
      >
        {label}
      </h2>
    </div>
  );
}

export function ComingSoon({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: "var(--space-8) var(--space-6)",
        borderRadius: "var(--radius-lg)",
        border: "1px dashed var(--color-border)",
        background: "var(--color-surface)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--space-3)",
        textAlign: "center",
      }}
    >
      <span style={{ fontSize: "1.25rem", opacity: 0.2 }}>◌</span>
      <p
        style={{ fontSize: "var(--text-sm)", color: "var(--color-text-faint)" }}
      >
        <strong
          style={{ fontStyle: "normal", color: "var(--color-text-muted)" }}
        >
          {label}
        </strong>{" "}
        verra popolato nella prossima fase.
      </p>
    </div>
  );
}
