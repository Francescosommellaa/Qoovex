import { listDocumentPackagesWithDetails } from "@shared/server/document-package-service";
import { listJobSites } from "@shared/server/job-site-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { DocumentPackagesPageView } from "@/views/admin-core/document-packages/DocumentPackagesPageView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import type { WorkspaceDocumentPackageRecord, WorkspaceJobSiteRecord, WorkspaceShareLinkRecord } from "@/views/workspace/workspace-records";

export default async function DocumentPackagesPage() {
  try {
    const capabilities = await getWorkspaceCapabilities();
    const [detailedPackages, jobSites] = await Promise.all([
      listDocumentPackagesWithDetails({ includeShareLinks: capabilities.canSharePackages }),
      listJobSites(),
    ]);
    const shareLinksByPackage = Object.fromEntries(detailedPackages.map((documentPackage) => [documentPackage.id, documentPackage.shareLinks]));
    const packages = detailedPackages.map(({ shareLinks: _shareLinks, ...documentPackage }) => documentPackage);
    return (
      <DocumentPackagesPageView
        capabilities={capabilities}
        packages={serializeForClient<WorkspaceDocumentPackageRecord[]>(packages)}
        jobSites={serializeForClient<WorkspaceJobSiteRecord[]>(jobSites)}
        shareLinksByPackage={serializeForClient<Record<string, WorkspaceShareLinkRecord[]>>(shareLinksByPackage)}
      />
    );
  } catch {
    return <WorkspaceAccessState title="Pacchetti non disponibili" description="Verifica accesso e azienda configurata." />;
  }
}
