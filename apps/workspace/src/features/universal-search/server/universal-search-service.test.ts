import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  rows: [] as Array<Record<string, unknown>>,
  executeRaw: vi.fn(),
  queryRaw: vi.fn(),
  transaction: vi.fn(),
  processFindMany: vi.fn(),
  assignmentFindMany: vi.fn(),
  requireAccess: vi.fn(),
  getScope: vi.fn(),
  processScopeWhere: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@qoovex/db", () => ({
  Prisma: { sql: (strings: TemplateStringsArray, ...values: unknown[]) => ({ strings: [...strings], values }) },
  db: {
    $transaction: mocks.transaction,
    operationalProcess: { findMany: mocks.processFindMany },
    jobSiteWorkerAssignment: { findMany: mocks.assignmentFindMany },
  },
}));
vi.mock("@shared/server/domain-access-service", () => ({ requireOrganizationDomainAccess: mocks.requireAccess }));
vi.mock("@shared/server/resource-scope-service", () => ({ getResourceScope: mocks.getScope }));
vi.mock("@features/operational-engine/server/operational-read-service", () => ({ processScopeWhere: mocks.processScopeWhere }));

import { universalSearch } from "./universal-search-service";

const date = new Date("2026-07-27T10:00:00.000Z");

function candidate(overrides: Record<string, unknown>) {
  return {
    type: "DOCUMENT",
    id: "document-1",
    title: "DUVRI cantiere Aurora",
    context: "Sicurezza",
    status: "PRESENT",
    usefulAt: date,
    updatedAt: date,
    workerId: null,
    jobSiteId: null,
    processId: null,
    packageId: null,
    ...overrides,
  };
}

beforeEach(() => {
  mocks.rows = [];
  mocks.executeRaw.mockReset().mockResolvedValue(0);
  mocks.queryRaw.mockReset().mockImplementation(async () => mocks.rows);
  mocks.transaction.mockReset().mockImplementation(async (callback) => callback({ $executeRaw: mocks.executeRaw, $queryRaw: mocks.queryRaw }));
  mocks.processFindMany.mockReset().mockResolvedValue([]);
  mocks.assignmentFindMany.mockReset().mockResolvedValue([]);
  mocks.requireAccess.mockReset().mockResolvedValue({ context: { permissions: ["organization:read", "documentPackages:share"] } });
  mocks.getScope.mockReset().mockResolvedValue({ organizationId: "org-1", fullAccess: true, actorRole: "OWNER", linkedWorker: null, visibleJobSiteIds: [], siteManagerJobSiteIds: [], workerJobSiteIds: [] });
  mocks.processScopeWhere.mockReset().mockResolvedValue({ organizationId: "org-1" });
});

describe("universal metadata search", () => {
  it("rejects empty, oversized and over-tokenized requests before touching the database", async () => {
    await expect(universalSearch({ query: " " })).rejects.toMatchObject({ status: 400 });
    await expect(universalSearch({ query: "x".repeat(121) })).rejects.toMatchObject({ status: 400 });
    await expect(universalSearch({ query: "a b c d e f g h i" })).rejects.toMatchObject({ status: 400 });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("rejects unsupported types and page sizes", async () => {
    await expect(universalSearch({ query: "DUVRI", take: 51 })).rejects.toMatchObject({ status: 400 });
    await expect(universalSearch({ query: "DUVRI", types: ["SECRET" as never] })).rejects.toMatchObject({ status: 400 });
  });

  it("rejects malformed cursors without falling back to the first page", async () => {
    await expect(universalSearch({ query: "DUVRI", cursor: "not-a-cursor" })).rejects.toMatchObject({ status: 400 });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("ranks exact title before prefix and term matches deterministically", async () => {
    mocks.rows = [
      candidate({ id: "terms", title: "Cantiere con DUVRI" }),
      candidate({ id: "prefix", title: "DUVRI aggiornato" }),
      candidate({ id: "exact", title: "DUVRI" }),
    ];
    const result = await universalSearch({ query: "DUVRI" });
    expect(result.items.map((item) => item.id)).toEqual(["exact", "prefix", "terms"]);
    expect(result.items.map((item) => item.matchReason)).toEqual(["Corrispondenza esatta", "Corrispondenza iniziale", "Tutti i termini"]);
    expect(mocks.executeRaw).toHaveBeenCalledTimes(1);
  });

  it("uses an opaque stable cursor without returning duplicate rows", async () => {
    mocks.rows = [candidate({ id: "a", title: "DUVRI A" }), candidate({ id: "b", title: "DUVRI B" })];
    const first = await universalSearch({ query: "DUVRI", take: 1 });
    expect(first.items).toHaveLength(1);
    expect(first.nextCursor).toEqual(expect.any(String));
    const second = await universalSearch({ query: "DUVRI", take: 1, cursor: first.nextCursor });
    expect(second.items).toHaveLength(1);
    expect(second.items[0].id).not.toBe(first.items[0].id);
  });

  it("removes rows outside a Collaborator's assigned job sites before counts and groups are built", async () => {
    mocks.getScope.mockResolvedValue({ organizationId: "org-1", fullAccess: false, actorRole: "COLLABORATOR", linkedWorker: null, visibleJobSiteIds: ["site-visible"], siteManagerJobSiteIds: ["site-visible"], workerJobSiteIds: [] });
    mocks.rows = [
      candidate({ id: "visible", jobSiteId: "site-visible" }),
      candidate({ id: "hidden", jobSiteId: "site-hidden" }),
      candidate({ id: "package-hidden", type: "DOCUMENT_PACKAGE", packageId: "package-hidden" }),
    ];
    const result = await universalSearch({ query: "DUVRI" });
    expect(result.items.map((item) => item.id)).toEqual(["visible"]);
    expect(JSON.stringify(result)).not.toContain("site-hidden");
    expect(JSON.stringify(result)).not.toContain("package-hidden");
  });
});
