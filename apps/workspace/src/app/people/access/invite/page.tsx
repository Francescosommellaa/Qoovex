import type { OrganizationRole } from "@qoovex/types";
import { canInviteRole } from "@shared/server/authorization-policy";
import { getWorkspaceCapabilities } from "@/views/admin-core/admin-core-server";
import { InvitePersonView } from "@/views/settings/InvitePersonView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";

const candidateRoles: Array<Exclude<OrganizationRole, "OWNER" | "WORKER">> = ["ADMIN", "MEMBER", "VIEWER"];

export default async function PeopleInvitePage() {
  try {
    const capabilities = await getWorkspaceCapabilities();
    if (!capabilities.canManageMembers || !capabilities.role) return <WorkspaceAccessState />;
    const invitableRoles = candidateRoles.filter((role) => canInviteRole(capabilities.role as OrganizationRole, role));
    return <InvitePersonView invitableRoles={invitableRoles} />;
  } catch {
    return <WorkspaceAccessState title="Invito non disponibile" description="Verifica accesso e autorizzazioni." />;
  }
}
