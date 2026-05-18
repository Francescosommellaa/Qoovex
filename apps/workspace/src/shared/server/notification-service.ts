import "server-only";

import {
  countUnreadNotificationsForUser,
  createNotificationRecord,
  deleteNotificationsForUser,
  listNotificationTypesForUser,
  listNotificationsForUser,
  listRecentNotificationsForUser,
  markAllNotificationsReadForUser,
  markNotificationReadForUser,
  markNotificationsReadStateForUser,
} from "@shared/server/repositories/notification-repository";
import type {
  NotificationDto,
  NotificationFeedDto,
  NotificationInboxDto,
  NotificationQueryFilters,
} from "@shared/lib/workspace-types";

const RECENT_NOTIFICATIONS_LIMIT = 7;
const DEFAULT_INBOX_LIMIT = 20;
const MAX_INBOX_LIMIT = 50;

function mapNotification(notification: Awaited<ReturnType<typeof listRecentNotificationsForUser>>[number]): NotificationDto {
  return {
    ...notification,
    createdAt: notification.createdAt.toISOString(),
  };
}

function parseDateFilter(value: string | undefined, boundary: "start" | "end") {
  if (!value) return undefined;

  const suffix = boundary === "start" ? "T00:00:00.000" : "T23:59:59.999";
  const date = new Date(`${value}${suffix}`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function normalizeIds(rawIds: unknown, rawId?: unknown) {
  const ids = Array.isArray(rawIds)
    ? rawIds
    : rawId === undefined
      ? []
      : [rawId];

  const normalizedIds = ids
    .filter((id): id is string => typeof id === "string")
    .map((id) => id.trim())
    .filter(Boolean);

  if (normalizedIds.length === 0) {
    throw new Error("Notification id is required.");
  }

  return normalizedIds;
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

export async function getUnreadNotificationCount(userId: string) {
  return await countUnreadNotificationsForUser(userId);
}

export async function getNotificationInbox(
  userId: string,
  filters: NotificationQueryFilters = {},
): Promise<NotificationInboxDto> {
  const take = Math.min(
    Math.max(filters.take ?? DEFAULT_INBOX_LIMIT, 1),
    MAX_INBOX_LIMIT,
  );
  const read =
    filters.read === "read"
      ? true
      : filters.read === "unread"
        ? false
        : undefined;

  const [notifications, unreadCount, types] = await Promise.all([
    listNotificationsForUser({
      userId,
      take: take + 1,
      cursor: filters.cursor,
      read,
      type: filters.type || undefined,
      from: parseDateFilter(filters.from, "start"),
      to: parseDateFilter(filters.to, "end"),
    }),
    countUnreadNotificationsForUser(userId),
    listNotificationTypesForUser(userId),
  ]);

  const visibleNotifications = notifications.slice(0, take);

  return {
    unreadCount,
    notifications: visibleNotifications.map(mapNotification),
    nextCursor:
      notifications.length > take
        ? visibleNotifications.at(-1)?.id ?? null
        : null,
    types: types.map((notificationType) => notificationType.type),
  };
}

export async function markNotificationRead(userId: string, rawId: unknown) {
  if (typeof rawId !== "string" || !rawId.trim()) {
    throw new Error("Notification id is required.");
  }

  await markNotificationReadForUser(userId, rawId.trim());
}

export async function markNotificationsReadState(
  userId: string,
  rawIds: unknown,
  read: boolean,
  rawId?: unknown,
) {
  await markNotificationsReadStateForUser(userId, normalizeIds(rawIds, rawId), read);
}

export async function markAllNotificationsRead(userId: string) {
  await markAllNotificationsReadForUser(userId);
}

export async function deleteNotifications(userId: string, rawIds: unknown, rawId?: unknown) {
  await deleteNotificationsForUser(userId, normalizeIds(rawIds, rawId));
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
