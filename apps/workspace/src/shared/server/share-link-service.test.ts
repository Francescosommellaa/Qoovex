import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  findFirst: vi.fn(),
  findUnique: vi.fn(),
  packageFindFirst: vi.fn(),
  updateMany: vi.fn(),
  transaction: vi.fn(),
  eventCreate: vi.fn(),
  auditBestEffort: vi.fn(),
  requireAccess: vi.fn(),
  ensureProcess: vi.fn(),
  supportAccess: vi.fn(),
  auditActor: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@qoovex/db", () => ({ Prisma: { TransactionIsolationLevel: { Serializable: "Serializable" } }, db: { documentPackage: { findFirst: mocks.packageFindFirst }, shareLink: { findMany: mocks.findMany }, $transaction: mocks.transaction } }));
vi.mock("@shared/server/domain-access-service", () => ({ requireOrganizationDomainAccess: mocks.requireAccess }));
vi.mock("@shared/server/document-package-share-proposal-service", () => ({ ensureShareLinkOperationalProcess: mocks.ensureProcess }));
vi.mock("@shared/server/support-access-service", () => ({ recordSupportAccess: mocks.supportAccess }));
vi.mock("@shared/server/product-audit-service", () => ({ auditActorFromContext: mocks.auditActor, recordProductAuditEventBestEffort: mocks.auditBestEffort }));

import { listShareLinks, revokeShareLink } from "./share-link-service";

const now = new Date("2026-07-27T10:00:00.000Z");
const link = { id: "link-1", organizationId: "org-1", documentPackageId: "package-1", revisionId: "revision-1", proposalId: "proposal-1", purpose: null, recipientLabel: "Mario Rossi", allowDownload: false, expiresAt: new Date("2026-08-01T10:00:00.000Z"), expiredAt: null, revokedAt: null, createdById: "user-1", createdAt: now, lastAccessedAt: null, proposal: { processId: "process-1" } };

beforeEach(() => {
  mocks.findMany.mockReset().mockResolvedValue([link]);
  mocks.findFirst.mockReset().mockResolvedValue(link);
  mocks.findUnique.mockReset().mockResolvedValue(link);
  mocks.packageFindFirst.mockReset().mockResolvedValue({ id: "package-1" });
  mocks.updateMany.mockReset().mockResolvedValue({ count: 1 });
  mocks.eventCreate.mockReset().mockResolvedValue({ id: "event-1" });
  mocks.auditBestEffort.mockReset().mockResolvedValue(undefined);
  mocks.ensureProcess.mockReset().mockResolvedValue("process-1");
  mocks.supportAccess.mockReset().mockResolvedValue(undefined);
  mocks.auditActor.mockReset().mockReturnValue({ actorUserId: "user-1", actorRole: "OWNER" });
  mocks.requireAccess.mockReset().mockResolvedValue({ context: { userId: "user-1" }, organizationId: "org-1", actorRole: "OWNER" });
  mocks.transaction.mockReset().mockImplementation(async (callback) => callback({ shareLink: { findFirst: mocks.findFirst, findUnique: mocks.findUnique, updateMany: mocks.updateMany }, operationalEvent: { create: mocks.eventCreate } }));
});

describe("share link lifecycle", () => {
  it("lists minimized links without a token or token hash", async () => {
    const result = await listShareLinks("package-1");
    expect(result[0]).not.toHaveProperty("token");
    expect(result[0]).not.toHaveProperty("tokenHash");
    expect(result[0]).toMatchObject({ revisionId: "revision-1", allowDownload: false });
  });

  it("appends one revocation event when the state changes", async () => {
    const result = await revokeShareLink("package-1", "link-1");
    expect(result.alreadyRevoked).toBe(false);
    expect(mocks.eventCreate).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ eventType: "SHARE_LINK_REVOKED", actorType: "USER" }) }));
    expect(mocks.auditBestEffort).toHaveBeenCalledTimes(1);
  });

  it("treats a repeated revocation as idempotent without duplicate events", async () => {
    mocks.updateMany.mockResolvedValue({ count: 0 });
    mocks.findUnique.mockResolvedValue({ ...link, revokedAt: now });
    const result = await revokeShareLink("package-1", "link-1");
    expect(result.alreadyRevoked).toBe(true);
    expect(mocks.eventCreate).not.toHaveBeenCalled();
    expect(mocks.auditBestEffort).not.toHaveBeenCalled();
  });
});
