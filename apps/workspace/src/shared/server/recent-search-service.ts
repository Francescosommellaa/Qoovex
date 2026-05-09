import "server-only";

import {
  deleteRecentSearchForUser,
  deleteRecentSearchesByIds,
  listOverflowRecentSearchIds,
  listRecentSearchesForUser,
  upsertRecentSearchForUser,
} from "@shared/server/repositories/recent-search-repository";

const MAX_RECENT_SEARCHES = 7;

export class InvalidRecentSearchInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidRecentSearchInputError";
  }
}

function normalizeRecentSearchQuery(value: unknown): string {
  if (typeof value !== "string") {
    throw new InvalidRecentSearchInputError("Query must be a string.");
  }

  const query = value.trim();

  if (!query) {
    throw new InvalidRecentSearchInputError("Query is required.");
  }

  return query;
}

function normalizeRecentSearchId(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new InvalidRecentSearchInputError("Id is required.");
  }

  return value.trim();
}

export async function listRecentSearches(userId: string) {
  return await listRecentSearchesForUser(userId, MAX_RECENT_SEARCHES);
}

export async function recordRecentSearch(userId: string, rawQuery: unknown) {
  const query = normalizeRecentSearchQuery(rawQuery);

  await upsertRecentSearchForUser(userId, query);

  const overflow = await listOverflowRecentSearchIds(
    userId,
    MAX_RECENT_SEARCHES,
  );

  await deleteRecentSearchesByIds(overflow.map((item) => item.id));
}

export async function removeRecentSearch(userId: string, rawId: unknown) {
  const id = normalizeRecentSearchId(rawId);
  await deleteRecentSearchForUser(userId, id);
}
