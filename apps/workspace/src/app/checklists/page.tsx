import { getChecklist, listChecklists } from "@shared/server/checklist-service";
import { listJobSites } from "@shared/server/job-site-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { ChecklistsPageView } from "@/views/admin-core/checklists/ChecklistsPageView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspacePrimitives";
import type { WorkspaceChecklistRecord, WorkspaceJobSiteRecord } from "@/views/workspace/workspace-records";

export default async function ChecklistsPage() {
  try {
    const [checklists, jobSites, capabilities] = await Promise.all([
      listChecklists(),
      listJobSites(),
      getWorkspaceCapabilities(),
    ]);
    const detailedChecklists = await Promise.all(checklists.map((checklist) => getChecklist(checklist.id)));
    return (
      <ChecklistsPageView
        capabilities={capabilities}
        checklists={serializeForClient<WorkspaceChecklistRecord[]>(detailedChecklists)}
        jobSites={serializeForClient<WorkspaceJobSiteRecord[]>(jobSites)}
      />
    );
  } catch {
    return <WorkspaceAccessState title="Checklist non disponibili" description="Verifica accesso e azienda attiva." />;
  }
}
