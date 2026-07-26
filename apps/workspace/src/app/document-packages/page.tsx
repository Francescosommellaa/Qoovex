import { listDocumentPackagesWithDetails } from "@shared/server/document-package-service";
import { listJobSites } from "@shared/server/job-site-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { DocumentPackagesPageView } from "@/views/admin-core/document-packages/DocumentPackagesPageView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import type { WorkspaceDocumentPackageRecord, WorkspaceJobSiteRecord, WorkspaceShareLinkRecord } from "@/views/workspace/workspace-records";
import { parseDocumentPackageQueueView, parseWorkspaceListPage, WORKSPACE_LIST_PAGE_SIZE } from "@shared/lib/workspace-list-filters";

export default async function DocumentPackagesPage({ searchParams }: { searchParams: Promise<{ view?: string; page?: string }> }) {
  try {
    const params = await searchParams;
    const view = parseDocumentPackageQueueView(params.view);
    const page = parseWorkspaceListPage(params.page);
    const capabilities = await getWorkspaceCapabilities();
    const [detailedPackages, jobSites] = await Promise.all([
      listDocumentPackagesWithDetails({
        includeShareLinks: capabilities.canSharePackages,
        ...(view ? { statuses: ["READY_FOR_REVIEW", "SHARED"] as const } : {}),
        take: WORKSPACE_LIST_PAGE_SIZE + 1,
        skip: (page - 1) * WORKSPACE_LIST_PAGE_SIZE,
      }),
      listJobSites(),
    ]);
    const visiblePackages = detailedPackages.slice(0, WORKSPACE_LIST_PAGE_SIZE);
    const shareLinksByPackage = Object.fromEntries(visiblePackages.map((documentPackage) => [documentPackage.id, documentPackage.shareLinks]));
    const packages = visiblePackages.map(({ shareLinks: _shareLinks, ...documentPackage }) => documentPackage);
    return (
      <DocumentPackagesPageView
        capabilities={capabilities}
        activeView={view}
        hasNextPage={detailedPackages.length > WORKSPACE_LIST_PAGE_SIZE}
        packages={serializeForClient<WorkspaceDocumentPackageRecord[]>(packages)}
        page={page}
        jobSites={serializeForClient<WorkspaceJobSiteRecord[]>(jobSites)}
        shareLinksByPackage={serializeForClient<Record<string, WorkspaceShareLinkRecord[]>>(shareLinksByPackage)}
      />
    );
  } catch {
    return <WorkspaceAccessState title="Pacchetti non disponibili" description="Verifica accesso e azienda configurata." />;
  }
}
