import { listPeopleWorkers } from "@shared/server/people-service";
import { listJobSites } from "@shared/server/job-site-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { WorkersPageView } from "@/views/admin-core/workers/WorkersPageView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";

interface WorkersPageProps {
  searchParams: Promise<{ intent?: string; q?: string; attention?: string; access?: string; page?: string }>;
}

export default async function WorkersPage({ searchParams }: WorkersPageProps) {
  try {
    const [capabilities, params] = await Promise.all([getWorkspaceCapabilities(), searchParams]);
    const [directory, jobSites] = await Promise.all([
      listPeopleWorkers(params),
      capabilities.canCreateWorkers ? listJobSites() : Promise.resolve([]),
    ]);
    return <WorkersPageView capabilities={capabilities} directory={serializeForClient(directory)} initialCreateOpen={params.intent === "create" && capabilities.canCreateWorkers} jobSites={serializeForClient(jobSites.map((site) => ({ id: site.id, name: site.name })))} />;
  } catch {
    return <WorkspaceAccessState title="Lavoratori non disponibili" description="Verifica accesso e azienda configurata." />;
  }
}
