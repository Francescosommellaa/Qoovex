import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  db: {
    $transaction: vi.fn(),
    organization: { update: vi.fn() },
    organizationProfile: { upsert: vi.fn() },
  },
  requireOrganizationDomainAccess: vi.fn(),
  recordProductAuditEventBestEffort: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@qoovex/db", () => ({ db: mocks.db }));
vi.mock("./domain-access-service", () => ({ requireOrganizationDomainAccess: mocks.requireOrganizationDomainAccess }));
vi.mock("./product-audit-service", () => ({
  auditActorFromContext: () => ({ actorUserId: "owner-1", actorRole: "OWNER", supportSessionId: null }),
  recordProductAuditEventBestEffort: mocks.recordProductAuditEventBestEffort,
}));

import { updateOrganizationProfile } from "./organization-profile-service";

const now = new Date("2026-08-13T10:00:00.000Z");

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireOrganizationDomainAccess.mockResolvedValue({
    context: { userId: "owner-1" },
    organizationId: "organization-1",
    actorRole: "OWNER",
  });
  mocks.db.$transaction.mockImplementation(async (operation: (tx: typeof mocks.db) => unknown) => operation(mocks.db));
  mocks.db.organizationProfile.upsert.mockResolvedValue({
    id: "profile-1",
    organizationId: "organization-1",
    legalName: "Edilizia Rossi Srl",
    taxCode: null,
    vatNumber: null,
    registeredOfficeAddress: null,
    operatingDescription: null,
    specializations: [],
    createdAt: now,
    updatedAt: now,
  });
  mocks.db.organization.update.mockResolvedValue({ id: "organization-1" });
  mocks.recordProductAuditEventBestEffort.mockResolvedValue(undefined);
});

describe("organization profile updates", () => {
  it("updates the legal profile and the workspace organization name atomically", async () => {
    await expect(updateOrganizationProfile({ legalName: "  Edilizia Rossi Srl  " })).resolves.toMatchObject({
      organizationId: "organization-1",
      legalName: "Edilizia Rossi Srl",
      updatedAt: now.toISOString(),
    });

    expect(mocks.db.$transaction).toHaveBeenCalledTimes(1);
    expect(mocks.db.organizationProfile.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { organizationId: "organization-1" },
      update: expect.objectContaining({ legalName: "Edilizia Rossi Srl" }),
    }));
    expect(mocks.db.organization.update).toHaveBeenCalledWith({
      where: { id: "organization-1" },
      data: { name: "Edilizia Rossi Srl" },
    });
  });

  it("does not rename the workspace organization when only secondary profile data changes", async () => {
    await updateOrganizationProfile({ vatNumber: "IT12345678901" });

    expect(mocks.db.organizationProfile.upsert).toHaveBeenCalled();
    expect(mocks.db.organization.update).not.toHaveBeenCalled();
  });

  it("rejects an empty organization name before opening a transaction", async () => {
    await expect(updateOrganizationProfile({ legalName: " " })).rejects.toMatchObject({ status: 409 });

    expect(mocks.db.$transaction).not.toHaveBeenCalled();
  });
});
