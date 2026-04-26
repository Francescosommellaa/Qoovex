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
    icon: "◮",
    description: "Easing, durate, transizioni",
  },
  {
    id: "zindex",
    label: "Z-index",
    icon: "⊕",
    description: "Layer stack",
  },
  {
    id: "button",
    label: "Button",
    icon: "▷",
    description: "Varianti e stati",
  },
  {
    id: "input",
    label: "Input",
    icon: "▬",
    description: "Text, label, stati",
  },
  {
    id: "textarea",
    label: "Textarea",
    icon: "▬",
    description: "Multiline, auto-grow, resize",
  },
  {
    id: "smartsearchbar",
    label: "Smart Search Bar",
    icon: "⊙",
    description: "Ricerca globale con clear",
  },
  {
    id: "searchbar",
    label: "Search Bar",
    icon: "⌕",
    description: "Filtro classico locale",
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
    description: "Surface, panel, bento",
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
    icon: "△",
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

export function SectionHeader({ label, id }: { label: string; id: string }) {
  return (
    <div className="mb-6 flex items-center gap-2.5 border-b border-border pb-4">
      <span className="select-none font-mono text-(length:--text-xs) tracking-[0.08em] text-text-faint">
        #{id}
      </span>
      <h2 className="font-display text-(length:--text-lg) font-semibold tracking-[-0.02em] text-text">
        {label}
      </h2>
    </div>
  );
}
