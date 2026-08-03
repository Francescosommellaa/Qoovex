import { listDocuments } from "@shared/server/document-service";
import { listJobSites } from "@shared/server/job-site-service";
import { listWorkers } from "@shared/server/worker-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { DocumentsPageView } from "@/views/admin-core/documents/DocumentsPageView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import type { WorkspaceDocumentRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";
import { redirect } from "next/navigation";

interface DocumentsPageProps {
  searchParams: Promise<{ status?: string; from?: string; origin?: string; intent?: string; notice?: string }>;
}

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  const { status, from, origin, intent, notice } = await searchParams;
  if (status === "ARCHIVED" && intent !== "upload") {
    const params = new URLSearchParams();
    if (origin === "dashboard" || from === "dashboard") params.set("origin", "dashboard");
    if (notice) params.set("notice", notice);
    redirect(`/documents/archive${params.size ? `?${params.toString()}` : ""}`);
  }

  try {
    const effectiveStatus = intent === "upload" && status === "ARCHIVED" ? undefined : status;
    const [documents, workers, jobSites, capabilities] = await Promise.all([
      listDocuments({ status: effectiveStatus }),
      listWorkers(),
      listJobSites(),
      getWorkspaceCapabilities(),
    ]);
    return (
      <DocumentsPageView
        activeStatus={effectiveStatus}
        capabilities={capabilities}
        documents={serializeForClient<WorkspaceDocumentRecord[]>(documents)}
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
