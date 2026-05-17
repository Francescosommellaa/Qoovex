import "server-only";

import { db, type Prisma } from "@qoovex/db";

export interface CreateNotificationRecordInput {
  userId: string;
  type: string;
  title: string;
  body?: string | null;
  data?: unknown;
}

export async function listRecentNotificationsForUser(userId: string, take: number) {
  return await db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      type: true,
      title: true,
      body: true,
      read: true,
      data: true,
      createdAt: true,
    },
  });
}

export async function countUnreadNotificationsForUser(userId: string) {
  return await db.notification.count({
    where: { userId, read: false },
  });
}

export async function markNotificationReadForUser(userId: string, id: string) {
  await db.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });
}

export async function markAllNotificationsReadForUser(userId: string) {
  await db.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

export async function createNotificationRecord(input: CreateNotificationRecordInput) {
  return await db.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      data:
        input.data === undefined
          ? undefined
          : (input.data as Prisma.InputJsonValue),
    },
    select: { id: true },
  });
}
