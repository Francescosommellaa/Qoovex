import "server-only";

import { db, Prisma } from "@qoovex/db";

const MAX_SERIALIZABLE_ATTEMPTS = 5;
const BASE_RETRY_DELAY_MS = 10;
const MAX_RETRY_DELAY_MS = 100;

export class SerializableTransactionConflictError extends Error {
  constructor() {
    super("Serializable transaction retry limit reached.");
    this.name = "SerializableTransactionConflictError";
  }
}

export function isPrismaKnownRequestError(error: unknown, code: string) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;
}

function waitBeforeRetry(attempt: number) {
  const exponentialDelay = Math.min(BASE_RETRY_DELAY_MS * 2 ** (attempt - 1), MAX_RETRY_DELAY_MS);
  const jitter = Math.floor(Math.random() * BASE_RETRY_DELAY_MS);
  return new Promise<void>((resolve) => setTimeout(resolve, exponentialDelay + jitter));
}

export async function runSerializableTransaction<T>(
  operation: (tx: Prisma.TransactionClient) => Promise<T>,
  options: {
    shouldRetry?: (error: unknown) => boolean | Promise<boolean>;
  } = {},
) {
  for (let attempt = 1; attempt <= MAX_SERIALIZABLE_ATTEMPTS; attempt += 1) {
    try {
      return await db.$transaction(operation, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error) {
      const serializationConflict = isPrismaKnownRequestError(error, "P2034");
      const retryable = serializationConflict || (await options.shouldRetry?.(error)) === true;
      if (!retryable) throw error;
      if (attempt === MAX_SERIALIZABLE_ATTEMPTS) {
        if (serializationConflict) throw new SerializableTransactionConflictError();
        throw error;
      }
      await waitBeforeRetry(attempt);
    }
  }

  throw new SerializableTransactionConflictError();
}
