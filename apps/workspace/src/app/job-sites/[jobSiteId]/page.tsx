import { listDeadlines } from "@shared/server/deadline-service";
import { listDocuments } from "@shared/server/document-service";
import { getJobSite } from "@shared/server/job-site-service";
import { listEvidence } from "@shared/server/evidence-service";
import { getChecklist, listChecklists } from "@shared/server/checklist-service";
import { getDocumentPackage, listDocumentPackages } from "@shared/server/document-package-service";
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
    const checklists = capabilities.canCompleteChecklists || capabilities.canManageChecklists ? await Promise.all((await listChecklists({ jobSiteId })).map((item) => getChecklist(item.id))) : [];
    const packages = capabilities.canManagePackages ? await Promise.all((await listDocumentPackages({ jobSiteId })).map((item) => getDocumentPackage(item.id))) : [];
    const [userAssignments, workerAssignments] = capabilities.canReadAssignments ? await Promise.all([listJobSiteUserAssignments(), listJobSiteWorkerAssignments()]) : [[], []];
    return (
      <JobSiteDetailView
        capabilities={capabilities}
        jobSite={serializeForClient<WorkspaceJobSiteRecord>(jobSite)}
        documents={serializeForClient<WorkspaceDocumentRecord[]>(documents)}
        deadlines={serializeForClient<WorkspaceDeadlineRecord[]>(deadlines)}
        evidence={serializeForClient<WorkspaceEvidenceRecord[]>(evidence)}
        checklists={serializeForClient<WorkspaceChecklistRecord[]>(checklists)}
        packages={serializeForClient<WorkspaceDocumentPackageRecord[]>(packages)}
        userAssignments={serializeForClient<JobSiteUserAssignmentResponse[]>(userAssignments.filter((item) => item.jobSiteId === jobSiteId))}
        workerAssignments={serializeForClient<JobSiteWorkerAssignmentResponse[]>(workerAssignments.filter((item) => item.jobSiteId === jobSiteId))}
      />
    );
  } catch {
    return <WorkspaceAccessState title="Cantiere non disponibile" description="Il cantiere non esiste, e archiviato o non e accessibile." />;
  }
}
