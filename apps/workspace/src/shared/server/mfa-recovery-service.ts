import "server-only";

import { db } from "@qoovex/db";
import { AuthCodeError, issueAuthCode, verifyAuthCode } from "@shared/server/auth-code-service";
import { MfaError, verifyCurrentFactorForUser } from "@shared/server/mfa-service";
import { assertPersistentRateLimit } from "@shared/server/rate-limit";
import { recordSecurityEvent } from "@shared/server/security-audit-service";
import { sendTransactionalEmail } from "@shared/server/transactional-email-service";

const RECOVERY_TTL_MS = 30 * 60 * 1000;

function getWorkspaceBaseUrl() {
  const raw = process.env.AUTH_URL?.trim() || process.env.NEXTAUTH_URL?.trim();
  if (!raw) return process.env.NODE_ENV === "production" ? "" : "http://localhost:3001";
  try {
    return new URL(raw).origin;
  } catch {
    return "";
  }
}

async function expireStaleRequests(userId?: string) {
  const stale = await db.mfaRecoveryRequest.findMany({
    where: {
      ...(userId ? { userId } : {}),
      status: { in: ["PENDING", "APPROVED", "SETUP_STARTED"] },
      expiresAt: { lte: new Date() },
    },
    select: { id: true, userId: true, organizationId: true, user: { select: { email: true } } },
  });
  await Promise.all(stale.map((request) => db.$transaction(async (tx) => {
    const expired = await tx.mfaRecoveryRequest.updateMany({
      where: { id: request.id, status: { in: ["PENDING", "APPROVED", "SETUP_STARTED"] }, expiresAt: { lte: new Date() } },
      data: { status: "EXPIRED", activeKey: null },
    });
    if (expired.count === 1) {
      await tx.securityAuditEvent.create({
        data: {
          userId: request.userId,
          email: request.user.email,
          type: "mfa_recovery_expired",
          metadata: { organizationId: request.organizationId },
        },
      });
    }
  })));
}

async function notifyRecoveryEmailBestEffort(input: {
  userId: string;
  email: string;
  event: "MFA_RECOVERY_APPROVED" | "MFA_RECOVERY_DENIED";
}) {
  try {
    await sendTransactionalEmail({
      to: input.email,
      template: { kind: "security-event", event: input.event },
      idempotencyKey: `mfa-recovery:${input.event}:${input.userId}:${Date.now()}`,
    });
  } catch {
    await recordSecurityEvent({ userId: input.userId, email: input.email, type: `security_email_failed:${input.event}` }).catch(() => undefined);
  }
}

export async function issueMfaRecoveryCode(input: { userId: string; ipHash?: string | null }) {
  const user = await db.user.findUnique({
    where: { id: input.userId },
    select: { id: true, email: true, emailVerified: true, mfaEnabled: true },
  });
  if (!user?.mfaEnabled) throw new MfaError("MFA non attiva.", 409);
  if (!user.emailVerified) throw new MfaError("Email verificata richiesta.", 403);
  await issueAuthCode({ email: user.email, userId: user.id, purpose: "MFA_RECOVERY", ipHash: input.ipHash });
  await recordSecurityEvent({ userId: user.id, email: user.email, type: "mfa_recovery_code_issued", ipHash: input.ipHash });
  return { sent: true };
}

export async function createMfaRecoveryRequest(input: { userId: string; emailCode: string; ipHash?: string | null }) {
  await assertPersistentRateLimit({ identifier: input.userId, bucket: "mfa-recovery", limit: 3, windowMs: 24 * 60 * 60 * 1000 });
  await expireStaleRequests(input.userId);
  const user = await db.user.findUnique({
    where: { id: input.userId },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      mfaEnabled: true,
      platformRole: true,
      organizationMembership: {
        select: { organizationId: true, role: true, revokedAt: true, organization: { select: { name: true } } },
      },
    },
  });
  if (!user?.mfaEnabled || !user.emailVerified) throw new MfaError("Recupero MFA non disponibile.", 403);
  try {
    await verifyAuthCode({ email: user.email, purpose: "MFA_RECOVERY", code: input.emailCode, ipHash: input.ipHash });
  } catch (error) {
    if (error instanceof AuthCodeError) throw new MfaError(error.message, 403);
    throw error;
  }

  const membership = user.organizationMembership?.revokedAt ? null : user.organizationMembership;
  const needsOwner = Boolean(membership && membership.role !== "OWNER" && user.platformRole !== "SUPER_ADMIN");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + RECOVERY_TTL_MS);
  const existing = await db.mfaRecoveryRequest.findFirst({
    where: { userId: user.id, activeKey: `mfa-recovery:${user.id}` },
  });
  if (existing) return serializeRecovery(existing);

  const recovery = await db.mfaRecoveryRequest.create({
    data: {
      userId: user.id,
      organizationId: needsOwner ? membership?.organizationId : null,
      mode: needsOwner ? "OWNER_APPROVAL" : "SELF_EMAIL",
      status: needsOwner ? "PENDING" : "APPROVED",
      activeKey: `mfa-recovery:${user.id}`,
      emailVerifiedAt: now,
      expiresAt,
      approvedAt: needsOwner ? null : now,
    },
  });
  await recordSecurityEvent({
    userId: user.id,
    email: user.email,
    type: "mfa_recovery_requested",
    ipHash: input.ipHash,
    metadata: { mode: recovery.mode, organizationId: recovery.organizationId },
  });

  if (needsOwner && membership) {
    const owners = await db.organizationMembership.findMany({
      where: { organizationId: membership.organizationId, role: "OWNER", revokedAt: null },
      select: { userId: true, user: { select: { email: true } } },
    });
    const actionUrl = `${getWorkspaceBaseUrl()}/account/security`;
    const deliveries = await Promise.allSettled(owners.map(async (owner) => {
      await db.notification.create({
        data: {
          organizationId: membership.organizationId,
          userId: owner.userId,
          type: "SYSTEM",
          severity: "WARNING",
          title: "Recupero MFA da approvare",
          message: `${user.email} ha verificato la propria email e chiede di sostituire il fattore MFA.`,
          sourceType: "SYSTEM",
          sourceId: recovery.id,
          dedupeKey: `mfa-recovery:${recovery.id}:requested:${owner.userId}`,
          actionHref: "/account/security",
        },
      });
      await sendTransactionalEmail({
        to: owner.user.email,
        template: {
          kind: "mfa-recovery-request",
          requesterEmail: user.email,
          organizationName: membership.organization.name,
          actionUrl,
          expiresAt,
        },
        idempotencyKey: `mfa-recovery:${recovery.id}:requested:${owner.userId}`,
      });
    }));
    await Promise.all(deliveries.map((delivery, index) => delivery.status === "rejected"
      ? recordSecurityEvent({
          userId: user.id,
          email: user.email,
          type: "mfa_recovery_owner_notification_failed",
          metadata: { ownerUserId: owners[index]?.userId },
        }).catch(() => undefined)
      : Promise.resolve()));
  }
  return serializeRecovery(recovery);
}

export async function getCurrentMfaRecovery(userId: string) {
  await expireStaleRequests(userId);
  const recovery = await db.mfaRecoveryRequest.findFirst({
    where: {
      userId,
      OR: [
        { status: { in: ["PENDING", "APPROVED", "SETUP_STARTED"] } },
        { status: { in: ["DENIED", "EXPIRED"] }, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });
  return recovery ? serializeRecovery(recovery) : null;
}

export async function listMfaRecoveryInbox(ownerUserId: string) {
  await expireStaleRequests();
  const membership = await db.organizationMembership.findUnique({
    where: { userId: ownerUserId },
    select: { organizationId: true, role: true, revokedAt: true },
  });
  if (!membership || membership.revokedAt || membership.role !== "OWNER") throw new MfaError("Risorsa non disponibile.", 403);
  const requests = await db.mfaRecoveryRequest.findMany({
    where: { organizationId: membership.organizationId, mode: "OWNER_APPROVAL", status: "PENDING", expiresAt: { gt: new Date() } },
    select: { id: true, status: true, mode: true, expiresAt: true, createdAt: true, user: { select: { id: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });
  return requests.map((request) => ({
    id: request.id,
    status: request.status,
    mode: request.mode,
    requester: request.user,
    expiresAt: request.expiresAt.toISOString(),
    createdAt: request.createdAt.toISOString(),
  }));
}

export async function decideMfaRecoveryRequest(input: {
  ownerUserId: string;
  requestId: string;
  decision: "approve" | "deny";
  currentCode: string;
  ipHash?: string | null;
}) {
  const owner = await db.user.findUnique({
    where: { id: input.ownerUserId },
    select: { id: true, email: true, authVersion: true, organizationMembership: { select: { organizationId: true, role: true, revokedAt: true } } },
  });
  const membership = owner?.organizationMembership;
  if (!owner || !membership || membership.revokedAt || membership.role !== "OWNER") throw new MfaError("Risorsa non disponibile.", 403);
  if (!(await verifyCurrentFactorForUser({ userId: owner.id, code: input.currentCode, ipHash: input.ipHash, purpose: "mfa-recovery-decision" }))) {
    throw new MfaError("Fattore OWNER non valido.", 403);
  }
  const request = await db.mfaRecoveryRequest.findFirst({
    where: { id: input.requestId, organizationId: membership.organizationId, mode: "OWNER_APPROVAL", status: "PENDING", expiresAt: { gt: new Date() } },
    select: { id: true, userId: true, user: { select: { email: true } } },
  });
  if (!request || request.userId === owner.id) throw new MfaError("Richiesta non disponibile.", 409);
  const now = new Date();
  const nextStatus = input.decision === "approve" ? "APPROVED" : "DENIED";
  const decided = await db.$transaction(async (tx) => {
    const claimed = await tx.mfaRecoveryRequest.updateMany({
      where: { id: request.id, organizationId: membership.organizationId, status: "PENDING", expiresAt: { gt: now } },
      data: input.decision === "approve"
        ? { status: nextStatus, approvedById: owner.id, approvedAt: now }
        : { status: nextStatus, deniedById: owner.id, deniedAt: now, activeKey: null },
    });
    if (claimed.count !== 1) throw new MfaError("Richiesta gia gestita.", 409);
    await tx.securityAuditEvent.create({
      data: {
        userId: request.userId,
        email: request.user.email,
        type: input.decision === "approve" ? "mfa_recovery_approved" : "mfa_recovery_denied",
        ipHash: input.ipHash ?? null,
        metadata: { ownerUserId: owner.id, organizationId: membership.organizationId },
      },
    });
    await tx.notification.create({
      data: {
        organizationId: membership.organizationId,
        userId: request.userId,
        type: "SYSTEM",
        severity: input.decision === "approve" ? "ATTENTION" : "WARNING",
        title: input.decision === "approve" ? "Recupero MFA approvato" : "Recupero MFA rifiutato",
        message: input.decision === "approve" ? "Puoi configurare un nuovo fattore MFA." : "La richiesta di recupero MFA e stata rifiutata.",
        sourceType: "SYSTEM",
        sourceId: request.id,
        dedupeKey: `mfa-recovery:${request.id}:${input.decision}`,
        actionHref: "/account/security",
      },
    });
    return { id: request.id, status: nextStatus };
  });
  await notifyRecoveryEmailBestEffort({
    userId: request.userId,
    email: request.user.email,
    event: input.decision === "approve" ? "MFA_RECOVERY_APPROVED" : "MFA_RECOVERY_DENIED",
  });
  const organization = await db.organization.findUnique({ where: { id: membership.organizationId }, select: { name: true } });
  const owners = await db.organizationMembership.findMany({
    where: { organizationId: membership.organizationId, role: "OWNER", revokedAt: null },
    select: { userId: true, user: { select: { email: true } } },
  });
  await Promise.allSettled(owners.map(async (recipient) => {
    await db.notification.create({
      data: {
        organizationId: membership.organizationId,
        userId: recipient.userId,
        type: "SYSTEM",
        severity: "INFO",
        title: input.decision === "approve" ? "Recupero MFA approvato" : "Recupero MFA rifiutato",
        message: `La richiesta di ${request.user.email} e stata ${input.decision === "approve" ? "approvata" : "rifiutata"}.`,
        sourceType: "SYSTEM",
        sourceId: request.id,
        dedupeKey: `mfa-recovery:${request.id}:decision:${recipient.userId}`,
        actionHref: "/account/security",
      },
    });
    await sendTransactionalEmail({
      to: recipient.user.email,
      template: {
        kind: "mfa-recovery-decision",
        requesterEmail: request.user.email,
        organizationName: organization?.name ?? "Qoovex",
        decision: input.decision === "approve" ? "approved" : "denied",
      },
      idempotencyKey: `mfa-recovery:${request.id}:decision:${recipient.userId}`,
    });
  }));
  return decided;
}

function serializeRecovery(recovery: {
  id: string;
  mode: string;
  status: string;
  expiresAt: Date;
  createdAt: Date;
  approvedAt?: Date | null;
  deniedAt?: Date | null;
  setupStartedAt?: Date | null;
  completedAt?: Date | null;
}) {
  return {
    id: recovery.id,
    mode: recovery.mode,
    status: recovery.status,
    expiresAt: recovery.expiresAt.toISOString(),
    createdAt: recovery.createdAt.toISOString(),
    approvedAt: recovery.approvedAt?.toISOString() ?? null,
    deniedAt: recovery.deniedAt?.toISOString() ?? null,
    setupStartedAt: recovery.setupStartedAt?.toISOString() ?? null,
    completedAt: recovery.completedAt?.toISOString() ?? null,
  };
}
