import { getWorkspaceAccessContext } from "@shared/server/access-context-service";
import { resolveWorkspaceAccessKind } from "@shared/server/workspace-access-state";
import { DataConfigurationState, OrganizationRequiredState, SignInRequiredState } from "@/views/auth/AuthAccessStates";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel } from "@/views/workspace/WorkspacePrimitives";

export default async function DashboardPage() {
  try {
    const context = await getWorkspaceAccessContext();
    if (!context.company && !context.support) return <OrganizationRequiredState />;
    return <WorkspacePage><WorkspacePageHeader title="Ambiente Azienda" description="Foundation tecnica disponibile dopo la rimozione del prodotto precedente." /><WorkspacePanel title="Stato intermedio" description="Le funzionalità operative Qoovex vNext non sono incluse in questa build."><p className="text-sm text-muted-foreground">Sono disponibili identità, sicurezza, accessi Azienda, persone operative, cantieri minimi, file, prove, audit e controllo dati.</p></WorkspacePanel></WorkspacePage>;
  } catch (error) {
    const state = await resolveWorkspaceAccessKind(error);
    if (state === "unauthenticated") return <SignInRequiredState callbackUrl="/dashboard" />;
    if (state === "no-organization") return <OrganizationRequiredState />;
    if (state === "data-config") return <DataConfigurationState />;
    return <WorkspaceAccessState />;
  }
}
