import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, submitJson } from "./admin-api-client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("admin API client errors", () => {
  it("preserves the structured message and valid field errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      message: "Dati non validi.",
      errors: [{ field: "email", message: "Email non valida." }, { field: 3, message: null }],
    }), { status: 409, headers: { "Content-Type": "application/json" } })));

    await expect(submitJson("/api/example", "POST", { email: "invalid" })).rejects.toMatchObject({
      name: "ApiError",
      message: "Dati non validi.",
      fieldErrors: [{ field: "email", message: "Email non valida." }],
    } satisfies Partial<ApiError>);
  });

  it("preserves a plain-text error without reading the response body twice", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Servizio temporaneamente non disponibile.", { status: 503 })));

    await expect(submitJson("/api/example", "DELETE")).rejects.toMatchObject({
      name: "ApiError",
      message: "Servizio temporaneamente non disponibile.",
      fieldErrors: [],
    } satisfies Partial<ApiError>);
  });
});
