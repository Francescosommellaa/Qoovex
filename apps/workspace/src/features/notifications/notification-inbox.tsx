"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle,
  EnvelopeOpen,
  Trash,
  X,
} from "@phosphor-icons/react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  Checkbox,
  EmptyState,
  Input,
  Select,
  Stack,
  Text,
  cn,
  useToast,
} from "@qoovex/ui";
import type {
  NotificationDto,
  NotificationInboxDto,
  NotificationQueryFilters,
  NotificationReadFilter,
} from "@shared/lib/workspace-types";

interface NotificationInboxProps {
  feed: NotificationInboxDto;
  filters: NotificationQueryFilters;
}

const readFilterOptions = [
  { value: "all", label: "Tutte" },
  { value: "unread", label: "Non lette" },
  { value: "read", label: "Lette" },
];

function formatNotificationTime(value: string) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getNextParams(
  searchParams: URLSearchParams,
  filters: NotificationQueryFilters,
) {
  const nextParams = new URLSearchParams(searchParams);

  if (filters.read && filters.read !== "all") {
    nextParams.set("read", filters.read);
  } else {
    nextParams.delete("read");
  }

  if (filters.type) {
    nextParams.set("type", filters.type);
  } else {
    nextParams.delete("type");
  }

  if (filters.from) {
    nextParams.set("from", filters.from);
  } else {
    nextParams.delete("from");
  }

  if (filters.to) {
    nextParams.set("to", filters.to);
  } else {
    nextParams.delete("to");
  }

  nextParams.delete("cursor");
  return nextParams;
}

function NotificationRow({
  notification,
  selected,
  updating,
  onSelect,
  onReadChange,
  onDelete,
}: {
  notification: NotificationDto;
  selected: boolean;
  updating: boolean;
  onSelect: (checked: boolean) => void;
  onReadChange: (read: boolean) => void;
  onDelete: () => void;
}) {
  return (
    <Card
      variant="panel"
      padding="md"
      className={cn(
        "transition-[border-color,background,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-qoovex)]",
        !notification.read &&
          "border-(--color-primary)/40 bg-(--color-primary-highlight)",
      )}
    >
      <CardBody>
        <div className="grid gap-(--spacing-3) md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-start">
          <Checkbox
            aria-label="Seleziona notifica"
            checked={selected}
            disabled={updating}
            onCheckedChange={onSelect}
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-(--spacing-2)">
              <span
                className={cn(
                  "size-2 rounded-(--radius-full)",
                  notification.read
                    ? "bg-(--color-border)"
                    : "bg-(--color-primary)",
                )}
                aria-hidden="true"
              />
              <Text as="h2" size="sm" weight="semibold" className="min-w-0 truncate">
                {notification.title}
              </Text>
              <Badge size="sm" tone={notification.read ? "neutral" : "primary"}>
                {notification.read ? "letta" : "nuova"}
              </Badge>
              <Badge size="sm" variant="soft" tone="neutral">
                {notification.type}
              </Badge>
            </div>
            {notification.body ? (
              <Text size="sm" tone="muted" leading="relaxed" className="mt-(--spacing-2)">
                {notification.body}
              </Text>
            ) : null}
            <Text size="xs" tone="faint" className="mt-(--spacing-2)">
              {formatNotificationTime(notification.createdAt)}
            </Text>
          </div>
          <div className="flex flex-wrap items-center gap-(--spacing-2) md:justify-end">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              disabled={updating}
              iconLeft={<EnvelopeOpen size={14} />}
              onClick={() => onReadChange(!notification.read)}
            >
              {notification.read ? "Non letta" : "Letta"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              disabled={updating}
              className="text-(--color-error)"
              iconLeft={<Trash size={14} />}
              onClick={onDelete}
            >
              Elimina
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export function NotificationInbox({ feed, filters }: NotificationInboxProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [readFilter, setReadFilter] = React.useState<NotificationReadFilter>(
    filters.read ?? "all",
  );
  const [typeFilter, setTypeFilter] = React.useState(filters.type ?? "all");
  const [from, setFrom] = React.useState(filters.from ?? "");
  const [to, setTo] = React.useState(filters.to ?? "");
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [updating, setUpdating] = React.useState(false);

  const typeOptions = React.useMemo(
    () => [
      { value: "all", label: "Tutti i tipi" },
      ...feed.types.map((type) => ({ value: type, label: type })),
    ],
    [feed.types],
  );
  const allSelected =
    feed.notifications.length > 0 &&
    selectedIds.length === feed.notifications.length;

  React.useEffect(() => {
    setSelectedIds([]);
  }, [feed.notifications]);

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextParams = getNextParams(searchParams, {
      read: readFilter,
      type: typeFilter === "all" ? undefined : typeFilter,
      from,
      to,
    });
    const query = nextParams.toString();
    router.push(query ? `/notifications?${query}` : "/notifications");
  }

  function resetFilters() {
    setReadFilter("all");
    setTypeFilter("all");
    setFrom("");
    setTo("");
    router.push("/notifications");
  }

  async function requestNotificationUpdate({
    method,
    body,
    successTitle,
  }: {
    method: "PATCH" | "DELETE";
    body: Record<string, unknown>;
    successTitle: string;
  }) {
    setUpdating(true);

    try {
      const response = await fetch("/api/notifications", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Operazione non riuscita.");
      }

      setSelectedIds([]);
      toast({ variant: "success", title: successTitle });
      router.refresh();
    } catch (error) {
      toast({
        variant: "error",
        title: "Notifiche non aggiornate",
        description:
          error instanceof Error
            ? error.message
            : "Riprova tra qualche istante.",
      });
    } finally {
      setUpdating(false);
    }
  }

  function toggleSelected(id: string, checked: boolean) {
    setSelectedIds((current) =>
      checked ? [...new Set([...current, id])] : current.filter((item) => item !== id),
    );
  }

  function toggleAllSelected(checked: boolean) {
    setSelectedIds(checked ? feed.notifications.map((notification) => notification.id) : []);
  }

  const hasSelected = selectedIds.length > 0;

  return (
    <Stack gap="5">
      <Card
        variant="panel"
        padding="md"
        overflow="visible"
        className="relative focus-within:z-(--z-dropdown)"
      >
        <CardBody>
          <form
            className="grid gap-(--spacing-3) md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_auto]"
            onSubmit={applyFilters}
          >
            <Select
              label="Stato"
              value={readFilter}
              options={readFilterOptions}
              onChange={(value) => setReadFilter(value as NotificationReadFilter)}
            />
            <Select
              label="Tipo"
              value={typeFilter}
              options={typeOptions}
              onChange={setTypeFilter}
            />
            <Input
              type="date"
              label="Da"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
            <Input
              type="date"
              label="A"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
            <div className="flex items-end gap-(--spacing-2)">
              <Button type="submit" variant="secondary" size="sm">
                Filtra
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                iconLeft={<X size={14} />}
                onClick={resetFilters}
              >
                Reset
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <div className="flex flex-col gap-(--spacing-3) rounded-(--radius-xl) border border-(--color-border) bg-(--color-surface-2) p-(--spacing-3) md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-(--spacing-3)">
          <Checkbox
            label="Seleziona pagina"
            checked={allSelected}
            disabled={feed.notifications.length === 0 || updating}
            onCheckedChange={toggleAllSelected}
          />
          <Badge tone={feed.unreadCount > 0 ? "error" : "neutral"}>
            {feed.unreadCount} non lette
          </Badge>
          {hasSelected ? (
            <Text size="xs" tone="muted">
              {selectedIds.length} selezionate
            </Text>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-(--spacing-2)">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            disabled={feed.unreadCount === 0 || updating}
            onClick={() =>
              requestNotificationUpdate({
                method: "PATCH",
                body: { action: "mark-all-read" },
                successTitle: "Tutte le notifiche sono lette",
              })
            }
          >
            Tutte lette
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            disabled={!hasSelected || updating}
            loading={updating && hasSelected}
            iconLeft={<CheckCircle size={14} />}
            onClick={() =>
              requestNotificationUpdate({
                method: "PATCH",
                body: { action: "mark-read", ids: selectedIds },
                successTitle: "Notifiche segnate come lette",
              })
            }
          >
            Segna lette
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            disabled={!hasSelected || updating}
            onClick={() =>
              requestNotificationUpdate({
                method: "PATCH",
                body: { action: "mark-unread", ids: selectedIds },
                successTitle: "Notifiche segnate come non lette",
              })
            }
          >
            Non lette
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            disabled={!hasSelected || updating}
            className="text-(--color-error)"
            iconLeft={<Trash size={14} />}
            onClick={() =>
              requestNotificationUpdate({
                method: "DELETE",
                body: { ids: selectedIds },
                successTitle: "Notifiche eliminate",
              })
            }
          >
            Elimina
          </Button>
        </div>
      </div>

      {feed.notifications.length === 0 ? (
        <EmptyState
          title="Nessuna notifica"
          description="I filtri correnti non restituiscono notifiche operative."
        />
      ) : (
        <div className="grid gap-(--spacing-3)">
          {feed.notifications.map((notification) => (
            <NotificationRow
              key={notification.id}
              notification={notification}
              selected={selectedIds.includes(notification.id)}
              updating={updating}
              onSelect={(checked) => toggleSelected(notification.id, checked)}
              onReadChange={(read) =>
                requestNotificationUpdate({
                  method: "PATCH",
                  body: {
                    action: "mark-read-state",
                    id: notification.id,
                    read,
                  },
                  successTitle: read
                    ? "Notifica segnata come letta"
                    : "Notifica segnata come non letta",
                })
              }
              onDelete={() =>
                requestNotificationUpdate({
                  method: "DELETE",
                  body: { id: notification.id },
                  successTitle: "Notifica eliminata",
                })
              }
            />
          ))}
        </div>
      )}
    </Stack>
  );
}
