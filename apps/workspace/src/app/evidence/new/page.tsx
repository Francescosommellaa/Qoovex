import { listChecklistsWithItems } from "@shared/server/checklist-service";
import { listJobSites } from "@shared/server/job-site-service";
import { listWorkers } from "@shared/server/worker-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { AdminCreationPage } from "@/views/admin-core/AdminCreationPage";
import { EvidenceForm } from "@/views/admin-core/evidence/EvidenceForm";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import { parseWorkspaceFlowContext } from "@/views/workspace/workspace-flow-context";
import type { WorkspaceChecklistItemRecord, WorkspaceChecklistRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";

export default async function NewEvidencePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  try {
    const capabilities = await getWorkspaceCapabilities();
    if (!capabilities.canUploadEvidence) return <WorkspaceAccessState />;
    const values = await searchParams;
    const flow = parseWorkspaceFlowContext(values);
    const requireJobSite = values.intent === "quick-job-site";
    if (flow.invalidContext || flow.context?.type === "document") return <WorkspaceAccessState title="Contesto non valido" description="Avvia il caricamento da un solo cantiere, lavoratore o voce checklist." />;
    const [jobSites, workers] = await Promise.all([listJobSites(), listWorkers()]);
    const checklists = capabilities.canCompleteChecklists || capabilities.canManageChecklists ? await listChecklistsWithItems() : [];
    const checklistItems = checklists.flatMap((checklist) => checklist.items ?? []);
    return <AdminCreationPage title="Aggiungi prova" description="Scegli foto, file o nota e completa solo le informazioni mancanti." backHref="/evidence" backLabel="Annulla" panelTitle="Prova" panelDescription="La prova viene registrata in un solo contesto operativo."><EvidenceForm checklists={serializeForClient<WorkspaceChecklistRecord[]>(checklists)} checklistItems={serializeForClient<WorkspaceChecklistItemRecord[]>(checklistItems)} jobSites={serializeForClient<WorkspaceJobSiteRecord[]>(jobSites)} workers={serializeForClient<WorkspaceWorkerRecord[]>(workers)} initialContext={flow.context} origin={flow.origin} requireJobSite={requireJobSite} /></AdminCreationPage>;
  } catch { return <WorkspaceAccessState title="Creazione non disponibile" description="Verifica accesso, assegnazioni e contesto." />; }
}
