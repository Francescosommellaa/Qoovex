import { listJobSites } from "@shared/server/job-site-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { AdminCreationPage } from "@/views/admin-core/AdminCreationPage";
import { ChecklistForm } from "@/views/admin-core/checklists/ChecklistForm";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import type { WorkspaceJobSiteRecord } from "@/views/workspace/workspace-records";
import { parseWorkspaceFlowContext } from "@/views/workspace/workspace-flow-context";

export default async function NewChecklistPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  try {
    if (!(await getWorkspaceCapabilities()).canManageChecklists) return <WorkspaceAccessState />;
    const flow = parseWorkspaceFlowContext(await searchParams);
    if (flow.invalidContext || (flow.context && flow.context.type !== "job-site")) return <WorkspaceAccessState title="Contesto non valido" description="Avvia la checklist da un solo cantiere." />;
    const jobSites = await listJobSites();
    return <AdminCreationPage title="Crea checklist" description="Prepara una lista operativa senza introdurre template o obblighi normativi." backHref="/checklists" backLabel="Annulla" panelTitle="Checklist" panelDescription="Dopo il salvataggio potrai aggiungere le voci da controllare."><ChecklistForm mode="create" jobSites={serializeForClient<WorkspaceJobSiteRecord[]>(jobSites)} initialJobSiteId={flow.context?.type === "job-site" ? flow.context.id : undefined} /></AdminCreationPage>;
  } catch { return <WorkspaceAccessState title="Creazione non disponibile" description="Verifica accesso e autorizzazioni." />; }
}
