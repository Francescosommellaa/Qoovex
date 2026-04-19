"use client";

import * as React from "react";
import {
  MagnifyingGlassPlus,
  X,
  Sparkle,
  ArrowRight,
  Hash,
  ChefHat,
  BookOpen,
  ForkKnife,
  ClipboardText,
  CircleNotch,
  Lightning,
  Command,
  Clock,
} from "@phosphor-icons/react";
import { cn, mergeRefs, useControllableValue } from "../lib/utils";

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

export interface SmartSearchBarProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "className" | "defaultValue" | "results" | "size" | "value"
> {
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
  inputClassName?: string;
}

const CATEGORY_ICONS: Record<SearchResultCategory, React.ReactNode> = {
  recipe: <BookOpen size={14} />,
  menu: <ForkKnife size={14} />,
  "work-plan": <ClipboardText size={14} />,
  command: <Hash size={14} />,
  action: <Lightning size={14} />,
  ai: <Sparkle size={14} />,
  recent: <Clock size={14} />,
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

function groupResults(results: SearchResult[]) {
  const map = new Map<SearchResultCategory, SearchResult[]>();

  for (const result of results) {
    if (!map.has(result.category)) {
      map.set(result.category, []);
    }

    map.get(result.category)?.push(result);
  }

  return CATEGORY_ORDER.filter((category) => map.has(category)).map(
    (category) => ({
      category,
      label: CATEGORY_LABELS[category],
      items: map.get(category) ?? [],
    }),
  );
}

function detectAiQuery(value: string) {
  return value.startsWith("?") || value.toLowerCase().startsWith("/ai ");
}

function detectCommandQuery(value: string) {
  return value.startsWith("/") && !value.toLowerCase().startsWith("/ai ");
}

function useIsTouchDevice() {
  const [isTouch, setIsTouch] = React.useState(false);

  React.useEffect(() => {
    setIsTouch(
      window.matchMedia("(hover: none) and (pointer: coarse)").matches,
    );
  }, []);

  return isTouch;
}

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
        onMouseDown={(event) => {
          event.preventDefault();
          onChip("?");
        }}
        aria-label="Attiva modalità IA"
      >
        <Sparkle size={12} />
        IA
      </button>

      <button
        type="button"
        className="search-bar-chip"
        onMouseDown={(event) => {
          event.preventDefault();
          onChip("/");
        }}
        aria-label="Attiva modalità comando"
      >
        <Hash size={12} />
        Comando
      </button>

      <button
        type="button"
        className="search-bar-chip"
        onMouseDown={(event) => {
          event.preventDefault();
          onChip("");
        }}
        aria-label="Cerca ricette"
      >
        <BookOpen size={12} />
        Ricette
      </button>

      <button
        type="button"
        className="search-bar-chip"
        onMouseDown={(event) => {
          event.preventDefault();
          onChip("");
        }}
        aria-label="Cerca menu"
      >
        <ForkKnife size={12} />
        Menu
      </button>

      {hasQuery ? (
        <button
          type="button"
          className="search-bar-chip search-bar-chip--primary"
          onMouseDown={(event) => {
            event.preventDefault();
            onSearch();
          }}
          aria-label="Esegui ricerca"
        >
          <ArrowRight size={12} />
          Cerca
        </button>
      ) : null}
    </div>
  );
}

export const SmartSearchBar = React.forwardRef<
  HTMLInputElement,
  SmartSearchBarProps
>(function SmartSearchBar(
  {
    placeholder = "Cerca ricette, menu, piani...",
    results = [],
    defaultQuery,
    value,
    onValueChange,
    onSearch,
    onAIQuery,
    onDeleteRecent,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
    disabled = false,
    isLoading = false,
    forceOpen = false,
    disableFullscreen: _disableFullscreen = false,
    shortcut = "K",
    showHotkey = true,
    className,
    inputClassName,
    autoComplete = "off",
    spellCheck = false,
    ...props
  },
  forwardedRef,
) {
  const [open, setOpen] = React.useState(forceOpen);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [query, setQuery] = useControllableValue({
    value,
    defaultValue: defaultQuery ?? "",
    onChange: onValueChange,
  });
  const localInputRef = React.useRef<HTMLInputElement>(null);
  const inputRef = mergeRefs(localInputRef, forwardedRef);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const isTouch = useIsTouchDevice();

  const aiMode = detectAiQuery(query);
  const commandMode = detectCommandQuery(query);
  const groups = React.useMemo(() => groupResults(results), [results]);
  const isOpen = forceOpen || open;
  const showDropdown = isOpen && (results.length > 0 || query.length > 0);
  const hotkeyLabel = shortcut.toUpperCase();

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
    onChange?.(event);
    setActiveIndex(-1);

    if (!forceOpen) {
      setOpen(true);
    }
  }

  function handleClear() {
    setQuery("");
    localInputRef.current?.focus();

    if (!forceOpen) {
      setOpen(false);
    }
  }

  function handleSelect(item: SearchResult) {
    item.onSelect?.();
    setQuery(item.label);

    if (!forceOpen) {
      setOpen(false);
    }
  }

  function handleSubmit() {
    if (aiMode) {
      onAIQuery?.(query);
    } else {
      onSearch?.(query);
    }

    if (!forceOpen) {
      setOpen(false);
    }
  }

  function handleChip(prefix: string) {
    setQuery(prefix);
    setOpen(true);

    setTimeout(() => {
      localInputRef.current?.focus();
      const length = prefix.length;
      localInputRef.current?.setSelectionRange(length, length);
    }, 0);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const flatItems = results;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, flatItems.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, -1));
    } else if (event.key === "Enter") {
      event.preventDefault();

      if (activeIndex >= 0 && flatItems[activeIndex]) {
        handleSelect(flatItems[activeIndex]);
      } else {
        handleSubmit();
      }
    } else if (event.key === "Escape" && !forceOpen) {
      setOpen(false);
      localInputRef.current?.blur();
    }

    onKeyDown?.(event);
  }

  React.useEffect(() => {
    if (activeIndex < 0 || !listRef.current) {
      return;
    }

    const items =
      listRef.current.querySelectorAll<HTMLElement>("[role='option']");
    items[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  React.useEffect(() => {
    if (forceOpen) {
      return;
    }

    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [forceOpen]);

  React.useEffect(() => {
    if (forceOpen || isTouch) {
      return;
    }

    function onShortcut(event: KeyboardEvent) {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === shortcut.toLowerCase()
      ) {
        event.preventDefault();
        setOpen(true);
        setTimeout(() => localInputRef.current?.focus(), 0);
      }
    }

    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, [forceOpen, isTouch, shortcut]);

  return (
    <div
      ref={rootRef}
      className={cn(
        "search-bar-root",
        isOpen && "search-bar-root--open",
        className,
      )}
    >
      {isOpen && isTouch ? (
        <div
          className="search-bar-backdrop"
          onPointerDown={() => {
            if (!forceOpen) {
              setOpen(false);
            }
          }}
          aria-hidden
        />
      ) : null}

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
          if (disabled) {
            return;
          }

          if (!forceOpen && !open) {
            setOpen(true);
            setTimeout(() => localInputRef.current?.focus(), 0);
          }
        }}
      >
        <span className="search-bar-icon-lead" aria-hidden>
          {isLoading ? (
            <CircleNotch size={16} className="animate-spin" />
          ) : aiMode ? (
            <Sparkle size={16} className="search-bar-icon-ai" />
          ) : (
            <MagnifyingGlassPlus size={16} />
          )}
        </span>

        <input
          {...props}
          ref={inputRef}
          type="text"
          role="searchbox"
          aria-autocomplete="list"
          aria-controls="search-bar-listbox"
          aria-activedescendant={
            activeIndex >= 0 ? `search-bar-item-${activeIndex}` : undefined
          }
          value={query}
          onChange={handleChange}
          onFocus={(event) => {
            if (!forceOpen) {
              setOpen(true);
            }

            onFocus?.(event);
          }}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={
            aiMode
              ? "Chiedi all'IA..."
              : commandMode
                ? "Scrivi un comando..."
                : placeholder
          }
          className={cn("search-bar-input", inputClassName)}
          autoComplete={autoComplete}
          spellCheck={spellCheck}
          readOnly={props.readOnly || (!isOpen && !forceOpen)}
          style={{
            ...props.style,
            cursor: !isOpen && !forceOpen ? "pointer" : "text",
          }}
        />

        {query && isOpen ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
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

      {showDropdown ? (
        <div
          id="search-bar-listbox"
          className={cn(
            "search-bar-dropdown",
            isTouch && "search-bar-dropdown--mobile",
          )}
          role="presentation"
        >
          {aiMode && query.length > 2 ? (
            <div className="search-bar-ai-row">
              <Sparkle size={13} className="search-bar-icon-ai" />
              <span>
                Chiedi all'IA:{" "}
                <strong>{query.replace(/^(\?|\/ai\s)/i, "")}</strong>
              </span>
              <button
                type="button"
                className="search-bar-ai-cta"
                onMouseDown={(event) => {
                  event.preventDefault();
                  onAIQuery?.(query);

                  if (!forceOpen) {
                    setOpen(false);
                  }
                }}
              >
                Chiedi
                <ArrowRight size={12} strokeWidth={2} />
              </button>
            </div>
          ) : null}

          {isTouch ? (
            <MobileChipBar
              onChip={handleChip}
              onSearch={handleSubmit}
              hasQuery={query.trim().length > 0}
            />
          ) : null}

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
                    const globalIndex = results.indexOf(item);
                    const isRecent = item.category === "recent";

                    return (
                      <div
                        key={item.id}
                        id={`search-bar-item-${globalIndex}`}
                        role="option"
                        aria-selected={globalIndex === activeIndex}
                        className={cn(
                          "search-bar-item",
                          globalIndex === activeIndex &&
                            "search-bar-item--active",
                        )}
                        onMouseEnter={() => setActiveIndex(globalIndex)}
                        onMouseDown={(event) => {
                          event.preventDefault();
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
                          {item.description ? (
                            <span className="search-bar-item-desc">
                              {item.description}
                            </span>
                          ) : null}
                        </span>

                        {!isTouch && (item.shortcut || item.badge) ? (
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
                        ) : null}

                        {isRecent && onDeleteRecent ? (
                          <button
                            type="button"
                            className={cn(
                              "search-bar-item-delete",
                              isTouch && "search-bar-item-delete--touch",
                            )}
                            aria-label={`Rimuovi "${item.label}" dai recenti`}
                            onMouseDown={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              onDeleteRecent(item.id);
                            }}
                          >
                            <X size={12} strokeWidth={2} />
                          </button>
                        ) : null}

                        {!isTouch && !isRecent ? (
                          <span className="search-bar-item-arrow" aria-hidden>
                            <ArrowRight size={12} strokeWidth={1.5} />
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : !aiMode && query.length > 0 ? (
            <div className="search-bar-empty">
              <ChefHat size={16} strokeWidth={1.5} />
              <span>
                Nessun risultato per <strong>{query}</strong>
              </span>
            </div>
          ) : null}

          {!isTouch ? (
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
              {!aiMode ? (
                <span className="search-bar-footer-ai-hint">
                  <kbd>/ai</kbd> oppure <kbd>?</kbd> per l'IA
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});

SmartSearchBar.displayName = "SmartSearchBar";
