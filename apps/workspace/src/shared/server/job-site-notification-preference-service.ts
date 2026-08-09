import "server-only";

import { db } from "@qoovex/db";
import { z } from "zod";
import { AccessError } from "./access-errors";
import { requireIdentity } from "./access-context-service";

const preferenceSchema = z.object({
  organizationId: z.string().min(1),
  type: z.enum(["JOB_SITE_ACTION_REQUIRED", "JOB_SITE_ACTIVITY", "PAYMENT_ACTIVITY", "DISPUTE_ACTIVITY", "EXPORT_READY"]),
  channel: z.enum(["IN_APP", "EMAIL"]),
  frequency: z.enum(["IMMEDIATE", "DAILY_DIGEST", "DISABLED"]),
}).strict();

async function requireNotificationContext(userId: string, organizationId: string) {
  const [membership, participant] = await Promise.all([
    db.organizationMembership.findFirst({ where: { userId, organizationId, revokedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }, select: { id: true } }),
    db.jobSiteParticipant.findFirst({ where: { userId, organizationId, kind: "CLIENT", status: { in: ["PENDING", "ACTIVE"] } }, select: { id: true } }),
  ]);
  if (!membership && !participant) throw new AccessError("Risorsa non disponibile.", 404);
}

export async function listNotificationPreferences() {
  const identity = await requireIdentity();
  const [memberships, participations, preferences] = await Promise.all([
    db.organizationMembership.findMany({ where: { userId: identity.id, revokedAt: null }, select: { organization: { select: { id: true, name: true } } } }),
    db.jobSiteParticipant.findMany({ where: { userId: identity.id, kind: "CLIENT", status: { in: ["PENDING", "ACTIVE"] } }, select: { organization: { select: { id: true, name: true } } } }),
    db.notificationPreference.findMany({ where: { userId: identity.id }, select: { id: true, organizationId: true, type: true, channel: true, frequency: true }, orderBy: [{ organizationId: "asc" }, { type: "asc" }, { channel: "asc" }] }),
  ]);
  const organizations = new Map([...memberships, ...participations].map((value) => [value.organization.id, value.organization]));
  return { organizations: [...organizations.values()].sort((left, right) => left.name.localeCompare(right.name)), preferences: preferences.filter((value) => organizations.has(value.organizationId)) };
}

export async function updateNotificationPreference(rawInput: unknown) {
  const identity = await requireIdentity();
  const input = preferenceSchema.parse(rawInput);
  await requireNotificationContext(identity.id, input.organizationId);
  return db.notificationPreference.upsert({
    where: { organizationId_userId_type_channel: { organizationId: input.organizationId, userId: identity.id, type: input.type, channel: input.channel } },
    create: { ...input, userId: identity.id },
    update: { frequency: input.frequency },
    select: { id: true, organizationId: true, type: true, channel: true, frequency: true },
  });
}
