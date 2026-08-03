import type { OrganizationRole } from "@qoovex/types";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  AccessError: class AccessError extends Error {
    constructor(message: string, public readonly status: 401 | 403 | 404 | 409 | 410) {
      super(message);
      this.name = "AccessError";
    }
  },
  TransactionalEmailError: class TransactionalEmailError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "TransactionalEmailError";
    }
  },
  db: {
    notificationPreference: {
      upsert: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    notificationEmailDelivery: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    organizationMembership: {
      findFirst: vi.fn(),
    },
    notification: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
  role: "OWNER" as OrganizationRole,
  recordSupportAccess: vi.fn(),
  assertPersistentRateLimit: vi.fn(),
  sendTransactionalEmail: vi.fn(),
  syncOrganizationReminderRecords: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@qoovex/db", () => ({ db: mocks.db }));
vi.mock("@shared/server/access-errors", () => ({ AccessError: mocks.AccessError }));
vi.mock("@shared/server/support-access-service", () => ({ recordSupportAccess: mocks.recordSupportAccess }));
vi.mock("@shared/server/rate-limit", () => ({
  assertPersistentRateLimit: mocks.assertPersistentRateLimit,
  RateLimitExceededError: class RateLimitExceededError extends Error {},
}));
vi.mock("./domain-access-service", () => ({
  requireOrganizationDomainAccess: vi.fn(async (_permission: string, allowedRoles: readonly OrganizationRole[]) => {
    if (!allowedRoles.includes(mocks.role)) throw new mocks.AccessError("Risorsa non disponibile.", 404);
    return { context: { userId: "user-1" }, organizationId: "org-1", actorRole: mocks.role };
  }),
}));
vi.mock("@shared/server/transactional-email-service", () => ({
  sendTransactionalEmail: mocks.sendTransactionalEmail,
  TransactionalEmailError: mocks.TransactionalEmailError,
}));
vi.mock("./transactional-email-service", () => ({
  sendTransactionalEmail: mocks.sendTransactionalEmail,
  TransactionalEmailError: mocks.TransactionalEmailError,
}));
vi.mock("./reminder-service", () => ({ syncOrganizationReminderRecords: mocks.syncOrganizationReminderRecords }));

import {
  getNotificationPreference,
  listNotificationEmailDeliveries,
  updateNotificationPreference,
} from "./notification-preference-service";
import { runScheduledEmailDigest } from "./scheduled-email-digest-service";

const now = new Date("2026-07-06T08:30:00.000Z");
const preferenceRecord = {
  id: "preference-1",
  emailDigestEnabled: false,
  emailDigestFrequency: "OFF",
  emailDigestHour: 8,
  deadlineNotificationsEnabled: true,
  documentNotificationsEnabled: true,
  packageNotificationsEnabled: true,
  systemNotificationsEnabled: true,
  lastDigestSentAt: null,
  createdAt: now,
  updatedAt: now,
};
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

function setRole(role: OrganizationRole) {
  mocks.role = role;
}

beforeEach(() => {
  for (const model of Object.values(mocks.db)) {
    for (const method of Object.values(model)) method.mockReset();
  }
  mocks.recordSupportAccess.mockReset();
  mocks.sendTransactionalEmail.mockReset();
  mocks.syncOrganizationReminderRecords.mockReset();
  setRole("OWNER");

  mocks.db.notificationPreference.upsert.mockResolvedValue(preferenceRecord);
  mocks.db.notificationPreference.update.mockResolvedValue({ ...preferenceRecord, emailDigestEnabled: true, emailDigestFrequency: "DAILY" });
  mocks.db.notificationPreference.findMany.mockResolvedValue([]);
  mocks.db.notificationEmailDelivery.findMany.mockResolvedValue([]);
  mocks.db.notificationEmailDelivery.create.mockResolvedValue({ id: "delivery-1" });
  mocks.db.organizationMembership.findFirst.mockResolvedValue({ id: "membership-1" });
  mocks.db.notification.findMany.mockResolvedValue([notificationRecord]);
  mocks.db.notification.count.mockResolvedValue(1);
  mocks.sendTransactionalEmail.mockResolvedValue({ providerMessageId: "email-1" });
  mocks.syncOrganizationReminderRecords.mockResolvedValue({ created: 0, updated: 0, skipped: 0 });
});

describe("notification preferences", () => {
  it("lets owner, admin and safety consultant read safe default preferences", async () => {
    for (const role of ["OWNER", "ADMIN", "SAFETY_CONSULTANT"] as const) {
      setRole(role);
      await expect(getNotificationPreference()).resolves.toMatchObject({
        emailDigestEnabled: false,
        emailDigestFrequency: "OFF",
        emailDigestHour: 8,
        deadlineNotificationsEnabled: true,
        documentNotificationsEnabled: true,
        packageNotificationsEnabled: true,
        systemNotificationsEnabled: true,
      });
    }

    expect(mocks.db.notificationPreference.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { organizationId_userId: { organizationId: "org-1", userId: "user-1" } },
      create: { organizationId: "org-1", userId: "user-1" },
    }));
  });

  it("denies site manager, worker and destinatario esterno preferences", async () => {
    for (const role of ["SITE_MANAGER", "WORKER"] as const) {
      setRole(role);
      await expect(getNotificationPreference()).rejects.toMatchObject({ status: 404 });
    }
  });

  it("validates preference updates and rejects client-owned fields", async () => {
    await expect(updateNotificationPreference({
      emailDigestEnabled: true,
      emailDigestFrequency: "DAILY",
      emailDigestHour: 8,
      deadlineNotificationsEnabled: false,
      documentNotificationsEnabled: true,
      packageNotificationsEnabled: true,
      systemNotificationsEnabled: true,
    })).resolves.toMatchObject({ updated: true });

    await expect(updateNotificationPreference({ emailDigestFrequency: "MONTHLY" })).rejects.toMatchObject({ status: 409 });
    await expect(updateNotificationPreference({ emailDigestHour: 24 })).rejects.toMatchObject({ status: 409 });
    await expect(updateNotificationPreference({ recipientEmail: "other@example.com" })).rejects.toMatchObject({ status: 409 });
    expect(JSON.stringify(mocks.db.notificationPreference.update.mock.calls)).not.toContain("recipientEmail");
  });

  it("lists only safe delivery log fields for the current user", async () => {
    mocks.db.notificationEmailDelivery.findMany.mockResolvedValue([{
      id: "delivery-1",
      type: "DIGEST",
      notificationId: null,
      notificationCount: 2,
      status: "SENT",
      errorCode: null,
      sentAt: now,
      createdAt: now,
    }]);

    const response = await listNotificationEmailDeliveries();
    const serialized = JSON.stringify(response);
    expect(response.deliveries[0]).toMatchObject({ type: "DIGEST", status: "SENT", notificationCount: 2 });
    expect(serialized).not.toContain("recipientEmail");
    expect(serialized).not.toContain("providerMessageId");
    expect(serialized).not.toContain("blobKey");
    expect(serialized).not.toContain("tokenHash");
  });
});

describe("scheduled email digest service", () => {
  it("paginates more than 200 preferences and synchronizes reminders once per organization", async () => {
    const preferences = Array.from({ length: 201 }, (_, index) => ({
      id: `preference-${String(index).padStart(3, "0")}`,
      organizationId: "org-1",
      userId: `user-${index}`,
      emailDigestFrequency: "DAILY",
      emailDigestHour: 8,
      deadlineNotificationsEnabled: true,
      documentNotificationsEnabled: true,
      packageNotificationsEnabled: true,
      systemNotificationsEnabled: true,
      lastDigestSentAt: null,
      user: { email: `user-${index}@example.test`, emailVerified: now },
    }));
    mocks.db.notificationPreference.findMany
      .mockResolvedValueOnce(preferences.slice(0, 100))
      .mockResolvedValueOnce(preferences.slice(100, 200))
      .mockResolvedValueOnce(preferences.slice(200));
    mocks.db.notification.findMany.mockResolvedValue([]);
    mocks.db.notification.count.mockResolvedValue(0);

    await expect(runScheduledEmailDigest(now)).resolves.toMatchObject({ scanned: 201, sent: 0, failed: 0, skipped: 201 });

    expect(mocks.db.notificationPreference.findMany).toHaveBeenCalledTimes(3);
    expect(mocks.db.notificationPreference.findMany).toHaveBeenNthCalledWith(2, expect.objectContaining({ cursor: { id: preferences[99].id }, skip: 1 }));
    expect(mocks.syncOrganizationReminderRecords).toHaveBeenCalledTimes(1);
  });

  it("sends only enabled preferences for allowed members and updates lastDigestSentAt", async () => {
    mocks.db.notificationPreference.findMany.mockResolvedValue([{
      id: "preference-1",
      organizationId: "org-1",
      userId: "user-1",
      emailDigestFrequency: "DAILY",
      emailDigestHour: 8,
      deadlineNotificationsEnabled: true,
      documentNotificationsEnabled: true,
      packageNotificationsEnabled: true,
      systemNotificationsEnabled: true,
      lastDigestSentAt: null,
      user: { email: "owner@example.com", emailVerified: now },
    }]);

    await expect(runScheduledEmailDigest(now)).resolves.toMatchObject({ scanned: 1, sent: 1, failed: 0, skipped: 0 });
    expect(mocks.db.organizationMembership.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        organizationId: "org-1",
        userId: "user-1",
        revokedAt: null,
        role: { in: ["OWNER", "ADMIN", "SAFETY_CONSULTANT"] },
      },
    }));
    expect(mocks.sendTransactionalEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: "owner@example.com",
      template: expect.objectContaining({ kind: "notification-digest" }),
    }));
    expect(mocks.db.notificationEmailDelivery.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: "SENT", notificationCount: 1, providerMessageId: "email-1" }),
    }));
    expect(mocks.db.notificationPreference.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "preference-1" },
      data: { lastDigestSentAt: expect.any(Date) },
    }));
  });

  it("skips disallowed members, missing verified email, no notifications and recent windows", async () => {
    mocks.db.notificationPreference.findMany.mockResolvedValue([
      { id: "role-skip", organizationId: "org-1", userId: "user-role", emailDigestFrequency: "DAILY", emailDigestHour: 8, deadlineNotificationsEnabled: true, documentNotificationsEnabled: true, packageNotificationsEnabled: true, systemNotificationsEnabled: true, lastDigestSentAt: null, user: { email: "a@example.com", emailVerified: now } },
      { id: "email-skip", organizationId: "org-1", userId: "user-email", emailDigestFrequency: "DAILY", emailDigestHour: 8, deadlineNotificationsEnabled: true, documentNotificationsEnabled: true, packageNotificationsEnabled: true, systemNotificationsEnabled: true, lastDigestSentAt: null, user: { email: "b@example.com", emailVerified: null } },
      { id: "recent-skip", organizationId: "org-1", userId: "user-recent", emailDigestFrequency: "DAILY", emailDigestHour: 8, deadlineNotificationsEnabled: true, documentNotificationsEnabled: true, packageNotificationsEnabled: true, systemNotificationsEnabled: true, lastDigestSentAt: new Date("2026-07-06T07:00:00.000Z"), user: { email: "c@example.com", emailVerified: now } },
      { id: "empty-skip", organizationId: "org-1", userId: "user-empty", emailDigestFrequency: "DAILY", emailDigestHour: 8, deadlineNotificationsEnabled: true, documentNotificationsEnabled: true, packageNotificationsEnabled: true, systemNotificationsEnabled: true, lastDigestSentAt: null, user: { email: "d@example.com", emailVerified: now } },
    ]);
    mocks.db.organizationMembership.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "membership-empty" });
    mocks.db.notification.findMany.mockResolvedValue([]);
    mocks.db.notification.count.mockResolvedValue(0);

    await expect(runScheduledEmailDigest(now)).resolves.toMatchObject({ scanned: 4, sent: 0, failed: 0, skipped: 4 });
    expect(mocks.sendTransactionalEmail).not.toHaveBeenCalled();
    expect(mocks.db.notificationEmailDelivery.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: "SKIPPED", errorCode: "NO_NOTIFICATIONS" }),
    }));
  });

  it("logs provider failures without updating lastDigestSentAt", async () => {
    mocks.db.notificationPreference.findMany.mockResolvedValue([{
      id: "preference-1",
      organizationId: "org-1",
      userId: "user-1",
      emailDigestFrequency: "WEEKLY",
      emailDigestHour: 8,
      deadlineNotificationsEnabled: true,
      documentNotificationsEnabled: true,
      packageNotificationsEnabled: true,
      systemNotificationsEnabled: true,
      lastDigestSentAt: null,
      user: { email: "owner@example.com", emailVerified: now },
    }]);
    mocks.sendTransactionalEmail.mockRejectedValue(new mocks.TransactionalEmailError("Invio email non riuscito."));

    await expect(runScheduledEmailDigest(now)).resolves.toMatchObject({ scanned: 1, sent: 0, failed: 1, skipped: 0 });
    expect(mocks.db.notificationEmailDelivery.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: "FAILED", errorCode: "PROVIDER_ERROR" }),
    }));
    expect(mocks.db.notificationPreference.update).not.toHaveBeenCalled();
  });

  it("skips digest when all available notifications are disabled by granular preferences", async () => {
    mocks.db.notificationPreference.findMany.mockResolvedValue([{
      id: "preference-1",
      organizationId: "org-1",
      userId: "user-1",
      emailDigestFrequency: "DAILY",
      emailDigestHour: 8,
      deadlineNotificationsEnabled: false,
      documentNotificationsEnabled: true,
      packageNotificationsEnabled: true,
      systemNotificationsEnabled: true,
      lastDigestSentAt: null,
      user: { email: "owner@example.com", emailVerified: now },
    }]);

    await expect(runScheduledEmailDigest(now)).resolves.toMatchObject({ scanned: 1, sent: 0, failed: 0, skipped: 1 });
    expect(mocks.sendTransactionalEmail).not.toHaveBeenCalled();
    expect(mocks.db.notificationEmailDelivery.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: "SKIPPED", errorCode: "NO_NOTIFICATIONS", notificationCount: 0 }),
    }));
  });
});
