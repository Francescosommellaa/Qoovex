import type { ChecklistItemStatus, DeadlineStatus, DocumentOwnerType, DocumentPackageItemType, DocumentPackageStatus, DocumentStatus, EvidenceType, RecordStatus } from "@qoovex/types";
import type { WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "./workspace-records";

export const documentStatusLabels: Record<DocumentStatus, string> = {
  PRESENT: "Presente",
  MISSING: "Mancante",
  EXPIRED: "Scaduto",
  EXPIRING_SOON: "In scadenza",
  TO_REVIEW: "Da verificare",
  ARCHIVED: "Archiviato",
};

export const deadlineStatusLabels: Record<DeadlineStatus, string> = {
  SCHEDULED: "Registrata",
  EXPIRING_SOON: "In scadenza",
  EXPIRED: "Scaduta",
  DONE: "Completata",
  ARCHIVED: "Archiviata",
};

export const recordStatusLabels: Record<RecordStatus, string> = {
  ACTIVE: "Attivo",
  ARCHIVED: "Archiviato",
};

export const checklistItemStatusLabels: Record<ChecklistItemStatus, string> = {
  OPEN: "Aperta",
  DONE: "Voce completata",
  TO_REVIEW: "Da verificare",
  ARCHIVED: "Archiviata",
};

export const evidenceTypeLabels: Record<EvidenceType, string> = {
  NOTE: "Nota operativa",
  PHOTO: "Foto collegata",
  FILE: "File collegato",
};

export const documentPackageStatusLabels: Record<DocumentPackageStatus, string> = {
  DRAFT: "Bozza",
  READY_FOR_REVIEW: "Pronto per revisione",
  SHARED: "Condiviso in lettura",
  ARCHIVED: "Archiviato",
};

export const documentPackageItemTypeLabels: Record<DocumentPackageItemType, string> = {
  DOCUMENT: "Documento",
  DOCUMENT_VERSION: "File del documento",
  EVIDENCE: "Prova",
  CHECKLIST: "Checklist",
  NOTE: "Nota",
};

export const ownerTypeLabels: Record<DocumentOwnerType, string> = {
  ORGANIZATION: "Azienda",
  WORKER: "Lavoratore",
  JOB_SITE: "Cantiere",
};

export function formatDate(value?: string | null) {
  if (!value) return "Non registrata";
  return new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export function formatDateInput(value?: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function formatDateTimeInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const timezoneOffsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
}

export function statusTone(status: string) {
  if (status === "EXPIRED" || status === "MISSING") return "danger";
  if (status === "EXPIRING_SOON") return "warning";
  if (status === "PRESENT" || status === "DONE" || status === "ACTIVE") return "good";
  return "info";
}

export function ownerLabel(ownerType: DocumentOwnerType, workerId?: string | null, jobSiteId?: string | null, workers: WorkspaceWorkerRecord[] = [], jobSites: WorkspaceJobSiteRecord[] = []) {
  if (ownerType === "WORKER") return workers.find((worker) => worker.id === workerId)?.displayName ?? "Lavoratore";
  if (ownerType === "JOB_SITE") return jobSites.find((jobSite) => jobSite.id === jobSiteId)?.name ?? "Cantiere";
  return "Azienda";
}

export function fileSizeLabel(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
