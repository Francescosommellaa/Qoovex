"use client";

import type { NotificationListResponse, NotificationResponse, NotificationSeverity } from "@qoovex/types";
import {
  IconAlertTriangle,
  IconBell,
  IconChevronRight,
  IconInfoCircle,
  IconInbox,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@qoovex/ui/components/badge";
import { Button, buttonVariants } from "@qoovex/ui/components/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@qoovex/ui/components/empty";
import { Separator } from "@qoovex/ui/components/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@qoovex/ui/components/sheet";
import { Skeleton } from "@qoovex/ui/components/skeleton";
import { Spinner } from "@qoovex/ui/components/spinner";
import { cn } from "@qoovex/ui/lib/utils";

const severity = {
  INFO: { icon: IconInfoCircle, label: "Informazione", variant: "info" },
  ATTENTION: { icon: IconBell, label: "Attenzione", variant: "warning" },
  WARNING: { icon: IconAlertTriangle, label: "Priorità alta", variant: "destructive" },
} satisfies Record<NotificationSeverity, {
  icon: typeof IconBell;
  label: string;
  variant: "info" | "warning" | "destructive";
}>;

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  month: "short",
});

function NotificationPreviewItem({ notification }: { notification: NotificationResponse }) {
  const itemSeverity = severity[notification.severity];
  const Icon = itemSeverity.icon;
  const unread = !notification.readAt;

  return (
    <article className="flex min-w-0 gap-3 px-4 py-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <h3 className={cn("min-w-0 flex-1 text-sm leading-5", unread ? "font-semibold" : "font-medium")}>{notification.title}</h3>
          {unread ? <span aria-label="Non letta" className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" /> : null}
        </div>
        <p className="mt-0.5 line-clamp-2 text-sm/5 text-muted-foreground">{notification.message}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant={itemSeverity.variant}>{itemSeverity.label}</Badge>
          <time className="text-xs text-muted-foreground" dateTime={notification.createdAt}>{dateFormatter.format(new Date(notification.createdAt))}</time>
          {notification.actionHref ? (
            <Link className="ml-auto inline-flex items-center gap-1 rounded-md text-xs font-medium text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring" data-link="plain" href={notification.actionHref}>
              Apri elemento <IconChevronRight aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function NotificationsLoading() {
  return (
    <div aria-label="Caricamento ultime notifiche" className="flex flex-col" role="status">
      {[0, 1, 2].map((item) => (
        <div className="flex gap-3 px-4 py-3" key={item}>
          <Skeleton className="size-8 shrink-0" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function WorkspaceNotificationsPanel({ unreadNotificationCount }: { unreadNotificationCount: number }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<NotificationListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentUnreadCount = data?.unreadCount ?? unreadNotificationCount;
  const notificationLabel = currentUnreadCount > 0
    ? `Apri notifiche, ${currentUnreadCount} ${currentUnreadCount === 1 ? "non letta" : "non lette"}`
    : "Apri notifiche";

  async function loadNotifications() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/notifications?limit=5&sort=recent", { cache: "no-store" });
      if (!response.ok) throw new Error("Le notifiche non sono disponibili in questo momento.");
      setData(await response.json() as NotificationListResponse);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Le notifiche non sono disponibili in questo momento.");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) void loadNotifications();
  }

  return (
    <Sheet onOpenChange={handleOpenChange} open={open}>
      <SheetTrigger render={<Button aria-label={notificationLabel} className="relative" size="icon-sm" variant="ghost" />}>
        <IconBell />
        {currentUnreadCount > 0 ? <span aria-hidden="true" className="absolute top-0 right-0 size-2 rounded-full bg-destructive ring-2 ring-background" /> : null}
      </SheetTrigger>
      <SheetContent className="data-[side=right]:w-full data-[side=right]:sm:max-w-md" showCloseButton={false}>
        <SheetHeader className="pr-12">
          <div className="flex items-center gap-2">
            <SheetTitle>Notifiche</SheetTitle>
            {currentUnreadCount > 0 ? <Badge variant="secondary">{currentUnreadCount} non {currentUnreadCount === 1 ? "letta" : "lette"}</Badge> : null}
          </div>
          <SheetDescription>Controlla gli ultimi aggiornamenti senza lasciare ciò che stai facendo.</SheetDescription>
        </SheetHeader>
        <SheetClose render={<Button aria-label="Chiudi notifiche" className="absolute top-3 right-3" size="icon-sm" variant="ghost" />}>
          <IconX />
        </SheetClose>
        <Separator />
        <div className="min-h-0 flex-1 overflow-y-auto">
          {!data && loading ? <NotificationsLoading /> : null}
          {error && !data ? (
            <Empty className="min-h-64 border-0">
              <EmptyHeader>
                <EmptyMedia variant="icon"><IconAlertTriangle /></EmptyMedia>
                <EmptyTitle>Impossibile caricare le notifiche</EmptyTitle>
                <EmptyDescription>{error}</EmptyDescription>
              </EmptyHeader>
              <Button onClick={() => void loadNotifications()} size="sm" variant="outline">Riprova</Button>
            </Empty>
          ) : null}
          {data && data.notifications.length === 0 ? (
            <Empty className="min-h-64 border-0">
              <EmptyHeader>
                <EmptyMedia variant="icon"><IconInbox /></EmptyMedia>
                <EmptyTitle>Nessuna notifica recente</EmptyTitle>
                <EmptyDescription>Gli aggiornamenti che richiedono attenzione appariranno qui.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : null}
          {data?.notifications.map((notification, index) => (
            <div key={notification.id}>
              {index > 0 ? <Separator /> : null}
              <NotificationPreviewItem notification={notification} />
            </div>
          ))}
        </div>
        <Separator />
        <SheetFooter>
          {loading && data ? <span className="flex items-center gap-2 text-xs text-muted-foreground"><Spinner /> Aggiornamento…</span> : null}
          <Link className={buttonVariants({ variant: "outline" })} data-link="plain" href="/notifications">Vedi tutte le notifiche</Link>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
