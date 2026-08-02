import { getDashboardOverview } from "@features/operational-engine/server/operational-read-service";
import { resolveWorkspaceAccessKind } from "@shared/server/workspace-access-state";
import { DataConfigurationState, OrganizationRequiredState, SignInRequiredState } from "@/views/auth/AuthAccessStates";
import { DashboardOverviewUnavailable, DashboardOverviewView } from "@/views/dashboard/DashboardOverviewView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";

export default async function DashboardPage() {
  try {
    return <DashboardOverviewView data={await getDashboardOverview()} />;
  }
  catch (error) {
    const state = await resolveWorkspaceAccessKind(error);
    if (state === "unauthenticated") return <SignInRequiredState callbackUrl="/dashboard" />;
    if (state === "no-organization") return <OrganizationRequiredState />;
    if (state === "denied") return <WorkspaceAccessState title="Accesso alla Panoramica non consentito" description="Questa area non è disponibile per l'accesso corrente." />;
    if (error instanceof Error && error.message === "DASHBOARD_OVERVIEW_UNAVAILABLE") return <DashboardOverviewUnavailable />;
    if (state === "data-config") return <DataConfigurationState />;
    return <DashboardOverviewUnavailable />;
  }
}
