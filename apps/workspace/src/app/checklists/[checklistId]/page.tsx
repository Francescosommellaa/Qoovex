import { getChecklist } from "@shared/server/checklist-service";
import { listJobSites } from "@shared/server/job-site-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { ChecklistDetailView } from "@/views/admin-core/checklists/ChecklistDetailView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import type { WorkspaceChecklistRecord, WorkspaceJobSiteRecord } from "@/views/workspace/workspace-records";

interface ChecklistDetailPageProps {
  params: Promise<{ checklistId: string }>;
}

export default async function ChecklistDetailPage({ params }: ChecklistDetailPageProps) {
  try {
    const { checklistId } = await params;
    const [checklist, jobSites, capabilities] = await Promise.all([
      getChecklist(checklistId),
      listJobSites(),
      getWorkspaceCapabilities(),
    ]);
    return (
      <ChecklistDetailView
        capabilities={capabilities}
        checklist={serializeForClient<WorkspaceChecklistRecord>(checklist)}
        jobSites={serializeForClient<WorkspaceJobSiteRecord[]>(jobSites)}
      />
    );
  } catch {
    return <WorkspaceAccessState title="Checklist non disponibile" description="Verifica accesso, azienda attiva o stato archiviazione." />;
  }
}
