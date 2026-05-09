import "server-only";

import { db } from "@qoovex/db";

export async function listRecentSearchesForUser(userId: string, take: number) {
  return await db.recentSearch.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
    select: { id: true, query: true, createdAt: true },
  });
}

export async function upsertRecentSearchForUser(userId: string, query: string) {
  await db.recentSearch.upsert({
    where: { userId_query: { userId, query } },
    create: { userId, query },
    update: { createdAt: new Date() },
  });
}

export async function listOverflowRecentSearchIds(userId: string, skip: number) {
  return await db.recentSearch.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    skip,
    select: { id: true },
  });
}

export async function deleteRecentSearchesByIds(ids: string[]) {
  if (ids.length === 0) return;

  await db.recentSearch.deleteMany({
    where: { id: { in: ids } },
  });
}

export async function deleteRecentSearchForUser(userId: string, id: string) {
  await db.recentSearch.deleteMany({
    where: { id, userId },
  });
}
