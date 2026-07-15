import { listDocumentTypes } from "@shared/server/document-type-service";
import { listJobSites } from "@shared/server/job-site-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { DocumentSettingsView } from "@/views/settings/DocumentSettingsView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import type { WorkspaceDocumentTypeRecord, WorkspaceJobSiteRecord } from "@/views/workspace/workspace-records";

export default async function DocumentSettingsPage() {
  try {
    const capabilities = await getWorkspaceCapabilities();
    if (!capabilities.canReadDocumentSettings) return <WorkspaceAccessState />;
    const [documentTypes, jobSites] = await Promise.all([listDocumentTypes(), listJobSites()]);
    return <DocumentSettingsView canManage={capabilities.canManageDocumentSettings} documentTypes={serializeForClient<WorkspaceDocumentTypeRecord[]>(documentTypes)} jobSites={serializeForClient<WorkspaceJobSiteRecord[]>(jobSites)} />;
  } catch { return <WorkspaceAccessState title="Impostazioni documenti non disponibili" description="Verifica accesso e azienda configurata." />; }
}
