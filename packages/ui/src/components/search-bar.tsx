"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Search,
  X,
  Loader2,
  Command,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  UtensilsCrossed,
  ListChecks,
  ShoppingCart,
  Zap,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SearchResultCategory =
  | "recipe"
  | "menu"
  | "work-plan"
  | "shopping-list"
  | "action"
  | "ai";

export interface SearchResult {
  id: string;
  label: string;
  description?: string;
  category: SearchResultCategory;
  icon?: React.ReactNode;
  onSelect: () => void;
  badge?: string;
}

export interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  results?: SearchResult[];
  isLoading?: boolean;
  onAIQuery?: (query: string) => void;
  shortcut?: string;
  className?: string;
  /** Forza il pannello sempre aperto — usato in Sirio */
  forceOpen?: boolean;
  /** Query preimpostata al mount — usato in Sirio */
  defaultQuery?: string;
  /**
   * Disabilita l'overlay full-screen su mobile.
   * Utile in Sirio dove il componente vive dentro un container fisso.
   */
  disableFullscreen?: boolean;
}

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
  SearchResultCategory,
  { label: string; icon: React.ReactNode; color: string }
> = {
  recipe: {
    label: "Ricette",
    icon: <BookOpen size={14} strokeWidth={1.5} />,
    color: "var(--color-primary)",
  },
  menu: {
    label: "Menu",
    icon: <UtensilsCrossed size={14} strokeWidth={1.5} />,
    color: "var(--color-warning)",
  },
  "work-plan": {
    label: "Piano di lavoro",
    icon: <ListChecks size={14} strokeWidth={1.5} />,
    color: "var(--color-success)",
  },
  "shopping-list": {
    label: "Lista spesa",
    icon: <ShoppingCart size={14} strokeWidth={1.5} />,
    color: "var(--color-blue)",
  },
  action: {
    label: "Azioni",
    icon: <Zap size={14} strokeWidth={1.5} />,
    color: "var(--color-gold)",
  },
  ai: {
    label: "AI",
    icon: <Sparkles size={14} strokeWidth={1.5} />,
    color: "var(--color-purple)",
  },
};

// ─── SearchBar ────────────────────────────────────────────────────────────────

export function SearchBar({
  placeholder = "Cerca ricette, menu, azioni…",
  onSearch,
  results = [],
  isLoading = false,
  onAIQuery,
  shortcut = "K",
  className,
  forceOpen = false,
  defaultQuery = "",
  disableFullscreen = false,
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(forceOpen);
  const [query, setQuery] = useState(defaultQuery);
  const [selectedIndex, setSelectedIndex] = useState(0);
  // Rilevamento device — sempre false in SSR, risolto in useEffect
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [modKey, setModKey] = useState<"⌘" | "Ctrl">("⌘");

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isAIMode = query.startsWith("/ai ") || query.startsWith("?");
  const isCommandMode = query.startsWith("/") && !isAIMode;
  const hasQuery = query.trim().length > 0;
  const hasResults = results.length > 0;
  const modeLabel = isAIMode ? "AI" : isCommandMode ? "Comando" : null;

  // Mobile full-screen solo se touch device e non disabilitato
  const useFullscreen = isTouchDevice && !disableFullscreen;

  // ── Rilevamento device ───────────────────────────────────────────────────────
  useEffect(() => {
    const touch = window.matchMedia("(pointer: coarse)").matches;
    const mac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform);
    setIsTouchDevice(touch);
    // ⌘ solo su Mac desktop; su Windows e mobile mostriamo Ctrl
    setModKey(!touch && mac ? "⌘" : "Ctrl");
  }, []);

  // ── Open / close ─────────────────────────────────────────────────────────────
  const open = useCallback(() => {
    if (forceOpen) return;
    setIsOpen(true);
    // Ritardo minimo per garantire il focus dopo il mount del panel
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [forceOpen]);

  const close = useCallback(() => {
    if (forceOpen) return;
    setIsOpen(false);
    setQuery("");
    setSelectedIndex(0);
  }, [forceOpen]);

  const clearQuery = useCallback(() => {
    setQuery("");
    setSelectedIndex(0);
    onSearch?.("");
    inputRef.current?.focus();
  }, [onSearch]);

  // ── AI mode da bottone (mobile) ──────────────────────────────────────────────
  const activateAIMode = useCallback(() => {
    setQuery("/ai ");
    onSearch?.("/ai ");
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [onSearch]);

  // ── Shortcut globale — solo su non-touch ────────────────────────────────────
  useEffect(() => {
    if (forceOpen || isTouchDevice) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toUpperCase() === shortcut) {
        e.preventDefault();
        isOpen ? close() : open();
      }
      if (e.key === "Escape" && isOpen) close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, open, close, shortcut, forceOpen, isTouchDevice]);

  // ── Click fuori — solo desktop ───────────────────────────────────────────────
  useEffect(() => {
    if (forceOpen || useFullscreen) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, close, forceOpen, useFullscreen]);

  // ── Blocca scroll body quando full-screen mobile ─────────────────────────────
  useEffect(() => {
    if (useFullscreen && isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [useFullscreen, isOpen]);

  // ── Navigazione tastiera ─────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (isAIMode && onAIQuery) {
        onAIQuery(query.replace(/^\/ai |\?/, "").trim());
        if (!forceOpen) close();
        return;
      }
      if (results[selectedIndex]) {
        results[selectedIndex].onSelect();
        if (!forceOpen) close();
      }
    } else if (e.key === "Escape") {
      if (!forceOpen) close();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedIndex(0);
    onSearch?.(val);
  };

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {});

  // ─── Stili panel — full-screen su mobile, dropdown su desktop ──────────────
  const panelStyle: React.CSSProperties = useFullscreen
    ? {
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "var(--color-surface)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }
    : {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-lg)",
        overflow: "hidden",
      };

  // ─── Altezza touch target per i risultati ─────────────────────────────────
  const rowMinHeight = isTouchDevice ? 52 : 40;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "relative", width: "100%" }}
    >
      {/* ── Trigger collapsed ────────────────────────────────────────────── */}
      {!isOpen && (
        <button
          type="button"
          onClick={open}
          aria-label="Apri ricerca"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            width: "100%",
            padding: "var(--space-2) var(--space-3)",
            background: "var(--color-surface-offset)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-text-muted)",
            fontSize: "var(--text-sm)",
            cursor: "pointer",
            // Touch target minimo garantito dal padding, ma esplicitiamo l'altezza
            minHeight: 40,
            transition: `border-color var(--transition-interactive), box-shadow var(--transition-interactive)`,
          }}
          onMouseEnter={(e) => {
            if (isTouchDevice) return;
            const el = e.currentTarget as HTMLButtonElement;
            el.style.borderColor = "var(--color-primary)";
            el.style.boxShadow =
              "0 0 0 2px color-mix(in oklch, var(--color-primary) 15%, transparent)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.borderColor = "var(--color-border)";
            el.style.boxShadow = "none";
          }}
        >
          <Search
            size={16}
            strokeWidth={1.5}
            style={{ flexShrink: 0, color: "var(--color-text-faint)" }}
          />
          <span style={{ flex: 1, textAlign: "left" }}>{placeholder}</span>

          {/* Badge shortcut — solo su desktop, con il tasto corretto per l'OS */}
          {!isTouchDevice && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--space-1)",
                padding: "2px var(--space-2)",
                background: "var(--color-surface-dynamic)",
                borderRadius: "var(--radius-sm)",
                fontSize: "var(--text-xs)",
                color: "var(--color-text-faint)",
                fontFamily: "monospace",
                flexShrink: 0,
              }}
            >
              {modKey === "⌘" ? (
                <Command size={11} strokeWidth={1.5} />
              ) : (
                <span>Ctrl</span>
              )}
              {modKey === "⌘" ? shortcut : `+${shortcut}`}
            </span>
          )}
        </button>
      )}

      {/* ── Pannello aperto ───────────────────────────────────────────────── */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Ricerca"
          style={panelStyle}
        >
          {/* Input row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              padding: useFullscreen
                ? "var(--space-3) var(--space-4)"
                : "var(--space-2) var(--space-3)",
              borderBottom: "1px solid var(--color-divider)",
              flexShrink: 0,
            }}
          >
            {/* Back button (mobile) / Search icon (desktop) */}
            {useFullscreen ? (
              <button
                type="button"
                onClick={close}
                aria-label="Chiudi ricerca"
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius-full)",
                  color: "var(--color-text-muted)",
                  cursor: "pointer",
                  marginRight: "var(--space-1)",
                  transition: `background var(--transition-interactive)`,
                }}
                onTouchStart={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background =
                    "var(--color-surface-dynamic)")
                }
                onTouchEnd={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background =
                    "transparent")
                }
              >
                <ArrowLeft size={20} strokeWidth={2} />
              </button>
            ) : (
              <span
                style={{
                  flexShrink: 0,
                  color: isAIMode
                    ? "var(--color-purple)"
                    : isCommandMode
                      ? "var(--color-gold)"
                      : "var(--color-text-faint)",
                  display: "flex",
                  transition: `color var(--transition-interactive)`,
                }}
              >
                {isAIMode ? (
                  <Sparkles size={16} strokeWidth={1.5} />
                ) : (
                  <Search size={16} strokeWidth={1.5} />
                )}
              </span>
            )}

            {/* Mode pill */}
            {modeLabel && (
              <span
                style={{
                  padding: "2px var(--space-2)",
                  borderRadius: "var(--radius-full)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 500,
                  background: isAIMode
                    ? "color-mix(in oklch, var(--color-purple) 12%, transparent)"
                    : "color-mix(in oklch, var(--color-gold) 12%, transparent)",
                  color: isAIMode ? "var(--color-purple)" : "var(--color-gold)",
                  flexShrink: 0,
                }}
              >
                {modeLabel}
              </span>
            )}

            <input
              ref={inputRef}
              type="text"
              inputMode="search"
              value={query}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={
                isAIMode
                  ? "Chiedi qualcosa all'AI…"
                  : isCommandMode
                    ? "Scrivi un comando…"
                    : placeholder
              }
              autoComplete="off"
              spellCheck={false}
              aria-autocomplete="list"
              aria-controls="search-results"
              aria-activedescendant={
                hasResults ? `search-result-${selectedIndex}` : undefined
              }
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: useFullscreen ? "var(--text-base)" : "var(--text-sm)",
                color: "var(--color-text)",
                lineHeight: 1.5,
              }}
            />

            {/* Spinner loading */}
            {isLoading && (
              <span
                style={{
                  color: "var(--color-text-faint)",
                  animation: "sq-spin 0.75s linear infinite",
                  flexShrink: 0,
                  display: "flex",
                }}
              >
                <Loader2 size={18} strokeWidth={1.5} />
              </span>
            )}

            {/* Clear query */}
            {hasQuery && !isLoading && (
              <button
                type="button"
                onClick={clearQuery}
                aria-label="Cancella ricerca"
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: isTouchDevice ? 36 : 24,
                  height: isTouchDevice ? 36 : 24,
                  borderRadius: "var(--radius-full)",
                  color: "var(--color-text-muted)",
                  cursor: "pointer",
                  transition: `background var(--transition-interactive), color var(--transition-interactive)`,
                }}
                onMouseEnter={(e) => {
                  if (isTouchDevice) return;
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.background = "var(--color-surface-dynamic)";
                  el.style.color = "var(--color-text)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.background = "transparent";
                  el.style.color = "var(--color-text-muted)";
                }}
              >
                <X size={isTouchDevice ? 16 : 14} strokeWidth={2} />
              </button>
            )}

            {/* Bottone AI — solo su mobile e solo quando NON siamo già in AI mode */}
            {isTouchDevice && !isAIMode && (
              <button
                type="button"
                onClick={activateAIMode}
                aria-label="Attiva modalità AI"
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius-full)",
                  background:
                    "color-mix(in oklch, var(--color-purple) 10%, var(--color-surface-offset))",
                  color: "var(--color-purple)",
                  cursor: "pointer",
                  transition: `background var(--transition-interactive)`,
                }}
                onTouchStart={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background =
                    "color-mix(in oklch, var(--color-purple) 20%, var(--color-surface-offset))")
                }
                onTouchEnd={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background =
                    "color-mix(in oklch, var(--color-purple) 10%, var(--color-surface-offset))")
                }
              >
                <Sparkles size={16} strokeWidth={1.5} />
              </button>
            )}

            {/* Esc button — solo desktop */}
            {!forceOpen && !useFullscreen && (
              <button
                type="button"
                onClick={close}
                aria-label="Chiudi ricerca"
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  padding: "2px var(--space-2)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "var(--text-xs)",
                  color: "var(--color-text-faint)",
                  fontFamily: "monospace",
                  background: "var(--color-surface-dynamic)",
                  cursor: "pointer",
                  transition: `background var(--transition-interactive)`,
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background =
                    "var(--color-surface-offset-2)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background =
                    "var(--color-surface-dynamic)")
                }
              >
                esc
              </button>
            )}
          </div>

          {/* ── Lista risultati / suggerimenti ──────────────────────────── */}
          <ul
            id="search-results"
            role="listbox"
            aria-label="Risultati ricerca"
            style={{
              listStyle: "none",
              margin: 0,
              padding: "var(--space-2) 0",
              flex: 1,
              overflowY: "auto",
              // Su mobile non limitiamo l'altezza (full-screen gestisce già il layout)
              maxHeight: useFullscreen ? "none" : 300,
            }}
          >
            {!hasQuery && !hasResults && !isLoading && (
              <DefaultSuggestions
                isTouchDevice={isTouchDevice}
                rowMinHeight={rowMinHeight}
                onSelect={(s) => {
                  setQuery(s);
                  onSearch?.(s);
                }}
              />
            )}

            {hasResults &&
              Object.entries(grouped).map(([cat, items]) => {
                const config =
                  CATEGORY_CONFIG[cat as SearchResultCategory] ??
                  CATEGORY_CONFIG.action;
                return (
                  <li key={cat} role="none">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-2)",
                        padding: "var(--space-2) var(--space-3) var(--space-1)",
                        color: "var(--color-text-faint)",
                        fontSize: "var(--text-xs)",
                        fontWeight: 500,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      <span style={{ color: config.color }}>{config.icon}</span>
                      {config.label}
                    </div>
                    <ul
                      role="group"
                      style={{ listStyle: "none", padding: 0, margin: 0 }}
                    >
                      {items.map((result) => {
                        const globalIdx = results.indexOf(result);
                        return (
                          <SearchResultItem
                            key={result.id}
                            result={result}
                            id={`search-result-${globalIdx}`}
                            isSelected={
                              !isTouchDevice && globalIdx === selectedIndex
                            }
                            isTouchDevice={isTouchDevice}
                            rowMinHeight={rowMinHeight}
                            onSelect={() => {
                              result.onSelect();
                              if (!forceOpen) close();
                            }}
                            onHover={() =>
                              !isTouchDevice && setSelectedIndex(globalIdx)
                            }
                          />
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
          </ul>

          {/* ── AI mode CTA ─────────────────────────────────────────────── */}
          {isAIMode && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: useFullscreen
                  ? "var(--space-3) var(--space-4)"
                  : "var(--space-2) var(--space-3)",
                borderTop: "1px solid var(--color-divider)",
                background:
                  "color-mix(in oklch, var(--color-purple) 5%, var(--color-surface))",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  color: "var(--color-purple)",
                  fontSize: "var(--text-xs)",
                }}
              >
                <Sparkles size={13} strokeWidth={1.5} />
                {isTouchDevice
                  ? "Tocca Invia per chiedere all'AI"
                  : "Modalità AI — premi Invio per inviare"}
              </span>
              <button
                type="button"
                onClick={() => {
                  onAIQuery?.(query.replace(/^\/ai |\?/, "").trim());
                  if (!forceOpen) close();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-1)",
                  padding: isTouchDevice
                    ? "var(--space-2) var(--space-3)"
                    : "var(--space-1) var(--space-2)",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--color-purple)",
                  color: "#fff",
                  fontSize: "var(--text-sm)",
                  fontWeight: 500,
                  cursor: "pointer",
                  border: "none",
                  minHeight: isTouchDevice ? 40 : "auto",
                  transition: `opacity var(--transition-interactive)`,
                }}
              >
                Invia
                <ArrowRight size={14} strokeWidth={2} />
              </button>
            </div>
          )}

          {/* ── Footer keyboard hints — solo su desktop ──────────────────── */}
          {!isAIMode && !isTouchDevice && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-4)",
                padding: "var(--space-2) var(--space-3)",
                borderTop: "1px solid var(--color-divider)",
                color: "var(--color-text-faint)",
                fontSize: "var(--text-xs)",
                flexShrink: 0,
              }}
            >
              {[
                { kbd: "↑↓", label: "naviga" },
                { kbd: "↵", label: "apri" },
                { kbd: "esc", label: "chiudi" },
              ].map(({ kbd, label }) => (
                <span
                  key={kbd}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-1)",
                  }}
                >
                  <kbd
                    style={{
                      fontFamily: "monospace",
                      background: "var(--color-surface-dynamic)",
                      padding: "1px var(--space-1)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.65rem",
                    }}
                  >
                    {kbd}
                  </kbd>
                  {label}
                </span>
              ))}
              <span
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-1)",
                }}
              >
                <kbd
                  style={{
                    fontFamily: "monospace",
                    background: "var(--color-surface-dynamic)",
                    padding: "1px var(--space-1)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.65rem",
                  }}
                >
                  /ai
                </kbd>
                oppure
                <kbd
                  style={{
                    fontFamily: "monospace",
                    background: "var(--color-surface-dynamic)",
                    padding: "1px var(--space-1)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.65rem",
                  }}
                >
                  ?
                </kbd>
                per l'AI
              </span>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes sq-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── SearchResultItem ─────────────────────────────────────────────────────────

function SearchResultItem({
  result,
  id,
  isSelected,
  isTouchDevice,
  rowMinHeight,
  onSelect,
  onHover,
}: {
  result: SearchResult;
  id: string;
  isSelected: boolean;
  isTouchDevice: boolean;
  rowMinHeight: number;
  onSelect: () => void;
  onHover: () => void;
}) {
  const config = CATEGORY_CONFIG[result.category] ?? CATEGORY_CONFIG.action;

  return (
    <li
      id={id}
      role="option"
      aria-selected={isSelected}
      onMouseEnter={onHover}
      onClick={onSelect}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        padding: isTouchDevice
          ? "var(--space-3) var(--space-4)"
          : "var(--space-2) var(--space-3)",
        minHeight: rowMinHeight,
        cursor: "pointer",
        background: isSelected
          ? "color-mix(in oklch, var(--color-primary) 8%, var(--color-surface))"
          : "transparent",
        transition: `background var(--transition-interactive)`,
        WebkitTapHighlightColor: "transparent",
      }}
      onTouchStart={(e) => {
        (e.currentTarget as HTMLLIElement).style.background =
          "color-mix(in oklch, var(--color-primary) 8%, var(--color-surface))";
      }}
      onTouchEnd={(e) => {
        (e.currentTarget as HTMLLIElement).style.background = "transparent";
      }}
    >
      <span
        style={{
          flexShrink: 0,
          width: isTouchDevice ? 36 : 28,
          height: isTouchDevice ? 36 : 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "var(--radius-sm)",
          background: `color-mix(in oklch, ${config.color} 10%, var(--color-surface-offset))`,
          color: config.color,
        }}
      >
        {result.icon ?? config.icon}
      </span>

      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontSize: isTouchDevice ? "var(--text-base)" : "var(--text-sm)",
            color: "var(--color-text)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {result.label}
        </span>
        {result.description && (
          <span
            style={{
              display: "block",
              fontSize: "var(--text-xs)",
              color: "var(--color-text-faint)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {result.description}
          </span>
        )}
      </span>

      {result.badge && (
        <span
          style={{
            flexShrink: 0,
            padding: "2px var(--space-2)",
            borderRadius: "var(--radius-full)",
            fontSize: "var(--text-xs)",
            fontWeight: 500,
            background: "var(--color-surface-dynamic)",
            color: "var(--color-text-muted)",
          }}
        >
          {result.badge}
        </span>
      )}

      {/* Arrow — solo su desktop su item selezionato */}
      {isSelected && !isTouchDevice && (
        <ArrowRight
          size={14}
          strokeWidth={2}
          style={{ flexShrink: 0, color: "var(--color-primary)" }}
        />
      )}

      {/* Freccia decorativa sempre visibile su mobile */}
      {isTouchDevice && (
        <ArrowRight
          size={16}
          strokeWidth={1.5}
          style={{ flexShrink: 0, color: "var(--color-text-faint)" }}
        />
      )}
    </li>
  );
}

// ─── DefaultSuggestions ───────────────────────────────────────────────────────

function DefaultSuggestions({
  onSelect,
  isTouchDevice,
  rowMinHeight,
}: {
  onSelect: (s: string) => void;
  isTouchDevice: boolean;
  rowMinHeight: number;
}) {
  const items = [
    {
      label: "Cerca una ricetta",
      query: "",
      icon: <BookOpen size={14} strokeWidth={1.5} />,
      color: "var(--color-primary)",
    },
    {
      label: "Esplora i menu",
      query: "",
      icon: <UtensilsCrossed size={14} strokeWidth={1.5} />,
      color: "var(--color-warning)",
    },
    {
      label: "Vai al piano di lavoro",
      query: "",
      icon: <ListChecks size={14} strokeWidth={1.5} />,
      color: "var(--color-success)",
    },
    {
      label: "Chiedi all'AI",
      query: "/ai ",
      icon: <Sparkles size={14} strokeWidth={1.5} />,
      color: "var(--color-purple)",
    },
  ];

  return (
    <>
      {items.map((item) => (
        <li
          key={item.label}
          role="option"
          aria-selected={false}
          onClick={() => onSelect(item.query)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            padding: isTouchDevice
              ? "var(--space-3) var(--space-4)"
              : "var(--space-2) var(--space-3)",
            minHeight: rowMinHeight,
            cursor: "pointer",
            fontSize: isTouchDevice ? "var(--text-base)" : "var(--text-sm)",
            color: "var(--color-text-muted)",
            transition: `background var(--transition-interactive)`,
            WebkitTapHighlightColor: "transparent",
          }}
          onMouseEnter={(e) => {
            if (isTouchDevice) return;
            (e.currentTarget as HTMLLIElement).style.background =
              "var(--color-surface-offset)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLLIElement).style.background = "transparent";
          }}
          onTouchStart={(e) => {
            (e.currentTarget as HTMLLIElement).style.background =
              "var(--color-surface-offset)";
          }}
          onTouchEnd={(e) => {
            (e.currentTarget as HTMLLIElement).style.background = "transparent";
          }}
        >
          <span
            style={{
              flexShrink: 0,
              width: isTouchDevice ? 36 : 28,
              height: isTouchDevice ? 36 : 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--radius-sm)",
              background: `color-mix(in oklch, ${item.color} 10%, var(--color-surface-offset))`,
              color: item.color,
            }}
          >
            {item.icon}
          </span>
          <span style={{ flex: 1 }}>{item.label}</span>
          <ArrowRight
            size={isTouchDevice ? 16 : 14}
            strokeWidth={1.5}
            style={{ color: "var(--color-text-faint)", flexShrink: 0 }}
          />
        </li>
      ))}
    </>
  );
}
