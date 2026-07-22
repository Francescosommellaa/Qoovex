import { listJobSites } from "@shared/server/job-site-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { JobSitesPageView } from "@/views/admin-core/job-sites/JobSitesPageView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import type { WorkspaceJobSiteRecord } from "@/views/workspace/workspace-records";

interface JobSitesPageProps {
  searchParams: Promise<{ intent?: string }>;
}

export default async function JobSitesPage({ searchParams }: JobSitesPageProps) {
  try {
    const [jobSites, capabilities, params] = await Promise.all([listJobSites(), getWorkspaceCapabilities(), searchParams]);
    return <JobSitesPageView capabilities={capabilities} initialCreateOpen={params.intent === "create" && capabilities.canCreateJobSites} jobSites={serializeForClient<WorkspaceJobSiteRecord[]>(jobSites)} />;
  } catch {
    return <WorkspaceAccessState title="Cantieri non disponibili" description="Verifica accesso e azienda configurata." />;
  }
}
