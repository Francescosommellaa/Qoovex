import type { OrganizationRole, WorkspaceAccessContext } from "@qoovex/types";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  db: {
    document: { groupBy: vi.fn(), findMany: vi.fn() },
    deadline: { groupBy: vi.fn(), findMany: vi.fn() },
    documentPackage: { findMany: vi.fn() },
    workerUserLink: { findMany: vi.fn() },
    jobSiteUserAssignment: { findMany: vi.fn() },
  },
  requireOrganizationDomainAccess: vi.fn(),
  getResourceScope: vi.fn(),
  buildMissingDocumentRequirementItemsForScope: vi.fn(),
  recordSupportAccess: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@qoovex/db", () => ({ db: mocks.db }));
vi.mock("./domain-access-service", () => ({ requireOrganizationDomainAccess: mocks.requireOrganizationDomainAccess }));
vi.mock("./resource-scope-service", () => ({ getResourceScope: mocks.getResourceScope }));
vi.mock("./document-requirement-service", () => ({ buildMissingDocumentRequirementItemsForScope: mocks.buildMissingDocumentRequirementItemsForScope }));
vi.mock("@shared/server/support-access-service", () => ({ recordSupportAccess: mocks.recordSupportAccess }));

import { getDashboardData } from "./dashboard-service";

const now = new Date("2026-07-14T10:42:00.000Z");
const future = new Date("2026-07-18T10:42:00.000Z");
const past = new Date("2026-07-01T10:42:00.000Z");

function context(role: OrganizationRole): WorkspaceAccessContext {
  return {
    userId: "user-1",
    platformRole: "USER",
    company: { role, organization: { id: "org-1", name: "Azienda Demo", code: "QVX-1" } },
    support: null,
    permissions: [],
  };
}

function setRole(role: OrganizationRole) {
  const accessContext = context(role);
  mocks.requireOrganizationDomainAccess.mockResolvedValue({ context: accessContext, organizationId: "org-1", actorRole: role });
  mocks.getResourceScope.mockResolvedValue({
    context: accessContext,
    organizationId: "org-1",
    actorRole: role,
    fullAccess: role === "OWNER" || role === "ADMIN" || role === "SAFETY_CONSULTANT",
    linkedWorker: role === "WORKER" ? { id: "worker-1", displayName: "Mario Rossi", roleLabel: null, status: "ACTIVE" } : null,
    siteManagerJobSiteIds: role === "SITE_MANAGER" ? ["jobsite-1"] : [],
    workerJobSiteIds: role === "WORKER" ? ["jobsite-1"] : [],
    visibleJobSiteIds: role === "SITE_MANAGER" || role === "WORKER" ? ["jobsite-1"] : [],
  });
}

function document(overrides: Record<string, unknown> = {}) {
  return {
    id: "document-review",
    title: "Documento da verificare",
    status: "TO_REVIEW",
    ownerType: "WORKER",
    workerId: "worker-1",
    jobSiteId: null,
    expiryDate: null,
    updatedAt: now,
    worker: { displayName: "Mario Rossi" },
    jobSite: null,
    ...overrides,
  };
}

function deadline(overrides: Record<string, unknown> = {}) {
  return {
    id: "deadline-1",
    title: "Revisione periodica",
    dueDate: future,
    status: "EXPIRING_SOON",
    documentId: null,
    workerId: null,
    jobSiteId: "jobsite-1",
    worker: null,
    jobSite: { name: "Cantiere Centro" },
    document: null,
    ...overrides,
  };
}

function primeDashboardMocks() {
  mocks.db.document.groupBy.mockResolvedValue([
    { status: "MISSING", _count: { _all: 1 } },
    { status: "EXPIRED", _count: { _all: 1 } },
    { status: "EXPIRING_SOON", _count: { _all: 1 } },
    { status: "TO_REVIEW", _count: { _all: 1 } },
    { status: "PRESENT", _count: { _all: 5 } },
  ]);
  mocks.db.document.findMany.mockResolvedValue([
    document(),
    document({ id: "document-expired", title: "Attestazione assicurativa", status: "EXPIRED", ownerType: "JOB_SITE", workerId: null, jobSiteId: "jobsite-1", expiryDate: past, worker: null, jobSite: { name: "Cantiere Centro" } }),
    document({ id: "document-expiring", title: "Documento in scadenza", status: "EXPIRING_SOON", expiryDate: future }),
    document({ id: "document-missing", title: "Documento mancante", status: "MISSING", updatedAt: past }),
  ]);
  mocks.db.deadline.groupBy.mockResolvedValue([{ status: "EXPIRING_SOON", _count: { _all: 1 } }]);
  mocks.db.deadline.findMany.mockResolvedValue([deadline()]);
  mocks.db.documentPackage.findMany.mockResolvedValue([
    {
      id: "package-1",
      title: "Pacchetto revisione",
      status: "READY_FOR_REVIEW",
      updatedAt: now,
      _count: { items: 2 },
      shareLinks: [],
    },
  ]);
  mocks.db.workerUserLink.findMany.mockResolvedValue([
    { workerId: "worker-1", userId: "user-1", user: { name: "Mario Rossi", firstName: "Mario", lastName: "Rossi", email: "mario@example.test" } },
  ]);
  mocks.db.jobSiteUserAssignment.findMany.mockResolvedValue([
    { jobSiteId: "jobsite-1", userId: "manager-1", user: { name: "Elena Mariani", firstName: "Elena", lastName: "Mariani", email: "elena@example.test" } },
  ]);
  mocks.buildMissingDocumentRequirementItemsForScope.mockResolvedValue([]);
}

beforeEach(() => {
  for (const model of Object.values(mocks.db)) for (const method of Object.values(model)) method.mockReset();
  mocks.requireOrganizationDomainAccess.mockReset();
  mocks.getResourceScope.mockReset();
  mocks.buildMissingDocumentRequirementItemsForScope.mockReset();
  mocks.recordSupportAccess.mockReset().mockResolvedValue(undefined);
  setRole("OWNER");
  primeDashboardMocks();
});

describe("dashboard service", () => {
  it("lets every internal role read a situation-centric dashboard", async () => {
    for (const role of ["OWNER", "ADMIN", "SAFETY_CONSULTANT", "SITE_MANAGER", "WORKER"] as const) {
      setRole(role);
      primeDashboardMocks();
      await expect(getDashboardData()).resolves.toMatchObject({ organization: { role } });
    }
  });

  it("orders attention deterministically and exposes cause, responsibility and action", async () => {
    const dashboard = await getDashboardData();

    expect(dashboard.attention.counts).toEqual({ expired: 1, expiringSoon: 2, missing: 1, toReview: 1 });
    expect(dashboard.attention.total).toBe(5);
    expect(dashboard.attention.situations.map((item) => item.kind)).toEqual(["EXPIRED", "EXPIRING_SOON", "EXPIRING_SOON", "MISSING", "TO_REVIEW"]);
    expect(dashboard.attention.situations[0]).toMatchObject({
      title: "Attestazione assicurativa",
      contextLabel: "Cantiere Centro",
      responsibility: { label: "Interviene: Elena Mariani" },
      action: { label: "Controlla il documento", href: "/documents/document-expired?from=dashboard" },
    });
    expect(dashboard.attention.situations.at(-1)).toMatchObject({ responsibility: { label: "Intervieni tu" } });
  });

  it("adds indexed missing requirements without inventing a document record", async () => {
    mocks.buildMissingDocumentRequirementItemsForScope.mockResolvedValue([
      {
        id: "requirement-1:worker:worker-1",
        requirementId: "requirement-1",
        requirementName: "Documento identificativo",
        documentTypeId: "type-1",
        documentTypeName: "Documento di identita",
        targetType: "WORKER",
        ownerType: "WORKER",
        workerId: "worker-1",
        workerName: "Mario Rossi",
        ownerLabel: "Mario Rossi",
      },
    ]);

    const dashboard = await getDashboardData();
    expect(dashboard.attention.counts.missing).toBe(2);
    expect(dashboard.attention.total).toBe(6);
    expect(dashboard.attention.situations).toContainEqual(expect.objectContaining({
      id: "missing:requirement-1:worker:worker-1",
      reason: expect.stringContaining("Documento identificativo"),
      action: { label: "Aggiungi documento", href: "/documents?status=MISSING&from=dashboard" },
    }));
  });

  it("hides sharing for scoped roles and filters attention by assigned resources", async () => {
    setRole("SITE_MANAGER");
    primeDashboardMocks();
    const dashboard = await getDashboardData();

    expect(dashboard.availability.sharing).toBe(false);
    expect(dashboard.readyPackages).toEqual([]);
    expect(mocks.db.documentPackage.findMany).not.toHaveBeenCalled();
    expect(mocks.db.document.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ ownerType: "JOB_SITE", jobSiteId: { in: ["jobsite-1"] } }),
    }));
  });

  it("keeps packages reviewable by safety consultants without exposing share creation", async () => {
    setRole("SAFETY_CONSULTANT");
    primeDashboardMocks();
    const dashboard = await getDashboardData();

    expect(dashboard.availability.sharing).toBe(true);
    expect(dashboard.readyPackages[0]).toMatchObject({
      title: "Pacchetto revisione",
      action: { label: "Apri il pacchetto", href: "/document-packages/package-1?from=dashboard" },
      shareLabel: expect.stringContaining("Owner o Admin"),
    });
  });

  it("returns section errors while preserving the sections that loaded", async () => {
    mocks.db.document.groupBy.mockRejectedValue(new Error("database unavailable"));
    const dashboard = await getDashboardData();

    expect(dashboard.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ section: "attention" }),
      expect.objectContaining({ section: "contexts" }),
    ]));
    expect(dashboard.readyPackages).toHaveLength(1);
    expect(dashboard.upcomingDeadlines).toHaveLength(1);
    expect(dashboard.firstUse).toBe(false);
  });

  it("does not expose storage or share secrets", async () => {
    const serialized = JSON.stringify(await getDashboardData());
    expect(serialized).not.toContain("blobKey");
    expect(serialized).not.toContain("tokenHash");
    expect(serialized).not.toContain("downloadUrl");
    expect(serialized).not.toContain("private/blob/key");
  });
});
