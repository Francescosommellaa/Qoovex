import "server-only";

import { db } from "@qoovex/db";
import type {
  EmailDigestFrequency,
  NotificationEmailDeliveryListResponse,
  NotificationEmailDeliveryResponse,
  NotificationPreferenceResponse,
  UpdateNotificationPreferenceResponse,
} from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { recordSupportAccess } from "@shared/server/support-access-service";
import { requireOrganizationDomainAccess } from "./domain-access-service";

const NOTIFICATION_PREFERENCE_ROLES = ["OWNER", "ADMIN", "SAFETY_CONSULTANT"] as const;
const EMAIL_DIGEST_FREQUENCIES = new Set<EmailDigestFrequency>(["OFF", "DAILY", "WEEKLY"]);
const ALLOWED_UPDATE_KEYS = new Set(["emailDigestEnabled", "emailDigestFrequency", "emailDigestHour"]);

const preferenceSelect = {
  id: true,
  emailDigestEnabled: true,
  emailDigestFrequency: true,
  emailDigestHour: true,
  lastDigestSentAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

const deliverySelect = {
  id: true,
  type: true,
  notificationId: true,
  notificationCount: true,
  status: true,
  errorCode: true,
  sentAt: true,
  createdAt: true,
} as const;

function toIso(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}

function toPreferenceResponse(preference: {
  id: string;
  emailDigestEnabled: boolean;
  emailDigestFrequency: EmailDigestFrequency;
  emailDigestHour: number;
  lastDigestSentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): NotificationPreferenceResponse {
  return {
    id: preference.id,
    emailDigestEnabled: preference.emailDigestEnabled,
    emailDigestFrequency: preference.emailDigestFrequency,
    emailDigestHour: preference.emailDigestHour,
    lastDigestSentAt: toIso(preference.lastDigestSentAt),
    createdAt: preference.createdAt.toISOString(),
    updatedAt: preference.updatedAt.toISOString(),
  };
}

function toDeliveryResponse(delivery: {
  id: string;
  type: NotificationEmailDeliveryResponse["type"];
  notificationId: string | null;
  notificationCount: number;
  status: NotificationEmailDeliveryResponse["status"];
  errorCode: string | null;
  sentAt: Date | null;
  createdAt: Date;
}): NotificationEmailDeliveryResponse {
  return {
    id: delivery.id,
    type: delivery.type,
    notificationId: delivery.notificationId,
    notificationCount: delivery.notificationCount,
    status: delivery.status,
    errorCode: delivery.errorCode,
    sentAt: toIso(delivery.sentAt),
    createdAt: delivery.createdAt.toISOString(),
  };
}

async function requireNotificationPreferenceAccess() {
  return requireOrganizationDomainAccess("organization:read", NOTIFICATION_PREFERENCE_ROLES);
}

async function getOrCreatePreferenceRecord(organizationId: string, userId: string) {
  return db.notificationPreference.upsert({
    where: { organizationId_userId: { organizationId, userId } },
    create: { organizationId, userId },
    update: {},
    select: preferenceSelect,
  });
}

function parseBoolean(value: unknown, key: string) {
  if (typeof value !== "boolean") throw new AccessError(`${key} non valido.`, 409);
  return value;
}

function parseFrequency(value: unknown) {
  if (typeof value !== "string" || !EMAIL_DIGEST_FREQUENCIES.has(value as EmailDigestFrequency)) {
    throw new AccessError("Frequenza digest non valida.", 409);
  }
  return value as EmailDigestFrequency;
}

function parseDigestHour(value: unknown) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 23) {
    throw new AccessError("Ora digest non valida.", 409);
  }
  return value;
}

function parseUpdateInput(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new AccessError("Input preferenze non valido.", 409);
  const data = input as Record<string, unknown>;
  for (const key of Object.keys(data)) {
    if (!ALLOWED_UPDATE_KEYS.has(key)) throw new AccessError("Campo preferenze non consentito.", 409);
  }

  const update: {
    emailDigestEnabled?: boolean;
    emailDigestFrequency?: EmailDigestFrequency;
    emailDigestHour?: number;
  } = {};

  if ("emailDigestEnabled" in data) update.emailDigestEnabled = parseBoolean(data.emailDigestEnabled, "emailDigestEnabled");
  if ("emailDigestFrequency" in data) update.emailDigestFrequency = parseFrequency(data.emailDigestFrequency);
  if ("emailDigestHour" in data) update.emailDigestHour = parseDigestHour(data.emailDigestHour);
  if (update.emailDigestFrequency === "OFF") update.emailDigestEnabled = false;
  if (update.emailDigestEnabled === false && !("emailDigestFrequency" in update)) update.emailDigestFrequency = "OFF";
  return update;
}

export async function getNotificationPreference(): Promise<NotificationPreferenceResponse> {
  const { context, organizationId } = await requireNotificationPreferenceAccess();
  const preference = await getOrCreatePreferenceRecord(organizationId, context.userId);
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "notification-preference" });
  return toPreferenceResponse(preference);
}

export async function updateNotificationPreference(input: unknown): Promise<UpdateNotificationPreferenceResponse> {
  const { context, organizationId } = await requireNotificationPreferenceAccess();
  await getOrCreatePreferenceRecord(organizationId, context.userId);
  const preference = await db.notificationPreference.update({
    where: { organizationId_userId: { organizationId, userId: context.userId } },
    data: parseUpdateInput(input),
    select: preferenceSelect,
  });
  await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "notification-preference" });
  return { preference: toPreferenceResponse(preference), updated: true };
}

export async function listNotificationEmailDeliveries(): Promise<NotificationEmailDeliveryListResponse> {
  const { context, organizationId } = await requireNotificationPreferenceAccess();
  const deliveries = await db.notificationEmailDelivery.findMany({
    where: { organizationId, userId: context.userId },
    select: deliverySelect,
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "notification-email-deliveries" });
  return {
    deliveries: deliveries.map(toDeliveryResponse),
    generatedAt: new Date().toISOString(),
  };
}
