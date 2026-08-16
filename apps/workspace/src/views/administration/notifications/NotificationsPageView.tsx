import Link from "next/link";
import type { NotificationListResponse, NotificationResponse } from "@qoovex/types";
import { presentNotificationSeverity } from "@shared/lib/product-state-presentation";
import { presentNotificationActionLabel } from "@shared/lib/job-site-notification-destination";
import styles from "../AdminCore.module.css";
import { NotificationActionButtons } from "./NotificationActionButtons";
import { WorkspaceEmptyState, WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";

const filters = [
  { label: "Tutte", href: "/notifications", key: "all" },
  { label: "Non lette", href: "/notifications?filter=unread", key: "unread" },
] as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function NotificationCard({ notification }: { notification: NotificationResponse }) {
  const read = Boolean(notification.readAt);
  return (
    <article className={styles.record}>
      <div className={styles.recordMain}>
        <strong>{notification.title}</strong>
        <span>{notification.message}</span>
        <small>{read ? `Letta il ${formatDate(notification.readAt ?? notification.updatedAt)}` : `Creata il ${formatDate(notification.createdAt)}`}</small>
      </div>
      <div className={styles.actions}>
        <WorkspaceState state={presentNotificationSeverity(notification.severity)} />
        {notification.actionHref ? <Link className={styles.linkButton} href={notification.actionHref}>{presentNotificationActionLabel(notification.sourceType, notification.actionHref)}</Link> : null}
        <NotificationActionButtons notificationId={notification.id} read={read} />
      </div>
    </article>
  );
}

export function NotificationsPageView({ data, activeFilter }: { data: NotificationListResponse; activeFilter: "all" | "unread" }) {
  return (
    <WorkspacePage>
      <WorkspacePageHeader
        title="Notifiche"
        description="Apri ciò che richiede attenzione oppure segna e nascondi le notifiche già gestite."
        action={<Link className={styles.ghostButton} href="/settings/notifications">Preferenze</Link>}
      />
      <WorkspacePanel title="Inbox" description={`${data.unreadCount} notifiche non lette. Le notifiche nascoste non appaiono nella vista standard.`}>
        <div className={styles.filterBar} aria-label="Filtra notifiche">
          {filters.map((filter) => (
            <Link aria-current={activeFilter === filter.key ? "page" : undefined} href={filter.href} key={filter.href}>
              {filter.label}
            </Link>
          ))}
        </div>
        <div className={`${styles.list} scroll-mt-20 outline-none focus-visible:ring-2 focus-visible:ring-ring`} data-focus-refresh-fallback="true" id="notifications-list" tabIndex={-1}>
          {!data.notifications.length ? (
            <WorkspaceEmptyState
              title="Nessuna notifica da controllare"
              description="Richieste, decisioni e cambi di stato appariranno qui quando richiedono attenzione."
            />
          ) : (
            data.notifications.map((notification) => <NotificationCard key={notification.id} notification={notification} />)
          )}
        </div>
      </WorkspacePanel>
    </WorkspacePage>
  );
}
