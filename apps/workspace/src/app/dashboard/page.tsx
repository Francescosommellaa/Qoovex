import { getDashboardData } from "@shared/server/dashboard-service";
import { resolveWorkspaceAccessKind } from "@shared/server/workspace-access-state";
import { DashboardView } from "@/views/dashboard/DashboardView";
import { DataConfigurationState, OrganizationRequiredState, SignInRequiredState } from "@/views/auth/AuthAccessStates";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";
import { parseWorkspaceFlowContext } from "@/views/workspace/workspace-flow-context";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ updated?: string; result?: string }> }) {
  try {
    const params = await searchParams;
    const { updated } = params;
    const data = await getDashboardData();
    return <DashboardView data={data} result={parseWorkspaceFlowContext(params).result} updatedId={updated} />;
  } catch (error) {
    const state = await resolveWorkspaceAccessKind(error);
    if (state === "unauthenticated") return <SignInRequiredState callbackUrl="/dashboard" />;
    if (state === "no-organization") return <OrganizationRequiredState />;
    if (state === "data-config") return <DataConfigurationState />;
    return <WorkspaceAccessState title="Accesso dashboard non consentito" description="Questa area non e disponibile per il ruolo corrente." />;
  }
}
