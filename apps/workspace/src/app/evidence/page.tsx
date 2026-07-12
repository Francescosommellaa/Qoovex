import { getChecklist, listChecklists } from "@shared/server/checklist-service";
import { listEvidence } from "@shared/server/evidence-service";
import { listJobSites } from "@shared/server/job-site-service";
import { listWorkers } from "@shared/server/worker-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { EvidencePageView } from "@/views/admin-core/evidence/EvidencePageView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import type { WorkspaceChecklistItemRecord, WorkspaceChecklistRecord, WorkspaceEvidenceRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";

export default async function EvidencePage() {
  try {
    const [evidence, checklists, jobSites, workers, capabilities] = await Promise.all([
      listEvidence(),
      listChecklists(),
      listJobSites(),
      listWorkers(),
      getWorkspaceCapabilities(),
    ]);
    const detailedChecklists = await Promise.all(checklists.map((checklist) => getChecklist(checklist.id)));
    const checklistItems = detailedChecklists.flatMap((checklist) => checklist.items ?? []);
    return (
      <EvidencePageView
        capabilities={capabilities}
        evidence={serializeForClient<WorkspaceEvidenceRecord[]>(evidence)}
        checklists={serializeForClient<WorkspaceChecklistRecord[]>(detailedChecklists)}
        checklistItems={serializeForClient<WorkspaceChecklistItemRecord[]>(checklistItems)}
        jobSites={serializeForClient<WorkspaceJobSiteRecord[]>(jobSites)}
        workers={serializeForClient<WorkspaceWorkerRecord[]>(workers)}
      />
    );
  } catch {
    return <WorkspaceAccessState title="Prove non disponibili" description="Verifica accesso e azienda configurata." />;
  }
}
