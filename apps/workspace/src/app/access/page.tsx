import { AccessAssignmentsPageView } from "@/views/admin-core/access/AccessAssignmentsPageView";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import { getResourceAssignmentOptions, listJobSiteUserAssignments, listJobSiteWorkerAssignments, listWorkerUserLinks } from "@shared/server/resource-assignment-service";

export default async function AccessPage() {
  try {
    const [capabilities, workerUserLinks, jobSiteUserAssignments, jobSiteWorkerAssignments, options] = await Promise.all([getWorkspaceCapabilities(), listWorkerUserLinks(), listJobSiteUserAssignments(), listJobSiteWorkerAssignments(), getResourceAssignmentOptions()]);
    return <AccessAssignmentsPageView canManage={capabilities.canManageAssignments} jobSiteUserAssignments={serializeForClient(jobSiteUserAssignments)} jobSiteWorkerAssignments={serializeForClient(jobSiteWorkerAssignments)} options={serializeForClient(options)} workerUserLinks={serializeForClient(workerUserLinks)} />;
  } catch { return <WorkspaceAccessState title="Assegnazioni non disponibili" description="Verifica accesso e azienda configurata." />; }
}
