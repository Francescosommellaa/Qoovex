import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ upsert: vi.fn() }));

vi.mock("server-only", () => ({}));
vi.mock("@qoovex/db", () => ({ db: { runtimeErrorEvent: { upsert: mocks.upsert } } }));

import { createRuntimeErrorFingerprint, recordRuntimeError, sanitizeRuntimeErrorText } from "./runtime-error-service";

beforeEach(() => mocks.upsert.mockReset().mockResolvedValue({ id: "error-1" }));

describe("runtime error registry", () => {
  it("redacts credentials, emails, tokens and blob URLs", () => {
    const value = sanitizeRuntimeErrorText("mario@example.com password=hunter2 Bearer abc.def.ghi https://x.blob.vercel-storage.com/file", 1000);
    expect(value).not.toContain("mario@example.com");
    expect(value).not.toContain("hunter2");
    expect(value).not.toContain("abc.def.ghi");
    expect(value).not.toContain("vercel-storage.com");
  });

  it("uses stable digest fingerprints", () => {
    const first = createRuntimeErrorFingerprint({ digest: "digest-1", errorName: "Error", message: "one" });
    const second = createRuntimeErrorFingerprint({ digest: "digest-1", errorName: "TypeError", message: "two" });
    expect(first).toBe(second);
  });

  it("upserts sanitized data and reopens recurring errors", async () => {
    await recordRuntimeError({
      error: new Error("token=very-secret-value mario@example.com"),
      source: "route",
      routePath: "/api/documents?token=secret",
      requestMethod: "get",
    });
    expect(mocks.upsert).toHaveBeenCalledWith(expect.objectContaining({
      create: expect.objectContaining({ routePath: "/api/documents", requestMethod: "GET" }),
      update: expect.objectContaining({ status: "OPEN", occurrenceCount: { increment: 1 }, resolvedAt: null }),
    }));
    expect(JSON.stringify(mocks.upsert.mock.calls[0])).not.toContain("very-secret-value");
    expect(JSON.stringify(mocks.upsert.mock.calls[0])).not.toContain("mario@example.com");
  });
});
