import { getDocumentPackage, listDocumentPackages } from "@shared/server/document-package-service";
import { listJobSites } from "@shared/server/job-site-service";
import { listShareLinks } from "@shared/server/share-link-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { DocumentPackagesPageView } from "@/views/admin-core/document-packages/DocumentPackagesPageView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import type { WorkspaceDocumentPackageRecord, WorkspaceJobSiteRecord, WorkspaceShareLinkRecord } from "@/views/workspace/workspace-records";

export default async function DocumentPackagesPage() {
  try {
    const [packages, jobSites, capabilities] = await Promise.all([
      listDocumentPackages(),
      listJobSites(),
      getWorkspaceCapabilities(),
    ]);
    const detailedPackages = await Promise.all(packages.map((documentPackage) => getDocumentPackage(documentPackage.id)));
    const shareLinksByPackageEntries = capabilities.canSharePackages
      ? await Promise.all(detailedPackages.map(async (documentPackage) => [documentPackage.id, await listShareLinks(documentPackage.id)] as const))
      : [];
    const shareLinksByPackage = Object.fromEntries(shareLinksByPackageEntries);
    return (
      <DocumentPackagesPageView
        capabilities={capabilities}
        packages={serializeForClient<WorkspaceDocumentPackageRecord[]>(detailedPackages)}
        jobSites={serializeForClient<WorkspaceJobSiteRecord[]>(jobSites)}
        shareLinksByPackage={serializeForClient<Record<string, WorkspaceShareLinkRecord[]>>(shareLinksByPackage)}
      />
    );
  } catch {
    return <WorkspaceAccessState title="Pacchetti non disponibili" description="Verifica accesso e azienda configurata." />;
  }
}
