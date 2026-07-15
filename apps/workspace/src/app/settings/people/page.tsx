import { listMembers } from "@shared/server/organization-access-service";
import { listInvitations } from "@shared/server/organization-invitation-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { PeopleSettingsView } from "@/views/settings/PeopleSettingsView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";

export default async function PeopleSettingsPage() {
  try {
    const capabilities = await getWorkspaceCapabilities();
    if (!capabilities.canReadMembers) return <WorkspaceAccessState />;
    const [members, invitations] = await Promise.all([listMembers(), listInvitations()]);
    return <PeopleSettingsView canManage={capabilities.canManageMembers} members={serializeForClient(members)} invitations={serializeForClient(invitations)} />;
  } catch { return <WorkspaceAccessState title="Persone non disponibili" description="Verifica accesso e azienda configurata." />; }
}
