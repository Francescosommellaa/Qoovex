import type { OrganizationRole } from "@qoovex/types";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  role: "OWNER" as OrganizationRole,
  preset: null as "SITE_MANAGER" | "LIMITED_UPLOAD" | null,
  userId: "owner-1",
  calendarEvent: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  organizationMembership: { findFirst: vi.fn(), findMany: vi.fn() },
  jobSite: { findFirst: vi.fn() },
  recordSupportAccess: vi.fn(),
  recordAudit: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@qoovex/db", () => ({ db: { calendarEvent: mocks.calendarEvent, organizationMembership: mocks.organizationMembership, jobSite: mocks.jobSite } }));
vi.mock("@shared/server/access-errors", () => ({ AccessError: class AccessError extends Error { constructor(message: string, public readonly status: number) { super(message); } } }));
vi.mock("@shared/server/support-access-service", () => ({ recordSupportAccess: mocks.recordSupportAccess }));
vi.mock("./domain-access-service", () => ({
  requireOrganizationDomainAccess: vi.fn(async () => ({ context: { userId: mocks.userId, permissions: mocks.role === "OWNER" ? ["calendar:read", "calendar:manage"] : ["calendar:read"] }, organizationId: "org-1", actorRole: mocks.role })),
}));
vi.mock("./resource-scope-service", () => ({
  getResourceScope: vi.fn(async () => ({ fullAccess: mocks.role === "OWNER", actorRole: mocks.role, preset: mocks.preset, siteManagerJobSiteIds: ["site-1"], linkedWorker: null })),
}));
vi.mock("./product-audit-service", () => ({ auditActorFromContext: vi.fn(() => ({ actorUserId: mocks.userId, actorRole: mocks.role, supportSessionId: null })), recordProductAuditEventBestEffort: mocks.recordAudit }));

import { createCalendarEvent, listCalendarEvents, updateCalendarEvent } from "./calendar-event-service";

const now = new Date("2026-07-20T08:00:00.000Z");
const record = {
  id: "event-1", organizationId: "org-1", title: "Sopralluogo", description: null,
  startAt: now, endAt: new Date("2026-07-20T10:00:00.000Z"), allDay: false,
  kind: "EVENT", priority: "HIGH", status: "PLANNED", source: "QOOVEX", externalUid: null,
  assignedToId: "worker-1", jobSiteId: "site-1", createdById: "owner-1", createdAt: now, updatedAt: now, archivedAt: null,
  assignedTo: { id: "worker-1", name: "Mario Rossi", email: "mario@example.test", organizationMembership: { role: "COLLABORATOR", revokedAt: null } },
  jobSite: { id: "site-1", name: "Cantiere Centro" },
} as const;

describe("calendar event service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.role = "OWNER";
    mocks.preset = null;
    mocks.userId = "owner-1";
    mocks.organizationMembership.findFirst.mockResolvedValue({ userId: "worker-1" });
    mocks.jobSite.findFirst.mockResolvedValue({ id: "site-1" });
    mocks.calendarEvent.create.mockResolvedValue(record);
    mocks.calendarEvent.findMany.mockResolvedValue([record]);
    mocks.calendarEvent.findFirst.mockResolvedValue(record);
    mocks.calendarEvent.update.mockResolvedValue({ ...record, status: "DONE" });
  });

  it("creates a tenant-scoped task with validated assignee and time range", async () => {
    await expect(createCalendarEvent({ title: "Sopralluogo", startAt: now.toISOString(), endAt: "2026-07-20T10:00:00.000Z", kind: "TASK", priority: "HIGH", assignedToId: "worker-1", jobSiteId: "site-1" })).resolves.toMatchObject({ id: "event-1" });
    expect(mocks.calendarEvent.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ organizationId: "org-1", createdById: "owner-1", assignedToId: "worker-1" }) }));
    expect(mocks.recordAudit).toHaveBeenCalledWith(expect.objectContaining({ action: "CALENDAR_EVENT_CREATED", entityType: "CALENDAR_EVENT" }));
  });

  it("rejects an invalid or zero-length time range", async () => {
    await expect(createCalendarEvent({ title: "Sopralluogo", startAt: now.toISOString(), endAt: now.toISOString() })).rejects.toMatchObject({ status: 409 });
    expect(mocks.calendarEvent.create).not.toHaveBeenCalled();
  });

  it("scopes a site manager to their own and assigned-site events", async () => {
    mocks.role = "COLLABORATOR";
    mocks.preset = "SITE_MANAGER";
    mocks.userId = "manager-1";
    await listCalendarEvents({ start: "2026-07-01", end: "2026-08-01" });
    expect(mocks.calendarEvent.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ organizationId: "org-1", OR: [{ assignedToId: "manager-1" }, { jobSiteId: { in: ["site-1"] } }] }) }));
  });

  it("lets an assignee update only task status", async () => {
    mocks.role = "COLLABORATOR";
    mocks.preset = "LIMITED_UPLOAD";
    mocks.userId = "worker-1";
    await expect(updateCalendarEvent("event-1", { status: "DONE" })).resolves.toMatchObject({ status: "DONE" });
    await expect(updateCalendarEvent("event-1", { title: "Titolo cambiato" })).rejects.toMatchObject({ status: 403 });
  });
});
