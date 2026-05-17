"use client";

import * as React from "react";
import {
  CookingPot,
  ForkKnife,
  List,
  NotePencil,
  PlayCircle,
  Sparkle,
} from "@phosphor-icons/react";
import {
  Button,
  SmartSearchBar,
  type SearchResult,
} from "@qoovex/ui";
import { useRecentSearches } from "@qoovex/utils";
import { ClockDropdown } from "./clock-dropdown";
import { NotificationDropdown } from "./notification-dropdown";

interface WorkspaceTopbarProps {
  nowIso: string;
  onOpenNavigation: () => void;
}

function WorkspaceSearch() {
  const { recents, loading, saveSearch, deleteSearch } = useRecentSearches();

  const runQuickSearch = React.useCallback(
    (query: string) => {
      void saveSearch(query);
    },
    [saveSearch],
  );

  const quickActions = React.useMemo<SearchResult[]>(
    () => [
      {
        id: "quick-ai-mode",
        category: "ai",
        label: "Modalità IA",
        description: "Scrivi una richiesta assistita",
        icon: <Sparkle size={14} />,
        query: "?",
        keepOpen: true,
      },
      {
        id: "quick-live",
        category: "action",
        label: "Live",
        description: "Ingresso rapido quando la modalità sarà attiva",
        badge: "presto",
        icon: <PlayCircle size={14} />,
        onSelect: () => {
          runQuickSearch("modalita live");
        },
      },
      {
        id: "quick-new-recipe",
        category: "action",
        label: "Nuova ricetta",
        description: "Azione frequente per creare una preparazione",
        badge: "presto",
        icon: <NotePencil size={14} />,
        onSelect: () => runQuickSearch("nuova ricetta"),
      },
      {
        id: "quick-service-menu",
        category: "action",
        label: "Menu servizio",
        description: "Accesso rapido alla gestione menu",
        badge: "presto",
        icon: <ForkKnife size={14} />,
        onSelect: () => runQuickSearch("menu servizio"),
      },
    ],
    [runQuickSearch],
  );

  const quickResults = React.useMemo<SearchResult[]>(
    () => [
      {
        id: "suggestion-recipes",
        category: "recipe",
        label: "Ricette",
        description: "Cerca e organizza le tue preparazioni",
        badge: "presto",
      },
      {
        id: "suggestion-menus",
        category: "menu",
        label: "Menu",
        description: "Componi menu e carte digitali",
        badge: "presto",
      },
      {
        id: "suggestion-work-plans",
        category: "work-plan",
        label: "Piani di lavoro",
        description: "Coordina preparazioni e task",
        badge: "presto",
      },
    ],
    [],
  );

  const mobileQuickActions = React.useMemo<SearchResult[]>(
    () => [
      {
        id: "mobile-quick-ai-mode",
        category: "ai",
        label: "Modalità IA",
        description: "Scrivi una richiesta assistita",
        icon: <Sparkle size={14} />,
        query: "?",
        keepOpen: true,
      },
      {
        id: "mobile-quick-live",
        category: "action",
        label: "Live",
        description: "Ingresso rapido alla modalità live",
        badge: "presto",
        icon: <PlayCircle size={14} />,
        onSelect: () => {
          runQuickSearch("modalita live");
        },
      },
      {
        id: "mobile-quick-new-recipe",
        category: "action",
        label: "Nuova ricetta",
        description: "Crea una preparazione",
        badge: "presto",
        icon: <NotePencil size={14} />,
        onSelect: () => runQuickSearch("nuova ricetta"),
      },
      {
        id: "mobile-quick-service-menu",
        category: "action",
        label: "Menu servizio",
        description: "Apri la gestione menu",
        badge: "presto",
        icon: <ForkKnife size={14} />,
        onSelect: () => runQuickSearch("menu servizio"),
      },
      {
        id: "mobile-quick-prep",
        category: "action",
        label: "Prep veloce",
        description: "Cerca preparazioni operative",
        icon: <CookingPot size={14} />,
        onSelect: () => runQuickSearch("prep"),
      },
    ],
    [runQuickSearch],
  );

  const results = React.useMemo<SearchResult[]>(
    () => [
      ...recents.map((recent) => ({
        id: recent.id,
        category: "recent" as const,
        label: recent.query,
        description: "Ricerca recente",
      })),
      ...quickResults,
    ],
    [quickResults, recents],
  );

  function handleSearch(query: string) {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    saveSearch(trimmedQuery);
  }

  return (
    <SmartSearchBar
      placeholder="Cerca nel workspace..."
      results={results}
      quickActions={quickActions}
      mobileQuickActions={mobileQuickActions}
      onSearch={handleSearch}
      onAIQuery={handleSearch}
      onDeleteRecent={deleteSearch}
      isLoading={loading}
      className="w-full"
    />
  );
}

export function WorkspaceTopbar({
  nowIso,
  onOpenNavigation,
}: WorkspaceTopbarProps) {
  return (
    <header className="shrink-0 border-b border-(--color-border) bg-(--color-bg) px-(--spacing-4) py-(--spacing-3) md:px-(--spacing-6) lg:px-(--spacing-8)">
      <div className="grid gap-(--spacing-3) md:grid-cols-[auto_minmax(16rem,34rem)_auto] md:items-center md:gap-(--spacing-4) lg:grid-cols-[minmax(16rem,34rem)_auto]">
        <div className="flex min-w-0 items-center justify-between gap-(--spacing-3) md:justify-start lg:hidden">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="size-10 px-0 lg:hidden"
            aria-label="Apri navigazione"
            onClick={onOpenNavigation}
          >
            <List size={18} weight="bold" />
          </Button>

          <div className="flex items-center gap-(--spacing-2) md:hidden">
            <NotificationDropdown />
            <ClockDropdown nowIso={nowIso} compact />
          </div>
        </div>

        <WorkspaceSearch />

        <div className="hidden items-center justify-end gap-(--spacing-3) md:flex">
          <NotificationDropdown />
          <ClockDropdown nowIso={nowIso} />
        </div>
      </div>
    </header>
  );
}
