import { listChecklistsWithItems } from "@shared/server/checklist-service";
import { listJobSites } from "@shared/server/job-site-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { ChecklistsPageView } from "@/views/admin-core/checklists/ChecklistsPageView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import type { WorkspaceChecklistRecord, WorkspaceJobSiteRecord } from "@/views/workspace/workspace-records";
import { parseChecklistQueueView, parseWorkspaceListPage, WORKSPACE_LIST_PAGE_SIZE } from "@shared/lib/workspace-list-filters";

export default async function ChecklistsPage({ searchParams }: { searchParams: Promise<{ view?: string; page?: string }> }) {
  try {
    const params = await searchParams;
    const view = parseChecklistQueueView(params.view);
    const page = parseWorkspaceListPage(params.page);
    const [checklists, jobSites, capabilities] = await Promise.all([
      listChecklistsWithItems({
        ...(view ? { itemStatuses: ["OPEN", "TO_REVIEW"] as const } : {}),
        take: WORKSPACE_LIST_PAGE_SIZE + 1,
        skip: (page - 1) * WORKSPACE_LIST_PAGE_SIZE,
      }),
      listJobSites(),
      getWorkspaceCapabilities(),
    ]);
    return (
      <ChecklistsPageView
        capabilities={capabilities}
        checklists={serializeForClient<WorkspaceChecklistRecord[]>(checklists.slice(0, WORKSPACE_LIST_PAGE_SIZE))}
        activeView={view}
        hasNextPage={checklists.length > WORKSPACE_LIST_PAGE_SIZE}
        jobSites={serializeForClient<WorkspaceJobSiteRecord[]>(jobSites)}
        page={page}
      />
    );
  } catch {
    return <WorkspaceAccessState title="Checklist non disponibili" description="Verifica accesso e azienda configurata." />;
  }
}
