import "server-only";

import { db } from "@qoovex/db";
import type {
  EmailDigestPreviewItem,
  EmailDigestPreviewResponse,
  NotificationEmailDeliveryStatus,
  NotificationEmailDeliveryType,
  NotificationResponse,
  SendEmailDigestResponse,
  SendNotificationEmailResponse,
} from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { assertPersistentRateLimit, RateLimitExceededError } from "@shared/server/rate-limit";
import { recordSupportAccess } from "@shared/server/support-access-service";
import { sendTransactionalEmail, TransactionalEmailError } from "@shared/server/transactional-email-service";
import type { NotificationEmailItem } from "@shared/server/transactional-email-service";
import { requireOrganizationDomainAccess } from "./domain-access-service";
import { syncOrganizationReminderRecords } from "./reminder-service";
import { toNotificationResponse } from "./notification-service";
import { auditActorFromContext, recordProductAuditEventBestEffort } from "./product-audit-service";

const NOTIFICATION_EMAIL_ROLES = ["OWNER", "ADMIN", "SAFETY_CONSULTANT"] as const;
export const EMAIL_DIGEST_LIMIT = 10;
const EMAIL_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const DIGEST_SUBJECT = "Qoovex - Promemoria documenti e scadenze";
const DIGEST_INTRO = "Riepilogo sintetico delle notifiche interne da controllare nel workspace Qoovex.";
const DIGEST_FOOTER = "Le informazioni dipendono dai dati registrati in Qoovex e vanno confermate con il responsabile o consulente.";

const notificationEmailSelect = {
  id: true,
  userId: true,
  type: true,
  severity: true,
  title: true,
  message: true,
  sourceType: true,
  sourceId: true,
  actionHref: true,
  readAt: true,
  dismissedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type NotificationEmailRecord = {
  id: string;
  userId: string | null;
  type: NotificationResponse["type"];
  severity: NotificationResponse["severity"];
  title: string;
  message: string;
  sourceType: NotificationResponse["sourceType"];
  sourceId: string | null;
  actionHref: string | null;
  readAt: Date | null;
  dismissedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function visibleNotificationWhere(organizationId: string, userId: string) {
  return {
    organizationId,
    OR: [{ userId: null }, { userId }],
  };
}

function safeActionHref(value: string | null) {
  if (!value?.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

export function getNotificationsUrl() {
  const baseUrl = process.env.AUTH_URL?.trim() || process.env.NEXTAUTH_URL?.trim() || (process.env.NODE_ENV !== "production" ? "http://localhost:3001" : "");
  if (!baseUrl) return null;

  try {
    return new URL("/notifications", baseUrl).toString();
  } catch {
    return null;
  }
}

function currentRateWindowKey(now = Date.now()) {
  return Math.floor(now / EMAIL_RATE_LIMIT_WINDOW_MS);
}

function toPreviewItem(notification: NotificationEmailRecord): EmailDigestPreviewItem {
  return {
    id: notification.id,
    type: notification.type,
    severity: notification.severity,
    title: notification.title,
    message: notification.message,
    actionHref: safeActionHref(notification.actionHref),
    createdAt: notification.createdAt.toISOString(),
  };
}

export function toEmailItem(notification: NotificationEmailRecord): NotificationEmailItem {
  return {
    title: notification.title,
    message: notification.message,
    severity: notification.severity,
    createdAt: notification.createdAt,
  };
}

async function requireNotificationEmailAccess() {
  const access = await requireOrganizationDomainAccess("organization:read", NOTIFICATION_EMAIL_ROLES);
  await syncOrganizationReminderRecords(access.organizationId);
  return access;
}

export async function getCurrentVerifiedEmail(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true, emailVerified: true },
  });

  if (!user?.email || !user.emailVerified) throw new AccessError("Email utente non disponibile per l'invio.", 409);
  return user.email;
}

async function assertNotificationEmailRateLimit(input: { organizationId: string; userId: string; bucket: string }) {
  try {
    await assertPersistentRateLimit({
      identifier: `${input.organizationId}:${input.userId}`,
      bucket: input.bucket,
      limit: 1,
      windowMs: EMAIL_RATE_LIMIT_WINDOW_MS,
      userId: input.userId,
    });
  } catch (error) {
    if (error instanceof RateLimitExceededError) throw new AccessError(error.message, 409);
    throw error;
  }
}

async function sendSafeEmail(input: Parameters<typeof sendTransactionalEmail>[0]) {
  try {
    return await sendTransactionalEmail(input);
  } catch (error) {
    if (error instanceof TransactionalEmailError) throw new AccessError(error.message, 409);
    throw error;
  }
}

export async function getDigestNotifications(organizationId: string, userId: string) {
  const where = {
    ...visibleNotificationWhere(organizationId, userId),
    dismissedAt: null,
    readAt: null,
  };
  const [notifications, unreadCount] = await Promise.all([
    db.notification.findMany({
      where,
      select: notificationEmailSelect,
      orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
      take: EMAIL_DIGEST_LIMIT,
    }),
    db.notification.count({ where }),
  ]);

  return { notifications: notifications as NotificationEmailRecord[], unreadCount };
}

export async function recordNotificationEmailDelivery(input: {
  organizationId: string;
  userId: string;
  notificationId?: string | null;
  type: NotificationEmailDeliveryType;
  recipientEmail: string;
  notificationCount: number;
  status: NotificationEmailDeliveryStatus;
  providerMessageId?: string | null;
  errorCode?: string | null;
  sentAt?: Date | null;
}) {
  await db.notificationEmailDelivery.create({
    data: {
      organizationId: input.organizationId,
      userId: input.userId,
      notificationId: input.notificationId ?? null,
      type: input.type,
      recipientEmail: input.recipientEmail,
      notificationCount: input.notificationCount,
      status: input.status,
      providerMessageId: input.providerMessageId ?? null,
      errorCode: input.errorCode ?? null,
      sentAt: input.sentAt ?? null,
    },
    select: { id: true },
  });
}

async function sendTransactionalEmailWithDeliveryLog(input: {
  organizationId: string;
  userId: string;
  notificationId?: string | null;
  type: NotificationEmailDeliveryType;
  recipientEmail: string;
  notificationCount: number;
  email: Parameters<typeof sendTransactionalEmail>[0];
}) {
  try {
    const sentAt = new Date();
    const result = await sendSafeEmail(input.email);
    await recordNotificationEmailDelivery({
      organizationId: input.organizationId,
      userId: input.userId,
      notificationId: input.notificationId,
      type: input.type,
      recipientEmail: input.recipientEmail,
      notificationCount: input.notificationCount,
      status: "SENT",
      providerMessageId: result.providerMessageId,
      sentAt,
    });
    return result;
  } catch (error) {
    const errorCode = error instanceof AccessError ? "PROVIDER_ERROR" : "EMAIL_ERROR";
    await recordNotificationEmailDelivery({
      organizationId: input.organizationId,
      userId: input.userId,
      notificationId: input.notificationId,
      type: input.type,
      recipientEmail: input.recipientEmail,
      notificationCount: input.notificationCount,
      status: "FAILED",
      errorCode,
    });
    throw error;
  }
}

export async function previewNotificationEmailDigest(): Promise<EmailDigestPreviewResponse> {
  const { context, organizationId } = await requireNotificationEmailAccess();
  const digest = await getDigestNotifications(organizationId, context.userId);

  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "notification-email-digest-preview" });
  return {
    subject: DIGEST_SUBJECT,
    intro: DIGEST_INTRO,
    unreadCount: digest.unreadCount,
    items: digest.notifications.map(toPreviewItem),
    workspaceHref: "/notifications",
    footer: DIGEST_FOOTER,
    generatedAt: new Date().toISOString(),
  };
}

export async function sendNotificationEmailDigestToMe(): Promise<SendEmailDigestResponse> {
  const { context, organizationId, actorRole } = await requireNotificationEmailAccess();
  const digest = await getDigestNotifications(organizationId, context.userId);
  if (!digest.notifications.length) throw new AccessError("Nessuna notifica da inviare.", 409);

  const email = await getCurrentVerifiedEmail(context.userId);
  try {
    await assertNotificationEmailRateLimit({ organizationId, userId: context.userId, bucket: "notification-email-digest" });
  } catch (error) {
    await recordNotificationEmailDelivery({
      organizationId,
      userId: context.userId,
      type: "DIGEST",
      recipientEmail: email,
      notificationCount: digest.notifications.length,
      status: "SKIPPED",
      errorCode: "RATE_LIMIT",
    });
    await recordProductAuditEventBestEffort({
      organizationId,
      ...auditActorFromContext(context, actorRole),
      action: "EMAIL_DIGEST_FAILED",
      entityType: "EMAIL_DELIVERY",
      outcome: "FAILED",
      metadata: { notificationCount: digest.notifications.length, deliveryStatus: "SKIPPED", reasonCode: "RATE_LIMIT", trigger: "manual-digest" },
    });
    throw error;
  }
  try {
    await sendTransactionalEmailWithDeliveryLog({
      organizationId,
      userId: context.userId,
      type: "DIGEST",
      recipientEmail: email,
      notificationCount: digest.notifications.length,
      email: {
        to: email,
        idempotencyKey: `notification-email-digest:${organizationId}:${context.userId}:${currentRateWindowKey()}`,
        template: {
          kind: "notification-digest",
          unreadCount: digest.unreadCount,
          items: digest.notifications.map(toEmailItem),
          notificationsUrl: getNotificationsUrl(),
        },
      },
    });
    await recordProductAuditEventBestEffort({
      organizationId,
      ...auditActorFromContext(context, actorRole),
      action: "EMAIL_DIGEST_SENT",
      entityType: "EMAIL_DELIVERY",
      metadata: { notificationCount: digest.notifications.length, deliveryStatus: "SENT", trigger: "manual-digest" },
    });
  } catch (error) {
    await recordProductAuditEventBestEffort({
      organizationId,
      ...auditActorFromContext(context, actorRole),
      action: "EMAIL_DIGEST_FAILED",
      entityType: "EMAIL_DELIVERY",
      outcome: "FAILED",
      metadata: { notificationCount: digest.notifications.length, deliveryStatus: "FAILED", trigger: "manual-digest" },
    });
    throw error;
  }

  await recordSupportAccess({
    userId: context.userId,
    action: "WRITE",
    resourceType: "notification-email-digest",
    metadata: { notificationCount: digest.notifications.length },
  });
  return { sent: true, notificationCount: digest.notifications.length, generatedAt: new Date().toISOString() };
}

async function findVisibleNotification(organizationId: string, userId: string, notificationId: string) {
  const notification = await db.notification.findFirst({
    where: {
      id: notificationId,
      ...visibleNotificationWhere(organizationId, userId),
      dismissedAt: null,
    },
    select: notificationEmailSelect,
  });
  if (!notification) throw new AccessError("Notifica non trovata.", 404);
  return notification as NotificationEmailRecord;
}

export async function sendSingleNotificationEmailToMe(notificationId: string): Promise<SendNotificationEmailResponse> {
  const { context, organizationId, actorRole } = await requireNotificationEmailAccess();
  const notification = await findVisibleNotification(organizationId, context.userId, notificationId);
  const email = await getCurrentVerifiedEmail(context.userId);

  try {
    await assertNotificationEmailRateLimit({ organizationId, userId: context.userId, bucket: "notification-email-single" });
  } catch (error) {
    await recordNotificationEmailDelivery({
      organizationId,
      userId: context.userId,
      notificationId: notification.id,
      type: "SINGLE_NOTIFICATION",
      recipientEmail: email,
      notificationCount: 1,
      status: "SKIPPED",
      errorCode: "RATE_LIMIT",
    });
    await recordProductAuditEventBestEffort({
      organizationId,
      ...auditActorFromContext(context, actorRole),
      action: "EMAIL_DIGEST_FAILED",
      entityType: "EMAIL_DELIVERY",
      entityId: notification.id,
      outcome: "FAILED",
      metadata: { notificationCount: 1, deliveryStatus: "SKIPPED", reasonCode: "RATE_LIMIT", trigger: "single-notification" },
    });
    throw error;
  }
  try {
    await sendTransactionalEmailWithDeliveryLog({
      organizationId,
      userId: context.userId,
      notificationId: notification.id,
      type: "SINGLE_NOTIFICATION",
      recipientEmail: email,
      notificationCount: 1,
      email: {
        to: email,
        idempotencyKey: `notification-email-single:${organizationId}:${context.userId}:${notification.id}:${currentRateWindowKey()}`,
        template: {
          kind: "notification-single",
          item: toEmailItem(notification),
          notificationsUrl: getNotificationsUrl(),
        },
      },
    });
    await recordProductAuditEventBestEffort({
      organizationId,
      ...auditActorFromContext(context, actorRole),
      action: "EMAIL_DIGEST_SENT",
      entityType: "EMAIL_DELIVERY",
      entityId: notification.id,
      metadata: { notificationCount: 1, deliveryStatus: "SENT", trigger: "single-notification" },
    });
  } catch (error) {
    await recordProductAuditEventBestEffort({
      organizationId,
      ...auditActorFromContext(context, actorRole),
      action: "EMAIL_DIGEST_FAILED",
      entityType: "EMAIL_DELIVERY",
      entityId: notification.id,
      outcome: "FAILED",
      metadata: { notificationCount: 1, deliveryStatus: "FAILED", trigger: "single-notification" },
    });
    throw error;
  }

  await recordSupportAccess({
    userId: context.userId,
    action: "WRITE",
    resourceType: "notification-email",
    resourceId: notification.id,
  });
  return { sent: true, notification: toNotificationResponse(notification), generatedAt: new Date().toISOString() };
}
