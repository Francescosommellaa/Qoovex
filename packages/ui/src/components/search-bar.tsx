"use client";

import * as React from "react";
import {
  Search,
  X,
  Sparkles,
  ArrowRight,
  Hash,
  ChefHat,
  BookOpen,
  UtensilsCrossed,
  ClipboardList,
  Loader2,
  Zap,
  Command,
} from "lucide-react";
import { cn } from "../lib/utils";

// ─── Tipi ─────────────────────────────────────────────────────────────────────

export type SearchResultCategory =
  | "recipe"
  | "menu"
  | "work-plan"
  | "command"
  | "action"
  | "ai"
  | "recent";

export interface SearchResult {
  id: string;
  category: SearchResultCategory;
  label: string;
  description?: string;
  shortcut?: string;
  badge?: string;
  icon?: React.ReactNode;
  onSelect?: () => void;
}

export interface SearchBarProps {
  placeholder?: string;
  results?: SearchResult[];
  defaultQuery?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  onAIQuery?: (query: string) => void;
  isLoading?: boolean;
  forceOpen?: boolean;
  disableFullscreen?: boolean;
  shortcut?: string;
  showHotkey?: boolean;
  className?: string;
}

// ─── Costanti ─────────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<SearchResultCategory, React.ReactNode> = {
  recipe: <BookOpen size={14} strokeWidth={1.5} />,
  menu: <UtensilsCrossed size={14} strokeWidth={1.5} />,
  "work-plan": <ClipboardList size={14} strokeWidth={1.5} />,
  command: <Hash size={14} strokeWidth={1.5} />,
  action: <Zap size={14} strokeWidth={1.5} />,
  ai: <Sparkles size={14} strokeWidth={1.5} />,
  recent: <ArrowRight size={14} strokeWidth={1.5} />,
};

const CATEGORY_LABELS: Record<SearchResultCategory, string> = {
  recipe: "Ricette",
  menu: "Menu",
  "work-plan": "Piano di lavoro",
  command: "Comandi",
  action: "Azioni",
  ai: "IA",
  recent: "Recenti",
};

const CATEGORY_ORDER: SearchResultCategory[] = [
  "recent",
  "recipe",
  "menu",
  "work-plan",
  "action",
  "command",
  "ai",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupResults(results: SearchResult[]) {
  const map = new Map<SearchResultCategory, SearchResult[]>();
  for (const r of results) {
    if (!map.has(r.category)) map.set(r.category, []);
    map.get(r.category)!.push(r);
  }
  return CATEGORY_ORDER.filter((c) => map.has(c)).map((c) => ({
    category: c,
    label: CATEGORY_LABELS[c],
    items: map.get(c)!,
  }));
}

function detectAiQuery(value: string) {
  return value.startsWith("?") || value.toLowerCase().startsWith("/ai ");
}

function detectCommandQuery(value: string) {
  return value.startsWith("/") && !value.toLowerCase().startsWith("/ai ");
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function SearchBar({
  placeholder = "Cerca ricette, menu, piani… o premi /",
  results = [],
  defaultQuery,
  value: controlledValue,
  onValueChange,
  onSearch,
  onAIQuery,
  isLoading = false,
  forceOpen = false,
  disableFullscreen: _disableFullscreen = false,
  shortcut = "K",
  showHotkey = true,
  className,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = React.useState(defaultQuery ?? "");
  const [open, setOpen] = React.useState(forceOpen);
  const [activeIndex, setActiveIndex] = React.useState(-1);

  const value = controlledValue ?? internalValue;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const aiMode = detectAiQuery(value);
  const commandMode = detectCommandQuery(value);
  const groups = React.useMemo(() => groupResults(results), [results]);
  const isOpen = forceOpen || open;
  const showDropdown = isOpen && (results.length > 0 || value.length > 0);
  const hotkeyLabel = shortcut.toUpperCase();

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    if (controlledValue === undefined) setInternalValue(v);
    onValueChange?.(v);
    setActiveIndex(-1);
    if (!forceOpen) setOpen(true);
  }

  function handleClear() {
    if (controlledValue === undefined) setInternalValue("");
    onValueChange?.("");
    inputRef.current?.focus();
    if (!forceOpen) setOpen(false);
  }

  function handleSelect(item: SearchResult) {
    item.onSelect?.();
    if (controlledValue === undefined) setInternalValue(item.label);
    if (!forceOpen) setOpen(false);
  }

  function handleSubmit() {
    if (aiMode) {
      onAIQuery?.(value);
    } else {
      onSearch?.(value);
    }
    if (!forceOpen) setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const flatItems = results;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && flatItems[activeIndex]) {
        handleSelect(flatItems[activeIndex]);
      } else {
        handleSubmit();
      }
    } else if (e.key === "Escape") {
      if (!forceOpen) {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
  }

  // Scroll item attivo in vista
  React.useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const items =
      listRef.current.querySelectorAll<HTMLElement>("[role='option']");
    items[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  // Click fuori → chiudi
  React.useEffect(() => {
    if (forceOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [forceOpen]);

  // Hotkey globale ⌘K
  React.useEffect(() => {
    if (forceOpen) return;
    function onKey(e: KeyboardEvent) {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === shortcut.toLowerCase()
      ) {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [forceOpen, shortcut]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div ref={rootRef} className={cn("search-bar-root", className)}>
      {/* Field — sempre visibile, unico elemento trigger */}
      <div
        className={cn(
          "search-bar-field",
          isOpen && "search-bar-field--open",
          aiMode && "search-bar-field--ai",
          commandMode && "search-bar-field--command",
        )}
        role="combobox"
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
        aria-owns="search-bar-listbox"
        // Click sul field apre se non è già aperto
        onClick={() => {
          if (!forceOpen && !open) {
            setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 0);
          }
        }}
      >
        {/* Icona sinistra */}
        <span className="search-bar-icon-lead" aria-hidden>
          {isLoading ? (
            <Loader2 size={16} strokeWidth={2} className="search-bar-spinner" />
          ) : aiMode ? (
            <Sparkles
              size={16}
              strokeWidth={1.5}
              className="search-bar-icon-ai"
            />
          ) : (
            <Search size={16} strokeWidth={1.5} />
          )}
        </span>

        {/* Input — sempre nel DOM, mostra placeholder quando chiuso */}
        <input
          ref={inputRef}
          type="text"
          role="searchbox"
          aria-autocomplete="list"
          aria-controls="search-bar-listbox"
          aria-activedescendant={
            activeIndex >= 0 ? `search-bar-item-${activeIndex}` : undefined
          }
          value={value}
          onChange={handleChange}
          onFocus={() => {
            if (!forceOpen) setOpen(true);
          }}
          onBlur={() => {
            // blur gestito da pointerdown fuori, non qui
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            aiMode
              ? "Chiedi all'IA…"
              : commandMode
                ? "Scrivi un comando…"
                : placeholder
          }
          className="search-bar-input"
          autoComplete="off"
          spellCheck={false}
          // Non intercettare il click quando il field è chiuso (lo gestisce il div)
          readOnly={!isOpen && !forceOpen}
          style={{ cursor: !isOpen && !forceOpen ? "pointer" : "text" }}
        />

        {/* Destra: clear | hotkey */}
        {value && isOpen ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="search-bar-clear"
            aria-label="Cancella ricerca"
          >
            <X size={14} strokeWidth={2} />
          </button>
        ) : showHotkey && !isOpen ? (
          <span className="search-bar-hotkey" aria-hidden>
            <Command size={11} strokeWidth={1.5} />
            <kbd>{hotkeyLabel}</kbd>
          </span>
        ) : null}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          id="search-bar-listbox"
          className="search-bar-dropdown"
          role="presentation"
        >
          {/* AI row */}
          {aiMode && value.length > 2 && (
            <div className="search-bar-ai-row">
              <Sparkles
                size={13}
                strokeWidth={1.5}
                className="search-bar-icon-ai"
              />
              <span>
                Chiedi all'IA:{" "}
                <strong>{value.replace(/^(\?|\/ai\s)/i, "")}</strong>
              </span>
              <button
                type="button"
                className="search-bar-ai-cta"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onAIQuery?.(value);
                  if (!forceOpen) setOpen(false);
                }}
              >
                Chiedi
                <ArrowRight size={12} strokeWidth={2} />
              </button>
            </div>
          )}

          {/* Risultati raggruppati */}
          {groups.length > 0 ? (
            <div ref={listRef} className="search-bar-list" role="listbox">
              {groups.map(({ category, label, items }) => (
                <div key={category} className="search-bar-group">
                  <div className="search-bar-group-label" aria-hidden>
                    <span className="search-bar-group-icon">
                      {CATEGORY_ICONS[category]}
                    </span>
                    {label}
                  </div>
                  {items.map((item) => {
                    const globalIdx = results.indexOf(item);
                    return (
                      <div
                        key={item.id}
                        id={`search-bar-item-${globalIdx}`}
                        role="option"
                        aria-selected={globalIdx === activeIndex}
                        className={cn(
                          "search-bar-item",
                          globalIdx === activeIndex &&
                            "search-bar-item--active",
                        )}
                        onMouseEnter={() => setActiveIndex(globalIdx)}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelect(item);
                        }}
                      >
                        <span className="search-bar-item-icon">
                          {item.icon ?? CATEGORY_ICONS[item.category]}
                        </span>
                        <span className="search-bar-item-body">
                          <span className="search-bar-item-label">
                            {item.label}
                          </span>
                          {item.description && (
                            <span className="search-bar-item-desc">
                              {item.description}
                            </span>
                          )}
                        </span>
                        {(item.shortcut || item.badge) && (
                          <span className="search-bar-item-meta">
                            {item.shortcut ? (
                              <kbd className="search-bar-shortcut">
                                {item.shortcut}
                              </kbd>
                            ) : (
                              <span className="search-bar-type-pill">
                                {item.badge}
                              </span>
                            )}
                          </span>
                        )}
                        <span className="search-bar-item-arrow" aria-hidden>
                          <ArrowRight size={12} strokeWidth={1.5} />
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : !aiMode && value.length > 0 ? (
            <div className="search-bar-empty">
              <ChefHat size={16} strokeWidth={1.5} />
              <span>
                Nessun risultato per <strong>{value}</strong>
              </span>
            </div>
          ) : null}

          {/* Footer */}
          <div className="search-bar-footer" aria-hidden>
            <span>
              <kbd>↑↓</kbd> naviga
            </span>
            <span>
              <kbd>↵</kbd> {aiMode ? "chiedi" : "apri"}
            </span>
            <span>
              <kbd>esc</kbd> chiudi
            </span>
            {!aiMode && (
              <span className="search-bar-footer-ai-hint">
                <kbd>/ai</kbd> oppure <kbd>?</kbd> per l'IA
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
