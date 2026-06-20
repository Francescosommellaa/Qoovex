export class AccessError extends Error {
  constructor(message: string, public readonly status: 401 | 403 | 404 | 409 | 410) {
    super(message);
    this.name = "AccessError";
  }
}

export function asAccessResponse(error: unknown) {
  const status = error instanceof AccessError ? error.status : 500;
  const message = error instanceof AccessError ? error.message : "Operazione non disponibile.";
  return Response.json({ message }, { status });
}
