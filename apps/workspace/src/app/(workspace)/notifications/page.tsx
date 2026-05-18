import { redirect } from "next/navigation";
import { getCurrentWorkspaceUser } from "@shared/server/current-workspace-user";
import type {
  NotificationQueryFilters,
  NotificationReadFilter,
} from "@shared/lib/workspace-types";
import { NotificationsView } from "@views/notifications";

function normalizeReadFilter(value: string | undefined): NotificationReadFilter | undefined {
  return value === "read" || value === "unread" || value === "all"
    ? value
    : undefined;
}

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    read?: string;
    type?: string;
    from?: string;
    to?: string;
    cursor?: string;
  }>;
}) {
  const user = await getCurrentWorkspaceUser();
  if (!user) redirect("/sign-in");

  const params = await searchParams;
  const filters: NotificationQueryFilters = {
    read: normalizeReadFilter(params.read),
    type: params.type || undefined,
    from: params.from || undefined,
    to: params.to || undefined,
    cursor: params.cursor || undefined,
    take: 30,
  };

  return <NotificationsView user={user} filters={filters} />;
}
