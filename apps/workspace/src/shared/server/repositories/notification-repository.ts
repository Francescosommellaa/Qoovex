import "server-only";

import { db, type Prisma } from "@qoovex/db";

export interface CreateNotificationRecordInput {
  userId: string;
  type: string;
  title: string;
  body?: string | null;
  data?: unknown;
}

export interface ListNotificationsForUserInput {
  userId: string;
  take: number;
  cursor?: string;
  read?: boolean;
  type?: string;
  from?: Date;
  to?: Date;
}

function getNotificationWhere(input: ListNotificationsForUserInput): Prisma.NotificationWhereInput {
  return {
    userId: input.userId,
    read: input.read,
    type: input.type,
    createdAt:
      input.from || input.to
        ? {
            gte: input.from,
            lte: input.to,
          }
        : undefined,
  };
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

export async function listNotificationsForUser(input: ListNotificationsForUserInput) {
  return await db.notification.findMany({
    where: getNotificationWhere(input),
    orderBy: { createdAt: "desc" },
    take: input.take,
    cursor: input.cursor ? { id: input.cursor } : undefined,
    skip: input.cursor ? 1 : undefined,
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

export async function listNotificationTypesForUser(userId: string) {
  return await db.notification.findMany({
    where: { userId },
    distinct: ["type"],
    orderBy: { type: "asc" },
    select: { type: true },
  });
}

export async function markNotificationReadForUser(userId: string, id: string) {
  await db.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });
}

export async function markNotificationsReadStateForUser(
  userId: string,
  ids: string[],
  read: boolean,
) {
  await db.notification.updateMany({
    where: { userId, id: { in: ids } },
    data: { read },
  });
}

export async function markAllNotificationsReadForUser(userId: string) {
  await db.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

export async function deleteNotificationsForUser(userId: string, ids: string[]) {
  await db.notification.deleteMany({
    where: { userId, id: { in: ids } },
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
