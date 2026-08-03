import { getDocumentWithVersions } from "@shared/server/document-service";
import { listDocumentTypes } from "@shared/server/document-type-service";
import { listDeadlines } from "@shared/server/deadline-service";
import { listJobSites } from "@shared/server/job-site-service";
import { listWorkers } from "@shared/server/worker-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { DocumentDetailView } from "@/views/admin-core/documents/DocumentDetailView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import type { WorkspaceDeadlineRecord, WorkspaceDocumentRecord, WorkspaceDocumentTypeRecord, WorkspaceDocumentVersionRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";
import { documentRouteId } from "@shared/lib/document-routes";

interface DocumentDetailPageProps {
  params: Promise<{ documentId: string }>;
  searchParams: Promise<{ from?: string }>;
}

export default async function DocumentDetailPage({ params, searchParams }: DocumentDetailPageProps) {
  try {
    const [{ documentId: documentRouteParam }, { from }] = await Promise.all([params, searchParams]);
    const documentId = documentRouteId(documentRouteParam);
    const capabilities = await getWorkspaceCapabilities();
    const [documentReadModel, deadlines, workers, jobSites] = await Promise.all([
      getDocumentWithVersions(documentId),
      listDeadlines({ documentId }),
      listWorkers(),
      listJobSites(),
    ]);
    const { document, versions } = documentReadModel;
    const documentTypes = capabilities.canReadDocumentSettings ? await listDocumentTypes() : [];
    return (
      <DocumentDetailView
        capabilities={capabilities}
        document={serializeForClient<WorkspaceDocumentRecord>(document)}
        versions={serializeForClient<WorkspaceDocumentVersionRecord[]>(versions)}
        deadlines={serializeForClient<WorkspaceDeadlineRecord[]>(deadlines)}
        documentTypes={serializeForClient<WorkspaceDocumentTypeRecord[]>(documentTypes)}
        workers={serializeForClient<WorkspaceWorkerRecord[]>(workers)}
        jobSites={serializeForClient<WorkspaceJobSiteRecord[]>(jobSites)}
        returnToDashboard={from === "dashboard"}
      />
    );
  } catch {
    return <WorkspaceAccessState title="Documento non disponibile" description="Il documento non esiste, e archiviato o non e accessibile." />;
  }
}
