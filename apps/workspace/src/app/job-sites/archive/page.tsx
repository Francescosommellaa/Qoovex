import { listOperationalJobSites } from "@shared/server/job-site-read-model-service";
import { getWorkspaceCapabilities } from "@/views/admin-core/admin-core-server";
import { JobSitesPageView } from "@/views/admin-core/job-sites/JobSitesPageView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";

export default async function ArchivedJobSitesPage({ searchParams }: { searchParams: Promise<{ search?: string; phase?: string; attention?: string; page?: string }> }) {
  try {
    const filters = await searchParams;
    const [response, capabilities] = await Promise.all([listOperationalJobSites({ ...filters, archived: true }), getWorkspaceCapabilities()]);
    if (!capabilities.canManageCore) return <WorkspaceAccessState />;
    return <JobSitesPageView archived capabilities={capabilities} filters={filters} response={response} />;
  } catch {
    return <WorkspaceAccessState title="Archivio non disponibile" description="Verifica accesso e azienda configurata." />;
  }
}
