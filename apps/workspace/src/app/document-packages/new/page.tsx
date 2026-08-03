import { listJobSites } from "@shared/server/job-site-service";
import { getWorkspaceCapabilities, serializeForClient } from "@/views/admin-core/admin-core-server";
import { AdminCreationPage } from "@/views/admin-core/AdminCreationPage";
import { DocumentPackageForm } from "@/views/admin-core/document-packages/DocumentPackageForm";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import type { WorkspaceJobSiteRecord } from "@/views/workspace/workspace-records";
import { parseWorkspaceFlowContext } from "@/views/workspace/workspace-flow-context";

export default async function NewDocumentPackagePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  try {
    if (!(await getWorkspaceCapabilities()).canManagePackages) return <WorkspaceAccessState />;
    const flow = parseWorkspaceFlowContext(await searchParams);
    if (flow.invalidContext || (flow.context && flow.context.type !== "job-site")) return <WorkspaceAccessState title="Contesto non valido" description="Avvia la condivisione da un solo cantiere oppure senza contesto." />;
    const jobSites = await listJobSites();
    return <AdminCreationPage title="Prepara condivisione" description="Crea un contenitore da controllare prima di generare un link." backHref="/document-packages" backLabel="Annulla" panelTitle="Informazioni" panelDescription="Dopo il salvataggio selezionerai esplicitamente gli elementi da condividere."><DocumentPackageForm mode="create" jobSites={serializeForClient<WorkspaceJobSiteRecord[]>(jobSites)} initialJobSiteId={flow.context?.type === "job-site" ? flow.context.id : undefined} /></AdminCreationPage>;
  } catch { return <WorkspaceAccessState title="Creazione non disponibile" description="Verifica accesso e autorizzazioni." />; }
}
