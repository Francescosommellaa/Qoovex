import { listDeadlines } from "@shared/server/deadline-service";
import { listDocuments } from "@shared/server/document-service";
import { listJobSites } from "@shared/server/job-site-service";
import { listWorkers } from "@shared/server/worker-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { DeadlinesPageView } from "@/views/admin-core/deadlines/DeadlinesPageView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import type { WorkspaceDeadlineRecord, WorkspaceDocumentRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";

export default async function DeadlinesPage() {
  try {
    const [deadlines, documents, workers, jobSites, capabilities] = await Promise.all([
      listDeadlines(),
      listDocuments(),
      listWorkers(),
      listJobSites(),
      getWorkspaceCapabilities(),
    ]);
    return (
      <DeadlinesPageView
        capabilities={capabilities}
        deadlines={serializeForClient<WorkspaceDeadlineRecord[]>(deadlines)}
        documents={serializeForClient<WorkspaceDocumentRecord[]>(documents)}
        workers={serializeForClient<WorkspaceWorkerRecord[]>(workers)}
        jobSites={serializeForClient<WorkspaceJobSiteRecord[]>(jobSites)}
      />
    );
  } catch {
    return <WorkspaceAccessState title="Scadenze non disponibili" description="Verifica accesso e azienda attiva." />;
  }
}
