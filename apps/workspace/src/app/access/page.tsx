import {
  getResourceAssignmentOptions,
  listJobSiteUserAssignments,
  listJobSiteWorkerAssignments,
  listWorkerUserLinks,
} from "@shared/server/resource-assignment-service";
import { AccessAssignmentsPageView } from "@/views/admin-core/access/AccessAssignmentsPageView";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";

export default async function AccessPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  try {
    const { from } = await searchParams;
    const capabilities = await getWorkspaceCapabilities();
    if (!capabilities.canManageAssignments) {
      return <WorkspaceAccessState title="Accessi non disponibili" description="Questa sezione e riservata alla gestione operativa dell'azienda." />;
    }
    const [workerLinks, userAssignments, workerAssignments, options] = await Promise.all([
      listWorkerUserLinks(),
      listJobSiteUserAssignments(),
      listJobSiteWorkerAssignments(),
      getResourceAssignmentOptions(),
    ]);
    return (
      <AccessAssignmentsPageView
        jobSiteUserAssignments={serializeForClient(userAssignments)}
        jobSiteWorkerAssignments={serializeForClient(workerAssignments)}
        options={serializeForClient(options)}
        workerUserLinks={serializeForClient(workerLinks)}
        returnToDashboard={from === "dashboard"}
      />
    );
  } catch {
    return <WorkspaceAccessState title="Accessi non disponibili" description="Verifica accesso e azienda configurata." />;
  }
}
