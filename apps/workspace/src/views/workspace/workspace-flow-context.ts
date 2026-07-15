export const workspaceOrigins = ["dashboard", "documents", "job-site", "worker", "checklist", "settings"] as const;
export type WorkspaceOrigin = typeof workspaceOrigins[number];

export const workspaceResults = ["document-created", "file-uploaded", "evidence-created", "share-created", "invitation-sent"] as const;
export type WorkspaceResult = typeof workspaceResults[number];

export type WorkspaceCreationContext =
  | { type: "document"; id: string }
  | { type: "job-site"; id: string }
  | { type: "worker"; id: string }
  | { type: "checklist-item"; id: string };

type SearchValues = Record<string, string | string[] | undefined>;

function scalar(value: string | string[] | undefined) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function parseWorkspaceFlowContext(values: SearchValues): { origin: WorkspaceOrigin | null; result: WorkspaceResult | null; context: WorkspaceCreationContext | null; invalidContext: boolean } {
  const originValue = scalar(values.origin);
  const resultValue = scalar(values.result);
  const candidates: WorkspaceCreationContext[] = [
    scalar(values.documentId) ? { type: "document", id: scalar(values.documentId)! } : null,
    scalar(values.jobSiteId) ? { type: "job-site", id: scalar(values.jobSiteId)! } : null,
    scalar(values.workerId) ? { type: "worker", id: scalar(values.workerId)! } : null,
    scalar(values.checklistItemId) ? { type: "checklist-item", id: scalar(values.checklistItemId)! } : null,
  ].filter((candidate): candidate is WorkspaceCreationContext => Boolean(candidate));

  return {
    origin: workspaceOrigins.includes(originValue as WorkspaceOrigin) ? originValue as WorkspaceOrigin : null,
    result: workspaceResults.includes(resultValue as WorkspaceResult) ? resultValue as WorkspaceResult : null,
    context: candidates.length === 1 ? candidates[0] : null,
    invalidContext: candidates.length > 1,
  };
}

export function workspaceResultHref(origin: WorkspaceOrigin | null, result: WorkspaceResult, resourceId?: string) {
  if (origin === "dashboard") return `/dashboard?result=${result}${resourceId ? `&updated=${encodeURIComponent(resourceId)}` : ""}`;
  return resourceId ? `/documents/${encodeURIComponent(resourceId)}?result=${result}` : `/${origin === "settings" ? "settings" : "dashboard"}?result=${result}`;
}
