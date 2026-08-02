import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@qoovex/db", () => ({ db: {}, Prisma: {} }));

import { assertMinimizedOperationalPayload, enqueueOperationalProcess } from "./operational-process-service";

describe("operational process enqueue", () => {
  it("rejects file content, secrets and signed URLs from minimized context", () => {
    expect(() => assertMinimizedOperationalPayload({ title: "Documento", blobKey: "private" })).toThrow("OPERATIONAL_PAYLOAD_FORBIDDEN_KEY");
    expect(() => assertMinimizedOperationalPayload({ nested: { signedUrl: "https://example.test" } })).toThrow("OPERATIONAL_PAYLOAD_FORBIDDEN_KEY");
    expect(() => assertMinimizedOperationalPayload({ source: "workspace", revision: 1, confirmed: true })).not.toThrow();
  });

  it("uses the organization plus idempotency key and creates the versioned registry steps", async () => {
    const upsert = vi.fn().mockResolvedValue({ id: "process-1" });
    const client = {
      worker: { findFirst: vi.fn().mockResolvedValue({ id: "worker-1" }) },
      operationalProcess: { upsert },
    };
    const input = {
      organizationId: "org-1",
      type: "WORKER_CREATED" as const,
      triggerKind: "WORKER_CREATED",
      idempotencyKey: "worker:worker-1:created",
      context: { source: "workspace" },
      artifacts: [{ type: "WORKER" as const, id: "worker-1", label: "Mario Rossi" }],
    };
    await enqueueOperationalProcess(input, client as never);
    await enqueueOperationalProcess(input, client as never);

    expect(upsert).toHaveBeenCalledTimes(2);
    expect(upsert).toHaveBeenNthCalledWith(1, expect.objectContaining({
      where: { organizationId_idempotencyKey: { organizationId: "org-1", idempotencyKey: "worker:worker-1:created" } },
      update: {},
      create: expect.objectContaining({
        definitionVersion: 1,
        steps: { create: expect.arrayContaining([expect.objectContaining({ key: "capture-context", status: "READY" })]) },
      }),
    }));
  });

  it("rejects cross-organization artifact references before persistence", async () => {
    const client = {
      document: { findFirst: vi.fn().mockResolvedValue(null) },
      operationalProcess: { upsert: vi.fn() },
    };
    await expect(enqueueOperationalProcess({ organizationId: "org-1", type: "DOCUMENT_RECEIVED", triggerKind: "TEST", idempotencyKey: "test", artifacts: [{ type: "DOCUMENT", id: "foreign-document" }] }, client as never)).rejects.toThrow("INVALID_OPERATIONAL_ARTIFACT:DOCUMENT");
    expect(client.operationalProcess.upsert).not.toHaveBeenCalled();
  });

  it("accepts the operational request, context message and document source artifact families", async () => {
    const client = {
      operationalRequest: { findFirst: vi.fn().mockResolvedValue({ id: "request-1" }) },
      contextMessage: { findFirst: vi.fn().mockResolvedValue({ id: "message-1" }) },
      documentSourcePolicy: { findFirst: vi.fn().mockResolvedValue({ id: "source-1" }) },
      operationalProcess: { upsert: vi.fn().mockResolvedValue({ id: "process-1" }) },
    };
    await enqueueOperationalProcess({ organizationId: "org-1", type: "CONTINUOUS_CONTROL", triggerKind: "TEST", idempotencyKey: "phase4-artifacts", artifacts: [
      { type: "OPERATIONAL_REQUEST", id: "request-1" },
      { type: "CONTEXT_MESSAGE", id: "message-1" },
      { type: "DOCUMENT_SOURCE", id: "source-1" },
    ] }, client as never);
    expect(client.operationalProcess.upsert).toHaveBeenCalledOnce();
  });
});
