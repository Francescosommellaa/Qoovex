import type { OrganizationRole } from "@qoovex/types";
import { canInviteRole } from "@shared/server/authorization-policy";
import { getAccessResourceOptions } from "@shared/server/organization-access-service";
import { getWorkspaceCapabilities } from "@/views/admin-core/admin-core-server";
import { InvitePersonView } from "@/views/settings/InvitePersonView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";

const candidateRoles: Array<Exclude<OrganizationRole, "OWNER">> = ["COLLABORATOR"];

export default async function PeopleInvitePage() {
  try {
    const [capabilities, resourceOptions] = await Promise.all([getWorkspaceCapabilities(), getAccessResourceOptions()]);
    if (!capabilities.canManageMembers || !capabilities.role) return <WorkspaceAccessState />;
    const invitableRoles = candidateRoles.filter((role) => canInviteRole(capabilities.role as OrganizationRole, role));
    return <InvitePersonView invitableRoles={invitableRoles} resourceOptions={resourceOptions} />;
  } catch {
    return <WorkspaceAccessState title="Invito non disponibile" description="Verifica accesso e autorizzazioni." />;
  }
}
