import { listDeadlines } from "@shared/server/deadline-service";
import { listDocuments } from "@shared/server/document-service";
import { getMissingDocumentRequirements } from "@shared/server/document-requirement-service";
import { getWorker } from "@shared/server/worker-service";
import { listEvidence } from "@shared/server/evidence-service";
import { listJobSites } from "@shared/server/job-site-service";
import { getWorkerUserLinkOptions, listJobSiteWorkerAssignments, listWorkerUserLinks } from "@shared/server/resource-assignment-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { WorkerDetailView } from "@/views/admin-core/workers/WorkerDetailView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import type { MissingDocumentRequirementItem, WorkerUserLinkResponse } from "@qoovex/types";
import type { WorkspaceDeadlineRecord, WorkspaceDocumentRecord, WorkspaceEvidenceRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";
import { workerRouteId } from "@shared/lib/worker-routes";
import { getWorkerAccessSummary } from "@shared/server/people-service";

interface WorkerDetailPageProps {
  params: Promise<{ workerId: string }>;
  searchParams: Promise<{ from?: string }>;
}

export default async function WorkerDetailPage({ params, searchParams }: WorkerDetailPageProps) {
  try {
    const [{ workerId: workerRouteParam }, { from }] = await Promise.all([params, searchParams]);
    const workerId = workerRouteId(workerRouteParam);
    const capabilities = await getWorkspaceCapabilities();
    const [worker, documents, missingResponse, deadlines, evidence] = await Promise.all([
      getWorker(workerId),
      listDocuments({ ownerType: "WORKER", workerId }),
      getMissingDocumentRequirements(),
      listDeadlines({ workerId }),
      listEvidence({ workerId }),
    ]);
    let jobSites: Awaited<ReturnType<typeof listJobSites>> = [];
    let userLinks: Awaited<ReturnType<typeof listWorkerUserLinks>> = [];
    let userLinkOptions: Awaited<ReturnType<typeof getWorkerUserLinkOptions>> = [];
    let accessSummary: Awaited<ReturnType<typeof getWorkerAccessSummary>> | null = null;
    if (capabilities.canReadAssignments) {
      const [visibleJobSites, assignments, links] = await Promise.all([listJobSites(), listJobSiteWorkerAssignments({ workerId }), listWorkerUserLinks({ workerId })]);
      const assignedIds = new Set(assignments.map((item) => item.jobSiteId));
      jobSites = visibleJobSites.filter((item) => assignedIds.has(item.id));
      userLinks = links;
      accessSummary = await getWorkerAccessSummary(workerId);
      if (capabilities.canManageAssignments && !links.length) userLinkOptions = await getWorkerUserLinkOptions(workerId);
    } else if (capabilities.accessPreset === "LIMITED_UPLOAD") jobSites = await listJobSites();
    return (
      <WorkerDetailView
        capabilities={capabilities}
        worker={serializeForClient<WorkspaceWorkerRecord>(worker)}
        documents={serializeForClient<WorkspaceDocumentRecord[]>(documents)}
        missingDocuments={serializeForClient<MissingDocumentRequirementItem[]>(missingResponse.items.filter((item) => item.workerId === workerId))}
        deadlines={serializeForClient<WorkspaceDeadlineRecord[]>(deadlines)}
        evidence={serializeForClient<WorkspaceEvidenceRecord[]>(evidence)}
        jobSites={serializeForClient<WorkspaceJobSiteRecord[]>(jobSites)}
        userLinks={serializeForClient<WorkerUserLinkResponse[]>(userLinks)}
        userLinkOptions={serializeForClient(userLinkOptions)}
        accessSummary={serializeForClient(accessSummary)}
        returnToDashboard={from === "dashboard"}
      />
    );
  } catch {
    return <WorkspaceAccessState title="Lavoratore non disponibile" description="Il lavoratore non esiste, e archiviato o non e accessibile." />;
  }
}
