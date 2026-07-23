import type { DocumentStatus } from "@qoovex/types";

export const ATTENTION_DOCUMENT_STATUSES: DocumentStatus[] = ["MISSING", "EXPIRED", "EXPIRING_SOON", "TO_REVIEW"];
export const WORKSPACE_LIST_PAGE_SIZE = 50;

export function parseWorkspaceListPage(value: unknown) {
  const parsed = typeof value === "string" ? Number.parseInt(value, 10) : 1;
  return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= 10_000 ? parsed : 1;
}

export function parseDocumentQueueView(value: unknown) {
  return value === "attention" ? "attention" as const : undefined;
}

export function parseChecklistQueueView(value: unknown) {
  return value === "open" ? "open" as const : undefined;
}

export function parseEvidenceSort(value: unknown) {
  return value === "recent" ? "recent" as const : undefined;
}

export function parseDocumentPackageQueueView(value: unknown) {
  return value === "ready" ? "ready" as const : undefined;
}
