import { listDocuments } from "@shared/server/document-service";
import { listJobSites } from "@shared/server/job-site-service";
import { listWorkers } from "@shared/server/worker-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { DocumentsPageView } from "@/views/admin-core/documents/DocumentsPageView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import type { WorkspaceDocumentRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";

interface DocumentsArchivePageProps {
  searchParams: Promise<{ origin?: string; notice?: string; ownerType?: string }>;
}

export default async function DocumentsArchivePage({ searchParams }: DocumentsArchivePageProps) {
  const { origin, notice, ownerType: ownerTypeParam } = await searchParams;
  const ownerType = ownerTypeParam === "ORGANIZATION" || ownerTypeParam === "WORKER" || ownerTypeParam === "JOB_SITE" ? ownerTypeParam : undefined;
  try {
    const [documents, workers, jobSites, capabilities] = await Promise.all([
      listDocuments({ status: "ARCHIVED", ownerType }),
      listWorkers(),
      listJobSites(),
      getWorkspaceCapabilities(),
    ]);
    return (
      <DocumentsPageView
        archiveMode
        archiveOwnerType={ownerType}
        capabilities={capabilities}
        documents={serializeForClient<WorkspaceDocumentRecord[]>(documents)}
        jobSites={serializeForClient<WorkspaceJobSiteRecord[]>(jobSites)}
        notice={notice}
        originDashboard={origin === "dashboard"}
        workers={serializeForClient<WorkspaceWorkerRecord[]>(workers)}
      />
    );
  } catch {
    return <WorkspaceAccessState title="Archivio non disponibile" description="L’archivio documenti è disponibile soltanto ai Collaboratori autorizzati dall’Owner." />;
  }
}
