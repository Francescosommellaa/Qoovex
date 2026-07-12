import { listJobSites } from "@shared/server/job-site-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { JobSitesPageView } from "@/views/admin-core/job-sites/JobSitesPageView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import type { WorkspaceJobSiteRecord } from "@/views/workspace/workspace-records";

export default async function JobSitesPage() {
  try {
    const [jobSites, capabilities] = await Promise.all([listJobSites(), getWorkspaceCapabilities()]);
    return <JobSitesPageView capabilities={capabilities} jobSites={serializeForClient<WorkspaceJobSiteRecord[]>(jobSites)} />;
  } catch {
    return <WorkspaceAccessState title="Cantieri non disponibili" description="Verifica accesso e azienda configurata." />;
  }
}
