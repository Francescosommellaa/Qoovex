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

function isTransactionStartConflict(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2039") return false;
  const driverAdapterError = error.meta?.driverAdapterError;
  if (!driverAdapterError || typeof driverAdapterError !== "object" || !("cause" in driverAdapterError)) return false;
  const cause = driverAdapterError.cause;
  return Boolean(cause && typeof cause === "object" && "originalCode" in cause && cause.originalCode === "25001");
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
      const transactionConflict = isPrismaKnownRequestError(error, "P2034") || isTransactionStartConflict(error);
      const retryable = transactionConflict || (await options.shouldRetry?.(error)) === true;
      if (!retryable) throw error;
      if (attempt === MAX_SERIALIZABLE_ATTEMPTS) {
        if (transactionConflict) throw new SerializableTransactionConflictError();
        throw error;
      }
      await waitBeforeRetry(attempt);
    }
  }

  throw new SerializableTransactionConflictError();
}
