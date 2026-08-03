import { listChecklistsWithItems } from "@shared/server/checklist-service";
import { getDocumentPackage } from "@shared/server/document-package-service";
import { listDocuments } from "@shared/server/document-service";
import { listDocumentVersionsByDocumentIds } from "@shared/server/document-version-service";
import { listEvidence } from "@shared/server/evidence-service";
import { listJobSites } from "@shared/server/job-site-service";
import { listShareLinks } from "@shared/server/share-link-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { DocumentPackageDetailView } from "@/views/admin-core/document-packages/DocumentPackageDetailView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import type {
  WorkspaceChecklistRecord,
  WorkspaceDocumentPackageRecord,
  WorkspaceDocumentRecord,
  WorkspaceDocumentVersionRecord,
  WorkspaceEvidenceRecord,
  WorkspaceJobSiteRecord,
  WorkspaceShareLinkRecord,
} from "@/views/workspace/workspace-records";

interface DocumentPackageDetailPageProps {
  params: Promise<{ packageId: string }>;
  searchParams: Promise<{ from?: string }>;
}

export default async function DocumentPackageDetailPage({ params, searchParams }: DocumentPackageDetailPageProps) {
  try {
    const [{ packageId }, { from }] = await Promise.all([params, searchParams]);
    const [documentPackage, jobSites, documents, evidence, checklists, capabilities] = await Promise.all([
      getDocumentPackage(packageId),
      listJobSites(),
      listDocuments(),
      listEvidence(),
      listChecklistsWithItems(),
      getWorkspaceCapabilities(),
    ]);
    const [documentVersions, shareLinks] = await Promise.all([
      listDocumentVersionsByDocumentIds(documents.map((document) => document.id)),
      capabilities.canSharePackages ? listShareLinks(packageId) : Promise.resolve([]),
    ]);
    return (
      <DocumentPackageDetailView
        capabilities={capabilities}
        documentPackage={serializeForClient<WorkspaceDocumentPackageRecord>(documentPackage)}
        documents={serializeForClient<WorkspaceDocumentRecord[]>(documents)}
        documentVersions={serializeForClient<WorkspaceDocumentVersionRecord[]>(documentVersions)}
        evidence={serializeForClient<WorkspaceEvidenceRecord[]>(evidence)}
        checklists={serializeForClient<WorkspaceChecklistRecord[]>(checklists)}
        jobSites={serializeForClient<WorkspaceJobSiteRecord[]>(jobSites)}
        shareLinks={serializeForClient<WorkspaceShareLinkRecord[]>(shareLinks)}
        returnToDashboard={from === "dashboard"}
      />
    );
  } catch {
    return <WorkspaceAccessState title="Pacchetto non disponibile" description="Verifica accesso, azienda configurata o stato archiviazione." />;
  }
}
