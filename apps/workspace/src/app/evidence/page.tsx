import { listChecklistsWithItems } from "@shared/server/checklist-service";
import { listEvidence } from "@shared/server/evidence-service";
import { listJobSites } from "@shared/server/job-site-service";
import { listWorkers } from "@shared/server/worker-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { EvidencePageView } from "@/views/admin-core/evidence/EvidencePageView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import type { WorkspaceChecklistItemRecord, WorkspaceChecklistRecord, WorkspaceEvidenceRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";
import { parseEvidenceSort, parseWorkspaceListPage, WORKSPACE_LIST_PAGE_SIZE } from "@shared/lib/workspace-list-filters";

export default async function EvidencePage({ searchParams }: { searchParams: Promise<{ sort?: string; page?: string }> }) {
  try {
    const params = await searchParams;
    const sort = parseEvidenceSort(params.sort);
    const page = parseWorkspaceListPage(params.page);
    const capabilities = await getWorkspaceCapabilities();
    const [evidence, jobSites, workers] = await Promise.all([
      listEvidence({ take: WORKSPACE_LIST_PAGE_SIZE + 1, skip: (page - 1) * WORKSPACE_LIST_PAGE_SIZE }),
      listJobSites(),
      listWorkers(),
    ]);
    const checklists = capabilities.canCompleteChecklists || capabilities.canManageChecklists ? await listChecklistsWithItems() : [];
    const checklistItems = checklists.flatMap((checklist) => checklist.items ?? []);
    return (
      <EvidencePageView
        capabilities={capabilities}
        evidence={serializeForClient<WorkspaceEvidenceRecord[]>(evidence.slice(0, WORKSPACE_LIST_PAGE_SIZE))}
        activeSort={sort}
        checklists={serializeForClient<WorkspaceChecklistRecord[]>(checklists)}
        checklistItems={serializeForClient<WorkspaceChecklistItemRecord[]>(checklistItems)}
        hasNextPage={evidence.length > WORKSPACE_LIST_PAGE_SIZE}
        jobSites={serializeForClient<WorkspaceJobSiteRecord[]>(jobSites)}
        page={page}
        workers={serializeForClient<WorkspaceWorkerRecord[]>(workers)}
      />
    );
  } catch {
    return <WorkspaceAccessState title="Prove non disponibili" description="Verifica accesso e azienda configurata." />;
  }
}
