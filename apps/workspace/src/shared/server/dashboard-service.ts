import "server-only";

import { db } from "@qoovex/db";
import type {
  DashboardDocumentAttentionItem,
  DashboardDocumentStatusCounts,
  DashboardEmptyState,
  DashboardEvidenceItem,
  DashboardJobSiteItem,
  DashboardNotificationItem,
  DashboardPackageItem,
  DashboardQuickAction,
  DashboardResponse,
  DashboardWorkerItem,
  DeadlineStatus,
  DocumentStatus,
} from "@qoovex/types";
import { recordSupportAccess } from "@shared/server/support-access-service";
import { requireOrganizationDomainAccess } from "./domain-access-service";
import { syncOrganizationReminderRecords } from "./reminder-service";
import { getResourceScope } from "./resource-scope-service";

const DASHBOARD_ROLES = ["OWNER", "ADMIN", "SAFETY_CONSULTANT", "SITE_MANAGER", "WORKER"] as const;
const ATTENTION_DOCUMENT_STATUSES: DocumentStatus[] = ["MISSING", "EXPIRED", "EXPIRING_SOON", "TO_REVIEW"];
const OPEN_DEADLINE_STATUSES: DeadlineStatus[] = ["DONE", "ARCHIVED"];
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
  const scope = await getResourceScope(context);
  const now = new Date();
  await syncOrganizationReminderRecords(organizationId, now);

  if (!scope.fullAccess) {
    const jobSiteIds = scope.visibleJobSiteIds;
    const workerId = scope.linkedWorker?.id ?? null;
    const documentWhere = scope.actorRole === "SITE_MANAGER"
      ? { organizationId, archivedAt: null, ownerType: "JOB_SITE" as const, jobSiteId: { in: scope.siteManagerJobSiteIds } }
      : workerId
        ? { organizationId, archivedAt: null, ownerType: "WORKER" as const, workerId }
        : { organizationId, archivedAt: null, id: { in: [] as string[] } };
    const deadlineWhere = scope.actorRole === "SITE_MANAGER"
      ? { organizationId, archivedAt: null, jobSiteId: { in: scope.siteManagerJobSiteIds }, status: { notIn: OPEN_DEADLINE_STATUSES } }
      : workerId
        ? {
          organizationId,
          archivedAt: null,
          status: { notIn: OPEN_DEADLINE_STATUSES },
          OR: [{ workerId }, { document: { ownerType: "WORKER" as const, workerId } }],
        }
        : { organizationId, archivedAt: null, id: { in: [] as string[] } };
    const evidenceWhere = scope.actorRole === "SITE_MANAGER"
      ? {
        organizationId,
        archivedAt: null,
        OR: [
          { jobSiteId: { in: scope.siteManagerJobSiteIds } },
          { checklistItem: { checklist: { jobSiteId: { in: scope.siteManagerJobSiteIds } } } },
        ],
      }
      : {
        organizationId,
        archivedAt: null,
        OR: [
          ...(workerId ? [{ workerId }] : []),
          { jobSiteId: { in: scope.workerJobSiteIds } },
          { checklistItem: { checklist: { jobSiteId: { in: scope.workerJobSiteIds } } } },
        ],
      };

    const [
      documentStatusRows,
      openDeadlines,
      jobSites,
      deadlines,
      documentsToReview,
      recentEvidenceRows,
      assignedWorkers,
    ] = await Promise.all([
      db.document.groupBy({ by: ["status"], where: documentWhere, _count: { _all: true } }),
      db.deadline.count({ where: deadlineWhere }),
      jobSiteIds.length
        ? db.jobSite.findMany({
          where: { organizationId, id: { in: jobSiteIds }, archivedAt: null },
          select: { id: true, name: true, status: true },
          orderBy: [{ name: "asc" }],
          take: DASHBOARD_LIMIT,
        })
        : Promise.resolve([]),
      db.deadline.findMany({
        where: deadlineWhere,
        select: { id: true, title: true, dueDate: true, sourceType: true, status: true, documentId: true, workerId: true, jobSiteId: true },
        orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
        take: DASHBOARD_LIMIT,
      }),
      db.document.findMany({
        where: { ...documentWhere, status: { in: ATTENTION_DOCUMENT_STATUSES } },
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
      db.evidence.findMany({
        where: evidenceWhere,
        select: { id: true, type: true, title: true, blobKey: true, createdAt: true, jobSiteId: true },
        orderBy: [{ createdAt: "desc" }],
        take: DASHBOARD_LIMIT,
      }),
      scope.actorRole === "SITE_MANAGER" && scope.siteManagerJobSiteIds.length
        ? db.jobSiteWorkerAssignment.findMany({
          where: { organizationId, archivedAt: null, jobSiteId: { in: scope.siteManagerJobSiteIds }, worker: { archivedAt: null } },
          select: { worker: { select: { id: true, displayName: true, status: true } } },
          take: DASHBOARD_LIMIT,
        })
        : Promise.resolve([]),
    ]);

    const documents = emptyDocumentCounts();
    for (const row of documentStatusRows) {
      const key = documentCountKey(row.status);
      if (key) documents[key] = row._count._all;
    }

    const jobSiteDocumentRows = jobSites.length ? await db.document.groupBy({
      by: ["jobSiteId"],
      where: { organizationId, archivedAt: null, jobSiteId: { in: jobSites.map((jobSite) => jobSite.id) }, status: { in: ATTENTION_DOCUMENT_STATUSES } },
      _count: { _all: true },
    }) : [];
    const jobSiteChecklistRows = jobSites.length ? await db.checklist.groupBy({
      by: ["jobSiteId"],
      where: { organizationId, archivedAt: null, jobSiteId: { in: jobSites.map((jobSite) => jobSite.id) } },
      _count: { _all: true },
    }) : [];
    const jobSiteDocumentCounts = countByNullableId(jobSiteDocumentRows, jobSites.map((jobSite) => jobSite.id));
    const jobSiteChecklistCounts = countByNullableId(jobSiteChecklistRows, jobSites.map((jobSite) => jobSite.id));
    const seenWorkers = new Set<string>();
    const mappedWorkers: DashboardWorkerItem[] = scope.actorRole === "WORKER" && scope.linkedWorker
      ? [{ id: scope.linkedWorker.id, displayName: scope.linkedWorker.displayName, status: scope.linkedWorker.status, documentsToReview: documents.missing + documents.expired + documents.expiringSoon + documents.toReview, openDeadlines }]
      : assignedWorkers.flatMap(({ worker }) => {
        if (seenWorkers.has(worker.id)) return [];
        seenWorkers.add(worker.id);
        return [{ id: worker.id, displayName: worker.displayName, status: worker.status, documentsToReview: 0, openDeadlines: 0 }];
      });

    await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "dashboard" });
    const totalDocuments = Object.values(documents).reduce((total, value) => total + value, 0);
    return {
      generatedAt: now.toISOString(),
      organization: {
        name: context.support?.organization.name ?? context.membership?.organization.name ?? "Azienda",
        role: actorRole,
      },
      summary: {
        documents,
        openDeadlines,
        activeJobSites: jobSites.length,
        activeWorkers: mappedWorkers.length,
        packagesReadyForReview: 0,
        sharedPackages: 0,
        recentEvidence: recentEvidenceRows.length,
        unreadNotifications: 0,
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
      jobSites: jobSites.map((jobSite, index) => ({
        id: jobSite.id,
        name: jobSite.name,
        status: jobSite.status,
        documentsToReview: jobSiteDocumentCounts[index] ?? 0,
        openChecklists: jobSiteChecklistCounts[index] ?? 0,
      })),
      workers: mappedWorkers,
      packages: [],
      recentEvidence: recentEvidenceRows.map((evidence) => ({
        id: evidence.id,
        type: evidence.type,
        title: evidence.title,
        hasFile: Boolean(evidence.blobKey),
        createdAt: evidence.createdAt.toISOString(),
        jobSiteId: evidence.jobSiteId,
      })),
      notifications: [],
      quickActions,
      emptyStates: buildEmptyStates({ activeJobSites: jobSites.length, activeWorkers: mappedWorkers.length, totalDocuments, packageCount: 0 }),
    };
  }

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
    notificationRows,
    unreadNotifications,
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
    db.notification.findMany({
      where: { organizationId, dismissedAt: null, readAt: null, OR: [{ userId: null }, { userId: context.userId }] },
      select: { id: true, type: true, severity: true, title: true, message: true, actionHref: true, createdAt: true },
      orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
      take: 3,
    }),
    db.notification.count({
      where: { organizationId, dismissedAt: null, readAt: null, OR: [{ userId: null }, { userId: context.userId }] },
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

  const mappedNotifications: DashboardNotificationItem[] = notificationRows.map((notification) => ({
    id: notification.id,
    type: notification.type,
    severity: notification.severity,
    title: notification.title,
    message: notification.message,
    actionHref: notification.actionHref,
    createdAt: notification.createdAt.toISOString(),
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
      unreadNotifications,
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
    notifications: mappedNotifications,
    quickActions,
    emptyStates: buildEmptyStates({ activeJobSites, activeWorkers, totalDocuments, packageCount: mappedPackages.length }),
  };
}
