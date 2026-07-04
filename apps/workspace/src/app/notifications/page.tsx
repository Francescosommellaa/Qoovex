import { listNotifications } from "@shared/server/notification-service";
import { NotificationsPageView } from "@/views/admin-core/notifications/NotificationsPageView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspacePrimitives";

interface NotificationsPageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function NotificationsPage({ searchParams }: NotificationsPageProps) {
  try {
    const params = await searchParams;
    const data = await listNotifications({ filter: params.filter });
    return <NotificationsPageView data={data} activeFilter={params.filter === "unread" ? "unread" : "all"} />;
  } catch {
    return <WorkspaceAccessState title="Notifiche non disponibili" description="Verifica accesso e azienda attiva." />;
  }
}
