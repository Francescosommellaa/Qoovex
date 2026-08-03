import { ZodError } from "zod";
import { AccessError } from "./access-errors";

function fieldErrors(error: ZodError) {
  const flattened = error.flatten().fieldErrors;
  return Object.fromEntries(Object.entries(flattened).filter((entry): entry is [string, string[]] => Array.isArray(entry[1])));
}

export function asVNextApiError(error: unknown) {
  if (error instanceof ZodError) {
    return Response.json({ error: { code: "VALIDATION_ERROR", message: "Controlla i campi indicati.", fieldErrors: fieldErrors(error) } }, { status: 400 });
  }
  if (error instanceof AccessError) {
    const currentRevision = /revision[:=](\d+)/i.exec(error.message)?.[1];
    return Response.json({ error: { code: error.code ?? "REQUEST_REJECTED", message: error.message, ...(currentRevision ? { currentRevision: Number(currentRevision) } : {}) } }, { status: error.status });
  }
  return Response.json({ error: { code: "INTERNAL_ERROR", message: "Operazione non disponibile." } }, { status: 500 });
}

export function requireIdempotencyKey(request: Request) {
  const key = request.headers.get("Idempotency-Key")?.trim();
  if (!key) throw new AccessError("Idempotency-Key richiesta.", 409, "IDEMPOTENCY_KEY_REQUIRED");
  return key;
}
