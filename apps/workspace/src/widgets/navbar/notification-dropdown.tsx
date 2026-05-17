"use client";

import * as React from "react";
import {
  Bell,
  BellRinging,
  CheckCircle,
  CircleNotch,
  WarningCircle,
} from "@phosphor-icons/react";
import { Badge, Button, Text, cn, useToast } from "@qoovex/ui";
import type { NotificationFeedDto } from "@shared/lib/workspace-types";

function formatNotificationTime(value: string) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function NotificationDropdown() {
  const { toast } = useToast();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [updating, setUpdating] = React.useState(false);
  const [feed, setFeed] = React.useState<NotificationFeedDto>({
    unreadCount: 0,
    notifications: [],
  });

  const loadNotifications = React.useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/notifications", {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error("Impossibile caricare le notifiche.");
      }

      setFeed((await response.json()) as NotificationFeedDto);
    } catch (error) {
      toast({
        variant: "error",
        title: "Notifiche non disponibili",
        description:
          error instanceof Error
            ? error.message
            : "Riprova tra qualche istante.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

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

  async function patchNotifications(body: Record<string, string>) {
    setUpdating(true);

    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Aggiornamento non riuscito.");
      }

      await loadNotifications();
    } catch (error) {
      toast({
        variant: "error",
        title: "Notifica non aggiornata",
        description:
          error instanceof Error
            ? error.message
            : "Riprova tra qualche istante.",
      });
    } finally {
      setUpdating(false);
    }
  }

  const hasUnread = feed.unreadCount > 0;

  return (
    <div ref={rootRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="xs"
        className="relative size-10 px-0"
        aria-label={
          hasUnread
            ? `${feed.unreadCount} notifiche non lette`
            : "Apri notifiche"
        }
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {hasUnread ? (
          <BellRinging size={18} weight="bold" />
        ) : (
          <Bell size={18} weight="bold" />
        )}
        {hasUnread ? (
          <span className="absolute right-1.5 top-1.5 flex min-h-4 min-w-4 items-center justify-center rounded-(--radius-full) bg-(--color-error) px-(--spacing-1) text-(length:--text-xs) font-semibold leading-none text-(--color-btn-filled-text)">
            {feed.unreadCount > 9 ? "9+" : feed.unreadCount}
          </span>
        ) : null}
      </Button>

      {open ? (
        <div className="fixed left-(--spacing-3) right-(--spacing-3) top-[calc(var(--spacing-16)+var(--spacing-2))] z-(--z-dropdown) overflow-hidden rounded-(--radius-xl) border border-(--color-border) bg-(--color-surface-2) shadow-[var(--shadow-lg)] md:absolute md:left-auto md:right-0 md:top-[calc(100%+var(--spacing-2))] md:w-[min(22rem,calc(100vw-var(--spacing-8)))]">
          <div className="flex items-center justify-between gap-(--spacing-3) border-b border-(--color-divider) px-(--spacing-4) py-(--spacing-3)">
            <div className="min-w-0">
              <Text size="sm" weight="semibold">
                Notifiche
              </Text>
              <Text size="xs" tone="muted">
                Ultimi aggiornamenti operativi
              </Text>
            </div>
            {hasUnread ? (
              <Badge size="sm" variant="soft" tone="error">
                {feed.unreadCount}
              </Badge>
            ) : null}
          </div>

          <div className="max-h-[22rem] overflow-y-auto p-(--spacing-2)">
            {loading ? (
              <div className="flex items-center gap-(--spacing-2) rounded-(--radius-lg) px-(--spacing-3) py-(--spacing-4) text-(--color-text-muted)">
                <CircleNotch size={16} className="animate-spin" />
                <Text size="sm" tone="muted">
                  Caricamento notifiche...
                </Text>
              </div>
            ) : feed.notifications.length === 0 ? (
              <div className="grid gap-(--spacing-2) rounded-(--radius-lg) px-(--spacing-3) py-(--spacing-5) text-center">
                <CheckCircle
                  size={24}
                  weight="bold"
                  className="mx-auto text-(--color-success)"
                />
                <Text size="sm" weight="medium">
                  Nessuna notifica recente
                </Text>
                <Text size="xs" tone="muted">
                  Qui compariranno completamenti task e aggiornamenti persistenti.
                </Text>
              </div>
            ) : (
              <div className="grid gap-(--spacing-1)">
                {feed.notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    className={cn(
                      "grid w-full gap-(--spacing-2) rounded-(--radius-lg) border px-(--spacing-3) py-(--spacing-3) text-left transition-[background,border-color] duration-[var(--duration-base)] ease-[var(--ease-qoovex)]",
                      notification.read
                        ? "border-transparent bg-transparent hover:border-(--color-border) hover:bg-(--color-surface)"
                        : "border-(--color-primary)/30 bg-(--color-primary-highlight)",
                    )}
                    disabled={updating}
                    onClick={() => {
                      if (!notification.read) {
                        void patchNotifications({
                          action: "mark-read",
                          id: notification.id,
                        });
                      }
                    }}
                  >
                    <span className="flex items-start gap-(--spacing-2)">
                      <span
                        className={cn(
                          "mt-1 size-2 shrink-0 rounded-(--radius-full)",
                          notification.read
                            ? "bg-(--color-border)"
                            : "bg-(--color-primary)",
                        )}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1">
                        <Text size="sm" weight="medium" className="truncate">
                          {notification.title}
                        </Text>
                        {notification.body ? (
                          <Text size="xs" tone="muted" leading="relaxed">
                            {notification.body}
                          </Text>
                        ) : null}
                      </span>
                    </span>
                    <Text size="xs" tone="faint">
                      {formatNotificationTime(notification.createdAt)}
                    </Text>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-(--spacing-2) border-t border-(--color-divider) px-(--spacing-3) py-(--spacing-3)">
            <Text size="xs" tone="muted">
              Persistenti, separate dai toast
            </Text>
            <div className="flex items-center gap-(--spacing-2)">
              <Button
                as="a"
                href="/notifications"
                variant="ghost"
                size="xs"
                onClick={() => setOpen(false)}
              >
                Vedi tutte
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                loading={updating}
                disabled={!hasUnread || updating}
                iconLeft={<WarningCircle size={14} />}
                onClick={() => {
                  void patchNotifications({ action: "mark-all-read" });
                }}
              >
                Segna lette
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
