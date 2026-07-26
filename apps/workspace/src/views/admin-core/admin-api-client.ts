"use client";

export interface ApiFieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  fieldErrors: ApiFieldError[];

  constructor(message: string, fieldErrors: ApiFieldError[] = []) {
    super(message);
    this.name = "ApiError";
    this.fieldErrors = fieldErrors;
  }
}

async function readApiError(response: Response) {
  const rawBody = await response.text();
  let body: { message?: unknown; errors?: unknown } | null = null;

  try {
    const parsed = JSON.parse(rawBody) as unknown;
    if (parsed && typeof parsed === "object") body = parsed as { message?: unknown; errors?: unknown };
  } catch {
    // Le risposte legacy possono essere testo semplice: il body e gia disponibile in rawBody.
  }

  const fieldErrors = Array.isArray(body?.errors)
    ? body.errors.filter((entry): entry is ApiFieldError => Boolean(
      entry
      && typeof entry === "object"
      && typeof (entry as ApiFieldError).field === "string"
      && typeof (entry as ApiFieldError).message === "string",
    ))
    : [];
  const message = typeof body?.message === "string" && body.message.trim()
    ? body.message
    : rawBody.trim() || "Operazione non riuscita.";

  return new ApiError(message, fieldErrors);
}

export async function submitJson<TResponse>(path: string, method: "POST" | "PATCH" | "DELETE", payload?: Record<string, unknown>) {
  const response = await fetch(path, {
    method,
    headers: payload ? { "Content-Type": "application/json" } : undefined,
    body: payload ? JSON.stringify(payload) : undefined,
  });
  if (!response.ok) throw await readApiError(response);
  return response.json() as Promise<TResponse>;
}

export async function submitFormData<TResponse>(path: string, formData: FormData) {
  const response = await fetch(path, { method: "POST", body: formData });
  if (!response.ok) throw await readApiError(response);
  return response.json() as Promise<TResponse>;
}

export function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function nullableFormValue(formData: FormData, key: string) {
  return formValue(formData, key) ?? null;
}
