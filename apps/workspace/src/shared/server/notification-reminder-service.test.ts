import type { OrganizationRole } from "@qoovex/types";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  db: {
    notification: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    deadline: { findMany: vi.fn() },
    document: { findMany: vi.fn() },
    documentPackage: { findMany: vi.fn() },
    shareLink: { findMany: vi.fn() },
  },
  getViewerContext: vi.fn(),
  getContextOrganizationId: vi.fn(),
  requirePermission: vi.fn(),
  recordSupportAccess: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@qoovex/db", () => ({ db: mocks.db }));
vi.mock("@shared/server/access-errors", () => ({
  AccessError: class AccessError extends Error {
    constructor(message: string, public readonly status: 401 | 403 | 404 | 409 | 410) {
      super(message);
      this.name = "AccessError";
    }
  },
}));
vi.mock("@shared/server/access-context-service", () => ({
  getViewerContext: mocks.getViewerContext,
  getContextOrganizationId: mocks.getContextOrganizationId,
  requirePermission: mocks.requirePermission,
}));
vi.mock("@shared/server/support-access-service", () => ({ recordSupportAccess: mocks.recordSupportAccess }));

import { dismissNotification, listNotifications, markNotificationRead } from "./notification-service";
import { syncOrganizationReminders } from "./reminder-service";

const now = new Date("2026-07-05T10:00:00.000Z");

const notificationRecord = {
  id: "notification-1",
  userId: null,
  type: "DEADLINE_OVERDUE",
  severity: "WARNING",
  title: "Scadenza registrata superata",
  message: "Scadenza registrata - data registrata 01 lug 2026.",
  sourceType: "DEADLINE",
  sourceId: "deadline-1",
  actionHref: "/deadlines",
  readAt: null,
  dismissedAt: null,
  createdAt: now,
  updatedAt: now,
};

function resetModel(model: Record<string, ReturnType<typeof vi.fn>>) {
  for (const method of Object.values(model)) method.mockReset();
}

function setRole(role: OrganizationRole) {
  mocks.getViewerContext.mockResolvedValue({
    userId: "user-1",
    platformRole: "USER",
    membership: { id: "member-1", role, organization: { id: "org-1", name: "Azienda", code: "QVX-1" } },
    support: null,
    permissions: [],
  });
}

function primeEmptyReminderSources() {
  mocks.db.deadline.findMany.mockResolvedValue([]);
  mocks.db.document.findMany.mockResolvedValue([]);
  mocks.db.documentPackage.findMany.mockResolvedValue([]);
  mocks.db.shareLink.findMany.mockResolvedValue([]);
}

beforeEach(() => {
  resetModel(mocks.db.notification);
  resetModel(mocks.db.deadline);
  resetModel(mocks.db.document);
  resetModel(mocks.db.documentPackage);
  resetModel(mocks.db.shareLink);
  mocks.getViewerContext.mockReset();
  mocks.getContextOrganizationId.mockReset();
  mocks.requirePermission.mockReset();
  mocks.recordSupportAccess.mockReset();

  mocks.getContextOrganizationId.mockReturnValue("org-1");
  mocks.requirePermission.mockImplementation(() => undefined);
  mocks.recordSupportAccess.mockResolvedValue(undefined);
  setRole("OWNER");
  primeEmptyReminderSources();
  mocks.db.notification.findUnique.mockResolvedValue(null);
  mocks.db.notification.create.mockResolvedValue({ id: "created" });
  mocks.db.notification.findMany.mockResolvedValue([notificationRecord]);
  mocks.db.notification.count.mockResolvedValue(1);
});

describe("notification service", () => {
  it("lets owners, admins and safety consultants list notifications", async () => {
    for (const role of ["OWNER", "ADMIN", "SAFETY_CONSULTANT"] as const) {
      setRole(role);
      await expect(listNotifications()).resolves.toMatchObject({ unreadCount: 1 });
    }

    expect(mocks.requirePermission).toHaveBeenCalledWith(expect.anything(), "organization:read");
    expect(mocks.db.notification.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ organizationId: "org-1", dismissedAt: null }),
    }));
  });

  it("denies notifications to site managers, workers and viewers", async () => {
    for (const role of ["SITE_MANAGER", "WORKER", "VIEWER"] as const) {
      setRole(role);
      await expect(listNotifications()).rejects.toMatchObject({ status: 404 });
    }
    expect(mocks.db.notification.findMany).not.toHaveBeenCalled();
  });

  it("returns a safe notification payload without internal keys", async () => {
    const response = await listNotifications({ filter: "unread" });
    const serialized = JSON.stringify(response);

    expect(response.notifications[0]).toMatchObject({ title: "Scadenza registrata superata", actionHref: "/deadlines" });
    expect(serialized).not.toContain("organizationId");
    expect(serialized).not.toContain("dedupeKey");
    expect(serialized).not.toContain("blobKey");
    expect(serialized).not.toContain("tokenHash");
    expect(serialized).not.toContain("downloadUrl");
  });

  it("marks and dismisses only notifications in the current organization", async () => {
    mocks.db.notification.findFirst.mockResolvedValue({ id: "notification-1" });
    mocks.db.notification.update.mockResolvedValue({ ...notificationRecord, readAt: now });

    await expect(markNotificationRead("notification-1")).resolves.toMatchObject({ read: true });

    expect(mocks.db.notification.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: "notification-1", organizationId: "org-1", dismissedAt: null }),
    }));
    expect(mocks.db.notification.update).toHaveBeenCalledWith(expect.objectContaining({
      data: { readAt: expect.any(Date) },
    }));

    mocks.db.notification.update.mockResolvedValue({ ...notificationRecord, dismissedAt: now });
    await expect(dismissNotification("notification-1")).resolves.toMatchObject({ dismissed: true });
    expect(mocks.db.notification.update).toHaveBeenLastCalledWith(expect.objectContaining({
      data: { dismissedAt: expect.any(Date) },
    }));
  });
});

describe("reminder service", () => {
  it("generates reminders from registered deadlines, documents, packages and share links", async () => {
    mocks.db.deadline.findMany.mockResolvedValue([
      { id: "deadline-overdue", title: "Scadenza registrata", dueDate: new Date("2026-07-01T00:00:00.000Z") },
      { id: "deadline-upcoming", title: "Scadenza futura", dueDate: new Date("2026-07-20T00:00:00.000Z") },
    ]);
    mocks.db.document.findMany.mockResolvedValue([
      { id: "doc-review", title: "Documento da controllare", status: "TO_REVIEW", expiryDate: null },
      { id: "doc-expired", title: "Documento scaduto", status: "EXPIRED", expiryDate: null },
      { id: "doc-expiring", title: "Documento in scadenza", status: "EXPIRING_SOON", expiryDate: new Date("2026-07-18T00:00:00.000Z") },
    ]);
    mocks.db.documentPackage.findMany.mockResolvedValue([{ id: "package-1", title: "Pacchetto revisione" }]);
    mocks.db.shareLink.findMany.mockResolvedValue([
      { id: "share-expiring", expiresAt: new Date("2026-07-12T00:00:00.000Z"), revokedAt: null, documentPackageId: "package-1", documentPackage: { title: "Pacchetto revisione" } },
      { id: "share-revoked", expiresAt: new Date("2026-07-12T00:00:00.000Z"), revokedAt: now, documentPackageId: "package-1", documentPackage: { title: "Pacchetto revisione" } },
    ]);

    await expect(syncOrganizationReminders()).resolves.toMatchObject({ created: 8, updated: 0, skipped: 0 });

    const createdTypes = mocks.db.notification.create.mock.calls.map((call) => call[0].data.type);
    expect(createdTypes).toEqual(expect.arrayContaining([
      "DEADLINE_OVERDUE",
      "DEADLINE_UPCOMING",
      "DOCUMENT_TO_REVIEW",
      "DOCUMENT_EXPIRED",
      "DOCUMENT_EXPIRING_SOON",
      "PACKAGE_READY_FOR_REVIEW",
      "SHARE_LINK_EXPIRING",
      "SHARE_LINK_REVOKED",
    ]));
    expect(mocks.db.notification.create.mock.calls[0][0].data).toEqual(expect.objectContaining({
      organizationId: "org-1",
      userId: null,
      dedupeKey: expect.any(String),
    }));
  });

  it("does not recreate dismissed reminders and skips unchanged duplicates", async () => {
    mocks.db.deadline.findMany.mockResolvedValue([
      { id: "deadline-1", title: "Scadenza registrata", dueDate: new Date("2026-07-01T00:00:00.000Z") },
    ]);
    mocks.db.notification.findUnique.mockResolvedValue({ ...notificationRecord, dismissedAt: now });

    await expect(syncOrganizationReminders()).resolves.toMatchObject({ created: 0, updated: 0, skipped: 1 });
    expect(mocks.db.notification.create).not.toHaveBeenCalled();

    mocks.db.notification.findUnique.mockResolvedValue({ id: "notification-1", title: "Scadenza registrata superata", message: "Scadenza registrata - data registrata 01 lug 2026.", severity: "WARNING", actionHref: "/deadlines", dismissedAt: null });
    await expect(syncOrganizationReminders()).resolves.toMatchObject({ created: 0, updated: 0, skipped: 1 });
    expect(mocks.db.notification.update).not.toHaveBeenCalled();
  });
});
