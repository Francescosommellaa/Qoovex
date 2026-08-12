import type { BlobOrphanDryRunResponse, DataControlJobListResponse, DataInventoryResponse, DataRetentionOverviewResponse } from "@qoovex/types";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel } from "@/views/workspace/WorkspacePrimitives";
import { DataControlActionsPanel } from "./DataControlActionsPanel";
import { presentDataInventoryCategory } from "@shared/lib/product-metadata-presentation";

export function DataControlPageView({ inventory, jobs, orphans }: { inventory: DataInventoryResponse; jobs: DataControlJobListResponse; orphans: BlobOrphanDryRunResponse; retention: DataRetentionOverviewResponse }) {
  return <WorkspacePage><WorkspacePageHeader title="Controllo dati" description="Riepilogo e preparazione dei dati autorizzati." /><WorkspacePanel title="Inventario"><dl className="grid gap-2 sm:grid-cols-2">{Object.entries(inventory.counts).map(([key, value]) => <div className="rounded-md border p-3" key={key}><dt className="text-xs text-muted-foreground">{presentDataInventoryCategory(key)}</dt><dd className="font-medium">{value.total}</dd></div>)}</dl></WorkspacePanel><WorkspacePanel title="Conservazione"><p className="text-sm text-muted-foreground">Non viene eliminato alcun dato automaticamente. Le regole di conservazione richiedono una decisione separata.</p></WorkspacePanel><WorkspacePanel title="Operazioni"><DataControlActionsPanel initialJobs={jobs} initialOrphans={orphans} /></WorkspacePanel></WorkspacePage>;
}
