import "server-only";

import { db } from "@qoovex/db";
import type {
  DashboardAttentionCounts,
  DashboardContextItem,
  DashboardDeadlineItem,
  DashboardPackageItem,
  DashboardResponse,
  DashboardSituation,
  DashboardSituationKind,
  DocumentOwnerType,
  DocumentStatus,
  MissingDocumentRequirementItem,
  OrganizationRole,
} from "@qoovex/types";
import { recordSupportAccess } from "@shared/server/support-access-service";
import { documentDetailsHref } from "../lib/document-routes";
import { workerDetailsHref } from "../lib/worker-routes";
import { requireOrganizationDomainAccess } from "./domain-access-service";
import { buildMissingDocumentRequirementItemsForScope } from "./document-requirement-service";
import { getResourceScope, type ResourceScope } from "./resource-scope-service";

const DASHBOARD_ROLES = ["OWNER", "COLLABORATOR"] as const;
const ATTENTION_DOCUMENT_STATUSES: DocumentStatus[] = ["MISSING", "EXPIRED", "EXPIRING_SOON", "TO_REVIEW"];
const CLOSED_DEADLINE_STATUSES = ["DONE", "ARCHIVED"] as const;
const DASHBOARD_SITUATION_LIMIT = 5;
const DASHBOARD_QUERY_LIMIT = 20;

const roleLabels: Record<OrganizationRole, string> = {
  OWNER: "Titolare",
  COLLABORATOR: "Collaboratore",
};

type AssignmentRow = {
  userId: string;
  user: { name: string | null; firstName: string; lastName: string | null; email: string };
};

type DocumentRow = {
  id: string;
  title: string;
  status: DocumentStatus;
  ownerType: DocumentOwnerType;
  workerId: string | null;
  jobSiteId: string | null;
  expiryDate: Date | null;
  updatedAt: Date;
  worker: { displayName: string } | null;
  jobSite: { name: string } | null;
};

type DeadlineRow = {
  id: string;
  title: string;
  dueDate: Date;
  status: "SCHEDULED" | "EXPIRING_SOON" | "EXPIRED" | "DONE" | "ARCHIVED";
  workerId: string | null;
  jobSiteId: string | null;
  worker: { displayName: string } | null;
  jobSite: { name: string } | null;
};

function emptyCounts(): DashboardAttentionCounts {
  return { missing: 0, expired: 0, expiringSoon: 0, toReview: 0 };
}

function documentCountKey(status: DocumentStatus): keyof DashboardAttentionCounts | null {
  if (status === "MISSING") return "missing";
  if (status === "EXPIRED") return "expired";
  if (status === "EXPIRING_SOON") return "expiringSoon";
  if (status === "TO_REVIEW") return "toReview";
  return null;
}

function situationKind(status: DocumentStatus | DeadlineRow["status"]): DashboardSituationKind {
  if (status === "EXPIRED") return "EXPIRED";
  if (status === "EXPIRING_SOON") return "EXPIRING_SOON";
  if (status === "MISSING") return "MISSING";
  return "TO_REVIEW";
}

function statusLabel(kind: DashboardSituationKind) {
  if (kind === "EXPIRED") return "Scaduto";
  if (kind === "EXPIRING_SOON") return "In scadenza";
  if (kind === "MISSING") return "Mancante";
  return "Da verificare";
}

function statusReason(kind: DashboardSituationKind, date?: Date | null) {
  if (kind === "EXPIRED") return date ? "La data registrata e trascorsa." : "Lo stato registrato risulta scaduto.";
  if (kind === "EXPIRING_SOON") return date ? "La data registrata e vicina." : "Lo stato registrato richiede attenzione a breve.";
  if (kind === "MISSING") return "Il documento richiesto non e ancora disponibile.";
  return "Il file e presente, ma le informazioni devono essere confermate.";
}

function statusConsequence(kind: DashboardSituationKind) {
  if (kind === "EXPIRED") return "Controlla il documento e aggiorna la data registrata quando hai nuove informazioni.";
  if (kind === "EXPIRING_SOON") return "Valuta se il documento deve essere aggiornato prima della data registrata.";
  if (kind === "MISSING") return "Il relativo insieme di informazioni resta incompleto finche il documento non viene aggiunto.";
  return "Lo stato resta aperto finche una persona non completa la verifica.";
}

function documentActionLabel(kind: DashboardSituationKind, scope: ResourceScope) {
  if (kind === "EXPIRED") return "Controlla il documento";
  if (kind === "EXPIRING_SOON") return "Apri la scadenza";
  if (kind === "MISSING") return scope.context.permissions.includes("documents:upload") ? "Carica versione" : "Apri il documento";
  return scope.context.permissions.includes("documents:verify") ? "Verifica informazioni" : "Apri il documento";
}

function userLabel(row: AssignmentRow) {
  const profileName = [row.user.firstName, row.user.lastName].filter(Boolean).join(" ").trim();
  return row.user.name?.trim() || profileName || row.user.email;
}

function responsibility(input: {
  actorRole: OrganizationRole;
  currentUserId: string;
  scope: ResourceScope;
  ownerType: DocumentOwnerType | "DEADLINE";
  workerId?: string | null;
  workerLabel?: string | null;
  jobSiteId?: string | null;
  workerAssignments: Map<string, AssignmentRow[]>;
  jobSiteAssignments: Map<string, AssignmentRow[]>;
}) {
  const canAssign = input.scope.context.permissions.includes("assignments:manage");
  const assignmentHref = canAssign && (input.workerId || input.jobSiteId) ? "/access?from=dashboard" : null;

  if (input.ownerType === "ORGANIZATION") {
    return {
      label: canAssign ? "Intervieni tu" : "Intervengono Owner o Admin",
      assignmentHref: null,
    };
  }

  if (input.workerId) {
    if (input.scope.linkedWorker?.id === input.workerId) return { label: "Intervieni tu", assignmentHref: null };
    const assignments = input.workerAssignments.get(input.workerId) ?? [];
    if (assignments.some((assignment) => assignment.userId === input.currentUserId)) return { label: "Intervieni tu", assignmentHref: null };
    if (assignments.length === 1) return { label: `Interviene: ${userLabel(assignments[0])}`, assignmentHref: null };
    if (assignments.length > 1) return { label: `${assignments.length} Collaboratori assegnati`, assignmentHref: null };
    if (input.workerLabel) return { label: `Interviene: ${input.workerLabel}`, assignmentHref };
  }

  if (input.jobSiteId) {
    const assignments = input.jobSiteAssignments.get(input.jobSiteId) ?? [];
    if (assignments.some((assignment) => assignment.userId === input.currentUserId)) return { label: "Intervieni tu", assignmentHref: null };
    if (assignments.length === 1) return { label: `Interviene: ${userLabel(assignments[0])}`, assignmentHref: null };
    if (assignments.length > 1) return { label: `${assignments.length} Collaboratori assegnati`, assignmentHref: null };
  }

  return { label: "Collaboratore non assegnato", assignmentHref };
}

function priority(item: DashboardSituation) {
  const rank: Record<DashboardSituationKind, number> = { EXPIRED: 0, EXPIRING_SOON: 1, MISSING: 2, TO_REVIEW: 3 };
  return rank[item.kind];
}

function sortSituations(items: DashboardSituation[]) {
  return [...items].sort((a, b) => {
    const rank = priority(a) - priority(b);
    if (rank) return rank;
    const aDate = a.date ? new Date(a.date).getTime() : new Date(a.updatedAt).getTime();
    const bDate = b.date ? new Date(b.date).getTime() : new Date(b.updatedAt).getTime();
    return aDate - bDate || a.title.localeCompare(b.title, "it");
  });
}

function contextForDocument(document: Pick<DocumentRow, "ownerType" | "workerId" | "jobSiteId" | "worker" | "jobSite">) {
  if (document.ownerType === "WORKER") return { kind: "WORKER" as const, id: document.workerId, label: document.worker?.displayName ?? "Lavoratore" };
  if (document.ownerType === "JOB_SITE") return { kind: "JOB_SITE" as const, id: document.jobSiteId, label: document.jobSite?.name ?? "Cantiere" };
  return { kind: "ORGANIZATION" as const, id: null, label: "Azienda" };
}

function contextsFromSituations(situations: DashboardSituation[]): DashboardContextItem[] {
  const grouped = new Map<string, DashboardContextItem>();
  for (const situation of situations) {
    if (situation.contextKind === "DEADLINE") continue;
    const key = `${situation.contextKind}:${situation.contextId ?? "organization"}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.situationCount += 1;
      continue;
    }
    const href = situation.contextKind === "WORKER" && situation.contextId
      ? workerDetailsHref(
        { id: situation.contextId, displayName: situation.contextLabel },
        new URLSearchParams({ from: "dashboard" }),
      )
      : situation.contextKind === "JOB_SITE" && situation.contextId
        ? `/job-sites/${situation.contextId}?from=dashboard`
        : "/documents?from=dashboard";
    grouped.set(key, {
      id: key,
      kind: situation.contextKind,
      label: situation.contextLabel,
      situationCount: 1,
      action: { label: "Apri contesto", href },
    });
  }
  return [...grouped.values()]
    .sort((a, b) => b.situationCount - a.situationCount || a.label.localeCompare(b.label, "it"))
    .slice(0, 5);
}

function documentWhere(organizationId: string, scope: ResourceScope) {
  if (scope.fullAccess) return { organizationId, archivedAt: null };
  if (scope.preset === "SITE_MANAGER") {
    return { organizationId, archivedAt: null, ownerType: "JOB_SITE" as const, jobSiteId: { in: scope.siteManagerJobSiteIds } };
  }
  if (scope.linkedWorker) {
    return { organizationId, archivedAt: null, ownerType: "WORKER" as const, workerId: scope.linkedWorker.id };
  }
  return { organizationId, archivedAt: null, id: { in: [] as string[] } };
}

function deadlineWhere(organizationId: string, scope: ResourceScope) {
  const open = { notIn: [...CLOSED_DEADLINE_STATUSES] };
  if (scope.fullAccess) return { organizationId, archivedAt: null, status: open };
  if (scope.preset === "SITE_MANAGER") {
    return { organizationId, archivedAt: null, status: open, jobSiteId: { in: scope.siteManagerJobSiteIds } };
  }
  if (scope.linkedWorker) {
    return {
      organizationId,
      archivedAt: null,
      status: open,
      OR: [{ workerId: scope.linkedWorker.id }, { document: { ownerType: "WORKER" as const, workerId: scope.linkedWorker.id } }],
    };
  }
  return { organizationId, archivedAt: null, id: { in: [] as string[] } };
}

async function loadAttention(input: {
  organizationId: string;
  scope: ResourceScope;
  actorRole: OrganizationRole;
  currentUserId: string;
}) {
  const baseDocumentWhere = documentWhere(input.organizationId, input.scope);
  const baseDeadlineWhere = deadlineWhere(input.organizationId, input.scope);
  const [documentStatusRows, documents, standaloneDeadlineStatusRows, standaloneDeadlines, missingRequirements] = await Promise.all([
    db.document.groupBy({ by: ["status"], where: baseDocumentWhere, _count: { _all: true } }),
    db.document.findMany({
      where: { ...baseDocumentWhere, status: { in: ATTENTION_DOCUMENT_STATUSES } },
      select: {
        id: true,
        title: true,
        status: true,
        ownerType: true,
        workerId: true,
        jobSiteId: true,
        expiryDate: true,
        updatedAt: true,
        worker: { select: { displayName: true } },
        jobSite: { select: { name: true } },
      },
      orderBy: [{ expiryDate: "asc" }, { updatedAt: "asc" }, { id: "asc" }],
      take: DASHBOARD_QUERY_LIMIT,
    }),
    db.deadline.groupBy({
      by: ["status"],
      where: { ...baseDeadlineWhere, documentId: null, status: { in: ["EXPIRED", "EXPIRING_SOON"] } },
      _count: { _all: true },
    }),
    db.deadline.findMany({
      where: { ...baseDeadlineWhere, documentId: null, status: { in: ["EXPIRED", "EXPIRING_SOON"] } },
      select: {
        id: true,
        title: true,
        dueDate: true,
        status: true,
        workerId: true,
        jobSiteId: true,
        worker: { select: { displayName: true } },
        jobSite: { select: { name: true } },
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
      take: DASHBOARD_QUERY_LIMIT,
    }),
    buildMissingDocumentRequirementItemsForScope({ organizationId: input.organizationId, scope: input.scope }),
  ]);

  const workerIds = new Set<string>();
  const jobSiteIds = new Set<string>();
  for (const document of documents) {
    if (document.workerId) workerIds.add(document.workerId);
    if (document.jobSiteId) jobSiteIds.add(document.jobSiteId);
  }
  for (const deadline of standaloneDeadlines) {
    if (deadline.workerId) workerIds.add(deadline.workerId);
    if (deadline.jobSiteId) jobSiteIds.add(deadline.jobSiteId);
  }
  for (const requirement of missingRequirements) {
    if (requirement.workerId) workerIds.add(requirement.workerId);
    if (requirement.jobSiteId) jobSiteIds.add(requirement.jobSiteId);
  }

  const [workerAssignmentRows, jobSiteAssignmentRows] = await Promise.all([
    workerIds.size
      ? db.workerUserLink.findMany({
        where: { organizationId: input.organizationId, workerId: { in: [...workerIds] }, archivedAt: null, user: { suspendedAt: null } },
        select: { workerId: true, userId: true, user: { select: { name: true, firstName: true, lastName: true, email: true } } },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      })
      : Promise.resolve([]),
    jobSiteIds.size
      ? db.jobSiteUserAssignment.findMany({
        where: { organizationId: input.organizationId, jobSiteId: { in: [...jobSiteIds] }, assignmentRole: "SITE_MANAGER", archivedAt: null, user: { suspendedAt: null } },
        select: { jobSiteId: true, userId: true, user: { select: { name: true, firstName: true, lastName: true, email: true } } },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      })
      : Promise.resolve([]),
  ]);

  const workerAssignments = new Map<string, AssignmentRow[]>();
  for (const row of workerAssignmentRows) workerAssignments.set(row.workerId, [...(workerAssignments.get(row.workerId) ?? []), row]);
  const jobSiteAssignments = new Map<string, AssignmentRow[]>();
  for (const row of jobSiteAssignmentRows) jobSiteAssignments.set(row.jobSiteId, [...(jobSiteAssignments.get(row.jobSiteId) ?? []), row]);

  const situations: DashboardSituation[] = documents.map((document: DocumentRow) => {
    const kind = situationKind(document.status);
    const context = contextForDocument(document);
    return {
      id: document.id,
      kind,
      statusLabel: statusLabel(kind),
      title: document.title,
      reason: statusReason(kind, document.expiryDate),
      consequence: statusConsequence(kind),
      contextKind: context.kind,
      contextId: context.id,
      contextLabel: context.label,
      responsibility: responsibility({
        actorRole: input.actorRole,
        currentUserId: input.currentUserId,
        scope: input.scope,
        ownerType: document.ownerType,
        workerId: document.workerId,
        workerLabel: document.worker?.displayName,
        jobSiteId: document.jobSiteId,
        workerAssignments,
        jobSiteAssignments,
      }),
      action: { label: documentActionLabel(kind, input.scope), href: documentDetailsHref(document, new URLSearchParams({ from: "dashboard" })) },
      date: document.expiryDate?.toISOString() ?? null,
      updatedAt: document.updatedAt.toISOString(),
    };
  });

  for (const requirement of missingRequirements as MissingDocumentRequirementItem[]) {
    situations.push({
      id: `missing:${requirement.id}`,
      kind: "MISSING",
      statusLabel: "Mancante",
      title: requirement.documentTypeName,
      reason: `Il requisito configurato "${requirement.requirementName}" non ha ancora un documento collegato.`,
      consequence: statusConsequence("MISSING"),
      contextKind: requirement.ownerType,
      contextId: requirement.workerId ?? requirement.jobSiteId ?? null,
      contextLabel: requirement.ownerLabel,
      responsibility: responsibility({
        actorRole: input.actorRole,
        currentUserId: input.currentUserId,
        scope: input.scope,
        ownerType: requirement.ownerType,
        workerId: requirement.workerId,
        workerLabel: requirement.workerName,
        jobSiteId: requirement.jobSiteId,
        workerAssignments,
        jobSiteAssignments,
      }),
      action: {
        label: input.scope.context.permissions.includes("documents:upload") ? "Aggiungi documento" : "Apri documenti",
        href: "/documents?status=MISSING&from=dashboard",
      },
      date: null,
      updatedAt: new Date(0).toISOString(),
    });
  }

  for (const deadline of standaloneDeadlines as DeadlineRow[]) {
    const kind = situationKind(deadline.status);
    const contextKind = deadline.workerId ? "WORKER" : deadline.jobSiteId ? "JOB_SITE" : "DEADLINE";
    const contextLabel = deadline.worker?.displayName ?? deadline.jobSite?.name ?? "Scadenza manuale";
    situations.push({
      id: `deadline:${deadline.id}`,
      kind,
      statusLabel: statusLabel(kind),
      title: deadline.title,
      reason: "La scadenza inserita dall'utente richiede attenzione.",
      consequence: kind === "EXPIRED" ? "Controlla la data registrata e aggiorna le informazioni disponibili." : "Controlla cosa deve essere preparato prima della data registrata.",
      contextKind,
      contextId: deadline.workerId ?? deadline.jobSiteId,
      contextLabel,
      responsibility: responsibility({
        actorRole: input.actorRole,
        currentUserId: input.currentUserId,
        scope: input.scope,
        ownerType: "DEADLINE",
        workerId: deadline.workerId,
        workerLabel: deadline.worker?.displayName,
        jobSiteId: deadline.jobSiteId,
        workerAssignments,
        jobSiteAssignments,
      }),
      action: { label: "Apri la scadenza", href: "/deadlines?from=dashboard" },
      date: deadline.dueDate.toISOString(),
      updatedAt: deadline.dueDate.toISOString(),
    });
  }

  const counts = emptyCounts();
  for (const row of documentStatusRows) {
    const key = documentCountKey(row.status);
    if (key) counts[key] += row._count._all;
  }
  counts.missing += missingRequirements.length;
  for (const row of standaloneDeadlineStatusRows) {
    if (row.status === "EXPIRED") counts.expired += row._count._all;
    if (row.status === "EXPIRING_SOON") counts.expiringSoon += row._count._all;
  }
  const sorted = sortSituations(situations);
  return {
    counts,
    total: Object.values(counts).reduce((total, count) => total + count, 0),
    situations: sorted.slice(0, DASHBOARD_SITUATION_LIMIT),
    contexts: contextsFromSituations(sorted),
  };
}

async function loadPackages(organizationId: string, canShare: boolean, now: Date): Promise<DashboardPackageItem[]> {
  const packages = await db.documentPackage.findMany({
    where: { organizationId, archivedAt: null, status: { in: ["READY_FOR_REVIEW", "SHARED"] } },
    select: {
      id: true,
      title: true,
      status: true,
      updatedAt: true,
      _count: { select: { items: true } },
      shareLinks: {
        where: { revokedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
        select: { id: true, expiresAt: true },
        orderBy: [{ createdAt: "desc" }],
        take: 1,
      },
    },
    orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
    take: 3,
  });
  return packages.map((documentPackage) => {
    const activeShare = documentPackage.shareLinks[0];
    const hasActiveShareLink = Boolean(activeShare);
    const shareLabel = activeShare
      ? activeShare.expiresAt
        ? `Link attivo fino al ${activeShare.expiresAt.toISOString()}`
        : "Link attivo senza scadenza registrata"
      : canShare
        ? "Pronto per creare un link"
        : "Pronto per revisione; Owner o Admin possono condividerlo";
    return {
      id: documentPackage.id,
      title: documentPackage.title,
      statusLabel: hasActiveShareLink ? "Condiviso" : "Pronto per revisione",
      itemCount: documentPackage._count.items,
      hasActiveShareLink,
      shareLabel,
      updatedAt: documentPackage.updatedAt.toISOString(),
      action: {
        label: hasActiveShareLink ? "Controlla il link" : canShare ? "Condividi pacchetto" : "Apri il pacchetto",
        href: `/document-packages/${documentPackage.id}?from=dashboard`,
      },
    };
  });
}

async function loadDeadlines(organizationId: string, scope: ResourceScope): Promise<DashboardDeadlineItem[]> {
  const deadlines = await db.deadline.findMany({
    where: { ...deadlineWhere(organizationId, scope), status: { in: ["SCHEDULED", "EXPIRING_SOON"] } },
    select: {
      id: true,
      title: true,
      dueDate: true,
      status: true,
      worker: { select: { displayName: true } },
      jobSite: { select: { name: true } },
      document: { select: { title: true } },
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
    take: 3,
  });
  return deadlines.map((deadline) => ({
    id: deadline.id,
    title: deadline.title,
    dueDate: deadline.dueDate.toISOString(),
    timingLabel: deadline.status === "EXPIRING_SOON" ? "In scadenza" : "Data registrata",
    contextLabel: deadline.document?.title ?? deadline.worker?.displayName ?? deadline.jobSite?.name ?? "Scadenza manuale",
    action: { label: "Apri la scadenza", href: "/deadlines?from=dashboard" },
  }));
}

export async function getDashboardData(): Promise<DashboardResponse> {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("organization:read", DASHBOARD_ROLES);
  const scope = await getResourceScope(context);
  const now = new Date();
  const canSeePackages = scope.context.permissions.includes("documentPackages:read");

  const [attentionResult, packageResult, deadlineResult] = await Promise.allSettled([
    loadAttention({ organizationId, scope, actorRole, currentUserId: context.userId }),
    canSeePackages ? loadPackages(organizationId, scope.context.permissions.includes("documentPackages:share"), now) : Promise.resolve([]),
    loadDeadlines(organizationId, scope),
  ]);

  const errors: DashboardResponse["errors"] = [];
  const attention = attentionResult.status === "fulfilled"
    ? attentionResult.value
    : { counts: emptyCounts(), total: 0, situations: [], contexts: [] };
  if (attentionResult.status === "rejected") {
    errors.push({ section: "attention", message: "Non riusciamo a caricare le situazioni operative. Riprova." });
    errors.push({ section: "contexts", message: "I contesti non sono disponibili finche le situazioni non vengono ricaricate." });
  }
  const readyPackages = packageResult.status === "fulfilled" ? packageResult.value : [];
  if (packageResult.status === "rejected") errors.push({ section: "sharing", message: "Non riusciamo a caricare i pacchetti. Riprova." });
  const upcomingDeadlines = deadlineResult.status === "fulfilled" ? deadlineResult.value : [];
  if (deadlineResult.status === "rejected") errors.push({ section: "deadlines", message: "Non riusciamo a caricare le prossime scadenze. Riprova." });

  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "dashboard" });

  return {
    generatedAt: now.toISOString(),
    organization: {
      name: context.support?.organization.name ?? context.company?.organization.name ?? "Azienda",
      role: actorRole,
      roleLabel: roleLabels[actorRole],
      viewLabel: scope.fullAccess ? "Tutta l'azienda" : scope.preset === "SITE_MANAGER" ? "Cantieri assegnati" : "I miei dati",
    },
    attention: {
      total: attention.total,
      counts: attention.counts,
      situations: attention.situations,
    },
    readyPackages,
    upcomingDeadlines,
    contexts: attention.contexts,
    availability: {
      sharing: canSeePackages,
      contexts: true,
    },
    firstUse: errors.length === 0
      && actorRole === "OWNER"
      && attention.total === 0
      && readyPackages.length === 0
      && upcomingDeadlines.length === 0,
    errors,
  };
}
