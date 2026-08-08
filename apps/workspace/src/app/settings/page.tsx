import { getWorkspaceCapabilities } from "@/views/administration/administration-server";
import { SettingsHubView } from "@/views/settings/SettingsHubView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";

export default async function SettingsPage() {
  try { return <SettingsHubView capabilities={await getWorkspaceCapabilities()} />; }
  catch { return <WorkspaceAccessState title="Impostazioni non disponibili" description="Verifica accesso e azienda configurata." />; }
}
