"use client";

import * as React from "react";
import {
  CalendarBlank,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import { Button, Icon, Text, cn } from "@qoovex/ui";

interface ClockDropdownProps {
  nowIso: string;
  compact?: boolean;
}

const weekDays = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getCalendarDays(monthDate: Date) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - mondayOffset);

  return Array.from({ length: 42 }).map((_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return date;
  });
}

function formatDayKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
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
      date,
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

export function ClockDropdown({ nowIso, compact = false }: ClockDropdownProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const clock = useWorkspaceClock(nowIso);
  const today = startOfDay(clock.date);
  const [open, setOpen] = React.useState(false);
  const [visibleMonth, setVisibleMonth] = React.useState(() =>
    new Date(clock.date.getFullYear(), clock.date.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = React.useState(today);
  const visibleDays = React.useMemo(
    () => getCalendarDays(visibleMonth),
    [visibleMonth],
  );
  const monthLabel = React.useMemo(
    () =>
      new Intl.DateTimeFormat("it-IT", {
        month: "long",
        year: "numeric",
      }).format(visibleMonth),
    [visibleMonth],
  );
  const selectedLabel = React.useMemo(
    () =>
      new Intl.DateTimeFormat("it-IT", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      }).format(selectedDate),
    [selectedDate],
  );
  const todayKey = formatDayKey(today);
  const selectedKey = formatDayKey(selectedDate);

  React.useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function shiftMonth(offset: number) {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  }

  function selectToday() {
    setSelectedDate(today);
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={cn(
          "grid grid-cols-[auto_minmax(0,1fr)] items-center gap-(--spacing-2) rounded-(--radius-xl) border border-(--color-border) bg-(--color-surface) px-(--spacing-3) py-(--spacing-2) text-left transition-[background,border-color,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-qoovex)] hover:border-(--color-primary)/40 hover:bg-(--color-surface-offset) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)",
          compact ? "min-w-0 rounded-(--radius-full)" : "min-w-[7.25rem]",
        )}
        aria-label="Apri calendario"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <Icon icon={CalendarBlank} size="sm" tone="current" />
        <span className="grid min-w-0 gap-0.5 leading-tight">
          {!compact ? (
            <span className="truncate text-(length:--text-xs) text-(--color-text-muted)">
              {clock.day}
            </span>
          ) : null}
          <span className={cn("block tabular-nums font-semibold", compact ? "text-(length:--text-xs)" : "text-(length:--text-sm)")}>
            {clock.time}
          </span>
        </span>
      </button>

      {open ? (
        <div className="fixed left-(--spacing-3) right-(--spacing-3) top-[calc(var(--spacing-16)+var(--spacing-2))] z-(--z-dropdown) overflow-hidden rounded-(--radius-xl) border border-(--color-border) bg-(--color-surface-2) shadow-[var(--shadow-lg)] md:absolute md:left-auto md:right-0 md:top-[calc(100%+var(--spacing-2))] md:w-[min(20rem,calc(100vw-var(--spacing-8)))]">
          <div className="flex items-center justify-between gap-(--spacing-3) border-b border-(--color-divider) px-(--spacing-4) py-(--spacing-3)">
            <div className="min-w-0">
              <Text size="sm" weight="semibold" className="capitalize">
                {monthLabel}
              </Text>
              <Text size="xs" tone="muted" className="capitalize">
                {selectedLabel}
              </Text>
            </div>
            <div className="flex items-center gap-(--spacing-1)">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="size-8 px-0"
                aria-label="Mese precedente"
                onClick={() => shiftMonth(-1)}
              >
                <CaretLeft size={14} weight="bold" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="size-8 px-0"
                aria-label="Mese successivo"
                onClick={() => shiftMonth(1)}
              >
                <CaretRight size={14} weight="bold" />
              </Button>
            </div>
          </div>

          <div className="grid gap-(--spacing-3) p-(--spacing-4)">
            <div className="grid grid-cols-7 gap-(--spacing-1)">
              {weekDays.map((day) => (
                <Text key={day} size="xs" tone="muted" weight="medium" className="text-center">
                  {day}
                </Text>
              ))}
              {visibleDays.map((date) => {
                const dateKey = formatDayKey(date);
                const inCurrentMonth = date.getMonth() === visibleMonth.getMonth();
                const isToday = dateKey === todayKey;
                const isSelected = dateKey === selectedKey;

                return (
                  <button
                    key={dateKey}
                    type="button"
                    className={cn(
                      "aspect-square rounded-(--radius-full) border text-(length:--text-xs) font-medium transition-[background,border-color,color] duration-[var(--duration-base)] ease-[var(--ease-qoovex)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)",
                      inCurrentMonth
                        ? "border-transparent text-(--color-text)"
                        : "border-transparent text-(--color-text-faint)",
                      isToday && "border-(--color-primary)/50",
                      isSelected
                        ? "bg-(--color-primary) text-(--color-btn-filled-text)"
                        : "hover:bg-(--color-surface-offset)",
                    )}
                    aria-pressed={isSelected}
                    onClick={() => setSelectedDate(startOfDay(date))}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            <Button type="button" variant="secondary" size="xs" onClick={selectToday}>
              Oggi
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
