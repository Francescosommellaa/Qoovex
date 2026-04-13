"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button, SearchBar, type SearchResult } from "@qoovex/ui";
import { SectionHeader } from "../app/sirio-content";

// ─── Row ──────────────────────────────────────────────────────────────────────

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
          flexDirection: "column",
          gap: "var(--space-4)",
          maxWidth: "560px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── SearchPreview — spazio dinamico basato sull'altezza reale del dropdown ───

function SearchPreview({
  children,
  zIndex = 10,
}: {
  children: React.ReactNode;
  zIndex?: number;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [extraHeight, setExtraHeight] = useState(0);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    function measure() {
      const dropdown = el!.querySelector<HTMLElement>(".search-bar-dropdown");
      if (dropdown) {
        // Altezza dropdown + 16px di respiro
        setExtraHeight(dropdown.offsetHeight + 16);
      } else {
        setExtraHeight(0);
      }
    }

    measure();

    // Ricalcola se il dropdown cambia dimensione (es. più risultati)
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    // Osserva anche il dropdown se esiste
    const dropdown = el.querySelector(".search-bar-dropdown");
    if (dropdown) ro.observe(dropdown);

    // MutationObserver per quando il dropdown appare/scompare dal DOM
    const mo = new MutationObserver(measure);
    mo.observe(el, { childList: true, subtree: true });

    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        zIndex,
        paddingBottom: `${extraHeight}px`,
        transition: "padding-bottom 150ms ease",
      }}
    >
      {children}
    </div>
  );
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const ALL_RESULTS: SearchResult[] = [
  {
    id: "rec1",
    category: "recent",
    label: "Risotto al limone",
    description: "Modificata 2 ore fa",
  },
  {
    id: "rec2",
    category: "recent",
    label: "Menu degustazione primavera",
    description: "Modificato ieri",
  },
  {
    id: "rcp1",
    category: "recipe",
    label: "Pasta alla Norma",
    description: "Primo · 4 porzioni",
    badge: "Tua",
  },
  {
    id: "rcp2",
    category: "recipe",
    label: "Tiramisù classico",
    description: "Dolce · 6 porzioni",
    badge: "Tua",
  },
  {
    id: "rcp3",
    category: "recipe",
    label: "Pesto alla genovese",
    description: "Salsa · 30 min",
  },
  {
    id: "mn1",
    category: "menu",
    label: "Menu estivo 2025",
    description: "12 portate · 3 allergie",
    badge: "Attivo",
  },
  {
    id: "mn2",
    category: "menu",
    label: "Degustazione 7 portate",
    description: "Chef's table",
  },
  {
    id: "wp1",
    category: "work-plan",
    label: "Servizio sabato sera",
    description: "3 membri · 8 task",
    badge: "In corso",
  },
  {
    id: "ac1",
    category: "action",
    label: "Nuova ricetta",
    description: "Crea una ricetta da zero",
    shortcut: "⌘N",
    icon: <Plus size={14} strokeWidth={1.5} />,
  },
  {
    id: "ac2",
    category: "action",
    label: "Genera menu con IA",
    description: "Costruisci un menu dagli ingredienti",
    shortcut: "⌘M",
  },
  {
    id: "ac3",
    category: "action",
    label: "Esporta lista della spesa",
    description: "PDF o CSV",
  },
  {
    id: "cmd1",
    category: "command",
    label: "/nuova-ricetta",
    description: "Apre la creazione guidata",
    shortcut: "/nr",
  },
  {
    id: "cmd2",
    category: "command",
    label: "/piano",
    description: "Vai al piano di lavoro attivo",
    shortcut: "/p",
  },
];

// ─── Sezione ──────────────────────────────────────────────────────────────────

export function SezioneSearchBar() {
  const [isLoading, setIsLoading] = useState(false);
  const [liveQuery, setLiveQuery] = useState("");
  const [lastAction, setLastAction] = useState<string | null>(null);

  const liveResults = useMemo(() => {
    if (!liveQuery.trim())
      return ALL_RESULTS.filter((r) => r.category === "recent");
    const q = liveQuery.toLowerCase();
    return ALL_RESULTS.filter(
      (r) =>
        r.label.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q),
    );
  }, [liveQuery]);

  function simulateLoading() {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  }

  return (
    <section id="searchbar" className="sirio-section">
      <SectionHeader label="SearchBar" id="searchbar" />

      <Row label="Dropdown — risultati raggruppati per categoria">
        <SearchPreview zIndex={40}>
          <SearchBar
            defaultQuery="pasta"
            results={ALL_RESULTS.filter(
              (r) =>
                r.label.toLowerCase().includes("pasta") ||
                r.category === "action" ||
                r.category === "command",
            )}
            forceOpen
            showHotkey={false}
          />
        </SearchPreview>
      </Row>

      <Row label='Modalità AI — query con "?" o "/ai"'>
        <SearchPreview zIndex={30}>
          <SearchBar
            defaultQuery="? quali ricette posso fare con zucchine e gamberi"
            results={[]}
            forceOpen
            showHotkey={false}
          />
        </SearchPreview>
      </Row>

      <Row label="State — empty">
        <SearchPreview zIndex={20}>
          <SearchBar
            defaultQuery="xyzqwerty123"
            results={[]}
            forceOpen
            showHotkey={false}
          />
        </SearchPreview>
      </Row>

      <Row label="State — loading (click per simulare)">
        <SearchBar
          defaultQuery="Risotto"
          results={[]}
          isLoading={isLoading}
          showHotkey={false}
        />
        <div>
          <Button variant="secondary" size="sm" onClick={simulateLoading}>
            Simula loading
          </Button>
        </div>
      </Row>

      <Row label="Default — collapsed con hotkey">
        <SearchBar showHotkey />
      </Row>

      <Row label='Shortcut custom — prop shortcut="P"'>
        <SearchBar shortcut="P" showHotkey />
      </Row>

      <Row label="Live — digita per cercare, prova /ai o ? per l'IA">
        <SearchBar
          results={liveResults}
          value={liveQuery}
          onValueChange={setLiveQuery}
          onSearch={(q) => setLastAction(`Ricerca: "${q}"`)}
          onAIQuery={(q) => setLastAction(`IA: "${q}"`)}
        />
        {lastAction && (
          <p
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--color-text-muted)",
              fontFamily: "monospace",
            }}
          >
            → {lastAction}
          </p>
        )}
      </Row>
    </section>
  );
}
