import type { OrganizationRole } from "@qoovex/types";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  AccessError: class AccessError extends Error {
    constructor(message: string, public readonly status: 401 | 403 | 404 | 409 | 410) {
      super(message);
      this.name = "AccessError";
    }
  },
  db: {
    productAuditEvent: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
  role: "OWNER" as OrganizationRole,
}));

vi.mock("server-only", () => ({}));
vi.mock("@qoovex/db", () => ({ db: mocks.db, Prisma: {} }));
vi.mock("@shared/server/access-errors", () => ({ AccessError: mocks.AccessError }));
vi.mock("./domain-access-service", () => ({
  requireOrganizationDomainAccess: vi.fn(async (_permission: string, allowedRoles: readonly OrganizationRole[]) => {
    if (!allowedRoles.includes(mocks.role)) throw new mocks.AccessError("Risorsa non disponibile.", 404);
    return { context: { userId: "user-1" }, organizationId: "org-1", actorRole: mocks.role };
  }),
}));

import {
  listProductAuditEvents,
  recordProductAuditEventBestEffort,
  sanitizeAuditMetadata,
} from "./product-audit-service";

const now = new Date("2026-07-07T08:00:00.000Z");
const auditRecord = {
  id: "audit-1",
  actorUserId: "user-1",
  actorRole: "OWNER",
  action: "DOCUMENT_VERSION_DOWNLOADED",
  entityType: "DOCUMENT_VERSION",
  entityId: "version-1",
  outcome: "SUCCESS",
  metadata: { mimeType: "application/pdf", size: 1200, blobKey: "private-key", tokenHash: "hash", emailBody: "body" },
  requestId: null,
  supportSessionId: null,
  createdAt: now,
};

describe("product audit service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.role = "OWNER";
    mocks.db.productAuditEvent.create.mockResolvedValue({ id: "audit-1" });
    mocks.db.productAuditEvent.findMany.mockResolvedValue([auditRecord]);
  });

  it("allows OWNER to list redacted organization audit events", async () => {
    const result = await listProductAuditEvents({ action: "DOCUMENT_VERSION_DOWNLOADED", limit: 20 });

    expect(mocks.db.productAuditEvent.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ organizationId: "org-1", action: "DOCUMENT_VERSION_DOWNLOADED" }),
      take: 21,
    }));
    expect(result.events).toHaveLength(1);
    expect(result.events[0]).toMatchObject({
      id: "audit-1",
      action: "DOCUMENT_VERSION_DOWNLOADED",
      entityType: "DOCUMENT_VERSION",
      metadata: { mimeType: "application/pdf", size: 1200 },
    });
    expect(JSON.stringify(result)).not.toMatch(/private-key|tokenHash|emailBody|blobKey/);
  });

  it("denies non-owner roles from reading audit events", async () => {
    mocks.role = "COLLABORATOR";

    await expect(listProductAuditEvents()).rejects.toMatchObject({ status: 404 });
    expect(mocks.db.productAuditEvent.findMany).not.toHaveBeenCalled();
  });

  it("sanitizes metadata with an allowlist and sensitive key redaction", () => {
    expect(sanitizeAuditMetadata({
      mimeType: "image/png",
      size: 123,
      reasonCode: "manual",
      previousPhase: "PREPARATION",
      nextPhase: "IN_PROGRESS",
      blobKey: "hidden",
      token: "hidden",
      downloadUrl: "hidden",
      emailBody: "hidden",
      fileContent: "hidden",
      password: "hidden",
      secret: "hidden",
      latitude: 45,
      stack: "hidden",
      arbitrary: "hidden",
    })).toEqual({ mimeType: "image/png", size: 123, reasonCode: "manual", previousPhase: "PREPARATION", nextPhase: "IN_PROGRESS" });
  });

  it("keeps best-effort audit writes from blocking user flows", async () => {
    mocks.db.productAuditEvent.create.mockRejectedValueOnce(new Error("db unavailable"));

    await expect(recordProductAuditEventBestEffort({
      organizationId: "org-1",
      actorUserId: "user-1",
      actorRole: "OWNER",
      action: "SHARE_LINK_REVOKED",
      entityType: "SHARE_LINK",
      entityId: "share-1",
      metadata: { reasonCode: "manual-revoke", rawToken: "hidden" },
    })).resolves.toBeUndefined();
  });
});
