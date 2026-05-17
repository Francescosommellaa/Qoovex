import { Badge } from "@qoovex/ui";
import { NotificationInbox } from "@features/notifications";
import type {
  NotificationQueryFilters,
  WorkspacePlan,
} from "@shared/lib/workspace-types";
import { WorkspacePage } from "@shared/ui";
import { getNotificationInbox } from "@shared/server/notification-service";

interface NotificationsViewUser {
  id: string;
  plan: WorkspacePlan;
}

export async function NotificationsView({
  user,
  filters,
}: {
  user: NotificationsViewUser;
  filters: NotificationQueryFilters;
}) {
  const feed = await getNotificationInbox(user.id, filters);

  return (
    <WorkspacePage
      title="Notifiche"
      description="Inbox operativa per eventi persistenti, separata dai toast temporanei."
      actions={
        <Badge tone={feed.unreadCount > 0 ? "error" : "neutral"}>
          {feed.unreadCount} non lette
        </Badge>
      }
    >
      <NotificationInbox feed={feed} filters={filters} />
    </WorkspacePage>
  );
}
