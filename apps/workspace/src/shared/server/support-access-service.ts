import "server-only";

import crypto from "crypto";
import { cookies } from "next/headers";
import { db, Prisma } from "@qoovex/db";
import { AccessError } from "@shared/server/access-errors";
import { verifyMfaChallengeForUser } from "@shared/server/mfa-service";
import { sendTransactionalEmail } from "@shared/server/transactional-email-service";
import { requireQoovexOperatorById } from "@shared/server/qoovex-operator-access";

const SUPPORT_COOKIE = "qoovex_support_session";
const SUPPORT_TTL_MS = 30 * 60 * 1000;
const SENSITIVE_TTL_MS = 5 * 60 * 1000;

function hashToken(token: string) { return crypto.createHash("sha256").update(token).digest("hex"); }

async function getSupportActor(userId: string) {
  return requireQoovexOperatorById(userId);
}

export async function getActiveSupportSession(userId: string) {
  const token = (await cookies()).get(SUPPORT_COOKIE)?.value;
  if (!token) return null;
  return db.supportSession.findFirst({
    where: { actorId: userId, tokenHash: hashToken(token), endedAt: null, expiresAt: { gt: new Date() } },
    select: { id: true, reason: true, expiresAt: true, sensitiveConfirmedUntil: true, organization: { select: { id: true, name: true, code: true } } },
  });
}

async function notifyOrganizationOwners(organizationId: string, template: "support-opened" | "support-closed", input: { employeeEmail: string; reason: string; occurredAt: Date }) {
  const owners = await db.user.findMany({ where: { organizationId, organizationRole: "OWNER" }, select: { email: true, organization: { select: { name: true } } } });
  await Promise.allSettled(owners.map((owner) => sendTransactionalEmail({ to: owner.email, template: { kind: template, organizationName: owner.organization?.name ?? "Azienda", employeeEmail: input.employeeEmail, reason: input.reason, occurredAt: input.occurredAt } })));
}

export async function findOrganizationForSupport(userId: string, codeInput: string) {
  await getSupportActor(userId);
  const code = codeInput.trim().toUpperCase();
  const organization = await db.organization.findUnique({ where: { code }, select: { id: true, name: true, code: true } });
  if (!organization) throw new AccessError("Azienda non trovata.", 404);
  return organization;
}

export async function openSupportSession(userId: string, input: { organizationCode?: string; reason: string }) {
  const actor = await getSupportActor(userId);
  const reason = input.reason.trim();
  if (reason.length < 8 || reason.length > 500) throw new AccessError("Indica un motivo di supporto specifico.", 409);
  if (await getActiveSupportSession(userId)) await closeSupportSession(userId);
  const organization = await findOrganizationForSupport(userId, input.organizationCode ?? "");
  const rawToken = crypto.randomBytes(32).toString("base64url");
  const now = new Date();

  const session = await db.$transaction(async (tx) => {
    await tx.supportSession.updateMany({ where: { actorId: actor.id, endedAt: null }, data: { endedAt: now } });
    const created = await tx.supportSession.create({ data: { actorId: actor.id, organizationId: organization.id, tokenHash: hashToken(rawToken), reason, expiresAt: new Date(now.getTime() + SUPPORT_TTL_MS), sensitiveConfirmedUntil: actor.isDev ? new Date(now.getTime() + SENSITIVE_TTL_MS) : null } });
    await tx.supportAuditEvent.create({ data: { supportSessionId: created.id, actorId: actor.id, organizationId: organization.id, action: "SENSITIVE", resourceType: "support-session", resourceId: created.id, metadata: { event: "opened", reason } } });
    return created;
  });
  (await cookies()).set(SUPPORT_COOKIE, rawToken, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SUPPORT_TTL_MS / 1000 });
  if (!actor.isDev) await notifyOrganizationOwners(organization.id, "support-opened", { employeeEmail: actor.email, reason, occurredAt: now });
  return { id: session.id, expiresAt: session.expiresAt, organization };
}

export async function closeSupportSession(userId: string) {
  const actor = await getSupportActor(userId);
  const session = await getActiveSupportSession(userId);
  if (!session) throw new AccessError("Sessione supporto non attiva.", 404);
  const now = new Date();
  await db.$transaction([
    db.supportSession.update({ where: { id: session.id }, data: { endedAt: now } }),
    db.supportAuditEvent.create({ data: { supportSessionId: session.id, actorId: actor.id, organizationId: session.organization.id, action: "SENSITIVE", resourceType: "support-session", resourceId: session.id, metadata: { event: "closed" } } }),
  ]);
  (await cookies()).delete(SUPPORT_COOKIE);
  if (!actor.isDev) await notifyOrganizationOwners(session.organization.id, "support-closed", { employeeEmail: actor.email, reason: session.reason, occurredAt: now });
  return { closed: true };
}

export async function elevateSupportSession(userId: string, code: string) {
  const actor = await getSupportActor(userId);
  const session = await getActiveSupportSession(userId);
  if (!session) throw new AccessError("Sessione supporto non attiva.", 404);
  if (!actor.isDev && !(await verifyMfaChallengeForUser({ userId, code }))) throw new AccessError("Codice MFA non valido.", 403);
  const until = new Date(Date.now() + SENSITIVE_TTL_MS);
  await db.supportSession.update({ where: { id: session.id }, data: { sensitiveConfirmedUntil: until } });
  return { sensitiveConfirmedUntil: until };
}

export async function recordSupportAccess(input: { userId: string; action: "READ" | "WRITE" | "SENSITIVE" | "EXPORT"; resourceType: string; resourceId?: string; metadata?: Record<string, unknown> }) {
  const session = await getActiveSupportSession(input.userId);
  if (!session) return;
  if ((input.action === "SENSITIVE" || input.action === "EXPORT") && (!session.sensitiveConfirmedUntil || session.sensitiveConfirmedUntil <= new Date())) throw new AccessError("Conferma MFA recente richiesta.", 403);
  await db.supportAuditEvent.create({ data: { supportSessionId: session.id, actorId: input.userId, organizationId: session.organization.id, action: input.action, resourceType: input.resourceType, resourceId: input.resourceId, metadata: input.metadata as Prisma.InputJsonValue | undefined } });
}
