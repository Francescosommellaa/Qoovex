import type { OrganizationRole } from "@qoovex/types";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const modelNames = [
    "organization",
    "organizationMembership",
    "organizationInvitation",
    "user",
    "account",
    "session",
    "userCredential",
    "authCode",
    "mfaRecoveryRequest",
    "authDevice",
    "mfaBackupCode",
    "securityAuditEvent",
    "authRateLimit",
    "worker",
    "jobSite",
    "documentType",
    "documentRequirement",
    "document",
    "documentVersion",
    "deadline",
    "calendarEvent",
    "checklist",
    "checklistItem",
    "evidence",
    "documentPackage",
    "documentPackageItem",
    "shareLink",
    "notification",
    "notificationPreference",
    "notificationEmailDelivery",
    "productAuditEvent",
    "dataControlJob",
    "supportSession",
    "supportAuditEvent",
    "workerUserLink",
    "jobSiteUserAssignment",
    "jobSiteWorkerAssignment",
  ] as const;
  const db = Object.fromEntries(modelNames.map((model) => [model, {
    count: vi.fn(),
    groupBy: vi.fn(),
    findMany: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    deleteMany: vi.fn(),
  }]));
  return {
    db: db as Record<(typeof modelNames)[number], {
      count: ReturnType<typeof vi.fn>;
      groupBy: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findUniqueOrThrow: ReturnType<typeof vi.fn>;
      deleteMany: ReturnType<typeof vi.fn>;
    }>,
    modelNames,
    role: "OWNER" as OrganizationRole,
    AccessError: class AccessError extends Error {
      constructor(message: string, public readonly status: number) {
        super(message);
        this.name = "AccessError";
      }
    },
    recordProductAuditEventBestEffort: vi.fn(),
  };
});

vi.mock("server-only", () => ({}));
vi.mock("@qoovex/db", () => ({ db: mocks.db }));
vi.mock("@shared/server/access-errors", () => ({ AccessError: mocks.AccessError }));
vi.mock("./domain-access-service", () => ({
  requireOrganizationDomainAccess: vi.fn(async (_permission: string, allowedRoles: readonly OrganizationRole[]) => {
    if (!allowedRoles.includes(mocks.role)) throw new mocks.AccessError("Risorsa non disponibile.", 404);
    return { context: { userId: "user-1" }, organizationId: "org-1", actorRole: mocks.role };
  }),
}));
vi.mock("./product-audit-service", () => ({
  auditActorFromContext: vi.fn(() => ({ actorUserId: "user-1", actorRole: "OWNER", supportSessionId: null })),
  recordProductAuditEventBestEffort: mocks.recordProductAuditEventBestEffort,
  sanitizeAuditMetadata: vi.fn((metadata: unknown) => {
    if (!metadata || typeof metadata !== "object") return null;
    const output: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(metadata as Record<string, unknown>)) {
      if (/blobKey|tokenHash|token|url|emailBody|fileContent|password|secret/i.test(key)) continue;
      output[key] = value;
    }
    return Object.keys(output).length ? output : null;
  }),
}));

import { buildDataExport } from "./data-export-service";
import { getDataInventory } from "./data-inventory-service";
import { buildDataRetentionOverviewForOrganization } from "./data-retention-service";

const now = new Date("2026-07-09T08:00:00.000Z");

describe("data control services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.role = "OWNER";
    for (const model of mocks.modelNames) {
      mocks.db[model].count.mockResolvedValue(0);
      mocks.db[model].groupBy.mockResolvedValue([]);
      mocks.db[model].findMany.mockResolvedValue([]);
      mocks.db[model].findUniqueOrThrow.mockResolvedValue({ id: "org-1", name: "Qoovex Test", code: "QVX", createdAt: now, updatedAt: now });
    }
  });

  it("allows only OWNER to read inventory", async () => {
    await expect(getDataInventory()).resolves.toMatchObject({ counts: expect.any(Object) });

    mocks.role = "ADMIN";
    await expect(getDataInventory()).rejects.toMatchObject({ status: 404 });
  });

  it("builds the inventory with the 57-operation proxy budget", async () => {
    await getDataInventory();

    const countCalls = mocks.modelNames.reduce((total, model) => total + mocks.db[model].count.mock.calls.length, 0);
    const groupByCalls = mocks.modelNames.reduce((total, model) => total + mocks.db[model].groupBy.mock.calls.length, 0);
    const identityReads = mocks.db.user.findMany.mock.calls.length;
    expect({ countCalls, groupByCalls, identityReads, total: countCalls + groupByCalls + identityReads }).toEqual({
      countCalls: 55,
      groupByCalls: 1,
      identityReads: 1,
      total: 57,
    });
  });

  it("exports metadata without Blob keys, token hashes, raw tokens or email bodies", async () => {
    mocks.db.user.findMany.mockResolvedValue([{ id: "user-1", name: "Mario", email: "mario@example.test", emailVerified: now, firstName: "Mario", lastName: "Rossi", username: "mario", usernameOnboarded: true, profileOnboarded: true, avatarBlobPathname: "organizations/org-1/avatars/private.png", phoneNumber: null, platformRole: "USER", authVersion: 1, suspendedAt: null, suspensionReason: null, mfaEnabled: true, totpPendingCreatedAt: null, totpVerifiedAt: now, usernameChangedAt: null, createdAt: now, updatedAt: now }]);
    mocks.db.documentVersion.findMany.mockResolvedValue([{ id: "version-1", organizationId: "org-1", documentId: "doc-1", originalFileName: "doc.pdf", mimeType: "application/pdf", size: 1200, checksum: "sum", uploadedById: "user-1", createdAt: now, archivedAt: null }]);
    mocks.db.evidence.findMany.mockResolvedValue([{ id: "evidence-1", organizationId: "org-1", jobSiteId: "jobsite-1", workerId: null, checklistItemId: null, type: "FILE", title: "Foto collegata", description: null, originalFileName: "photo.jpg", mimeType: "image/jpeg", size: 200, createdById: "user-1", createdAt: now, archivedAt: null }]);
    mocks.db.shareLink.findMany.mockResolvedValue([{ id: "share-1", organizationId: "org-1", documentPackageId: "package-1", expiresAt: now, revokedAt: null, createdById: "user-1", createdAt: now, lastAccessedAt: null }]);
    mocks.db.productAuditEvent.findMany.mockResolvedValue([{ id: "audit-1", actorUserId: "user-1", actorRole: "OWNER", action: "DOCUMENT_VERSION_DOWNLOADED", entityType: "DOCUMENT_VERSION", entityId: "version-1", outcome: "SUCCESS", metadata: { mimeType: "application/pdf", blobKey: "private", tokenHash: "hash", emailBody: "body" }, requestId: null, supportSessionId: null, createdAt: now }]);
    mocks.db.authCode.findMany.mockResolvedValue([{ id: "code-1", userId: "user-1", email: "mario@example.test", purpose: "MFA_ENROLLMENT", attempts: 1, maxAttempts: 5, expiresAt: now, consumedAt: now, metadata: { token: "private", reasonCode: "verified" }, createdAt: now }]);
    mocks.db.authRateLimit.findMany.mockResolvedValue([{ userId: "user-1", bucket: "signin", count: 2, resetAt: now, createdAt: now, updatedAt: now }]);

    const result = await buildDataExport();
    const serialized = JSON.stringify(result);

    expect(mocks.db.documentVersion.findMany.mock.calls[0][0].select).not.toHaveProperty("blobKey");
    expect(mocks.db.evidence.findMany.mock.calls[0][0].select).not.toHaveProperty("blobKey");
    expect(mocks.db.shareLink.findMany.mock.calls[0][0].select).not.toHaveProperty("tokenHash");
    expect(mocks.db.user.findMany.mock.calls[1][0].select).not.toHaveProperty("totpSecretEncrypted");
    expect(mocks.db.authCode.findMany.mock.calls[0][0].select).not.toHaveProperty("codeHash");
    expect(mocks.db.authRateLimit.findMany.mock.calls[0][0].select).not.toHaveProperty("key");
    expect(result).toMatchObject({ memberProfiles: [{ id: "user-1", hasAvatar: true }], auth: { rateLimits: [{ bucket: "signin", count: 2 }] } });
    expect(serialized).not.toMatch(/blobKey|tokenHash|rawToken|downloadUrl|emailBody|fileContent|password|secret|private|hash|body/);
    expect(mocks.recordProductAuditEventBestEffort).toHaveBeenCalledWith(expect.objectContaining({ action: "DATA_EXPORT_GENERATED" }));
  });

  it("builds retention candidates without deleting records or Blob files", async () => {
    mocks.db.worker.count.mockResolvedValueOnce(2);
    mocks.db.shareLink.count.mockResolvedValueOnce(3).mockResolvedValueOnce(4);
    mocks.db.notification.count.mockResolvedValueOnce(5).mockResolvedValueOnce(6);
    mocks.db.notificationEmailDelivery.count.mockResolvedValueOnce(7);
    mocks.db.productAuditEvent.count.mockResolvedValueOnce(8);

    const result = await buildDataRetentionOverviewForOrganization("org-1", now);

    expect(result.notice).toContain("default operativi");
    expect(result.candidates.some((candidate) => candidate.key === "archived-records")).toBe(true);
    for (const model of mocks.modelNames) expect(mocks.db[model].deleteMany).not.toHaveBeenCalled();
  });
});
