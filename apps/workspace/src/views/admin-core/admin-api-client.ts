"use client";

export async function submitJson<TResponse>(path: string, method: "POST" | "PATCH" | "DELETE", payload?: Record<string, unknown>) {
  const response = await fetch(path, {
    method,
    headers: payload ? { "Content-Type": "application/json" } : undefined,
    body: payload ? JSON.stringify(payload) : undefined,
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<TResponse>;
}

export async function submitFormData<TResponse>(path: string, formData: FormData) {
  const response = await fetch(path, { method: "POST", body: formData });
  if (!response.ok) throw new Error(await response.text());
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
