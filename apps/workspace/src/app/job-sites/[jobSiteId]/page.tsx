import { jobSiteDetailSections } from "@qoovex/types";
import type { JobSiteDetailSection, JobSiteUserAssignmentResponse, JobSiteWorkerAssignmentResponse, MissingDocumentRequirementItem } from "@qoovex/types";
import { listChecklistsWithItems } from "@shared/server/checklist-service";
import { listDeadlines } from "@shared/server/deadline-service";
import { listDocumentPackagesWithDetails } from "@shared/server/document-package-service";
import { getMissingDocumentRequirements } from "@shared/server/document-requirement-service";
import { listDocuments } from "@shared/server/document-service";
import { listEvidence } from "@shared/server/evidence-service";
import { getJobSiteShell } from "@shared/server/job-site-read-model-service";
import { listJobSiteUserAssignments, listJobSiteWorkerAssignments } from "@shared/server/resource-assignment-service";
import { jobSiteRouteId } from "@shared/lib/job-site-routes";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { JobSiteDetailSegmentedView } from "@/views/admin-core/job-sites/JobSiteDetailSegmentedView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import type { WorkspaceChecklistRecord, WorkspaceDeadlineRecord, WorkspaceDocumentPackageRecord, WorkspaceDocumentRecord, WorkspaceEvidenceRecord } from "@/views/workspace/workspace-records";

export default async function JobSiteDetailPage({ params, searchParams }: { params: Promise<{ jobSiteId: string }>; searchParams: Promise<{ from?: string; section?: string }> }) {
  try {
    const [{ jobSiteId: routeParam }, query] = await Promise.all([params, searchParams]);
    const jobSiteId = jobSiteRouteId(routeParam);
    const section: JobSiteDetailSection = jobSiteDetailSections.includes(query.section as JobSiteDetailSection) ? query.section as JobSiteDetailSection : "overview";
    const [jobSite, rawCapabilities] = await Promise.all([getJobSiteShell(jobSiteId, true), getWorkspaceCapabilities()]);
    const capabilities = jobSite.archivedAt ? { ...rawCapabilities, canCreateDocuments: false, canCreateDeadlines: false, canManageCalendar: false, canManageChecklists: false, canCompleteChecklists: false, canUploadEvidence: false, canManagePackages: false, canSharePackages: false, canManageAssignments: false, canManageCore: false } : rawCapabilities;
    let documents: WorkspaceDocumentRecord[] = [];
    let missingDocuments: MissingDocumentRequirementItem[] = [];
    let deadlines: WorkspaceDeadlineRecord[] = [];
    let checklists: WorkspaceChecklistRecord[] = [];
    let evidence: WorkspaceEvidenceRecord[] = [];
    let packages: WorkspaceDocumentPackageRecord[] = [];
    let userAssignments: JobSiteUserAssignmentResponse[] = [];
    let workerAssignments: JobSiteWorkerAssignmentResponse[] = [];

    if (section === "documents") {
      const [documentRows, missing] = await Promise.all([listDocuments({ ownerType: "JOB_SITE", jobSiteId }), getMissingDocumentRequirements()]);
      documents = serializeForClient<WorkspaceDocumentRecord[]>(documentRows);
      missingDocuments = serializeForClient<MissingDocumentRequirementItem[]>(missing.items.filter((item) => item.jobSiteId === jobSiteId));
    } else if (section === "people" && capabilities.canReadAssignments) {
      [userAssignments, workerAssignments] = await Promise.all([listJobSiteUserAssignments({ jobSiteId }), listJobSiteWorkerAssignments({ jobSiteId })]);
    } else if (section === "activities") {
      const [deadlineRows, checklistRows] = await Promise.all([listDeadlines({ jobSiteId }), listChecklistsWithItems({ jobSiteId })]);
      deadlines = serializeForClient<WorkspaceDeadlineRecord[]>(deadlineRows);
      checklists = serializeForClient<WorkspaceChecklistRecord[]>(checklistRows);
    } else if (section === "evidence") {
      evidence = serializeForClient<WorkspaceEvidenceRecord[]>(await listEvidence({ jobSiteId }));
    } else if (section === "sharing" && rawCapabilities.canManagePackages) {
      const detailed = await listDocumentPackagesWithDetails({ jobSiteId });
      packages = serializeForClient<WorkspaceDocumentPackageRecord[]>(detailed.map(({ shareLinks: _shareLinks, ...item }) => item));
    }

    return <JobSiteDetailSegmentedView capabilities={capabilities} checklists={checklists} deadlines={deadlines} documents={documents} evidence={evidence} jobSite={jobSite} missingDocuments={missingDocuments} packages={packages} returnToDashboard={query.from === "dashboard"} section={section} userAssignments={serializeForClient(userAssignments)} workerAssignments={serializeForClient(workerAssignments)} />;
  } catch {
    return <WorkspaceAccessState title="Cantiere non disponibile" description="Il cantiere non esiste oppure non e accessibile per il ruolo corrente." />;
  }
}
