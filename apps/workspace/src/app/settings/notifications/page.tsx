import { getWorkspaceCapabilities } from "@/views/admin-core/admin-core-server";
import { NotificationSettingsView } from "@/views/settings/NotificationSettingsView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";

export default async function NotificationSettingsPage() {
  try {
    const capabilities = await getWorkspaceCapabilities();
    if (!capabilities.canReadNotifications) return <WorkspaceAccessState />;
    return <NotificationSettingsView />;
  } catch { return <WorkspaceAccessState title="Preferenze non disponibili" description="Verifica accesso e azienda configurata." />; }
}
