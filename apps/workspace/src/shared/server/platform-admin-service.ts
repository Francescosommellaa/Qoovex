import "server-only";

import { db, Prisma, type RuntimeErrorStatus } from "@qoovex/db";
import { AccessError } from "@shared/server/access-errors";
import { requireIdentity } from "@shared/server/access-context-service";
import { requireQoovexOperatorById } from "@shared/server/qoovex-operator-access";

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 50;

function parseLimit(value: string | number | null | undefined) {
  const parsed = Number(value ?? DEFAULT_LIMIT);
  if (!Number.isInteger(parsed) || parsed < 1) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

function parseReason(value: string | null | undefined) {
  const reason = value?.trim() ?? "";
  if (reason.length < 8 || reason.length > 500) {
    throw new AccessError("Indica un motivo specifico da 8 a 500 caratteri.", 409);
  }
  return reason;
}

export async function requireQoovexOperator() {
  const identity = await requireIdentity();
  return requireQoovexOperatorById(identity.id);
}

async function recordPlatformUserAction(input: {
  actorId: string;
  targetUserId: string;
  targetEmail: string;
  type: string;
  reason: string;
}) {
  await db.securityAuditEvent.create({
    data: {
      userId: input.targetUserId,
      email: input.targetEmail,
      type: input.type,
      metadata: { actorUserId: input.actorId, reason: input.reason },
    },
    select: { id: true },
  });
}

async function getManageableUser(actorId: string, targetUserId: string) {
  const target = await db.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, email: true, platformRole: true, suspendedAt: true },
  });
  if (!target) throw new AccessError("Utente non trovato.", 404);
  if (target.id === actorId || target.platformRole === "SUPER_ADMIN") {
    throw new AccessError("Questo account operatore non puo essere modificato dalla console.", 409);
  }
  return target;
}

export async function getPlatformAdminOverview() {
  await requireQoovexOperator();
  const now = new Date();
  const [users, suspendedUsers, organizations, activeSupportSessions, openErrors, failedJobs, failedEmails] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { suspendedAt: { not: null } } }),
    db.organization.count(),
    db.supportSession.count({ where: { endedAt: null, expiresAt: { gt: now } } }),
    db.runtimeErrorEvent.count({ where: { status: "OPEN" } }),
    db.dataControlJob.count({ where: { status: "FAILED" } }),
    db.notificationEmailDelivery.count({ where: { status: "FAILED" } }),
  ]);
  return { users, suspendedUsers, organizations, activeSupportSessions, openErrors, failedJobs, failedEmails, generatedAt: now.toISOString() };
}

export async function listPlatformUsers(input: { q?: string | null; status?: string | null; cursor?: string | null; limit?: string | number | null }) {
  await requireQoovexOperator();
  const q = input.q?.trim() ?? "";
  const limit = parseLimit(input.limit);
  const where: Prisma.UserWhereInput = {};
  if (input.status === "suspended") where.suspendedAt = { not: null };
  if (input.status === "active") where.suspendedAt = null;
  if (q) {
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { username: { contains: q, mode: "insensitive" } },
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { organizationMemberships: { some: { revokedAt: null, organization: { OR: [
        { name: { contains: q, mode: "insensitive" } },
        { code: { contains: q, mode: "insensitive" } },
      ] } } } },
    ];
  }
  const users = await db.user.findMany({
    where,
    select: {
      id: true, email: true, username: true, firstName: true, lastName: true, platformRole: true,
      emailVerified: true, mfaEnabled: true, suspendedAt: true, suspensionReason: true, createdAt: true,
      organizationMemberships: {
        where: { revokedAt: null },
        take: 3,
        select: { role: true, organization: { select: { id: true, name: true, code: true } } },
      },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    cursor: input.cursor ? { id: input.cursor } : undefined,
    skip: input.cursor ? 1 : 0,
    take: limit + 1,
  });
  const next = users.length > limit ? users.pop() : undefined;
  return { users, nextCursor: next?.id ?? null };
}

export async function getPlatformUserDetail(userId: string) {
  await requireQoovexOperator();
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true, email: true, username: true, firstName: true, lastName: true, platformRole: true,
      emailVerified: true, mfaEnabled: true, suspendedAt: true, suspensionReason: true, createdAt: true, updatedAt: true,
      _count: { select: { sessions: true } },
      organizationMemberships: {
        where: { revokedAt: null },
        select: { id: true, role: true, createdAt: true, organization: { select: { id: true, name: true, code: true } } },
        orderBy: { createdAt: "asc" },
      },
      securityEvents: {
        select: { id: true, type: true, metadata: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
  if (!user) throw new AccessError("Utente non trovato.", 404);
  return user;
}

export async function suspendPlatformUser(userId: string, reasonInput: string | null | undefined) {
  const actor = await requireQoovexOperator();
  const reason = parseReason(reasonInput);
  const target = await getManageableUser(actor.id, userId);
  const now = new Date();
  await db.$transaction(async (tx) => {
    await tx.user.update({ where: { id: target.id }, data: { suspendedAt: now, suspensionReason: reason, authVersion: { increment: 1 } } });
    await tx.session.deleteMany({ where: { userId: target.id } });
    await tx.securityAuditEvent.create({ data: { userId: target.id, email: target.email, type: "platform_user_suspended", metadata: { actorUserId: actor.id, reason } } });
  });
  return { suspended: true, suspendedAt: now.toISOString() };
}

export async function reactivatePlatformUser(userId: string, reasonInput: string | null | undefined) {
  const actor = await requireQoovexOperator();
  const reason = parseReason(reasonInput);
  const target = await getManageableUser(actor.id, userId);
  await db.$transaction(async (tx) => {
    await tx.user.update({ where: { id: target.id }, data: { suspendedAt: null, suspensionReason: null, authVersion: { increment: 1 } } });
    await tx.session.deleteMany({ where: { userId: target.id } });
    await tx.securityAuditEvent.create({ data: { userId: target.id, email: target.email, type: "platform_user_reactivated", metadata: { actorUserId: actor.id, reason } } });
  });
  return { reactivated: true };
}

export async function revokePlatformUserSessions(userId: string, reasonInput: string | null | undefined) {
  const actor = await requireQoovexOperator();
  const reason = parseReason(reasonInput);
  const target = await getManageableUser(actor.id, userId);
  const result = await db.$transaction(async (tx) => {
    await tx.user.update({ where: { id: target.id }, data: { authVersion: { increment: 1 } } });
    const deleted = await tx.session.deleteMany({ where: { userId: target.id } });
    await tx.securityAuditEvent.create({ data: { userId: target.id, email: target.email, type: "platform_user_sessions_revoked", metadata: { actorUserId: actor.id, reason, persistentSessionsDeleted: deleted.count } } });
    return deleted.count;
  });
  return { revoked: true, persistentSessionsDeleted: result };
}

export async function listPlatformOrganizations(input: { q?: string | null; cursor?: string | null; limit?: string | number | null }) {
  await requireQoovexOperator();
  const q = input.q?.trim() ?? "";
  const limit = parseLimit(input.limit);
  const organizations = await db.organization.findMany({
    where: q ? { OR: [
      { name: { contains: q, mode: "insensitive" } },
      { code: { contains: q, mode: "insensitive" } },
      { memberships: { some: { revokedAt: null, user: { email: { contains: q, mode: "insensitive" } } } } },
    ] } : undefined,
    select: {
      id: true, name: true, code: true, createdAt: true,
      _count: { select: { memberships: true, workers: true, jobSites: true, documents: true } },
      memberships: {
        where: { role: "OWNER", revokedAt: null },
        take: 3,
        select: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
      },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    cursor: input.cursor ? { id: input.cursor } : undefined,
    skip: input.cursor ? 1 : 0,
    take: limit + 1,
  });
  const next = organizations.length > limit ? organizations.pop() : undefined;
  return { organizations, nextCursor: next?.id ?? null };
}

export async function listRuntimeErrors(input: { status?: string | null; source?: string | null; cursor?: string | null; limit?: string | number | null }) {
  await requireQoovexOperator();
  const limit = parseLimit(input.limit);
  const status: RuntimeErrorStatus | undefined = input.status === "RESOLVED" ? "RESOLVED" : input.status === "OPEN" ? "OPEN" : undefined;
  const errors = await db.runtimeErrorEvent.findMany({
    where: { status, source: input.source?.trim() || undefined },
    select: {
      id: true, fingerprint: true, status: true, source: true, routePath: true, requestMethod: true,
      errorName: true, message: true, stackPreview: true, digest: true, lastRequestId: true,
      occurrenceCount: true, firstSeenAt: true, lastSeenAt: true, resolvedAt: true, resolutionNote: true,
      resolvedBy: { select: { id: true, email: true } },
    },
    orderBy: [{ lastSeenAt: "desc" }, { id: "desc" }],
    cursor: input.cursor ? { id: input.cursor } : undefined,
    skip: input.cursor ? 1 : 0,
    take: limit + 1,
  });
  const next = errors.length > limit ? errors.pop() : undefined;
  return { errors, nextCursor: next?.id ?? null };
}

export async function updateRuntimeErrorStatus(errorId: string, input: { status?: string | null; reason?: string | null }) {
  const actor = await requireQoovexOperator();
  const reason = parseReason(input.reason);
  const status: RuntimeErrorStatus = input.status === "OPEN" ? "OPEN" : input.status === "RESOLVED" ? "RESOLVED" : (() => { throw new AccessError("Stato errore non valido.", 409); })();
  const existing = await db.runtimeErrorEvent.findUnique({ where: { id: errorId }, select: { id: true } });
  if (!existing) throw new AccessError("Errore non trovato.", 404);
  const now = new Date();
  const updated = await db.runtimeErrorEvent.update({
    where: { id: errorId },
    data: status === "RESOLVED"
      ? { status, resolvedAt: now, resolvedById: actor.id, resolutionNote: reason }
      : { status, resolvedAt: null, resolvedById: null, resolutionNote: null },
    select: { id: true, status: true, resolvedAt: true },
  });
  await recordPlatformUserAction({ actorId: actor.id, targetUserId: actor.id, targetEmail: actor.email, type: `runtime_error_${status.toLowerCase()}`, reason: `${errorId}: ${reason}` });
  return updated;
}
