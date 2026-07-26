import { listDocumentTypes } from "@shared/server/document-type-service";
import { listDocuments } from "@shared/server/document-service";
import { listJobSites } from "@shared/server/job-site-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { DocumentSettingsView } from "@/views/settings/DocumentSettingsView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import type { WorkspaceDocumentRecord, WorkspaceDocumentTypeRecord, WorkspaceJobSiteRecord } from "@/views/workspace/workspace-records";

export default async function DocumentSettingsPage() {
  try {
    const capabilities = await getWorkspaceCapabilities();
    if (!capabilities.canReadDocumentSettings) return <WorkspaceAccessState />;
    const [documentTypes, documents, jobSites] = await Promise.all([listDocumentTypes(), listDocuments(), listJobSites()]);
    return <DocumentSettingsView canManage={capabilities.canManageDocumentSettings} documents={serializeForClient<WorkspaceDocumentRecord[]>(documents)} documentTypes={serializeForClient<WorkspaceDocumentTypeRecord[]>(documentTypes)} jobSites={serializeForClient<WorkspaceJobSiteRecord[]>(jobSites)} />;
  } catch { return <WorkspaceAccessState title="Impostazioni documenti non disponibili" description="Verifica accesso e azienda configurata." />; }
}
