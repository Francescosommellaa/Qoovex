import { listDeadlines } from "@shared/server/deadline-service";
import { listDocuments } from "@shared/server/document-service";
import { getJobSite } from "@shared/server/job-site-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { JobSiteDetailView } from "@/views/admin-core/job-sites/JobSiteDetailView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspacePrimitives";
import type { WorkspaceDeadlineRecord, WorkspaceDocumentRecord, WorkspaceJobSiteRecord } from "@/views/workspace/workspace-records";

interface JobSiteDetailPageProps {
  params: Promise<{ jobSiteId: string }>;
}

export default async function JobSiteDetailPage({ params }: JobSiteDetailPageProps) {
  try {
    const { jobSiteId } = await params;
    const [jobSite, documents, deadlines, capabilities] = await Promise.all([
      getJobSite(jobSiteId),
      listDocuments({ ownerType: "JOB_SITE", jobSiteId }),
      listDeadlines({ jobSiteId }),
      getWorkspaceCapabilities(),
    ]);
    return (
      <JobSiteDetailView
        capabilities={capabilities}
        jobSite={serializeForClient<WorkspaceJobSiteRecord>(jobSite)}
        documents={serializeForClient<WorkspaceDocumentRecord[]>(documents)}
        deadlines={serializeForClient<WorkspaceDeadlineRecord[]>(deadlines)}
      />
    );
  } catch {
    return <WorkspaceAccessState title="Cantiere non disponibile" description="Il cantiere non esiste, e archiviato o non e accessibile." />;
  }
}
