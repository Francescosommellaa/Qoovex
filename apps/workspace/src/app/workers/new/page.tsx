import { getWorkspaceCapabilities } from "@/views/admin-core/admin-core-server";
import { AdminCreationPage } from "@/views/admin-core/AdminCreationPage";
import { WorkerForm } from "@/views/admin-core/workers/WorkerForm";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";

export default async function NewWorkerPage() {
  try {
    if (!(await getWorkspaceCapabilities()).canCreateWorkers) return <WorkspaceAccessState />;
    return <AdminCreationPage title="Aggiungi lavoratore" description="Inserisci solo le informazioni necessarie per collegare documenti e cantieri." backHref="/workers" backLabel="Annulla" panelTitle="Informazioni" panelDescription="Il ruolo operativo è una descrizione, non una qualifica o un permesso."><WorkerForm mode="create" /></AdminCreationPage>;
  } catch { return <WorkspaceAccessState title="Creazione non disponibile" description="Verifica accesso e autorizzazioni." />; }
}
