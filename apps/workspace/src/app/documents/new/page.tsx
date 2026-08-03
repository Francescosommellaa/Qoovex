import { listDocumentTypes } from "@shared/server/document-type-service";
import { listJobSites } from "@shared/server/job-site-service";
import { listWorkers } from "@shared/server/worker-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { AdminCreationPage } from "@/views/admin-core/AdminCreationPage";
import { DocumentCreateFlow } from "@/views/admin-core/documents/DocumentCreateFlow";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import { parseWorkspaceFlowContext } from "@/views/workspace/workspace-flow-context";
import type { WorkspaceDocumentTypeRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";

export default async function NewDocumentPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  try {
    const capabilities = await getWorkspaceCapabilities();
    if (!capabilities.canCreateDocuments) return <WorkspaceAccessState title="Creazione non disponibile" description="Puoi caricare un file da un documento già visibile." />;
    const flow = parseWorkspaceFlowContext(await searchParams);
    if (flow.invalidContext || flow.context?.type === "document" || flow.context?.type === "checklist-item") return <WorkspaceAccessState title="Contesto non valido" description="Avvia la creazione da un solo cantiere, lavoratore o dall'azienda." />;
    const [documentTypes, workers, jobSites] = await Promise.all([listDocumentTypes(), listWorkers(), listJobSites()]);
    return <AdminCreationPage title="Aggiungi documento" description="Salva informazioni e file in un unico percorso." backHref="/documents" backLabel="Annulla" panelTitle="Documento" panelDescription="Chiediamo solo le informazioni necessarie al contesto scelto."><DocumentCreateFlow documentTypes={serializeForClient<WorkspaceDocumentTypeRecord[]>(documentTypes)} workers={serializeForClient<WorkspaceWorkerRecord[]>(workers)} jobSites={serializeForClient<WorkspaceJobSiteRecord[]>(jobSites)} initialContext={flow.context} origin={flow.origin} /></AdminCreationPage>;
  } catch { return <WorkspaceAccessState title="Creazione non disponibile" description="Verifica accesso e autorizzazioni." />; }
}
