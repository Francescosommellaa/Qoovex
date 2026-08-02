import "server-only";

import { db } from "@qoovex/db";
import type {
  ArchiveJobSiteUserAssignmentResponse,
  ArchiveJobSiteWorkerAssignmentResponse,
  ArchiveWorkerUserLinkResponse,
  CreateJobSiteUserAssignmentInput,
  CreateJobSiteWorkerAssignmentInput,
  CreateWorkerUserLinkInput,
  JobSiteUserAssignmentResponse,
  JobSiteUserAssignmentRole,
  JobSiteWorkerAssignmentResponse,
  OrganizationAccessPreset,
  OrganizationPermission,
  WorkerUserLinkResponse,
} from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { isEnumValue, parseOptionalDate, trimOptionalId, trimOptionalText } from "./document-domain-validation";
import { requireOrganizationDomainAccess } from "./domain-access-service";
import { auditActorFromContext, recordProductAuditEventBestEffort } from "./product-audit-service";
import { getResourceScope, toMyResourceScopeResponse } from "./resource-scope-service";

const ASSIGNMENT_MANAGE_ROLES = ["OWNER", "COLLABORATOR"] as const;
const ASSIGNMENT_READ_ROLES = ["OWNER", "COLLABORATOR"] as const;
const MY_SCOPE_ROLES = ["OWNER", "COLLABORATOR"] as const;
const JOB_SITE_USER_ASSIGNMENT_ROLES = ["SITE_MANAGER", "DOCUMENT_REVIEWER", "CONTRIBUTOR"] as const satisfies readonly JobSiteUserAssignmentRole[];

const jobSiteUserAssignmentSelect = {
  id: true,
  jobSiteId: true,
  userId: true,
  assignmentRole: true,
  operationalRoleLabel: true,
  taskLabel: true,
  startsAt: true,
  endsAt: true,
  endedById: true,
  endReason: true,
  assignedById: true,
  createdAt: true,
  updatedAt: true,
  archivedAt: true,
  jobSite: { select: { name: true } },
  user: { select: { name: true, email: true } },
} as const;

const jobSiteWorkerAssignmentSelect = {
  id: true,
  jobSiteId: true,
  workerId: true,
  operationalRoleLabel: true,
  taskLabel: true,
  startsAt: true,
  endsAt: true,
  endedById: true,
  endReason: true,
  assignedById: true,
  createdAt: true,
  updatedAt: true,
  archivedAt: true,
  jobSite: { select: { name: true } },
  worker: { select: { displayName: true, roleLabel: true } },
} as const;

function parseAssignmentRole(value: unknown): JobSiteUserAssignmentRole {
  if (value === undefined) return "SITE_MANAGER";
  if (!isEnumValue(JOB_SITE_USER_ASSIGNMENT_ROLES, value)) throw new AccessError("Ruolo operativo cantiere non valido.", 409);
  return value;
}

function normalizeAssignmentPeriod(input: { startsAt?: unknown; endsAt?: unknown }) {
  const startsAt = parseOptionalDate(input.startsAt, "Inizio assegnazione") ?? new Date();
  const endsAt = parseOptionalDate(input.endsAt, "Fine assegnazione") ?? null;
  if (endsAt && endsAt <= startsAt) throw new AccessError("La fine assegnazione deve essere successiva all'inizio.", 409);
  return { startsAt, endsAt };
}

interface ListWorkerUserLinksInput {
  workerId?: unknown;
}

interface ListJobSiteUserAssignmentsInput {
  jobSiteId?: unknown;
  includeHistory?: unknown;
}

interface ListJobSiteWorkerAssignmentsInput {
  jobSiteId?: unknown;
  workerId?: unknown;
  includeHistory?: unknown;
}

function parseIncludeHistory(value: unknown) {
  if (value === undefined) return false;
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  throw new AccessError("Filtro storico assegnazioni non valido.", 409);
}

function assignmentStatus(assignment: { startsAt?: Date | null; endsAt?: Date | null; archivedAt: Date | null }, now = new Date()) {
  const startsAt = assignment.startsAt ?? now;
  if (assignment.archivedAt) return assignment.endsAt && assignment.endsAt < startsAt ? "CANCELLED" as const : "ENDED" as const;
  if (startsAt > now) return "SCHEDULED" as const;
  if (assignment.endsAt && assignment.endsAt <= now) return "ENDED" as const;
  return "ACTIVE" as const;
}

function parseRequiredId(value: unknown, label: string) {
  const id = trimOptionalId(value, label);
  if (!id) throw new AccessError(`${label} non valido.`, 409);
  return id;
}

function userLabel(user: { name: string | null; email: string }) {
  return user.name?.trim() || user.email;
}

function assertExpectedAccessPreset(preset: OrganizationAccessPreset | null, expected: OrganizationAccessPreset, label: string) {
  if (preset !== expected) throw new AccessError(`${label} non disponibile per questa assegnazione.`, 409);
}

function assertAssignmentPermission(permissionKeys: readonly string[], assignmentRole: JobSiteUserAssignmentRole) {
  const requiredPermission: OrganizationPermission = assignmentRole === "DOCUMENT_REVIEWER" ? "documents:read" : "jobSites:read";
  if (!permissionKeys.includes(requiredPermission)) {
    throw new AccessError("Il Collaboratore non dispone dei permessi richiesti per questa assegnazione.", 409);
  }
}

async function assertActiveWorker(organizationId: string, workerId: string) {
  const worker = await db.worker.findFirst({
    where: { id: workerId, organizationId, archivedAt: null },
    select: { id: true, displayName: true, roleLabel: true },
  });
  if (!worker) throw new AccessError("Lavoratore non trovato.", 404);
  return worker;
}

async function assertActiveJobSite(organizationId: string, jobSiteId: string) {
  const jobSite = await db.jobSite.findFirst({
    where: { id: jobSiteId, organizationId, archivedAt: null },
    select: { id: true, name: true },
  });
  if (!jobSite) throw new AccessError("Cantiere non trovato.", 404);
  return jobSite;
}

async function assertActiveMembership(organizationId: string, userId: string) {
  const membership = await db.organizationMembership.findFirst({
    where: { organizationId, userId, revokedAt: null, role: "COLLABORATOR", OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    select: { id: true, role: true, preset: true, permissionKeys: true, user: { select: { id: true, name: true, email: true } } },
  });
  if (!membership) throw new AccessError("Utente non disponibile per questa azienda.", 404);
  return membership;
}

function toWorkerUserLinkResponse(link: {
  id: string;
  workerId: string;
  userId: string;
  linkedById: string;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
  worker: { displayName: string };
  user: { name: string | null; email: string };
}): WorkerUserLinkResponse {
  return {
    id: link.id,
    workerId: link.workerId,
    userId: link.userId,
    linkedById: link.linkedById,
    workerDisplayName: link.worker.displayName,
    userLabel: userLabel(link.user),
    userEmail: link.user.email,
    createdAt: link.createdAt.toISOString(),
    updatedAt: link.updatedAt.toISOString(),
    archivedAt: link.archivedAt?.toISOString() ?? null,
  };
}

function toJobSiteUserAssignmentResponse(assignment: {
  id: string;
  jobSiteId: string;
  userId: string;
  assignmentRole: JobSiteUserAssignmentRole;
  operationalRoleLabel?: string | null;
  taskLabel?: string | null;
  startsAt?: Date | null;
  endsAt?: Date | null;
  endedById?: string | null;
  endReason?: string | null;
  assignedById: string;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
  jobSite: { name: string };
  user: { name: string | null; email: string };
}): JobSiteUserAssignmentResponse {
  return {
    id: assignment.id,
    jobSiteId: assignment.jobSiteId,
    userId: assignment.userId,
    assignmentRole: assignment.assignmentRole,
    assignmentStatus: assignmentStatus(assignment),
    operationalRoleLabel: assignment.operationalRoleLabel ?? null,
    taskLabel: assignment.taskLabel ?? null,
    startsAt: (assignment.startsAt ?? assignment.createdAt).toISOString(),
    endsAt: assignment.endsAt?.toISOString() ?? null,
    endedById: assignment.endedById ?? null,
    endReason: assignment.endReason ?? null,
    assignedById: assignment.assignedById,
    jobSiteName: assignment.jobSite.name,
    userLabel: userLabel(assignment.user),
    userEmail: assignment.user.email,
    createdAt: assignment.createdAt.toISOString(),
    updatedAt: assignment.updatedAt.toISOString(),
    archivedAt: assignment.archivedAt?.toISOString() ?? null,
  };
}

function toJobSiteWorkerAssignmentResponse(assignment: {
  id: string;
  jobSiteId: string;
  workerId: string;
  assignedById: string;
  operationalRoleLabel?: string | null;
  taskLabel?: string | null;
  startsAt?: Date | null;
  endsAt?: Date | null;
  endedById?: string | null;
  endReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
  jobSite: { name: string };
  worker: { displayName: string; roleLabel: string | null };
}): JobSiteWorkerAssignmentResponse {
  return {
    id: assignment.id,
    jobSiteId: assignment.jobSiteId,
    workerId: assignment.workerId,
    assignedById: assignment.assignedById,
    assignmentStatus: assignmentStatus(assignment),
    jobSiteName: assignment.jobSite.name,
    workerDisplayName: assignment.worker.displayName,
    workerRoleLabel: assignment.worker.roleLabel,
    operationalRoleLabel: assignment.operationalRoleLabel ?? null,
    taskLabel: assignment.taskLabel ?? null,
    startsAt: (assignment.startsAt ?? assignment.createdAt).toISOString(),
    endsAt: assignment.endsAt?.toISOString() ?? null,
    endedById: assignment.endedById ?? null,
    endReason: assignment.endReason ?? null,
    createdAt: assignment.createdAt.toISOString(),
    updatedAt: assignment.updatedAt.toISOString(),
    archivedAt: assignment.archivedAt?.toISOString() ?? null,
  };
}

export async function listWorkerUserLinks(input: ListWorkerUserLinksInput = {}) {
  const { organizationId } = await requireOrganizationDomainAccess("assignments:read", ASSIGNMENT_READ_ROLES);
  const workerId = trimOptionalId(input.workerId, "Lavoratore");
  const links = await db.workerUserLink.findMany({
    where: { organizationId, archivedAt: null, ...(workerId ? { workerId } : {}) },
    select: {
      id: true,
      workerId: true,
      userId: true,
      linkedById: true,
      createdAt: true,
      updatedAt: true,
      archivedAt: true,
      worker: { select: { displayName: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: [{ createdAt: "desc" }],
  });
  return links.map(toWorkerUserLinkResponse);
}

export async function createWorkerUserLink(input: CreateWorkerUserLinkInput | Record<string, unknown>) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("assignments:manage", ASSIGNMENT_MANAGE_ROLES);
  const workerId = parseRequiredId(input.workerId, "Lavoratore");
  const userId = parseRequiredId(input.userId, "Utente");
  const [worker, membership] = await Promise.all([
    assertActiveWorker(organizationId, workerId),
    assertActiveMembership(organizationId, userId),
  ]);
  assertExpectedAccessPreset(membership.preset, "LIMITED_UPLOAD", "Utente");

  const duplicate = await db.workerUserLink.findFirst({
    where: { organizationId, archivedAt: null, OR: [{ workerId }, { userId }] },
    select: { id: true },
  });
  if (duplicate) throw new AccessError("Collegamento operativo gia presente.", 409);

  const link = await db.workerUserLink.create({
    data: { organizationId, workerId, userId, linkedById: context.userId },
    select: {
      id: true,
      workerId: true,
      userId: true,
      linkedById: true,
      createdAt: true,
      updatedAt: true,
      archivedAt: true,
      worker: { select: { displayName: true } },
      user: { select: { name: true, email: true } },
    },
  });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "WORKER_USER_LINK_CREATED",
    entityType: "WORKER_USER_LINK",
    entityId: link.id,
    metadata: { entityType: "WorkerUserLink", reasonCode: "created" },
  });
  return toWorkerUserLinkResponse({ ...link, worker: { displayName: worker.displayName } });
}

export async function archiveWorkerUserLink(linkId: string): Promise<ArchiveWorkerUserLinkResponse> {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("assignments:manage", ASSIGNMENT_MANAGE_ROLES);
  const existing = await db.workerUserLink.findFirst({ where: { id: linkId, organizationId, archivedAt: null }, select: { id: true } });
  if (!existing) throw new AccessError("Collegamento operativo non trovato.", 404);
  const link = await db.workerUserLink.update({
    where: { id: existing.id },
    data: { archivedAt: new Date() },
    select: {
      id: true,
      workerId: true,
      userId: true,
      linkedById: true,
      createdAt: true,
      updatedAt: true,
      archivedAt: true,
      worker: { select: { displayName: true } },
      user: { select: { name: true, email: true } },
    },
  });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "WORKER_USER_LINK_ARCHIVED",
    entityType: "WORKER_USER_LINK",
    entityId: link.id,
    metadata: { entityType: "WorkerUserLink", reasonCode: "archived" },
  });
  return { link: toWorkerUserLinkResponse(link), archived: true };
}

export async function listJobSiteUserAssignments(input: ListJobSiteUserAssignmentsInput = {}) {
  const { organizationId } = await requireOrganizationDomainAccess("assignments:read", ASSIGNMENT_READ_ROLES);
  const jobSiteId = trimOptionalId(input.jobSiteId, "Cantiere");
  const includeHistory = parseIncludeHistory(input.includeHistory);
  const assignments = await db.jobSiteUserAssignment.findMany({
    where: { organizationId, ...(includeHistory ? {} : { archivedAt: null }), ...(jobSiteId ? { jobSiteId } : {}) },
    select: jobSiteUserAssignmentSelect,
    orderBy: [{ createdAt: "desc" }],
  });
  return assignments.map(toJobSiteUserAssignmentResponse);
}

export async function createJobSiteUserAssignment(input: CreateJobSiteUserAssignmentInput | Record<string, unknown>) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("assignments:manage", ASSIGNMENT_MANAGE_ROLES);
  const jobSiteId = parseRequiredId(input.jobSiteId, "Cantiere");
  const userId = parseRequiredId(input.userId, "Utente");
  const assignmentRole = parseAssignmentRole(input.assignmentRole);
  const operationalRoleLabel = trimOptionalText(input.operationalRoleLabel, "Ruolo operativo", 120) ?? null;
  const taskLabel = trimOptionalText(input.taskLabel, "Mansione", 160) ?? null;
  const period = normalizeAssignmentPeriod(input);
  await assertActiveJobSite(organizationId, jobSiteId);
  const membership = await assertActiveMembership(organizationId, userId);
  assertAssignmentPermission(membership.permissionKeys, assignmentRole);

  const duplicate = await db.jobSiteUserAssignment.findFirst({
    where: { organizationId, jobSiteId, userId, assignmentRole, archivedAt: null },
    select: { id: true },
  });
  if (duplicate) throw new AccessError("Cantiere gia assegnato a questo utente.", 409);

  const assignment = await db.$transaction(async (tx) => {
    const created = await tx.jobSiteUserAssignment.create({ data: { organizationId, jobSiteId, userId, assignmentRole, operationalRoleLabel, taskLabel, ...period, assignedById: context.userId }, select: jobSiteUserAssignmentSelect });
    return created;
  });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "JOB_SITE_USER_ASSIGNMENT_CREATED",
    entityType: "JOB_SITE_USER_ASSIGNMENT",
    entityId: assignment.id,
    metadata: { entityType: "JobSiteUserAssignment", reasonCode: "created" },
  });
  return toJobSiteUserAssignmentResponse(assignment);
}

export async function archiveJobSiteUserAssignment(assignmentId: string): Promise<ArchiveJobSiteUserAssignmentResponse> {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("assignments:manage", ASSIGNMENT_MANAGE_ROLES);
  const existing = await db.jobSiteUserAssignment.findFirst({ where: { id: assignmentId, organizationId, archivedAt: null }, select: { id: true, jobSiteId: true, startsAt: true } });
  if (!existing) throw new AccessError("Assegnazione cantiere non trovata.", 404);
  const endedAt = new Date();
  const cancelled = existing.startsAt > endedAt;
  const endReason = cancelled ? "Assegnazione pianificata annullata manualmente." : "Assegnazione conclusa manualmente.";
  const assignment = await db.$transaction(async (tx) => {
    const updated = await tx.jobSiteUserAssignment.update({ where: { id: existing.id }, data: { endsAt: endedAt, endedById: context.userId, endReason, archivedAt: endedAt }, select: jobSiteUserAssignmentSelect });
    return updated;
  });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "JOB_SITE_USER_ASSIGNMENT_ARCHIVED",
    entityType: "JOB_SITE_USER_ASSIGNMENT",
    entityId: assignment.id,
    metadata: { entityType: "JobSiteUserAssignment", reasonCode: "archived" },
  });
  return { assignment: toJobSiteUserAssignmentResponse(assignment), archived: true };
}

export async function listJobSiteWorkerAssignments(input: ListJobSiteWorkerAssignmentsInput = {}) {
  const { organizationId } = await requireOrganizationDomainAccess("assignments:read", ASSIGNMENT_READ_ROLES);
  const jobSiteId = trimOptionalId(input.jobSiteId, "Cantiere");
  const workerId = trimOptionalId(input.workerId, "Lavoratore");
  const includeHistory = parseIncludeHistory(input.includeHistory);
  const assignments = await db.jobSiteWorkerAssignment.findMany({
    where: {
      organizationId,
      ...(includeHistory ? {} : { archivedAt: null }),
      ...(jobSiteId ? { jobSiteId } : {}),
      ...(workerId ? { workerId } : {}),
    },
    select: jobSiteWorkerAssignmentSelect,
    orderBy: [{ createdAt: "desc" }],
  });
  return assignments.map(toJobSiteWorkerAssignmentResponse);
}

export async function createJobSiteWorkerAssignment(input: CreateJobSiteWorkerAssignmentInput | Record<string, unknown>) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("assignments:manage", ASSIGNMENT_MANAGE_ROLES);
  const jobSiteId = parseRequiredId(input.jobSiteId, "Cantiere");
  const workerId = parseRequiredId(input.workerId, "Lavoratore");
  const operationalRoleLabel = trimOptionalText(input.operationalRoleLabel, "Ruolo operativo", 120) ?? null;
  const taskLabel = trimOptionalText(input.taskLabel, "Mansione", 160) ?? null;
  const period = normalizeAssignmentPeriod(input);
  await Promise.all([assertActiveJobSite(organizationId, jobSiteId), assertActiveWorker(organizationId, workerId)]);

  const duplicate = await db.jobSiteWorkerAssignment.findFirst({
    where: { organizationId, jobSiteId, workerId, archivedAt: null },
    select: { id: true },
  });
  if (duplicate) throw new AccessError("Cantiere gia assegnato a questo lavoratore.", 409);

  const assignment = await db.$transaction(async (tx) => {
    const created = await tx.jobSiteWorkerAssignment.create({ data: { organizationId, jobSiteId, workerId, operationalRoleLabel, taskLabel, ...period, assignedById: context.userId }, select: jobSiteWorkerAssignmentSelect });
    return created;
  });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "JOB_SITE_WORKER_ASSIGNMENT_CREATED",
    entityType: "JOB_SITE_WORKER_ASSIGNMENT",
    entityId: assignment.id,
    metadata: { entityType: "JobSiteWorkerAssignment", reasonCode: "created" },
  });
  return toJobSiteWorkerAssignmentResponse(assignment);
}

export async function archiveJobSiteWorkerAssignment(assignmentId: string): Promise<ArchiveJobSiteWorkerAssignmentResponse> {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("assignments:manage", ASSIGNMENT_MANAGE_ROLES);
  const existing = await db.jobSiteWorkerAssignment.findFirst({ where: { id: assignmentId, organizationId, archivedAt: null }, select: { id: true, jobSiteId: true, startsAt: true } });
  if (!existing) throw new AccessError("Assegnazione lavoratore-cantiere non trovata.", 404);
  const endedAt = new Date();
  const cancelled = existing.startsAt > endedAt;
  const endReason = cancelled ? "Assegnazione pianificata annullata manualmente." : "Assegnazione conclusa manualmente.";
  const assignment = await db.$transaction(async (tx) => {
    const updated = await tx.jobSiteWorkerAssignment.update({ where: { id: existing.id }, data: { endsAt: endedAt, endedById: context.userId, endReason, archivedAt: endedAt }, select: jobSiteWorkerAssignmentSelect });
    return updated;
  });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "JOB_SITE_WORKER_ASSIGNMENT_ARCHIVED",
    entityType: "JOB_SITE_WORKER_ASSIGNMENT",
    entityId: assignment.id,
    metadata: { entityType: "JobSiteWorkerAssignment", reasonCode: "archived" },
  });
  return { assignment: toJobSiteWorkerAssignmentResponse(assignment), archived: true };
}

export async function getMyResourceScope() {
  const scope = await getResourceScope();
  return toMyResourceScopeResponse(scope);
}

export async function getResourceAssignmentOptions() {
  const { organizationId } = await requireOrganizationDomainAccess("assignments:read", ASSIGNMENT_READ_ROLES);
  const [workers, jobSites, memberships] = await Promise.all([
    db.worker.findMany({
      where: { organizationId, archivedAt: null },
      select: { id: true, displayName: true, roleLabel: true, status: true },
      orderBy: [{ displayName: "asc" }],
    }),
    db.jobSite.findMany({
      where: { organizationId, archivedAt: null },
      select: { id: true, name: true, status: true },
      orderBy: [{ name: "asc" }],
    }),
    db.organizationMembership.findMany({
      where: { organizationId, revokedAt: null, role: "COLLABORATOR", OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
      select: { role: true, preset: true, permissionKeys: true, user: { select: { id: true, name: true, email: true } } },
      orderBy: [{ createdAt: "asc" }],
    }),
  ]);
  return {
    workers,
    jobSites,
    users: memberships.map((membership) => ({
      id: membership.user.id,
      label: userLabel(membership.user),
      email: membership.user.email,
      role: membership.role,
      preset: membership.preset,
      permissionKeys: membership.permissionKeys,
    })),
  };
}

export async function getWorkerUserLinkOptions(workerId: string) {
  const { organizationId } = await requireOrganizationDomainAccess("assignments:manage", ASSIGNMENT_MANAGE_ROLES);
  await assertActiveWorker(organizationId, parseRequiredId(workerId, "Lavoratore"));
  const memberships = await db.organizationMembership.findMany({
    where: {
      organizationId,
      revokedAt: null,
      role: "COLLABORATOR",
      preset: "LIMITED_UPLOAD",
      user: { workerUserLinks: { none: { organizationId, archivedAt: null } } },
    },
    select: { user: { select: { id: true, name: true, email: true } } },
    orderBy: [{ createdAt: "asc" }],
  });
  return memberships.map(({ user }) => ({ id: user.id, label: userLabel(user), email: user.email }));
}
