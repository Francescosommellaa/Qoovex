import { getDataInventory } from "@shared/server/data-inventory-service";
import { getDataRetentionOverview } from "@shared/server/data-retention-service";
import { DataControlPageView } from "@/views/admin-core/data-control/DataControlPageView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";

export default async function DataControlPage() {
  try {
    const [inventory, retention] = await Promise.all([getDataInventory(), getDataRetentionOverview()]);
    return <DataControlPageView inventory={inventory} retention={retention} />;
  } catch {
    return <WorkspaceAccessState title="Controllo dati non disponibile" description="Solo il proprietario dell'azienda puo consultare inventario, export e retention." />;
  }
}
