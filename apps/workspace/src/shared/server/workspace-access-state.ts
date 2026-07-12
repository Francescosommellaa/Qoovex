import "server-only";

import { AccessError } from "@shared/server/access-errors";
import { getWorkspaceAccessContext } from "@shared/server/access-context-service";

export type WorkspaceAccessKind = "unauthenticated" | "no-organization" | "denied" | "data-config";

export async function resolveWorkspaceAccessKind(error: unknown): Promise<WorkspaceAccessKind> {
  if (error instanceof AccessError && error.status === 401) return "unauthenticated";

  try {
    const context = await getWorkspaceAccessContext();
    if (!context.company && !context.support) return "no-organization";
  } catch (contextError) {
    if (contextError instanceof AccessError && contextError.status === 401) return "unauthenticated";
    return "data-config";
  }

  if (error instanceof AccessError) return "denied";
  return "data-config";
}
