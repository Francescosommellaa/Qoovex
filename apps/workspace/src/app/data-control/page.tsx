import { getDataInventory } from "@shared/server/data-inventory-service";
import { getDataRetentionOverview } from "@shared/server/data-retention-service";
import { getBlobOrphanDryRun, listDataControlJobs } from "@shared/server/data-control-job-service";
import { requireDataControlAccess } from "@shared/server/data-control-access";
import { DataControlPageView } from "@/views/administration/data-control/DataControlPageView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";

export default async function DataControlPage() {
  try {
    await requireDataControlAccess();
    const [inventory, retention, jobs, orphans] = await Promise.all([getDataInventory(), getDataRetentionOverview(), listDataControlJobs(), getBlobOrphanDryRun()]);
    return <DataControlPageView inventory={inventory} jobs={jobs} orphans={orphans} retention={retention} />;
  } catch {
    return <WorkspaceAccessState title="Controllo dati non disponibile" description="Solo il proprietario dell'azienda puo consultare inventario, export e retention." />;
  }
}
