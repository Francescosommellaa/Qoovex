import { listDeadlines } from "@shared/server/deadline-service";
import { listDocuments } from "@shared/server/document-service";
import { getWorker } from "@shared/server/worker-service";
import { listEvidence } from "@shared/server/evidence-service";
import { listJobSites } from "@shared/server/job-site-service";
import { listJobSiteWorkerAssignments, listWorkerUserLinks } from "@shared/server/resource-assignment-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { WorkerDetailView } from "@/views/admin-core/workers/WorkerDetailView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import type { WorkerUserLinkResponse } from "@qoovex/types";
import type { WorkspaceDeadlineRecord, WorkspaceDocumentRecord, WorkspaceEvidenceRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";
import { workerRouteId } from "@shared/lib/worker-routes";

interface WorkerDetailPageProps {
  params: Promise<{ workerId: string }>;
  searchParams: Promise<{ from?: string }>;
}

export default async function WorkerDetailPage({ params, searchParams }: WorkerDetailPageProps) {
  try {
    const [{ workerId: workerRouteParam }, { from }] = await Promise.all([params, searchParams]);
    const workerId = workerRouteId(workerRouteParam);
    const capabilities = await getWorkspaceCapabilities();
    const [worker, documents, deadlines, evidence] = await Promise.all([
      getWorker(workerId),
      listDocuments({ ownerType: "WORKER", workerId }),
      listDeadlines({ workerId }),
      listEvidence({ workerId }),
    ]);
    let jobSites: Awaited<ReturnType<typeof listJobSites>> = [];
    let userLinks: Awaited<ReturnType<typeof listWorkerUserLinks>> = [];
    if (capabilities.canReadAssignments) {
      const [visibleJobSites, assignments, links] = await Promise.all([listJobSites(), listJobSiteWorkerAssignments({ workerId }), listWorkerUserLinks({ workerId })]);
      const assignedIds = new Set(assignments.map((item) => item.jobSiteId));
      jobSites = visibleJobSites.filter((item) => assignedIds.has(item.id));
      userLinks = links;
    } else if (capabilities.role === "WORKER") jobSites = await listJobSites();
    return (
      <WorkerDetailView
        capabilities={capabilities}
        worker={serializeForClient<WorkspaceWorkerRecord>(worker)}
        documents={serializeForClient<WorkspaceDocumentRecord[]>(documents)}
        deadlines={serializeForClient<WorkspaceDeadlineRecord[]>(deadlines)}
        evidence={serializeForClient<WorkspaceEvidenceRecord[]>(evidence)}
        jobSites={serializeForClient<WorkspaceJobSiteRecord[]>(jobSites)}
        userLinks={serializeForClient<WorkerUserLinkResponse[]>(userLinks)}
        returnToDashboard={from === "dashboard"}
      />
    );
  } catch {
    return <WorkspaceAccessState title="Lavoratore non disponibile" description="Il lavoratore non esiste, e archiviato o non e accessibile." />;
  }
}
