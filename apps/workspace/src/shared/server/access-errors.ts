export class AccessError extends Error {
  constructor(message: string, public readonly status: 401 | 403 | 404 | 409 | 410) {
    super(message);
    this.name = "AccessError";
  }
}

export function asAccessResponse(error: unknown) {
  const status = error instanceof AccessError ? error.status : 500;
  const message = error instanceof AccessError ? error.message : "Operazione non disponibile.";
  if (!(error instanceof AccessError)) {
    try {
      after(() => recordRuntimeErrorBestEffort({ error, source: "handled-api" }));
    } catch {
      // Some unit-test contexts do not provide a Next.js request lifecycle.
    }
  }
  return Response.json({ message }, { status });
}
import { after } from "next/server";
import { recordRuntimeErrorBestEffort } from "@shared/server/runtime-error-service";
