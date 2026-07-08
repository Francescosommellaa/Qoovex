import { listWorkers } from "@shared/server/worker-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { WorkersPageView } from "@/views/admin-core/workers/WorkersPageView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import type { WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";

export default async function WorkersPage() {
  try {
    const [workers, capabilities] = await Promise.all([listWorkers(), getWorkspaceCapabilities()]);
    return <WorkersPageView capabilities={capabilities} workers={serializeForClient<WorkspaceWorkerRecord[]>(workers)} />;
  } catch {
    return <WorkspaceAccessState title="Lavoratori non disponibili" description="Verifica accesso e azienda attiva." />;
  }
}
