import { documentStatuses, type DocumentStatus, type MissingDocumentRequirementItem } from "@qoovex/types";
import { listDocuments } from "@shared/server/document-service";
import { listDocumentTypes } from "@shared/server/document-type-service";
import { getMissingDocumentRequirements } from "@shared/server/document-requirement-service";
import { listJobSites } from "@shared/server/job-site-service";
import { listWorkers } from "@shared/server/worker-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { DocumentAreaPageView } from "@/views/admin-core/documents/DocumentAreaPageView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import type { WorkspaceDocumentRecord, WorkspaceDocumentTypeRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";
import { ATTENTION_DOCUMENT_STATUSES, parseDocumentQueueView, parseWorkspaceListPage, WORKSPACE_LIST_PAGE_SIZE } from "@shared/lib/workspace-list-filters";

export default async function WorkerDocumentsPage({ searchParams }: { searchParams: Promise<{ status?: string; view?: string; page?: string }> }) {
  try {
    const params = await searchParams;
    const requested = params.status;
    const status = documentStatuses.includes(requested as DocumentStatus) && requested !== "ARCHIVED" ? requested as DocumentStatus : undefined;
    const view = parseDocumentQueueView(params.view);
    const page = parseWorkspaceListPage(params.page);
    const capabilities = await getWorkspaceCapabilities();
    const canReadTypeCatalog = capabilities.canReadDocumentSettings;
    const [workers, jobSites] = await Promise.all([listWorkers(), listJobSites()]);
    const visibleTargets = { workers: workers.filter((item) => item.status === "ACTIVE").map((item) => ({ id: item.id, displayName: item.displayName })), jobSites: jobSites.filter((item) => item.status === "ACTIVE").map((item) => ({ id: item.id, name: item.name })) };
    const [documents, documentTypes, missingResponse] = await Promise.all([listDocuments({ ownerType: "WORKER", ...(view ? { statuses: ATTENTION_DOCUMENT_STATUSES } : { status }), take: WORKSPACE_LIST_PAGE_SIZE + 1, skip: (page - 1) * WORKSPACE_LIST_PAGE_SIZE }), canReadTypeCatalog ? listDocumentTypes() : Promise.resolve([]), getMissingDocumentRequirements(visibleTargets)]);
    return <DocumentAreaPageView activeStatus={view ? undefined : status} activeView={view} capabilities={capabilities} documents={serializeForClient<WorkspaceDocumentRecord[]>(documents.slice(0, WORKSPACE_LIST_PAGE_SIZE))} documentTypes={serializeForClient<WorkspaceDocumentTypeRecord[]>(documentTypes)} hasNextPage={documents.length > WORKSPACE_LIST_PAGE_SIZE} jobSites={serializeForClient<WorkspaceJobSiteRecord[]>(jobSites)} missing={serializeForClient<MissingDocumentRequirementItem[]>(missingResponse.items.filter((item) => item.ownerType === "WORKER"))} ownerType="WORKER" page={page} workers={serializeForClient<WorkspaceWorkerRecord[]>(workers)} />;
  } catch { return <WorkspaceAccessState title="Documenti lavoratori non disponibili" description="Verifica accesso e scope assegnato." />; }
}
