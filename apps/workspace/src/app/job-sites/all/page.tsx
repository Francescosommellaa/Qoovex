import { listOperationalJobSites } from "@shared/server/job-site-read-model-service";
import { getWorkspaceCapabilities } from "@/views/admin-core/admin-core-server";
import { JobSitesPageView } from "@/views/admin-core/job-sites/JobSitesPageView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";

export default async function AllJobSitesPage({ searchParams }: { searchParams: Promise<{ search?: string; phase?: string; attention?: string; page?: string }> }) {
  try {
    const filters = await searchParams;
    const [response, capabilities] = await Promise.all([listOperationalJobSites(filters), getWorkspaceCapabilities()]);
    return <JobSitesPageView capabilities={capabilities} filters={filters} response={response} />;
  } catch {
    return <WorkspaceAccessState title="Cantieri non disponibili" description="Verifica i filtri, l'accesso e l'azienda configurata." />;
  }
}
