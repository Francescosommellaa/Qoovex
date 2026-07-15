import { listDocuments } from "@shared/server/document-service";
import { listJobSites } from "@shared/server/job-site-service";
import { listWorkers } from "@shared/server/worker-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { AdminCreationPage } from "@/views/admin-core/AdminCreationPage";
import { DeadlineForm } from "@/views/admin-core/deadlines/DeadlineForm";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import type { WorkspaceDocumentRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";
import { parseWorkspaceFlowContext } from "@/views/workspace/workspace-flow-context";

export default async function NewDeadlinePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  try {
    if (!(await getWorkspaceCapabilities()).canCreateDeadlines) return <WorkspaceAccessState />;
    const flow = parseWorkspaceFlowContext(await searchParams);
    if (flow.invalidContext || flow.context?.type === "checklist-item") return <WorkspaceAccessState title="Contesto non valido" description="Collega la scadenza a un solo documento, lavoratore o cantiere." />;
    const [documents, workers, jobSites] = await Promise.all([listDocuments(), listWorkers(), listJobSites()]);
    return <AdminCreationPage title="Aggiungi scadenza" description="Registra una data inserita o confermata dall'utente." backHref="/deadlines" backLabel="Annulla" panelTitle="Scadenza" panelDescription="Collega un solo contesto principale quando serve."><DeadlineForm mode="create" documents={serializeForClient<WorkspaceDocumentRecord[]>(documents)} workers={serializeForClient<WorkspaceWorkerRecord[]>(workers)} jobSites={serializeForClient<WorkspaceJobSiteRecord[]>(jobSites)} initialContext={flow.context} origin={flow.origin} /></AdminCreationPage>;
  } catch { return <WorkspaceAccessState title="Creazione non disponibile" description="Verifica accesso e autorizzazioni." />; }
}
