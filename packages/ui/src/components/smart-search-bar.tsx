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
  Clock,
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

export interface SmartSearchBarProps {
  placeholder?: string;
  results?: SearchResult[];
  defaultQuery?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  onAIQuery?: (query: string) => void;
  onDeleteRecent?: (id: string) => void;
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
  recent: <Clock size={14} strokeWidth={1.5} />,
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

// ─── Hook: detect touch device ────────────────────────────────────────────────

function useIsTouchDevice() {
  const [isTouch, setIsTouch] = React.useState(false);
  React.useEffect(() => {
    setIsTouch(
      window.matchMedia("(hover: none) and (pointer: coarse)").matches,
    );
  }, []);
  return isTouch;
}

// ─── Chip rapidi mobile ───────────────────────────────────────────────────────

interface MobileChipBarProps {
  onChip: (value: string) => void;
  onSearch: () => void;
  hasQuery: boolean;
}

function MobileChipBar({ onChip, onSearch, hasQuery }: MobileChipBarProps) {
  return (
    <div className="search-bar-chip-bar" aria-label="Azioni rapide">
      <button
        type="button"
        className="search-bar-chip search-bar-chip--ai"
        onMouseDown={(e) => {
          e.preventDefault();
          onChip("?");
        }}
        aria-label="Attiva modalità IA"
      >
        <Sparkles size={12} strokeWidth={1.5} />
        IA
      </button>

      <button
        type="button"
        className="search-bar-chip"
        onMouseDown={(e) => {
          e.preventDefault();
          onChip("/");
        }}
        aria-label="Attiva modalità comando"
      >
        <Hash size={12} strokeWidth={1.5} />
        Comando
      </button>

      <button
        type="button"
        className="search-bar-chip"
        onMouseDown={(e) => {
          e.preventDefault();
          onChip("");
        }}
        aria-label="Cerca ricette"
      >
        <BookOpen size={12} strokeWidth={1.5} />
        Ricette
      </button>

      <button
        type="button"
        className="search-bar-chip"
        onMouseDown={(e) => {
          e.preventDefault();
          onChip("");
        }}
        aria-label="Cerca menu"
      >
        <UtensilsCrossed size={12} strokeWidth={1.5} />
        Menu
      </button>

      {hasQuery && (
        <button
          type="button"
          className="search-bar-chip search-bar-chip--primary"
          onMouseDown={(e) => {
            e.preventDefault();
            onSearch();
          }}
          aria-label="Esegui ricerca"
        >
          <ArrowRight size={12} strokeWidth={2} />
          Cerca
        </button>
      )}
    </div>
  );
}

// ─── Componente principale ────────────────────────────────────────────────────

export function SmartSearchBar({
  placeholder = "Cerca ricette, menu, piani…",
  results = [],
  defaultQuery,
  value: controlledValue,
  onValueChange,
  onSearch,
  onAIQuery,
  onDeleteRecent,
  isLoading = false,
  forceOpen = false,
  disableFullscreen: _disableFullscreen = false,
  shortcut = "K",
  showHotkey = true,
  className,
}: SmartSearchBarProps) {
  const [internalValue, setInternalValue] = React.useState(defaultQuery ?? "");
  const [open, setOpen] = React.useState(forceOpen);
  const [activeIndex, setActiveIndex] = React.useState(-1);

  const value = controlledValue ?? internalValue;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const isTouch = useIsTouchDevice();

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

  function handleChip(prefix: string) {
    const next = prefix;
    if (controlledValue === undefined) setInternalValue(next);
    onValueChange?.(next);
    setOpen(true);
    setTimeout(() => {
      inputRef.current?.focus();
      const len = next.length;
      inputRef.current?.setSelectionRange(len, len);
    }, 0);
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

  React.useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const items =
      listRef.current.querySelectorAll<HTMLElement>("[role='option']");
    items[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

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

  React.useEffect(() => {
    if (forceOpen || isTouch) return;
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
  }, [forceOpen, shortcut, isTouch]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      ref={rootRef}
      className={cn(
        "search-bar-root",
        isOpen && "search-bar-root--open",
        className,
      )}
    >
      {isOpen && isTouch && (
        <div
          className="search-bar-backdrop"
          onPointerDown={() => {
            if (!forceOpen) setOpen(false);
          }}
          aria-hidden
        />
      )}

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
        onClick={() => {
          if (!forceOpen && !open) {
            setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 0);
          }
        }}
      >
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
          onBlur={() => {}}
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
          readOnly={!isOpen && !forceOpen}
          style={{ cursor: !isOpen && !forceOpen ? "pointer" : "text" }}
        />

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
        ) : showHotkey && !isOpen && !isTouch ? (
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
          className={cn(
            "search-bar-dropdown",
            isTouch && "search-bar-dropdown--mobile",
          )}
          role="presentation"
        >
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

          {isTouch && (
            <MobileChipBar
              onChip={handleChip}
              onSearch={handleSubmit}
              hasQuery={value.trim().length > 0}
            />
          )}

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
                    const isRecent = item.category === "recent";
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

                        {!isTouch && (item.shortcut || item.badge) && (
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

                        {isRecent && onDeleteRecent && (
                          <button
                            type="button"
                            className={cn(
                              "search-bar-item-delete",
                              isTouch && "search-bar-item-delete--touch",
                            )}
                            aria-label={`Rimuovi "${item.label}" dai recenti`}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onDeleteRecent(item.id);
                            }}
                          >
                            <X size={12} strokeWidth={2} />
                          </button>
                        )}

                        {!isTouch && !isRecent && (
                          <span className="search-bar-item-arrow" aria-hidden>
                            <ArrowRight size={12} strokeWidth={1.5} />
                          </span>
                        )}
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

          {!isTouch && (
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
          )}
        </div>
      )}
    </div>
  );
}
