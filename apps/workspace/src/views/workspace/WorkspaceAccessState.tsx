import { AccessError } from "@shared/server/access-errors";
import { getViewerContext } from "@shared/server/access-context-service";
import { DataConfigurationState, OrganizationRequiredState, SignInRequiredState } from "@/views/auth/AuthAccessStates";
import { WorkspaceAccessState as WorkspaceDeniedState } from "./WorkspacePrimitives";

async function getWorkspaceAccessFallback() {
  try {
    const context = await getViewerContext();
    if (!context.membership && !context.support) return "no-organization" as const;
    return "denied" as const;
  } catch (error) {
    if (error instanceof AccessError && error.status === 401) return "unauthenticated" as const;
    return "data-config" as const;
  }
}

export async function WorkspaceAccessState({ title = "Area non disponibile", description = "Questa sezione non e disponibile per il ruolo corrente." }) {
  const fallback = await getWorkspaceAccessFallback();
  if (fallback === "unauthenticated") return <SignInRequiredState />;
  if (fallback === "no-organization") return <OrganizationRequiredState />;
  if (fallback === "data-config") return <DataConfigurationState />;
  return <WorkspaceDeniedState title={title} description={description} />;
}
