import "server-only";

import crypto from "crypto";
import { db, Prisma } from "@qoovex/db";

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
  userId?: string | null;
}) {
  const normalizedIdentifier = input.identifier.trim().toLowerCase() || "anonymous";
  const key = createPersistentRateLimitKey(input.bucket, normalizedIdentifier);
  const now = new Date();
  const resetAt = new Date(now.getTime() + input.windowMs);

  const rows = await db.$queryRaw<Array<{ count: number }>>(Prisma.sql`
    INSERT INTO "AuthRateLimit" (
      "key", "bucket", "userId", "count", "resetAt", "createdAt", "updatedAt"
    ) VALUES (
      ${key}, ${input.bucket}, ${input.userId ?? null}, 1, ${resetAt}, ${now}, ${now}
    )
    ON CONFLICT ("key") DO UPDATE SET
      "bucket" = EXCLUDED."bucket",
      "userId" = COALESCE(EXCLUDED."userId", "AuthRateLimit"."userId"),
      "count" = CASE
        WHEN "AuthRateLimit"."resetAt" <= ${now} THEN 1
        ELSE "AuthRateLimit"."count" + 1
      END,
      "resetAt" = CASE
        WHEN "AuthRateLimit"."resetAt" <= ${now} THEN EXCLUDED."resetAt"
        ELSE "AuthRateLimit"."resetAt"
      END,
      "updatedAt" = ${now}
    WHERE "AuthRateLimit"."resetAt" <= ${now}
       OR "AuthRateLimit"."count" < ${input.limit}
    RETURNING "count"
  `);

  await db.authRateLimit.deleteMany({
    where: { resetAt: { lte: now }, key: { not: key } },
  }).catch(() => undefined);

  if (!rows.length) throw new RateLimitExceededError();
  return key;
}

function getRateLimitSecret() {
  const secret = process.env.QOOVEX_AUDIT_SECRET?.trim();
  if (!secret || secret.length < 32) throw new Error("QOOVEX_AUDIT_SECRET non configurato.");
  return secret;
}

export function createPersistentRateLimitKey(bucket: string, normalizedIdentifier: string) {
  const digest = crypto
    .createHmac("sha256", getRateLimitSecret())
    .update(`rate-limit:v1\0${bucket}\0${normalizedIdentifier}`)
    .digest("hex");
  return `v1:${digest}`;
}
