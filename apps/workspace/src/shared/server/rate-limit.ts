import "server-only";

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
