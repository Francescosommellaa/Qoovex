import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  db: {
    jobSite: { findFirst: vi.fn(), updateMany: vi.fn() },
    organizationMembership: { findFirst: vi.fn() },
    jobSiteParticipant: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    $transaction: vi.fn(async (callback: (tx: unknown) => unknown) => callback(mocks.db)),
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
vi.mock("./resource-scope-service", () => ({ getResourceScope: vi.fn(), toMyResourceScopeResponse: vi.fn() }));

import { createOrganizationParticipant, endJobSiteParticipant, listJobSiteParticipants } from "./resource-assignment-service";

const now = new Date("2026-08-03T10:00:00.000Z");
const participant = {
  id: "participant-1",
  organizationId: "org-1",
  jobSiteId: "job-1",
  userId: "user-2",
  membershipId: "membership-2",
  kind: "ORGANIZATION_MEMBER" as const,
  status: "ACTIVE" as const,
  publicRoleLabel: "Capocantiere",
  createdAt: now,
  updatedAt: now,
  jobSite: { name: "Casa Rossi" },
  user: { firstName: "Ada", lastName: "Bianchi", name: null, email: "ada@example.test" },
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireOrganizationDomainAccess.mockResolvedValue({ context: { userId: "owner-1" }, organizationId: "org-1", actorRole: "OWNER" });
  mocks.db.jobSite.findFirst.mockResolvedValue({ id: "job-1", name: "Casa Rossi" });
  mocks.db.organizationMembership.findFirst.mockResolvedValue({ id: "membership-2", userId: "user-2" });
  mocks.db.jobSiteParticipant.findFirst.mockResolvedValue(null);
  mocks.db.jobSiteParticipant.findMany.mockResolvedValue([participant]);
  mocks.db.jobSiteParticipant.create.mockResolvedValue(participant);
  mocks.db.jobSiteParticipant.update.mockResolvedValue({ ...participant, status: "ENDED" });
  mocks.db.jobSite.updateMany.mockResolvedValue({ count: 0 });
});

describe("organization-side JobSite participants", () => {
  it("lists only organization members by default", async () => {
    await expect(listJobSiteParticipants({ jobSiteId: "job-1" })).resolves.toHaveLength(1);
    expect(mocks.db.jobSiteParticipant.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ kind: "ORGANIZATION_MEMBER", status: "ACTIVE" }) }));
  });

  it("creates a participant from a membership without creating a client", async () => {
    await expect(createOrganizationParticipant({ jobSiteId: "job-1", membershipId: "membership-2", publicRoleLabel: "Capocantiere" })).resolves.toMatchObject({ kind: "ORGANIZATION_MEMBER" });
    expect(mocks.db.jobSiteParticipant.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ membershipId: "membership-2", kind: "ORGANIZATION_MEMBER" }) }));
  });

  it("ends the participant and clears a matching responsibility", async () => {
    mocks.db.jobSiteParticipant.findFirst.mockResolvedValue({ id: "participant-1", jobSiteId: "job-1" });
    await expect(endJobSiteParticipant("participant-1")).resolves.toMatchObject({ ended: true });
    expect(mocks.db.jobSite.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "job-1", responsibleParticipantId: "participant-1" } }));
  });
});
