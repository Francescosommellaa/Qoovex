import { listDeadlines } from "@shared/server/deadline-service";
import { listDocuments } from "@shared/server/document-service";
import { getWorker } from "@shared/server/worker-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { WorkerDetailView } from "@/views/admin-core/workers/WorkerDetailView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import type { WorkspaceDeadlineRecord, WorkspaceDocumentRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";

interface WorkerDetailPageProps {
  params: Promise<{ workerId: string }>;
}

export default async function WorkerDetailPage({ params }: WorkerDetailPageProps) {
  try {
    const { workerId } = await params;
    const [worker, documents, deadlines, capabilities] = await Promise.all([
      getWorker(workerId),
      listDocuments({ ownerType: "WORKER", workerId }),
      listDeadlines({ workerId }),
      getWorkspaceCapabilities(),
    ]);
    return (
      <WorkerDetailView
        capabilities={capabilities}
        worker={serializeForClient<WorkspaceWorkerRecord>(worker)}
        documents={serializeForClient<WorkspaceDocumentRecord[]>(documents)}
        deadlines={serializeForClient<WorkspaceDeadlineRecord[]>(deadlines)}
      />
    );
  } catch {
    return <WorkspaceAccessState title="Lavoratore non disponibile" description="Il lavoratore non esiste, e archiviato o non e accessibile." />;
  }
}
