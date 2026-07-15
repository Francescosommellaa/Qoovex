import { listDocuments } from "@shared/server/document-service";
import { listJobSites } from "@shared/server/job-site-service";
import { listWorkers } from "@shared/server/worker-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { DocumentsPageView } from "@/views/admin-core/documents/DocumentsPageView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import type { WorkspaceDocumentRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";

interface DocumentsPageProps {
  searchParams: Promise<{ status?: string; from?: string; origin?: string; intent?: string }>;
}

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  try {
    const { status, from, origin, intent } = await searchParams;
    const [documents, workers, jobSites, capabilities] = await Promise.all([
      listDocuments({ status }),
      listWorkers(),
      listJobSites(),
      getWorkspaceCapabilities(),
    ]);
    return (
      <DocumentsPageView
        activeStatus={status}
        capabilities={capabilities}
        documents={serializeForClient<WorkspaceDocumentRecord[]>(documents)}
        workers={serializeForClient<WorkspaceWorkerRecord[]>(workers)}
        jobSites={serializeForClient<WorkspaceJobSiteRecord[]>(jobSites)}
        returnToDashboard={from === "dashboard"}
        originDashboard={origin === "dashboard"}
        intentUpload={intent === "upload"}
      />
    );
  } catch {
    return <WorkspaceAccessState title="Documenti non disponibili" description="Verifica accesso e azienda configurata." />;
  }
}
