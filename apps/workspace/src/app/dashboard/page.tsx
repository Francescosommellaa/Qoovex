import { getOperationalCenter, paginateOperationalCenter } from "@features/operational-engine/server/operational-read-service";
import type { OperationalCenterView as OperationalCenterViewName } from "@qoovex/types";
import { resolveWorkspaceAccessKind } from "@shared/server/workspace-access-state";
import { DataConfigurationState, OrganizationRequiredState, SignInRequiredState } from "@/views/auth/AuthAccessStates";
import { OperationalCenterView } from "@/views/operational-center/OperationalCenterView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  try {
    const { view } = await searchParams;
    const selectedView = (view ?? "ALL") as OperationalCenterViewName;
    const data = await getOperationalCenter();
    const inbox = paginateOperationalCenter(data, { filters: { view: selectedView }, take: 50 });
    return <OperationalCenterView data={data} inbox={inbox} selectedView={selectedView} />;
  }
  catch (error) {
    const state = await resolveWorkspaceAccessKind(error);
    if (state === "unauthenticated") return <SignInRequiredState callbackUrl="/dashboard" />;
    if (state === "no-organization") return <OrganizationRequiredState />;
    if (state === "data-config") return <DataConfigurationState />;
    return <WorkspaceAccessState title="Accesso al Centro operativo non consentito" description="Questa area non e disponibile per il ruolo corrente." />;
  }
}
