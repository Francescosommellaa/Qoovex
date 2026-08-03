import { listDeadlines } from "@shared/server/deadline-service";
import { listDocuments } from "@shared/server/document-service";
import { listJobSites } from "@shared/server/job-site-service";
import { listWorkers } from "@shared/server/worker-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { AdminCreationPage } from "@/views/admin-core/AdminCreationPage";
import { DeadlineForm } from "@/views/admin-core/deadlines/DeadlineForm";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import type { WorkspaceDeadlineRecord, WorkspaceDocumentRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";

export default async function EditDeadlinePage({ params }: { params: Promise<{ deadlineId: string }> }) {
  try {
    const capabilities = await getWorkspaceCapabilities();
    if (!capabilities.canCreateDeadlines) return <WorkspaceAccessState />;

    const { deadlineId } = await params;
    const [deadlines, documents, workers, jobSites] = await Promise.all([
      listDeadlines(),
      listDocuments(),
      listWorkers(),
      listJobSites(),
    ]);
    const deadline = deadlines.find((item) => item.id === deadlineId);
    if (!deadline) return <WorkspaceAccessState title="Scadenza non disponibile" description="La scadenza non esiste oppure non rientra nel tuo ambito di accesso." />;

    return (
      <AdminCreationPage
        title="Modifica scadenza"
        description="Aggiorna data, stato, promemoria e contesto della scadenza registrata."
        backHref="/deadlines"
        backLabel="Torna alle scadenze"
        panelTitle="Dettagli scadenza"
        panelDescription="Le modifiche restano tracciate e limitate all'Azienda corrente."
      >
        <DeadlineForm
          mode="update"
          deadline={serializeForClient<WorkspaceDeadlineRecord>(deadline)}
          documents={serializeForClient<WorkspaceDocumentRecord[]>(documents)}
          workers={serializeForClient<WorkspaceWorkerRecord[]>(workers)}
          jobSites={serializeForClient<WorkspaceJobSiteRecord[]>(jobSites)}
        />
      </AdminCreationPage>
    );
  } catch {
    return <WorkspaceAccessState title="Modifica non disponibile" description="Verifica accesso e autorizzazioni." />;
  }
}
