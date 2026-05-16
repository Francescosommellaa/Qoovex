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
import { cn, mergeRefs, useControllableValue } from "../../lib/utils";

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
  query?: string;
  keepOpen?: boolean;
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
  quickActions?: SearchResult[];
  mobileQuickActions?: SearchResult[];
  enableAiMode?: boolean;
  enableCommandMode?: boolean;
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

/**
 * SSR-safe: parte da false, si aggiorna dopo l'hydration.
 * Non causa problemi perché il layout touch/desktop diverge
 * solo nel dropdown (che appare dopo interazione utente).
 */
function useIsTouchDevice() {
  const [isTouch, setIsTouch] = React.useState(false);

  React.useEffect(() => {
    const touchQuery = window.matchMedia("(hover: none) and (pointer: coarse)");
    const compactQuery = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsTouch(touchQuery.matches || compactQuery.matches);

    update();
    touchQuery.addEventListener("change", update);
    compactQuery.addEventListener("change", update);

    return () => {
      touchQuery.removeEventListener("change", update);
      compactQuery.removeEventListener("change", update);
    };
  }, []);

  return isTouch;
}

interface MobileChipBarProps {
  onChip: (value: string) => void;
  onSearch: () => void;
  hasQuery: boolean;
  aiMode: boolean;
  commandMode: boolean;
  enableAiMode: boolean;
  enableCommandMode: boolean;
}

function MobileChipBar({
  onChip,
  onSearch,
  hasQuery,
  aiMode,
  commandMode,
  enableAiMode,
  enableCommandMode,
}: MobileChipBarProps) {
  // classic mode = nessun prefisso speciale (né AI né comando)
  const classicMode = !aiMode && !commandMode;

  return (
    <div className="search-bar-chip-bar" aria-label="Azioni rapide">
      {enableAiMode ? (
        <button
        type="button"
        className={cn(
          "search-bar-chip",
          aiMode && "search-bar-chip--active",
        )}
        onClick={() => onChip("?")}
        aria-label="Attiva modalità IA"
        aria-pressed={aiMode}
      >
        <Sparkle size={12} />
        IA
        </button>
      ) : null}

      {enableCommandMode ? (
        <button
        type="button"
        className={cn(
          "search-bar-chip",
          commandMode && "search-bar-chip--active",
        )}
        onClick={() => onChip("/")}
        aria-label="Attiva modalità comando"
        aria-pressed={commandMode}
      >
        <Hash size={12} />
        Comando
        </button>
      ) : null}

      <button
        type="button"
        className={cn(
          "search-bar-chip",
          // Ricette attivo se siamo in classic mode senza query specifica
          classicMode && "search-bar-chip--active",
        )}
        onClick={() => onChip("")}
        aria-label="Cerca ricette"
        aria-pressed={classicMode}
      >
        <BookOpen size={12} />
        Ricette
      </button>

      <button
        type="button"
        className="search-bar-chip"
        onClick={() => onChip("")}
        aria-label="Cerca menu"
        aria-pressed={false}
      >
        <ForkKnife size={12} />
        Menu
      </button>

      {hasQuery ? (
        <button
          type="button"
          className="search-bar-chip search-bar-chip--primary"
          onClick={onSearch}
          aria-label="Esegui ricerca"
        >
          <ArrowRight size={12} />
          Cerca
        </button>
      ) : null}
    </div>
  );
}

function isQuickActionCategory(category: SearchResultCategory) {
  return (
    category === "action" ||
    category === "command" ||
    category === "recipe" ||
    category === "menu" ||
    category === "work-plan" ||
    category === "ai"
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
    quickActions = [],
    mobileQuickActions,
    enableAiMode = true,
    enableCommandMode = true,
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

  const aiMode = enableAiMode && detectAiQuery(query);
  const commandMode = enableCommandMode && detectCommandQuery(query);
  const groups = React.useMemo(() => groupResults(results), [results]);
  const fallbackQuickActions = React.useMemo(
    () => results.filter((result) => isQuickActionCategory(result.category)).slice(0, 6),
    [results],
  );
  const desktopQuickActions = quickActions.length > 0 ? quickActions : fallbackQuickActions;
  const touchQuickActions = React.useMemo(
    () => mobileQuickActions ?? desktopQuickActions,
    [desktopQuickActions, mobileQuickActions],
  );
  const isOpen = forceOpen || open;
  const showDropdown =
    isOpen &&
    (results.length > 0 ||
      query.length > 0 ||
      (isTouch && touchQuickActions.length > 0));
  const hotkeyLabel = shortcut.toUpperCase();
  const generatedId = React.useId();
  const listboxId = `${generatedId}-search-bar-listbox`;
  const getOptionId = React.useCallback(
    (index: number) => `${generatedId}-search-bar-item-${index}`,
    [generatedId],
  );

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
    setQuery(item.query ?? item.label);

    if (item.keepOpen) {
      localInputRef.current?.focus();
      const nextQuery = item.query ?? item.label;
      window.setTimeout(() => {
        localInputRef.current?.setSelectionRange(nextQuery.length, nextQuery.length);
      }, 0);
      return;
    }

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

    localInputRef.current?.focus();
    const length = prefix.length;
    localInputRef.current?.setSelectionRange(length, length);
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
    if (forceOpen) return;

    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [forceOpen, setQuery]);

  // Shortcut da tastiera (solo desktop)
  React.useEffect(() => {
    if (forceOpen || isTouch) return;

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
      <div
        className={cn(
          "search-bar-field",
          isOpen && "search-bar-field--open",
          aiMode && "search-bar-field--ai",
          commandMode && "search-bar-field--command",
        )}
        onClick={() => {
          if (disabled) return;
          if (!open) {
            setOpen(true);
            localInputRef.current?.focus();
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
          aria-controls={showDropdown && groups.length > 0 ? listboxId : undefined}
          aria-activedescendant={
            activeIndex >= 0 && results[activeIndex]
              ? getOptionId(activeIndex)
              : undefined
          }
          value={query}
          onChange={handleChange}
          onFocus={(event) => {
            if (!forceOpen) setOpen(true);
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
          // Rimosso readOnly: su iOS Safari blocca apertura tastiera al primo tap
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
            <X size={14} />
          </button>
        ) : showHotkey && !isOpen && !isTouch ? (
          <span className="search-bar-hotkey" aria-hidden>
            <Command size={11} />
            <kbd>{hotkeyLabel}</kbd>
          </span>
        ) : null}
      </div>

      {showDropdown ? (
        <div
          className={cn(
            "search-bar-dropdown",
            isTouch && "search-bar-dropdown",
          )}
          role="presentation"
        >
          {/* Header mobile */}
          {isTouch ? (
            <div className="search-bar-mobile-header">
              <span className="search-bar-mobile-title">
                {aiMode ? "Chiedi all'IA" : commandMode ? "Comandi" : "Cerca"}
              </span>
              {!forceOpen ? (
                <button
                  type="button"
                  className="search-bar-mobile-close"
                  onClick={() => {
                    setOpen(false);
                    localInputRef.current?.blur();
                  }}
                  aria-label="Chiudi ricerca"
                ></button>
              ) : null}
            </div>
          ) : null}

          {/* AI row */}
          {enableAiMode && aiMode && query.length > 2 ? (
            <div className="search-bar-ai-row">
              <Sparkle size={13} className="search-bar-icon-ai" />
              <span>
                Chiedi all'IA:{" "}
                <strong>{query.replace(/^(\?|\/ai\s)/i, "")}</strong>
              </span>
              <button
                type="button"
                className="search-bar-ai-cta"
                onClick={() => {
                  onAIQuery?.(query);
                  if (!forceOpen) setOpen(false);
                }}
              >
                Chiedi
                <ArrowRight size={12} weight="bold" />
              </button>
            </div>
          ) : null}

          {(isTouch ? touchQuickActions : desktopQuickActions).length > 0 ? (
            <div className="search-bar-quick-actions" aria-label="Comandi rapidi">
              <div className="search-bar-quick-actions__header">
                <span className="search-bar-group-icon" aria-hidden>
                  <Lightning size={14} />
                </span>
                Comandi rapidi
              </div>
              <div className="search-bar-quick-actions__grid">
                {(isTouch ? touchQuickActions : desktopQuickActions).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="search-bar-quick-action"
                    onClick={() => handleSelect(item)}
                  >
                    <span className="search-bar-quick-action__icon" aria-hidden>
                      {item.icon ?? CATEGORY_ICONS[item.category]}
                    </span>
                    <span className="search-bar-quick-action__body">
                      <span className="search-bar-quick-action__label">
                        {item.label}
                      </span>
                      {item.description ? (
                        <span className="search-bar-quick-action__desc">
                          {item.description}
                        </span>
                      ) : null}
                    </span>
                    {item.badge ? (
                      <span className="search-bar-type-pill">{item.badge}</span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Lista risultati */}
          {!isTouch && groups.length > 0 ? (
            <div
              id={listboxId}
              ref={listRef}
              className="search-bar-list"
              role="listbox"
              aria-label="Risultati ricerca"
            >
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
                        id={getOptionId(globalIndex)}
                        role="option"
                        aria-selected={globalIndex === activeIndex}
                        className={cn(
                          "search-bar-item",
                          globalIndex === activeIndex &&
                            "search-bar-item--active",
                        )}
                        onMouseEnter={() =>
                          !isTouch && setActiveIndex(globalIndex)
                        }
                        onClick={() => handleSelect(item)}
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

                        {/* Badge/shortcut solo desktop */}
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

                        {/* Badge testo su touch */}
                        {isTouch && item.badge ? (
                          <span className="search-bar-type-pill">
                            {item.badge}
                          </span>
                        ) : null}

                        {/* Delete recenti */}
                        {isRecent && onDeleteRecent ? (
                          <button
                            type="button"
                            className={cn(
                              "search-bar-item-delete",
                              isTouch && "search-bar-item-delete--touch",
                            )}
                            aria-label={`Rimuovi "${item.label}" dai recenti`}
                            onClick={(event) => {
                              event.stopPropagation();
                              onDeleteRecent(item.id);
                            }}
                          >
                            <X size={12} weight="bold" />
                          </button>
                        ) : null}

                        {/* Arrow solo desktop */}
                        {!isTouch && !isRecent ? (
                          <span className="search-bar-item-arrow" aria-hidden>
                            <ArrowRight size={12} />
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
              <ChefHat size={16} />
              <span>
                Nessun risultato per <strong>{query}</strong>
              </span>
            </div>
          ) : null}

          {/* Footer keyboard — solo desktop */}
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
              {enableAiMode && !aiMode ? (
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
