import { getPeopleAssignmentsOverview } from "@shared/server/people-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { PeopleAssignmentsView } from "@/views/people/PeopleAssignmentsView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";

export default async function PeopleAssignmentsPage() {
  try {
    const [overview, capabilities] = await Promise.all([getPeopleAssignmentsOverview(), getWorkspaceCapabilities()]);
    return <PeopleAssignmentsView canManage={capabilities.canManageAssignments} overview={serializeForClient(overview)} />;
  } catch {
    return <WorkspaceAccessState title="Assegnazioni non disponibili" description="Verifica accesso e azienda configurata." />;
  }
}
