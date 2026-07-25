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

export async function submitJson<TResponse>(path: string, method: "POST" | "PATCH" | "DELETE", payload?: Record<string, unknown>) {
  const response = await fetch(path, {
    method,
    headers: payload ? { "Content-Type": "application/json" } : undefined,
    body: payload ? JSON.stringify(payload) : undefined,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as
      | { message?: string; errors?: ApiFieldError[] }
      | null;
    const message = body?.message ?? (await response.text()) ?? "Operazione non riuscita.";
    throw new ApiError(message, body?.errors ?? []);
  }
  return response.json() as Promise<TResponse>;
}

export async function submitFormData<TResponse>(path: string, formData: FormData) {
  const response = await fetch(path, { method: "POST", body: formData });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as
      | { message?: string; errors?: ApiFieldError[] }
      | null;
    const message = body?.message ?? (await response.text()) ?? "Operazione non riuscita.";
    throw new ApiError(message, body?.errors ?? []);
  }
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
