import { getPeopleOverview } from "@shared/server/people-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { PeopleOverviewView } from "@/views/people/PeopleOverviewView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";

export default async function PeoplePage() {
  try {
    const [overview, capabilities] = await Promise.all([getPeopleOverview(), getWorkspaceCapabilities()]);
    return <PeopleOverviewView capabilities={capabilities} overview={serializeForClient(overview)} />;
  } catch {
    return <WorkspaceAccessState title="Persone non disponibili" description="Verifica accesso e azienda configurata." />;
  }
}
