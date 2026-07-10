import "server-only";

import { db } from "@qoovex/db";
import type { EmailDigestFrequency, NotificationType, OrganizationRole, ScheduledEmailDigestRunResponse } from "@qoovex/types";
import { getDigestNotifications, getNotificationsUrl, recordNotificationEmailDelivery, toEmailItem } from "./notification-email-service";
import { sendTransactionalEmail, TransactionalEmailError } from "./transactional-email-service";
import { syncOrganizationReminderRecords } from "./reminder-service";
import { recordProductAuditEventBestEffort } from "./product-audit-service";

const SCHEDULED_EMAIL_ROLES: OrganizationRole[] = ["OWNER", "ADMIN", "SAFETY_CONSULTANT"];
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

function getRomeHour(now: Date) {
  const hourPart = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    hour12: false,
    timeZone: "Europe/Rome",
  }).formatToParts(now).find((part) => part.type === "hour")?.value;
  return Number(hourPart ?? "0") % 24;
}

function isTooRecent(frequency: EmailDigestFrequency, lastDigestSentAt: Date | null, now: Date) {
  if (!lastDigestSentAt) return false;
  const windowMs = frequency === "WEEKLY" ? WEEK_MS : DAY_MS;
  return now.getTime() - lastDigestSentAt.getTime() < windowMs;
}

function scheduleWindowKey(frequency: EmailDigestFrequency, now: Date) {
  const windowMs = frequency === "WEEKLY" ? WEEK_MS : DAY_MS;
  return Math.floor(now.getTime() / windowMs);
}

function notificationCategoryEnabled(type: NotificationType, preference: {
  deadlineNotificationsEnabled: boolean;
  documentNotificationsEnabled: boolean;
  packageNotificationsEnabled: boolean;
  systemNotificationsEnabled: boolean;
}) {
  if (type === "DEADLINE_OVERDUE" || type === "DEADLINE_UPCOMING") return preference.deadlineNotificationsEnabled;
  if (type === "DOCUMENT_TO_REVIEW" || type === "DOCUMENT_EXPIRED" || type === "DOCUMENT_EXPIRING_SOON") return preference.documentNotificationsEnabled;
  if (type === "PACKAGE_READY_FOR_REVIEW" || type === "SHARE_LINK_EXPIRING" || type === "SHARE_LINK_REVOKED") return preference.packageNotificationsEnabled;
  if (type === "SYSTEM") return preference.systemNotificationsEnabled;
  return true;
}

async function hasAllowedMembership(input: { organizationId: string; userId: string }) {
  const membership = await db.organizationMembership.findFirst({
    where: {
      organizationId: input.organizationId,
      userId: input.userId,
      revokedAt: null,
      role: { in: SCHEDULED_EMAIL_ROLES },
    },
    select: { id: true },
  });
  return Boolean(membership);
}

export async function runScheduledEmailDigest(now = new Date()): Promise<ScheduledEmailDigestRunResponse> {
  const preferences = await db.notificationPreference.findMany({
    where: {
      emailDigestEnabled: true,
      emailDigestFrequency: { in: ["DAILY", "WEEKLY"] },
    },
    select: {
      id: true,
      organizationId: true,
      userId: true,
      emailDigestFrequency: true,
      emailDigestHour: true,
      deadlineNotificationsEnabled: true,
      documentNotificationsEnabled: true,
      packageNotificationsEnabled: true,
      systemNotificationsEnabled: true,
      lastDigestSentAt: true,
      user: { select: { email: true, emailVerified: true } },
    },
    orderBy: { updatedAt: "asc" },
    take: 100,
  });

  const result = { scanned: preferences.length, sent: 0, failed: 0, skipped: 0 };
  const currentHour = getRomeHour(now);

  for (const preference of preferences) {
    if (currentHour < preference.emailDigestHour || isTooRecent(preference.emailDigestFrequency, preference.lastDigestSentAt, now)) {
      result.skipped += 1;
      continue;
    }

    if (!(await hasAllowedMembership({ organizationId: preference.organizationId, userId: preference.userId }))) {
      result.skipped += 1;
      continue;
    }

    if (!preference.user.email || !preference.user.emailVerified) {
      result.skipped += 1;
      continue;
    }

    await syncOrganizationReminderRecords(preference.organizationId, now);
    const digest = await getDigestNotifications(preference.organizationId, preference.userId);
    digest.notifications = digest.notifications.filter((notification) => notificationCategoryEnabled(notification.type, preference));
    if (!digest.notifications.length) {
      await recordNotificationEmailDelivery({
        organizationId: preference.organizationId,
        userId: preference.userId,
        type: "DIGEST",
        recipientEmail: preference.user.email,
        notificationCount: 0,
        status: "SKIPPED",
        errorCode: "NO_NOTIFICATIONS",
      });
      await recordProductAuditEventBestEffort({
        organizationId: preference.organizationId,
        actorUserId: preference.userId,
        action: "SCHEDULED_EMAIL_DIGEST_RUN",
        entityType: "EMAIL_DELIVERY",
        outcome: "SUCCESS",
        metadata: { notificationCount: 0, deliveryStatus: "SKIPPED", reasonCode: "NO_NOTIFICATIONS", frequency: preference.emailDigestFrequency },
      });
      result.skipped += 1;
      continue;
    }

    try {
      const sentAt = new Date();
      const delivery = await sendTransactionalEmail({
        to: preference.user.email,
        idempotencyKey: `scheduled-email-digest:${preference.organizationId}:${preference.userId}:${preference.emailDigestFrequency}:${scheduleWindowKey(preference.emailDigestFrequency, now)}`,
        template: {
          kind: "notification-digest",
          unreadCount: digest.unreadCount,
          items: digest.notifications.map(toEmailItem),
          notificationsUrl: getNotificationsUrl(),
        },
      });
      await recordNotificationEmailDelivery({
        organizationId: preference.organizationId,
        userId: preference.userId,
        type: "DIGEST",
        recipientEmail: preference.user.email,
        notificationCount: digest.notifications.length,
        status: "SENT",
        providerMessageId: delivery.providerMessageId,
        sentAt,
      });
      await db.notificationPreference.update({
        where: { id: preference.id },
        data: { lastDigestSentAt: sentAt },
        select: { id: true },
      });
      await recordProductAuditEventBestEffort({
        organizationId: preference.organizationId,
        actorUserId: preference.userId,
        action: "SCHEDULED_EMAIL_DIGEST_RUN",
        entityType: "EMAIL_DELIVERY",
        outcome: "SUCCESS",
        metadata: { notificationCount: digest.notifications.length, deliveryStatus: "SENT", frequency: preference.emailDigestFrequency },
      });
      result.sent += 1;
    } catch (error) {
      await recordNotificationEmailDelivery({
        organizationId: preference.organizationId,
        userId: preference.userId,
        type: "DIGEST",
        recipientEmail: preference.user.email,
        notificationCount: digest.notifications.length,
        status: "FAILED",
        errorCode: error instanceof TransactionalEmailError ? "PROVIDER_ERROR" : "EMAIL_ERROR",
      });
      await recordProductAuditEventBestEffort({
        organizationId: preference.organizationId,
        actorUserId: preference.userId,
        action: "SCHEDULED_EMAIL_DIGEST_RUN",
        entityType: "EMAIL_DELIVERY",
        outcome: "FAILED",
        metadata: { notificationCount: digest.notifications.length, deliveryStatus: "FAILED", frequency: preference.emailDigestFrequency },
      });
      result.failed += 1;
    }
  }

  return { ...result, generatedAt: new Date().toISOString() };
}
