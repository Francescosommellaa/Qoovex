import { getDocument } from "@shared/server/document-service";
import { listDocumentTypes } from "@shared/server/document-type-service";
import { listDocumentVersions } from "@shared/server/document-version-service";
import { listDeadlines } from "@shared/server/deadline-service";
import { listJobSites } from "@shared/server/job-site-service";
import { listWorkers } from "@shared/server/worker-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { DocumentDetailView } from "@/views/admin-core/documents/DocumentDetailView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspacePrimitives";
import type { WorkspaceDeadlineRecord, WorkspaceDocumentRecord, WorkspaceDocumentTypeRecord, WorkspaceDocumentVersionRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";

interface DocumentDetailPageProps {
  params: Promise<{ documentId: string }>;
}

export default async function DocumentDetailPage({ params }: DocumentDetailPageProps) {
  try {
    const { documentId } = await params;
    const [document, versions, deadlines, documentTypes, workers, jobSites, capabilities] = await Promise.all([
      getDocument(documentId),
      listDocumentVersions(documentId),
      listDeadlines({ documentId }),
      listDocumentTypes(),
      listWorkers(),
      listJobSites(),
      getWorkspaceCapabilities(),
    ]);
    return (
      <DocumentDetailView
        capabilities={capabilities}
        document={serializeForClient<WorkspaceDocumentRecord>(document)}
        versions={serializeForClient<WorkspaceDocumentVersionRecord[]>(versions)}
        deadlines={serializeForClient<WorkspaceDeadlineRecord[]>(deadlines)}
        documentTypes={serializeForClient<WorkspaceDocumentTypeRecord[]>(documentTypes)}
        workers={serializeForClient<WorkspaceWorkerRecord[]>(workers)}
        jobSites={serializeForClient<WorkspaceJobSiteRecord[]>(jobSites)}
      />
    );
  } catch {
    return <WorkspaceAccessState title="Documento non disponibile" description="Il documento non esiste, e archiviato o non e accessibile." />;
  }
}
