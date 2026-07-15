import { getWorkspaceCapabilities } from "@/views/admin-core/admin-core-server";
import { AdminCreationPage } from "@/views/admin-core/AdminCreationPage";
import { JobSiteForm } from "@/views/admin-core/job-sites/JobSiteForm";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";

export default async function NewJobSitePage() {
  try {
    if (!(await getWorkspaceCapabilities()).canCreateJobSites) return <WorkspaceAccessState />;
    return <AdminCreationPage title="Aggiungi cantiere" description="Crea il contesto in cui raccogliere lavoro, persone e documenti." backHref="/job-sites" backLabel="Annulla" panelTitle="Informazioni cantiere" panelDescription="Coordinate, tracciamento continuo e presenze restano fuori da questo flusso."><JobSiteForm mode="create" /></AdminCreationPage>;
  } catch { return <WorkspaceAccessState title="Creazione non disponibile" description="Verifica accesso e autorizzazioni." />; }
}
