import { listDocuments } from "@shared/server/document-service";
import { getDocumentOverview } from "@shared/server/document-overview-service";
import { listJobSites } from "@shared/server/job-site-service";
import { listWorkers } from "@shared/server/worker-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { DocumentsPageView } from "@/views/admin-core/documents/DocumentsPageView";
import { DocumentOverviewView } from "@/views/admin-core/documents/DocumentOverviewView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import type { WorkspaceDocumentOverviewRecord, WorkspaceDocumentRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";
import { redirect } from "next/navigation";
import { parseDocumentQueueView } from "@shared/lib/workspace-list-filters";

interface DocumentsPageProps {
  searchParams: Promise<{ status?: string; view?: string; from?: string; origin?: string; intent?: string; notice?: string }>;
}

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  const { status, view: requestedView, from, origin, intent, notice } = await searchParams;
  const view = parseDocumentQueueView(requestedView);
  if (status === "ARCHIVED" && intent !== "upload") {
    const params = new URLSearchParams();
    if (origin === "dashboard" || from === "dashboard") params.set("origin", "dashboard");
    if (notice) params.set("notice", notice);
    redirect(`/documents/archive${params.size ? `?${params.toString()}` : ""}`);
  }

  try {
    const effectiveStatus = intent === "upload" && status === "ARCHIVED" ? undefined : status;
    const showLegacyFilteredList = Boolean(effectiveStatus || intent === "upload" || notice || from === "dashboard" || origin === "dashboard");
    if (!showLegacyFilteredList) {
      const [workers, jobSites, capabilities] = await Promise.all([listWorkers(), listJobSites(), getWorkspaceCapabilities()]);
      const documentData = await getDocumentOverview({
        workers: workers.filter((item) => item.status === "ACTIVE").map((item) => ({ id: item.id, displayName: item.displayName })),
        jobSites: jobSites.filter((item) => item.status === "ACTIVE").map((item) => ({ id: item.id, name: item.name })),
      });
      return <DocumentOverviewView activeView={view} capabilities={capabilities} jobSites={serializeForClient<WorkspaceJobSiteRecord[]>(jobSites)} overview={serializeForClient<WorkspaceDocumentOverviewRecord>(documentData)} workers={serializeForClient<WorkspaceWorkerRecord[]>(workers)} />;
    }
    const [documentData, workers, jobSites, capabilities] = await Promise.all([listDocuments({ status: effectiveStatus }), listWorkers(), listJobSites(), getWorkspaceCapabilities()]);
    return (
      <DocumentsPageView
        activeStatus={effectiveStatus}
        capabilities={capabilities}
        documents={serializeForClient<WorkspaceDocumentRecord[]>(documentData)}
        workers={serializeForClient<WorkspaceWorkerRecord[]>(workers)}
        jobSites={serializeForClient<WorkspaceJobSiteRecord[]>(jobSites)}
        returnToDashboard={from === "dashboard"}
        originDashboard={origin === "dashboard"}
        intentUpload={intent === "upload"}
        notice={notice}
      />
    );
  } catch {
    return <WorkspaceAccessState title="Documenti non disponibili" description="Verifica accesso e azienda configurata." />;
  }
}
