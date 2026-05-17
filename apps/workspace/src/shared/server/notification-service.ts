import "server-only";

import {
  countUnreadNotificationsForUser,
  createNotificationRecord,
  listRecentNotificationsForUser,
  markAllNotificationsReadForUser,
  markNotificationReadForUser,
} from "@shared/server/repositories/notification-repository";
import type { NotificationDto, NotificationFeedDto } from "@shared/lib/workspace-types";

const RECENT_NOTIFICATIONS_LIMIT = 7;

function mapNotification(notification: Awaited<ReturnType<typeof listRecentNotificationsForUser>>[number]): NotificationDto {
  return {
    ...notification,
    createdAt: notification.createdAt.toISOString(),
  };
}

export async function getNotificationFeed(userId: string): Promise<NotificationFeedDto> {
  const [notifications, unreadCount] = await Promise.all([
    listRecentNotificationsForUser(userId, RECENT_NOTIFICATIONS_LIMIT),
    countUnreadNotificationsForUser(userId),
  ]);

  return {
    unreadCount,
    notifications: notifications.map(mapNotification),
  };
}

export async function markNotificationRead(userId: string, rawId: unknown) {
  if (typeof rawId !== "string" || !rawId.trim()) {
    throw new Error("Notification id is required.");
  }

  await markNotificationReadForUser(userId, rawId.trim());
}

export async function markAllNotificationsRead(userId: string) {
  await markAllNotificationsReadForUser(userId);
}

export async function createPersistentNotification(input: {
  userId: string;
  type: string;
  title: string;
  body?: string | null;
  data?: unknown;
}) {
  return await createNotificationRecord(input);
}
