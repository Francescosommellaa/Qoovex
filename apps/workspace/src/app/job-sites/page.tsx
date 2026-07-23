import { getJobSiteOverview } from "@shared/server/job-site-read-model-service";
import { getWorkspaceCapabilities } from "@/views/admin-core/admin-core-server";
import { JobSitesOverviewView } from "@/views/admin-core/job-sites/JobSitesOverviewView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";

interface JobSitesPageProps {
  searchParams: Promise<{ intent?: string }>;
}

export default async function JobSitesPage({ searchParams }: JobSitesPageProps) {
  try {
    const [overview, capabilities, params] = await Promise.all([getJobSiteOverview(), getWorkspaceCapabilities(), searchParams]);
    return <JobSitesOverviewView capabilities={capabilities} initialCreateOpen={params.intent === "create" && capabilities.canCreateJobSites} overview={overview} />;
  } catch {
    return <WorkspaceAccessState title="Cantieri non disponibili" description="Verifica accesso e azienda configurata." />;
  }
}
