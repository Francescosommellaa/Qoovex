"use client";

export const SECTIONS = [
  // ── Fondamenta ──────────────────────────────────────────────
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
  {
    id: "spacing",
    label: "Spacing",
    icon: "⊾",
    description: "Sistema 4px",
  },
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
    description: "Elevazione e profondità",
  },
  {
    id: "animazioni",
    label: "Animazioni",
    icon: "◎",
    description: "Easing, durate, transizioni",
  },
  {
    id: "zindex",
    label: "Z-index",
    icon: "⊕",
    description: "Layer stack",
  },

  // ── Componenti ───────────────────────────────────────────────
  {
    id: "button",
    label: "Button",
    icon: "▷",
    description: "Varianti e stati",
  },
  {
    id: "input",
    label: "Input",
    icon: "▭",
    description: "Text, label, stati",
  },
  {
    id: "textarea",
    label: "Textarea",
    icon: "▬",
    description: "Multiline, auto-grow, resize",
  },
  {
    id: "searchbar",
    label: "SearchBar",
    icon: "⊙",
    description: "Ricerca globale con clear",
  },
  {
    id: "select",
    label: "Select",
    icon: "⌄",
    description: "Dropdown custom, chevron animato",
  },
  {
    id: "card",
    label: "Card",
    icon: "▪",
    description: "Flat, elevated, interactive",
  },
  {
    id: "badge",
    label: "Badge",
    icon: "◦",
    description: "Colori semantici, outline e filled",
  },
  {
    id: "avatar",
    label: "Avatar",
    icon: "◔",
    description: "Immagine, iniziali, size scale",
  },
  {
    id: "divider",
    label: "Divider",
    icon: "─",
    description: "Orizzontale, verticale, con label",
  },
  {
    id: "toggle",
    label: "Toggle",
    icon: "◑",
    description: "Switch animato on/off/disabled",
  },
  {
    id: "checkbox",
    label: "Checkbox & Radio",
    icon: "☐",
    description: "Custom styled, animazione check",
  },
  {
    id: "toast",
    label: "Toast",
    icon: "◳",
    description: "Notifiche, posizioni, dismiss",
  },
  {
    id: "modal",
    label: "Modal / Sheet",
    icon: "◱",
    description: "Bottom sheet mobile, dialog desktop",
  },
  {
    id: "form",
    label: "Form",
    icon: "⊟",
    description: "Composizione completa",
  },
  {
    id: "skeleton",
    label: "Skeleton",
    icon: "░",
    description: "Shimmer loader per card, testo, avatar",
  },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

// ─── Componenti UI condivisi ──────────────────────────────────────

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
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--color-text-faint)",
        }}
      >
        <strong
          style={{ fontStyle: "normal", color: "var(--color-text-muted)" }}
        >
          {label}
        </strong>{" "}
        verrà popolato nella prossima fase.
      </p>
    </div>
  );
}

// ─── Tipi utili per le sezioni ────────────────────────────────────
export type SectionStatus = "done" | "coming-soon";

export const SECTION_STATUS: Record<SectionId, SectionStatus> = {
  fondamenta: "done",
  colori: "done",
  tipografia: "done",
  spacing: "done",
  radius: "done",
  shadows: "done",
  animazioni: "done",
  zindex: "done",
  button: "done",
  input: "done",
  textarea: "done",
  searchbar: "done",
  select: "coming-soon",
  card: "coming-soon",
  badge: "coming-soon",
  avatar: "coming-soon",
  divider: "coming-soon",
  toggle: "coming-soon",
  checkbox: "coming-soon",
  toast: "coming-soon",
  modal: "coming-soon",
  form: "coming-soon",
  skeleton: "coming-soon",
};
