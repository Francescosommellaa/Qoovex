import type { OrganizationRole } from "@qoovex/types";
import { canInviteRole } from "@shared/server/authorization-policy";
import { getPeopleAccessOverview } from "@shared/server/people-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { PeopleAccessView } from "@/views/people/PeopleAccessView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";

const candidateRoles: Array<Exclude<OrganizationRole, "OWNER" | "WORKER">> = ["ADMIN", "SAFETY_CONSULTANT", "SITE_MANAGER"];

export default async function PeopleAccessPage() {
  try {
    const [overview, capabilities] = await Promise.all([getPeopleAccessOverview(), getWorkspaceCapabilities()]);
    const invitableRoles = capabilities.role
      ? candidateRoles.filter((role) => canInviteRole(capabilities.role as OrganizationRole, role))
      : [];
    return <PeopleAccessView canManage={capabilities.canManageMembers} canRevoke={capabilities.role === "OWNER"} invitableRoles={invitableRoles} overview={serializeForClient(overview)} />;
  } catch {
    return <WorkspaceAccessState title="Accessi non disponibili" description="Questa sezione e riservata a proprietario e amministratori." />;
  }
}
