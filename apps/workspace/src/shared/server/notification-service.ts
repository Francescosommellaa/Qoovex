import "server-only";

import { db } from "@qoovex/db";
import type { NotificationListResponse, NotificationResponse } from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { recordSupportAccess } from "@shared/server/support-access-service";
import { requireOrganizationDomainAccess } from "./domain-access-service";
import { syncOrganizationReminderRecords } from "./reminder-service";

const NOTIFICATION_ACCESS_ROLES = ["OWNER", "ADMIN", "SAFETY_CONSULTANT"] as const;

export interface ListNotificationsInput {
  filter?: unknown;
}

const notificationSelect = {
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

function toIso(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}

export function toNotificationResponse(notification: {
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
}): NotificationResponse {
  return {
    id: notification.id,
    userId: notification.userId,
    type: notification.type,
    severity: notification.severity,
    title: notification.title,
    message: notification.message,
    sourceType: notification.sourceType,
    sourceId: notification.sourceId,
    actionHref: notification.actionHref,
    readAt: toIso(notification.readAt),
    dismissedAt: toIso(notification.dismissedAt),
    createdAt: notification.createdAt.toISOString(),
    updatedAt: notification.updatedAt.toISOString(),
  };
}

function visibleNotificationWhere(organizationId: string, userId: string) {
  return {
    organizationId,
    OR: [{ userId: null }, { userId }],
  };
}

function parseFilter(filter: unknown): "all" | "unread" {
  if (filter === undefined || filter === null || filter === "" || filter === "all") return "all";
  if (filter === "unread") return "unread";
  throw new AccessError("Filtro notifiche non valido.", 409);
}

export async function listNotifications(input: ListNotificationsInput = {}): Promise<NotificationListResponse> {
  const { context, organizationId } = await requireOrganizationDomainAccess("organization:read", NOTIFICATION_ACCESS_ROLES);
  await syncOrganizationReminderRecords(organizationId);

  const filter = parseFilter(input.filter);
  const baseWhere = {
    ...visibleNotificationWhere(organizationId, context.userId),
    dismissedAt: null,
  };
  const where = filter === "unread" ? { ...baseWhere, readAt: null } : baseWhere;
  const [notifications, unreadCount] = await Promise.all([
    db.notification.findMany({
      where,
      select: notificationSelect,
      orderBy: [{ readAt: "asc" }, { severity: "desc" }, { createdAt: "desc" }],
      take: 100,
    }),
    db.notification.count({
      where: { ...baseWhere, readAt: null },
    }),
  ]);

  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "notifications" });
  return {
    notifications: notifications.map(toNotificationResponse),
    unreadCount,
    generatedAt: new Date().toISOString(),
  };
}

async function findVisibleNotification(organizationId: string, userId: string, notificationId: string) {
  const notification = await db.notification.findFirst({
    where: {
      id: notificationId,
      ...visibleNotificationWhere(organizationId, userId),
      dismissedAt: null,
    },
    select: { id: true },
  });
  if (!notification) throw new AccessError("Notifica non trovata.", 404);
  return notification.id;
}

export async function markNotificationRead(notificationId: string) {
  const { context, organizationId } = await requireOrganizationDomainAccess("organization:read", NOTIFICATION_ACCESS_ROLES);
  const id = await findVisibleNotification(organizationId, context.userId, notificationId);
  const notification = await db.notification.update({
    where: { id },
    data: { readAt: new Date() },
    select: notificationSelect,
  });
  await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "notification", resourceId: id });
  return { notification: toNotificationResponse(notification), read: true as const };
}

export async function dismissNotification(notificationId: string) {
  const { context, organizationId } = await requireOrganizationDomainAccess("organization:read", NOTIFICATION_ACCESS_ROLES);
  const id = await findVisibleNotification(organizationId, context.userId, notificationId);
  const notification = await db.notification.update({
    where: { id },
    data: { dismissedAt: new Date() },
    select: notificationSelect,
  });
  await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "notification", resourceId: id });
  return { notification: toNotificationResponse(notification), dismissed: true as const };
}
