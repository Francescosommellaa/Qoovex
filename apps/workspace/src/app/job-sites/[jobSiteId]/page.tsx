import { listDeadlines } from "@shared/server/deadline-service";
import { listDocuments } from "@shared/server/document-service";
import { getJobSite } from "@shared/server/job-site-service";
import { listEvidence } from "@shared/server/evidence-service";
import { listChecklistsWithItems } from "@shared/server/checklist-service";
import { listDocumentPackagesWithDetails } from "@shared/server/document-package-service";
import { listJobSiteUserAssignments, listJobSiteWorkerAssignments } from "@shared/server/resource-assignment-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { JobSiteDetailView } from "@/views/admin-core/job-sites/JobSiteDetailView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import type { JobSiteUserAssignmentResponse, JobSiteWorkerAssignmentResponse } from "@qoovex/types";
import type { WorkspaceChecklistRecord, WorkspaceDeadlineRecord, WorkspaceDocumentPackageRecord, WorkspaceDocumentRecord, WorkspaceEvidenceRecord, WorkspaceJobSiteRecord } from "@/views/workspace/workspace-records";

interface JobSiteDetailPageProps {
  params: Promise<{ jobSiteId: string }>;
}

export default async function JobSiteDetailPage({ params }: JobSiteDetailPageProps) {
  try {
    const { jobSiteId } = await params;
    const capabilities = await getWorkspaceCapabilities();
    const [jobSite, documents, deadlines, evidence] = await Promise.all([
      getJobSite(jobSiteId),
      listDocuments({ ownerType: "JOB_SITE", jobSiteId }),
      listDeadlines({ jobSiteId }),
      listEvidence({ jobSiteId }),
    ]);
    const checklists = capabilities.canCompleteChecklists || capabilities.canManageChecklists ? await listChecklistsWithItems({ jobSiteId }) : [];
    const detailedPackages = capabilities.canManagePackages ? await listDocumentPackagesWithDetails({ jobSiteId }) : [];
    const packages = detailedPackages.map(({ shareLinks: _shareLinks, ...documentPackage }) => documentPackage);
    const [userAssignments, workerAssignments] = capabilities.canReadAssignments ? await Promise.all([listJobSiteUserAssignments({ jobSiteId }), listJobSiteWorkerAssignments({ jobSiteId })]) : [[], []];
    return (
      <JobSiteDetailView
        capabilities={capabilities}
        jobSite={serializeForClient<WorkspaceJobSiteRecord>(jobSite)}
        documents={serializeForClient<WorkspaceDocumentRecord[]>(documents)}
        deadlines={serializeForClient<WorkspaceDeadlineRecord[]>(deadlines)}
        evidence={serializeForClient<WorkspaceEvidenceRecord[]>(evidence)}
        checklists={serializeForClient<WorkspaceChecklistRecord[]>(checklists)}
        packages={serializeForClient<WorkspaceDocumentPackageRecord[]>(packages)}
        userAssignments={serializeForClient<JobSiteUserAssignmentResponse[]>(userAssignments)}
        workerAssignments={serializeForClient<JobSiteWorkerAssignmentResponse[]>(workerAssignments)}
      />
    );
  } catch {
    return <WorkspaceAccessState title="Cantiere non disponibile" description="Il cantiere non esiste, e archiviato o non e accessibile." />;
  }
}
