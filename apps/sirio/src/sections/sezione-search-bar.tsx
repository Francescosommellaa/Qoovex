"use client";

import { SearchBar, type SearchResult } from "@qoovex/ui";
import {
  BookOpen,
  UtensilsCrossed,
  ListChecks,
  Zap,
  Sparkles,
  Plus,
  Trash2,
} from "lucide-react";
import { SectionHeader } from "../app/sirio-content";

// ─── Helper locali ────────────────────────────────────────────────────────────

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
      {children}
    </div>
  );
}

/**
 * Wrapper per gli stati "aperti" in Sirio.
 * Il pannello è position:absolute — serve un contenitore alto abbastanza
 * da non sovrapporre la row successiva.
 */
function OpenDemo({
  height = 320,
  children,
}: {
  height?: number;
  children: React.ReactNode;
}) {
  return (
    <div style={{ position: "relative", height, maxWidth: 560 }}>
      {children}
    </div>
  );
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_RECIPES: SearchResult[] = [
  {
    id: "r1",
    label: "Risotto al limone e timo",
    description: "4 porzioni · 35 min · Piano: Servizio Sabato",
    category: "recipe",
    onSelect: () => {},
  },
  {
    id: "r2",
    label: "Petto d'anatra con riduzione di Barolo",
    description: "2 porzioni · 50 min",
    category: "recipe",
    onSelect: () => {},
  },
];

const MOCK_MENUS: SearchResult[] = [
  {
    id: "m1",
    label: "Menu Degustazione Estate 2026",
    description: "6 portate · QR attivo",
    category: "menu",
    onSelect: () => {},
  },
];

const MOCK_ACTIONS: SearchResult[] = [
  {
    id: "a1",
    label: "Nuova ricetta",
    description: "Crea una ricetta da zero",
    category: "action",
    badge: "Azione",
    icon: <Plus size={14} strokeWidth={1.5} />,
    onSelect: () => {},
  },
  {
    id: "a2",
    label: "Elimina piano di lavoro",
    description: "Rimuovi un piano esistente",
    category: "action",
    badge: "Azione",
    icon: <Trash2 size={14} strokeWidth={1.5} />,
    onSelect: () => {},
  },
];

const MOCK_WORKPLANS: SearchResult[] = [
  {
    id: "w1",
    label: "Piano Servizio Sabato sera",
    description: "3 membri · SERVICE",
    category: "work-plan",
    onSelect: () => {},
  },
];

const ALL_RESULTS: SearchResult[] = [
  ...MOCK_RECIPES,
  ...MOCK_MENUS,
  ...MOCK_WORKPLANS,
  ...MOCK_ACTIONS,
];

// ─── Sezione ──────────────────────────────────────────────────────────────────

export function SezioneSearchBar() {
  return (
    <section id="search-bar" className="sirio-section">
      <SectionHeader label="SearchBar" id="search-bar" />

      {/* Trigger collapsed */}
      <Row label="Trigger — collapsed (click per aprire)">
        <div style={{ maxWidth: 560 }}>
          <SearchBar
            onSearch={(q) => console.log("search:", q)}
            onAIQuery={(q) => console.log("ai:", q)}
          />
        </div>
      </Row>

      {/* Aperta — suggerimenti default */}
      <Row label="Aperta — vuota (suggerimenti default)">
        <OpenDemo height={260}>
          <SearchBar
            forceOpen
            disableFullscreen
            onSearch={() => {}}
            onAIQuery={() => {}}
          />
        </OpenDemo>
      </Row>

      {/* Aperta — con risultati multi-categoria */}
      <Row label="Aperta — risultati multi-categoria">
        <OpenDemo height={420}>
          <SearchBar
            forceOpen
            disableFullscreen
            defaultQuery="risotto"
            results={ALL_RESULTS}
            onSearch={() => {}}
            onAIQuery={() => {}}
          />
        </OpenDemo>
      </Row>

      {/* Solo ricette */}
      <Row label="Aperta — solo ricette">
        <OpenDemo height={260}>
          <SearchBar
            forceOpen
            disableFullscreen
            defaultQuery="anatra"
            results={MOCK_RECIPES}
            onSearch={() => {}}
            onAIQuery={() => {}}
          />
        </OpenDemo>
      </Row>

      {/* State loading */}
      <Row label="State — loading">
        <OpenDemo height={120}>
          <SearchBar
            forceOpen
            disableFullscreen
            defaultQuery="risotto"
            isLoading
            results={[]}
            onSearch={() => {}}
            onAIQuery={() => {}}
          />
        </OpenDemo>
      </Row>

      {/* Modalità AI */}
      <Row label="Modalità AI — prefisso /ai">
        <OpenDemo height={160}>
          <SearchBar
            forceOpen
            disableFullscreen
            defaultQuery="/ai Suggerisci un primo piatto estivo"
            results={[]}
            onSearch={() => {}}
            onAIQuery={(q) => console.log("ai query:", q)}
          />
        </OpenDemo>
      </Row>

      {/* Modalità AI con ? */}
      <Row label="Modalità AI — prefisso ?">
        <OpenDemo height={160}>
          <SearchBar
            forceOpen
            disableFullscreen
            defaultQuery="?Come bilancio i macro in un menu degustazione?"
            results={[]}
            onSearch={() => {}}
            onAIQuery={(q) => console.log("ai query:", q)}
          />
        </OpenDemo>
      </Row>

      {/* Modalità comando */}
      <Row label="Modalità comando — prefisso /">
        <OpenDemo height={200}>
          <SearchBar
            forceOpen
            disableFullscreen
            defaultQuery="/crea menu"
            results={MOCK_ACTIONS}
            onSearch={() => {}}
            onAIQuery={() => {}}
          />
        </OpenDemo>
      </Row>

      {/* Shortcut custom */}
      <Row label="Shortcut custom — ⌘P">
        <div style={{ maxWidth: 560 }}>
          <SearchBar
            shortcut="P"
            placeholder="Cerca con ⌘P…"
            onSearch={() => {}}
            onAIQuery={() => {}}
          />
        </div>
      </Row>
    </section>
  );
}
