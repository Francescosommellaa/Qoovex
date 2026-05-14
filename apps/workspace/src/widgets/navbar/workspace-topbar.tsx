"use client";

import * as React from "react";
import Image from "next/image";
import { CalendarBlank, List } from "@phosphor-icons/react";
import { Button, Icon, SmartSearchBar, Text, ThemeToggle } from "@qoovex/ui";
import { useRecentSearches } from "@qoovex/utils";

interface WorkspaceTopbarProps {
  nowIso: string;
  onOpenNavigation: () => void;
}

function useWorkspaceClock(nowIso: string) {
  const [date, setDate] = React.useState(() => new Date(nowIso));

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setDate(new Date());
    }, 30_000);

    return () => window.clearInterval(interval);
  }, []);

  return React.useMemo(
    () => ({
      day: new Intl.DateTimeFormat("it-IT", {
        weekday: "short",
        day: "2-digit",
        month: "short",
      }).format(date),
      time: new Intl.DateTimeFormat("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date),
    }),
    [date],
  );
}

function WorkspaceSearch() {
  const { recents, loading, saveSearch, deleteSearch } = useRecentSearches();

  return (
    <SmartSearchBar
      placeholder="Cerca nel workspace..."
      results={recents.map((recent) => ({
        id: recent.id,
        category: "recent",
        label: recent.query,
        description: "Ricerca recente",
      }))}
      onSearch={saveSearch}
      onDeleteRecent={deleteSearch}
      isLoading={loading}
      enableAiMode={false}
      enableCommandMode={false}
      className="w-full"
    />
  );
}

export function WorkspaceTopbar({
  nowIso,
  onOpenNavigation,
}: WorkspaceTopbarProps) {
  const clock = useWorkspaceClock(nowIso);

  return (
    <header className="shrink-0 border-b border-(--color-border) bg-(--color-bg) px-(--spacing-4) py-(--spacing-3) md:px-(--spacing-6) lg:px-(--spacing-8)">
      <div className="grid gap-(--spacing-3) md:grid-cols-[auto_minmax(16rem,34rem)_auto] md:items-center md:gap-(--spacing-4)">
        <div className="flex min-w-0 items-center justify-between gap-(--spacing-3) md:justify-start">
          <div className="flex min-w-0 items-center gap-(--spacing-3)">
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
            <span className="flex size-10 shrink-0 items-center justify-center rounded-(--radius-xl) border border-(--color-border) bg-(--color-surface-raised)">
              <Image
                src="/logo-icon/qoovex-icona-nera-no-sfondo.svg"
                alt=""
                width={22}
                height={22}
                className="[filter:var(--sirio-brand-icon-filter)]"
                priority
              />
            </span>
            <div className="hidden min-w-0 sm:block">
              <Text size="sm" weight="semibold">
                Qoovex Workspace
              </Text>
              <Text size="xs" tone="muted">
                Regia operativa
              </Text>
            </div>
          </div>

          <div className="flex items-center gap-(--spacing-2) md:hidden">
            <div className="flex items-center gap-(--spacing-2) rounded-(--radius-full) border border-(--color-border) bg-(--color-surface) px-(--spacing-3) py-(--spacing-2)">
              <Icon icon={CalendarBlank} size="sm" tone="current" />
              <span className="text-(length:--text-xs) font-medium text-(--color-text-muted)">
                {clock.time}
              </span>
            </div>
            <ThemeToggle label="Tema" className="h-9 px-(--spacing-3)" />
          </div>
        </div>

        <WorkspaceSearch />

        <div className="hidden items-center justify-end gap-(--spacing-3) md:flex">
          <div className="rounded-(--radius-xl) border border-(--color-border) bg-(--color-surface) px-(--spacing-3) py-(--spacing-2) text-right">
            <Text size="xs" tone="muted">
              {clock.day}
            </Text>
            <Text size="sm" weight="semibold">
              {clock.time}
            </Text>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
