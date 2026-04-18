"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button, SmartSearchBar, type SearchResult } from "@qoovex/ui";
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
    const element = wrapperRef.current;
    if (!element) return;
    const rootElement = element;

    function measure() {
      const dropdown =
        rootElement.querySelector<HTMLElement>(".search-bar-dropdown");
      if (dropdown) {
        setExtraHeight(dropdown.offsetHeight + 16);
      } else {
        setExtraHeight(0);
      }
    }

    measure();

    // Keep enough space below the demo when the dropdown grows or remounts.
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(rootElement);

    const dropdown = rootElement.querySelector(".search-bar-dropdown");
    if (dropdown) {
      resizeObserver.observe(dropdown);
    }

    const mutationObserver = new MutationObserver(measure);
    mutationObserver.observe(rootElement, { childList: true, subtree: true });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
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
    description: "Primo - 4 porzioni",
    badge: "Tua",
  },
  {
    id: "rcp2",
    category: "recipe",
    label: "Tiramisu classico",
    description: "Dolce - 6 porzioni",
    badge: "Tua",
  },
  {
    id: "rcp3",
    category: "recipe",
    label: "Pesto alla genovese",
    description: "Salsa - 30 min",
  },
  {
    id: "mn1",
    category: "menu",
    label: "Menu estivo 2025",
    description: "12 portate - 3 allergie",
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
    description: "3 membri - 8 task",
    badge: "In corso",
  },
  {
    id: "ac1",
    category: "action",
    label: "Nuova ricetta",
    description: "Crea una ricetta da zero",
    shortcut: "Cmd+N",
    icon: <Plus size={14} strokeWidth={1.5} />,
  },
  {
    id: "ac2",
    category: "action",
    label: "Genera menu con IA",
    description: "Costruisci un menu dagli ingredienti",
    shortcut: "Cmd+M",
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

export function SezioneSmartSearchBar() {
  const [isLoading, setIsLoading] = useState(false);
  const [liveQuery, setLiveQuery] = useState("");
  const [lastAction, setLastAction] = useState<string | null>(null);

  const liveResults = useMemo(() => {
    if (!liveQuery.trim()) {
      return ALL_RESULTS.filter((result) => result.category === "recent");
    }

    const query = liveQuery.toLowerCase();
    return ALL_RESULTS.filter(
      (result) =>
        result.label.toLowerCase().includes(query) ||
        result.description?.toLowerCase().includes(query),
    );
  }, [liveQuery]);

  function simulateLoading() {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  }

  return (
    <section id="smartsearchbar" className="sirio-section">
      <SectionHeader label="Smart Search Bar" id="smartsearchbar" />

      <Row label="Dropdown - risultati per categoria">
        <SearchPreview zIndex={40}>
          <SmartSearchBar
            defaultQuery="pasta"
            results={ALL_RESULTS.filter(
              (result) =>
                result.label.toLowerCase().includes("pasta") ||
                result.category === "action" ||
                result.category === "command",
            )}
            forceOpen
            showHotkey={false}
          />
        </SearchPreview>
      </Row>

      <Row label='Modalita IA - query con "?" o "/ai"'>
        <SearchPreview zIndex={30}>
          <SmartSearchBar
            defaultQuery="? quali ricette posso fare con zucchine e gamberi"
            results={[]}
            forceOpen
            showHotkey={false}
          />
        </SearchPreview>
      </Row>

      <Row label="State - empty">
        <SearchPreview zIndex={20}>
          <SmartSearchBar
            defaultQuery="xyzqwerty123"
            results={[]}
            forceOpen
            showHotkey={false}
          />
        </SearchPreview>
      </Row>

      <Row label="State - loading">
        <SmartSearchBar
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

      <Row label="Default - collapsed con hotkey">
        <SmartSearchBar showHotkey />
      </Row>

      <Row label='Shortcut custom - prop shortcut="P"'>
        <SmartSearchBar shortcut="P" showHotkey />
      </Row>

      <Row label="Live - digita per cercare, prova /ai o ? per l'IA">
        <SmartSearchBar
          results={liveResults}
          value={liveQuery}
          onValueChange={setLiveQuery}
          onSearch={(query) => setLastAction(`Ricerca: "${query}"`)}
          onAIQuery={(query) => setLastAction(`IA: "${query}"`)}
        />
        {lastAction ? (
          <p
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--color-text-muted)",
              fontFamily: "monospace",
            }}
          >
            -&gt; {lastAction}
          </p>
        ) : null}
      </Row>
    </section>
  );
}
