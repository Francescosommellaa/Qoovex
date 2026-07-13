export class AccessError extends Error {
  constructor(
    message: string,
    public readonly status: 400 | 401 | 403 | 404 | 409 | 410 | 429,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "AccessError";
  }
}

export function asAccessResponse(error: unknown) {
  const isRateLimit = error instanceof RateLimitExceededError;
  const status = error instanceof AccessError ? error.status : isRateLimit ? 429 : 500;
  const message = error instanceof AccessError || isRateLimit ? error.message : "Operazione non disponibile.";
  if (!(error instanceof AccessError) && !isRateLimit) {
    try {
      after(() => recordRuntimeErrorBestEffort({ error, source: "handled-api" }));
    } catch {
      // Some unit-test contexts do not provide a Next.js request lifecycle.
    }
  }
  const code = error instanceof AccessError ? error.code : isRateLimit ? "RATE_LIMITED" : undefined;
  return Response.json({ message, ...(code ? { code } : {}) }, { status });
}
import { after } from "next/server";
import { RateLimitExceededError } from "@shared/server/rate-limit";
import { recordRuntimeErrorBestEffort } from "@shared/server/runtime-error-service";
