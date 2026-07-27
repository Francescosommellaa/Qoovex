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
  JobSiteWorkerAssignmentResponse,
  OrganizationAccessPreset,
  OrganizationRole,
  WorkerUserLinkResponse,
} from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { trimOptionalId } from "./document-domain-validation";
import { requireOrganizationDomainAccess } from "./domain-access-service";
import { auditActorFromContext, recordProductAuditEventBestEffort } from "./product-audit-service";
import { getResourceScope, toMyResourceScopeResponse } from "./resource-scope-service";

const ASSIGNMENT_MANAGE_ROLES = ["OWNER", "ADMIN"] as const;
const ASSIGNMENT_READ_ROLES = ["OWNER", "ADMIN", "SAFETY_CONSULTANT"] as const;
const MY_SCOPE_ROLES = ["OWNER", "ADMIN", "MEMBER", "VIEWER", "SAFETY_CONSULTANT", "SITE_MANAGER", "WORKER"] as const;

interface ListWorkerUserLinksInput {
  workerId?: unknown;
}

interface ListJobSiteUserAssignmentsInput {
  jobSiteId?: unknown;
}

interface ListJobSiteWorkerAssignmentsInput {
  jobSiteId?: unknown;
  workerId?: unknown;
}

function parseRequiredId(value: unknown, label: string) {
  const id = trimOptionalId(value, label);
  if (!id) throw new AccessError(`${label} non valido.`, 409);
  return id;
}

function userLabel(user: { name: string | null; email: string }) {
  return user.name?.trim() || user.email;
}

function assertExpectedCompanyAccess(
  membership: { role: OrganizationRole; preset: OrganizationAccessPreset | null },
  expectedLegacyRole: OrganizationRole,
  expectedPreset: OrganizationAccessPreset,
  label: string,
) {
  if (membership.role !== expectedLegacyRole && membership.preset !== expectedPreset) {
    throw new AccessError(`${label} non disponibile per questa assegnazione.`, 409);
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
    where: { organizationId, userId, revokedAt: null },
    select: { id: true, role: true, preset: true, user: { select: { id: true, name: true, email: true } } },
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
  assignmentRole: "SITE_MANAGER";
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
    jobSiteName: assignment.jobSite.name,
    workerDisplayName: assignment.worker.displayName,
    workerRoleLabel: assignment.worker.roleLabel,
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
  assertExpectedCompanyAccess(membership, "WORKER", "LIMITED_UPLOAD", "Utente");

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
  const assignments = await db.jobSiteUserAssignment.findMany({
    where: { organizationId, archivedAt: null, ...(jobSiteId ? { jobSiteId } : {}) },
    select: {
      id: true,
      jobSiteId: true,
      userId: true,
      assignmentRole: true,
      assignedById: true,
      createdAt: true,
      updatedAt: true,
      archivedAt: true,
      jobSite: { select: { name: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: [{ createdAt: "desc" }],
  });
  return assignments.map(toJobSiteUserAssignmentResponse);
}

export async function createJobSiteUserAssignment(input: CreateJobSiteUserAssignmentInput | Record<string, unknown>) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("assignments:manage", ASSIGNMENT_MANAGE_ROLES);
  const jobSiteId = parseRequiredId(input.jobSiteId, "Cantiere");
  const userId = parseRequiredId(input.userId, "Utente");
  await assertActiveJobSite(organizationId, jobSiteId);
  const membership = await assertActiveMembership(organizationId, userId);
  assertExpectedCompanyAccess(membership, "SITE_MANAGER", "SITE_MANAGER", "Utente");

  const duplicate = await db.jobSiteUserAssignment.findFirst({
    where: { organizationId, jobSiteId, userId, assignmentRole: "SITE_MANAGER", archivedAt: null },
    select: { id: true },
  });
  if (duplicate) throw new AccessError("Cantiere gia assegnato a questo utente.", 409);

  const assignment = await db.jobSiteUserAssignment.create({
    data: { organizationId, jobSiteId, userId, assignmentRole: "SITE_MANAGER", assignedById: context.userId },
    select: {
      id: true,
      jobSiteId: true,
      userId: true,
      assignmentRole: true,
      assignedById: true,
      createdAt: true,
      updatedAt: true,
      archivedAt: true,
      jobSite: { select: { name: true } },
      user: { select: { name: true, email: true } },
    },
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
  const existing = await db.jobSiteUserAssignment.findFirst({ where: { id: assignmentId, organizationId, archivedAt: null }, select: { id: true } });
  if (!existing) throw new AccessError("Assegnazione cantiere non trovata.", 404);
  const assignment = await db.jobSiteUserAssignment.update({
    where: { id: existing.id },
    data: { archivedAt: new Date() },
    select: {
      id: true,
      jobSiteId: true,
      userId: true,
      assignmentRole: true,
      assignedById: true,
      createdAt: true,
      updatedAt: true,
      archivedAt: true,
      jobSite: { select: { name: true } },
      user: { select: { name: true, email: true } },
    },
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
  const assignments = await db.jobSiteWorkerAssignment.findMany({
    where: {
      organizationId,
      archivedAt: null,
      ...(jobSiteId ? { jobSiteId } : {}),
      ...(workerId ? { workerId } : {}),
    },
    select: {
      id: true,
      jobSiteId: true,
      workerId: true,
      assignedById: true,
      createdAt: true,
      updatedAt: true,
      archivedAt: true,
      jobSite: { select: { name: true } },
      worker: { select: { displayName: true, roleLabel: true } },
    },
    orderBy: [{ createdAt: "desc" }],
  });
  return assignments.map(toJobSiteWorkerAssignmentResponse);
}

export async function createJobSiteWorkerAssignment(input: CreateJobSiteWorkerAssignmentInput | Record<string, unknown>) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("assignments:manage", ASSIGNMENT_MANAGE_ROLES);
  const jobSiteId = parseRequiredId(input.jobSiteId, "Cantiere");
  const workerId = parseRequiredId(input.workerId, "Lavoratore");
  await Promise.all([assertActiveJobSite(organizationId, jobSiteId), assertActiveWorker(organizationId, workerId)]);

  const duplicate = await db.jobSiteWorkerAssignment.findFirst({
    where: { organizationId, jobSiteId, workerId, archivedAt: null },
    select: { id: true },
  });
  if (duplicate) throw new AccessError("Cantiere gia assegnato a questo lavoratore.", 409);

  const assignment = await db.jobSiteWorkerAssignment.create({
    data: { organizationId, jobSiteId, workerId, assignedById: context.userId },
    select: {
      id: true,
      jobSiteId: true,
      workerId: true,
      assignedById: true,
      createdAt: true,
      updatedAt: true,
      archivedAt: true,
      jobSite: { select: { name: true } },
      worker: { select: { displayName: true, roleLabel: true } },
    },
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
  const existing = await db.jobSiteWorkerAssignment.findFirst({ where: { id: assignmentId, organizationId, archivedAt: null }, select: { id: true } });
  if (!existing) throw new AccessError("Assegnazione lavoratore-cantiere non trovata.", 404);
  const assignment = await db.jobSiteWorkerAssignment.update({
    where: { id: existing.id },
    data: { archivedAt: new Date() },
    select: {
      id: true,
      jobSiteId: true,
      workerId: true,
      assignedById: true,
      createdAt: true,
      updatedAt: true,
      archivedAt: true,
      jobSite: { select: { name: true } },
      worker: { select: { displayName: true, roleLabel: true } },
    },
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
  if (!(MY_SCOPE_ROLES as readonly OrganizationRole[]).includes(scope.actorRole)) throw new AccessError("Risorsa non disponibile.", 404);
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
      where: {
        organizationId,
        revokedAt: null,
        OR: [
          { role: { in: ["SITE_MANAGER", "WORKER"] } },
          { preset: { in: ["SITE_MANAGER", "LIMITED_UPLOAD"] } },
        ],
      },
      select: { role: true, preset: true, user: { select: { id: true, name: true, email: true } } },
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
      role: membership.preset === "SITE_MANAGER" ? "SITE_MANAGER" : membership.preset === "LIMITED_UPLOAD" ? "WORKER" : membership.role,
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
      OR: [{ role: "WORKER" }, { preset: "LIMITED_UPLOAD" }],
      user: { workerUserLinks: { none: { organizationId, archivedAt: null } } },
    },
    select: { user: { select: { id: true, name: true, email: true } } },
    orderBy: [{ createdAt: "asc" }],
  });
  return memberships.map(({ user }) => ({ id: user.id, label: userLabel(user), email: user.email }));
}
