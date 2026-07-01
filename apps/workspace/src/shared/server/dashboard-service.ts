import "server-only";

import { db } from "@qoovex/db";
import type {
  DashboardDocumentAttentionItem,
  DashboardDocumentStatusCounts,
  DashboardEmptyState,
  DashboardEvidenceItem,
  DashboardJobSiteItem,
  DashboardPackageItem,
  DashboardQuickAction,
  DashboardResponse,
  DashboardWorkerItem,
  DocumentStatus,
} from "@qoovex/types";
import { recordSupportAccess } from "@shared/server/support-access-service";
import { requireOrganizationDomainAccess } from "./domain-access-service";

const DASHBOARD_ROLES = ["OWNER", "ADMIN", "SAFETY_CONSULTANT"] as const;
const ATTENTION_DOCUMENT_STATUSES: DocumentStatus[] = ["MISSING", "EXPIRED", "EXPIRING_SOON", "TO_REVIEW"];
const DASHBOARD_LIMIT = 6;

const quickActions: DashboardQuickAction[] = [
  { label: "Aggiungi documento", description: "Crea un record documento logico.", href: null, disabled: true, disabledReason: "Schermata in preparazione" },
  { label: "Carica una versione", description: "Aggiungi un file a un documento.", href: null, disabled: true, disabledReason: "Schermata in preparazione" },
  { label: "Aggiungi lavoratore", description: "Registra una persona operativa.", href: null, disabled: true, disabledReason: "Schermata in preparazione" },
  { label: "Aggiungi cantiere", description: "Crea un contesto operativo.", href: null, disabled: true, disabledReason: "Schermata in preparazione" },
  { label: "Crea checklist", description: "Prepara controlli configurati.", href: null, disabled: true, disabledReason: "Schermata in preparazione" },
  { label: "Aggiungi prova", description: "Collega una nota, foto o file.", href: null, disabled: true, disabledReason: "Schermata in preparazione" },
  { label: "Crea pacchetto", description: "Prepara documenti per revisione.", href: null, disabled: true, disabledReason: "Schermata in preparazione" },
];

function emptyDocumentCounts(): DashboardDocumentStatusCounts {
  return { present: 0, missing: 0, expired: 0, expiringSoon: 0, toReview: 0 };
}

function documentCountKey(status: DocumentStatus): keyof DashboardDocumentStatusCounts | null {
  if (status === "PRESENT") return "present";
  if (status === "MISSING") return "missing";
  if (status === "EXPIRED") return "expired";
  if (status === "EXPIRING_SOON") return "expiringSoon";
  if (status === "TO_REVIEW") return "toReview";
  return null;
}

function toIso(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}

function countByNullableId(rows: Array<{ _count: { _all: number } }>, ids: string[]) {
  const counts = new Map<string, number>();
  for (const row of rows as Array<{ workerId?: string | null; jobSiteId?: string | null; _count: { _all: number } }>) {
    const id = row.workerId ?? row.jobSiteId;
    if (id) counts.set(id, row._count._all);
  }
  return ids.map((id) => counts.get(id) ?? 0);
}

function documentNextAction(status: DocumentStatus) {
  if (status === "MISSING") return "Aggiungi documento";
  if (status === "EXPIRED") return "Aggiorna scadenza registrata";
  if (status === "EXPIRING_SOON") return "Controlla scadenza";
  if (status === "TO_REVIEW") return "Verifica informazioni";
  return "Controlla documento";
}

function buildEmptyStates(input: {
  activeJobSites: number;
  activeWorkers: number;
  totalDocuments: number;
  packageCount: number;
}): DashboardEmptyState[] {
  const emptyStates: DashboardEmptyState[] = [];
  if (!input.activeJobSites) emptyStates.push({ title: "Crea il primo cantiere", actionLabel: "Aggiungi cantiere" });
  if (!input.activeWorkers) emptyStates.push({ title: "Aggiungi un lavoratore", actionLabel: "Aggiungi lavoratore" });
  if (!input.totalDocuments) emptyStates.push({ title: "Configura un tipo documento", actionLabel: "Aggiungi documento" });
  if (!input.packageCount) emptyStates.push({ title: "Crea un pacchetto per revisione", actionLabel: "Crea pacchetto" });
  return emptyStates;
}

export async function getDashboardData(): Promise<DashboardResponse> {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("organization:read", DASHBOARD_ROLES);
  const now = new Date();

  const [
    documentStatusRows,
    openDeadlines,
    activeJobSites,
    activeWorkers,
    packagesReadyForReview,
    sharedPackages,
    deadlines,
    documentsToReview,
    jobSites,
    workers,
    packages,
    recentEvidenceRows,
  ] = await Promise.all([
    db.document.groupBy({
      by: ["status"],
      where: { organizationId, archivedAt: null },
      _count: { _all: true },
    }),
    db.deadline.count({ where: { organizationId, archivedAt: null, status: { notIn: ["DONE", "ARCHIVED"] } } }),
    db.jobSite.count({ where: { organizationId, archivedAt: null } }),
    db.worker.count({ where: { organizationId, archivedAt: null } }),
    db.documentPackage.count({ where: { organizationId, archivedAt: null, status: "READY_FOR_REVIEW" } }),
    db.documentPackage.count({ where: { organizationId, archivedAt: null, status: "SHARED" } }),
    db.deadline.findMany({
      where: { organizationId, archivedAt: null, status: { notIn: ["DONE", "ARCHIVED"] } },
      select: { id: true, title: true, dueDate: true, sourceType: true, status: true, documentId: true, workerId: true, jobSiteId: true },
      orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
      take: DASHBOARD_LIMIT,
    }),
    db.document.findMany({
      where: { organizationId, archivedAt: null, status: { in: ATTENTION_DOCUMENT_STATUSES } },
      select: {
        id: true,
        title: true,
        status: true,
        ownerType: true,
        expiryDate: true,
        updatedAt: true,
        worker: { select: { displayName: true } },
        jobSite: { select: { name: true } },
      },
      orderBy: [{ updatedAt: "desc" }],
      take: DASHBOARD_LIMIT,
    }),
    db.jobSite.findMany({
      where: { organizationId, archivedAt: null },
      select: { id: true, name: true, status: true },
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
      take: DASHBOARD_LIMIT,
    }),
    db.worker.findMany({
      where: { organizationId, archivedAt: null },
      select: { id: true, displayName: true, status: true },
      orderBy: [{ displayName: "asc" }],
      take: DASHBOARD_LIMIT,
    }),
    db.documentPackage.findMany({
      where: { organizationId, archivedAt: null },
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
        _count: { select: { items: true } },
        shareLinks: {
          where: { revokedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
          select: { id: true },
          take: 1,
        },
      },
      orderBy: [{ updatedAt: "desc" }],
      take: DASHBOARD_LIMIT,
    }),
    db.evidence.findMany({
      where: { organizationId, archivedAt: null },
      select: { id: true, type: true, title: true, blobKey: true, createdAt: true, jobSiteId: true },
      orderBy: [{ createdAt: "desc" }],
      take: DASHBOARD_LIMIT,
    }),
  ]);

  const documents = emptyDocumentCounts();
  for (const row of documentStatusRows) {
    const key = documentCountKey(row.status);
    if (key) documents[key] = row._count._all;
  }

  const jobSiteIds = jobSites.map((jobSite) => jobSite.id);
  const workerIds = workers.map((worker) => worker.id);
  const [jobSiteDocumentRows, jobSiteChecklistRows, workerDocumentRows, workerDeadlineRows] = await Promise.all([
    jobSiteIds.length ? db.document.groupBy({
      by: ["jobSiteId"],
      where: { organizationId, archivedAt: null, jobSiteId: { in: jobSiteIds }, status: { in: ATTENTION_DOCUMENT_STATUSES } },
      _count: { _all: true },
    }) : Promise.resolve([]),
    jobSiteIds.length ? db.checklist.groupBy({
      by: ["jobSiteId"],
      where: { organizationId, archivedAt: null, jobSiteId: { in: jobSiteIds } },
      _count: { _all: true },
    }) : Promise.resolve([]),
    workerIds.length ? db.document.groupBy({
      by: ["workerId"],
      where: { organizationId, archivedAt: null, workerId: { in: workerIds }, status: { in: ATTENTION_DOCUMENT_STATUSES } },
      _count: { _all: true },
    }) : Promise.resolve([]),
    workerIds.length ? db.deadline.groupBy({
      by: ["workerId"],
      where: { organizationId, archivedAt: null, workerId: { in: workerIds }, status: { notIn: ["DONE", "ARCHIVED"] } },
      _count: { _all: true },
    }) : Promise.resolve([]),
  ]);

  const jobSiteDocumentCounts = countByNullableId(jobSiteDocumentRows, jobSiteIds);
  const jobSiteChecklistCounts = countByNullableId(jobSiteChecklistRows, jobSiteIds);
  const workerDocumentCounts = countByNullableId(workerDocumentRows, workerIds);
  const workerDeadlineCounts = countByNullableId(workerDeadlineRows, workerIds);

  const mappedJobSites: DashboardJobSiteItem[] = jobSites.map((jobSite, index) => ({
    id: jobSite.id,
    name: jobSite.name,
    status: jobSite.status,
    documentsToReview: jobSiteDocumentCounts[index] ?? 0,
    openChecklists: jobSiteChecklistCounts[index] ?? 0,
  }));

  const mappedWorkers: DashboardWorkerItem[] = workers.map((worker, index) => ({
    id: worker.id,
    displayName: worker.displayName,
    status: worker.status,
    documentsToReview: workerDocumentCounts[index] ?? 0,
    openDeadlines: workerDeadlineCounts[index] ?? 0,
  }));

  const mappedPackages: DashboardPackageItem[] = packages.map((documentPackage) => ({
    id: documentPackage.id,
    title: documentPackage.title,
    status: documentPackage.status,
    itemCount: documentPackage._count.items,
    hasActiveShareLink: documentPackage.shareLinks.length > 0,
    updatedAt: documentPackage.updatedAt.toISOString(),
  }));

  const mappedEvidence: DashboardEvidenceItem[] = recentEvidenceRows.map((evidence) => ({
    id: evidence.id,
    type: evidence.type,
    title: evidence.title,
    hasFile: Boolean(evidence.blobKey),
    createdAt: evidence.createdAt.toISOString(),
    jobSiteId: evidence.jobSiteId,
  }));

  const totalDocuments = Object.values(documents).reduce((total, value) => total + value, 0);
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "dashboard" });

  return {
    generatedAt: now.toISOString(),
    organization: {
      name: context.support?.organization.name ?? context.membership?.organization.name ?? "Azienda",
      role: actorRole,
    },
    summary: {
      documents,
      openDeadlines,
      activeJobSites,
      activeWorkers,
      packagesReadyForReview,
      sharedPackages,
      recentEvidence: mappedEvidence.length,
    },
    deadlines: deadlines.map((deadline) => ({
      id: deadline.id,
      title: deadline.title,
      dueDate: deadline.dueDate.toISOString(),
      status: deadline.status,
      sourceType: deadline.sourceType,
      documentId: deadline.documentId,
      workerId: deadline.workerId,
      jobSiteId: deadline.jobSiteId,
    })),
    documentsToReview: documentsToReview.map<DashboardDocumentAttentionItem>((document) => ({
      id: document.id,
      title: document.title,
      status: document.status,
      ownerType: document.ownerType,
      ownerLabel: document.worker?.displayName ?? document.jobSite?.name ?? "Azienda",
      expiryDate: toIso(document.expiryDate),
      updatedAt: document.updatedAt.toISOString(),
      nextAction: documentNextAction(document.status),
    })),
    jobSites: mappedJobSites,
    workers: mappedWorkers,
    packages: mappedPackages,
    recentEvidence: mappedEvidence,
    quickActions,
    emptyStates: buildEmptyStates({ activeJobSites, activeWorkers, totalDocuments, packageCount: mappedPackages.length }),
  };
}
