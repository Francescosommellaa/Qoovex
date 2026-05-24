import "server-only";

import { db } from "@qoovex/db";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitEntry>();

export class RateLimitExceededError extends Error {
  constructor() {
    super("Troppe richieste. Riprova tra qualche minuto.");
    this.name = "RateLimitExceededError";
  }
}

export function assertRateLimit(input: {
  userId: string;
  bucket: string;
  limit: number;
  windowMs: number;
}) {
  const key = `${input.userId}:${input.bucket}`;
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + input.windowMs });
    return;
  }

  if (current.count >= input.limit) {
    throw new RateLimitExceededError();
  }

  current.count += 1;
}

export async function assertPersistentRateLimit(input: {
  identifier: string;
  bucket: string;
  limit: number;
  windowMs: number;
}) {
  const normalizedIdentifier = input.identifier.trim().toLowerCase() || "anonymous";
  const key = `${input.bucket}:${normalizedIdentifier}`;
  const now = new Date();
  const resetAt = new Date(now.getTime() + input.windowMs);

  const current = await db.authRateLimit.findUnique({ where: { key } });
  if (!current || current.resetAt <= now) {
    await db.authRateLimit.upsert({
      where: { key },
      create: {
        key,
        bucket: input.bucket,
        count: 1,
        resetAt,
      },
      update: {
        bucket: input.bucket,
        count: 1,
        resetAt,
      },
    });
    return;
  }

  if (current.count >= input.limit) {
    throw new RateLimitExceededError();
  }

  await db.authRateLimit.update({
    where: { key },
    data: { count: { increment: 1 } },
  });
}
