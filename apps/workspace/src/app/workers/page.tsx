import type { OrganizationRole } from "@qoovex/types";
import { canInviteRole } from "@shared/server/authorization-policy";
import { listWorkers } from "@shared/server/worker-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { WorkersPageView } from "@/views/admin-core/workers/WorkersPageView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import type { WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";

const candidateRoles: Array<Exclude<OrganizationRole, "OWNER">> = ["ADMIN", "SAFETY_CONSULTANT", "SITE_MANAGER", "WORKER"];

interface WorkersPageProps {
  searchParams: Promise<{ intent?: string }>;
}

export default async function WorkersPage({ searchParams }: WorkersPageProps) {
  try {
    const [workers, capabilities, params] = await Promise.all([listWorkers(), getWorkspaceCapabilities(), searchParams]);
    const invitableRoles = capabilities.canManageMembers && capabilities.role
      ? candidateRoles.filter((role) => canInviteRole(capabilities.role as OrganizationRole, role))
      : [];
    return <WorkersPageView capabilities={capabilities} initialCreateOpen={params.intent === "create" && capabilities.canCreateWorkers} invitableRoles={invitableRoles} workers={serializeForClient<WorkspaceWorkerRecord[]>(workers)} />;
  } catch {
    return <WorkspaceAccessState title="Lavoratori non disponibili" description="Verifica accesso e azienda configurata." />;
  }
}
