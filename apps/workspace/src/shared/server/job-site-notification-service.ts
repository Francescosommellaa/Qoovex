import "server-only";

import { db, Prisma, type NotificationSourceType, type NotificationType } from "@qoovex/db";
import { z } from "zod";
import { buildAbsoluteWorkspaceUrl } from "./workspace-url-service";
import { sendTransactionalEmail } from "./transactional-email-service";
import type { JobSiteActor } from "./job-site-authorization-service";

function classify(action: string): { type: NotificationType; sourceType: NotificationSourceType; title: string } {
  if (action.includes("PAYMENT")) return { type: "PAYMENT_ACTIVITY", sourceType: "PAYMENT_REQUEST", title: "Attività pagamento" };
  if (action.includes("DISPUTE")) return { type: "DISPUTE_ACTIVITY", sourceType: "DISPUTE", title: "Disaccordo aggiornato" };
  if (action.includes("EXPORT")) return { type: "EXPORT_READY", sourceType: "EXPORT", title: "Export aggiornato" };
  if (action.includes("PROPOSAL") || action.includes("CHANGE")) return { type: "JOB_SITE_ACTION_REQUIRED", sourceType: "CHANGE_PROPOSAL", title: "Modifica da controllare" };
  return { type: "JOB_SITE_ACTIVITY", sourceType: "JOB_SITE", title: "Cantiere aggiornato" };
}

const deliveryPayloadSchema = z.object({ title: z.string().min(1).max(200), actionHref: z.string().startsWith("/"), jobSiteId: z.string().min(1) }).strict();

export async function runJobSiteNotificationDeliveries(now = new Date()) {
  const deliveries = await db.notificationDelivery.findMany({
    where: { status: "PENDING", nextAttemptAt: { lte: now }, attemptCount: { lt: 5 } },
    select: { id: true, dedupeKey: true, safePayload: true, attemptCount: true, user: { select: { email: true } } },
    orderBy: [{ nextAttemptAt: "asc" }, { createdAt: "asc" }],
    take: 25,
  });
  let sent = 0;
  let failed = 0;
  for (const delivery of deliveries) {
    try {
      const payload = deliveryPayloadSchema.parse(delivery.safePayload);
      await sendTransactionalEmail({
        to: delivery.user.email,
        template: { kind: "notification-single", item: { title: payload.title, message: "Apri il cantiere per controllare l'aggiornamento autorizzato.", severity: "INFO", createdAt: now }, notificationsUrl: buildAbsoluteWorkspaceUrl(payload.actionHref) },
        idempotencyKey: delivery.dedupeKey,
      });
      await db.notificationDelivery.update({ where: { id: delivery.id }, data: { status: "SENT", sentAt: new Date(), attemptCount: { increment: 1 }, errorCode: null } });
      sent += 1;
    } catch (error) {
      const terminal = delivery.attemptCount + 1 >= 5;
      await db.notificationDelivery.update({ where: { id: delivery.id }, data: { status: terminal ? "FAILED" : "PENDING", attemptCount: { increment: 1 }, nextAttemptAt: new Date(Date.now() + 60_000 * 2 ** delivery.attemptCount), failedAt: terminal ? new Date() : null, errorCode: error instanceof Error ? error.name.slice(0, 120) : "DELIVERY_FAILED" } });
      failed += 1;
    }
  }
  return { scanned: deliveries.length, sent, failed };
}

export async function queueJobSiteNotifications(tx: Prisma.TransactionClient, input: { actor: JobSiteActor; action: string; idempotencyKey: string; sourceId?: string | null }) {
  const recipients = await tx.jobSiteParticipant.findMany({ where: { jobSiteId: input.actor.jobSiteId, status: "ACTIVE", kind: input.actor.side === "CLIENT" ? "ORGANIZATION_MEMBER" : "CLIENT", userId: { not: input.actor.userId } }, select: { userId: true, kind: true } });
  if (!recipients.length) return;
  const category = classify(input.action);
  const preferences = await tx.notificationPreference.findMany({ where: { organizationId: input.actor.organizationId, userId: { in: recipients.map((value) => value.userId) }, type: category.type }, select: { userId: true, channel: true, frequency: true } });
  for (const recipient of recipients) {
    const actionHref = recipient.kind === "CLIENT" ? `/client/job-sites/${input.actor.jobSiteId}` : `/job-sites/${input.actor.jobSiteId}`;
    const inAppFrequency = preferences.find((value) => value.userId === recipient.userId && value.channel === "IN_APP")?.frequency ?? "IMMEDIATE";
    const emailFrequency = preferences.find((value) => value.userId === recipient.userId && value.channel === "EMAIL")?.frequency ?? "IMMEDIATE";
    const day = new Date().toISOString().slice(0, 10);
    if (inAppFrequency !== "DISABLED") {
      const dedupeKey = inAppFrequency === "DAILY_DIGEST" ? `job-site-digest:${input.actor.organizationId}:${category.type}:${day}:${recipient.userId}` : `job-site:${input.action}:${input.idempotencyKey}:${recipient.userId}`;
      await tx.notification.upsert({ where: { organizationId_dedupeKey: { organizationId: input.actor.organizationId, dedupeKey } }, create: { organizationId: input.actor.organizationId, userId: recipient.userId, type: category.type, severity: category.type === "JOB_SITE_ACTION_REQUIRED" ? "ATTENTION" : "INFO", title: inAppFrequency === "DAILY_DIGEST" ? "Riepilogo attività cantiere" : category.title, message: "Apri il cantiere per controllare gli eventi autorizzati.", sourceType: category.sourceType, sourceId: input.sourceId ?? input.actor.jobSiteId, dedupeKey, actionHref }, update: { updatedAt: new Date(), actionHref } });
    }
    if (emailFrequency !== "DISABLED") {
      const digest = emailFrequency === "DAILY_DIGEST";
      const dedupeKey = digest ? `job-site-email-digest:${input.actor.organizationId}:${category.type}:${day}:${recipient.userId}` : `job-site-email:${input.action}:${input.idempotencyKey}:${recipient.userId}`;
      const tomorrow = new Date(); tomorrow.setUTCDate(tomorrow.getUTCDate() + 1); tomorrow.setUTCHours(8, 0, 0, 0);
      const safePayload = { title: digest ? "Riepilogo attività cantiere" : category.title, actionHref, jobSiteId: input.actor.jobSiteId };
      await tx.notificationDelivery.upsert({ where: { dedupeKey }, create: { organizationId: input.actor.organizationId, userId: recipient.userId, channel: "EMAIL", dedupeKey, templateKey: digest ? "JOB_SITE_DAILY_DIGEST@1" : "JOB_SITE_ACTIVITY@1", safePayload, nextAttemptAt: digest ? tomorrow : new Date() }, update: { safePayload } });
    }
  }
}
