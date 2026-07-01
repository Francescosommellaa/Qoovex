import { listDocuments } from "@shared/server/document-service";
import { listDocumentTypes } from "@shared/server/document-type-service";
import { listJobSites } from "@shared/server/job-site-service";
import { listWorkers } from "@shared/server/worker-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { DocumentsPageView } from "@/views/admin-core/documents/DocumentsPageView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspacePrimitives";
import type { WorkspaceDocumentRecord, WorkspaceDocumentTypeRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";

interface DocumentsPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  try {
    const { status } = await searchParams;
    const [documents, documentTypes, workers, jobSites, capabilities] = await Promise.all([
      listDocuments({ status }),
      listDocumentTypes(),
      listWorkers(),
      listJobSites(),
      getWorkspaceCapabilities(),
    ]);
    return (
      <DocumentsPageView
        activeStatus={status}
        capabilities={capabilities}
        documents={serializeForClient<WorkspaceDocumentRecord[]>(documents)}
        documentTypes={serializeForClient<WorkspaceDocumentTypeRecord[]>(documentTypes)}
        workers={serializeForClient<WorkspaceWorkerRecord[]>(workers)}
        jobSites={serializeForClient<WorkspaceJobSiteRecord[]>(jobSites)}
      />
    );
  } catch {
    return <WorkspaceAccessState title="Documenti non disponibili" description="Verifica accesso e azienda attiva." />;
  }
}
