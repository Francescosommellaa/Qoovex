import type { OrganizationRole } from "@qoovex/types";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  AccessError: class AccessError extends Error {
    constructor(message: string, public readonly status: 401 | 403 | 404 | 409 | 410) {
      super(message);
      this.name = "AccessError";
    }
  },
  RateLimitExceededError: class RateLimitExceededError extends Error {
    constructor() {
      super("Troppe richieste. Riprova tra qualche minuto.");
      this.name = "RateLimitExceededError";
    }
  },
  TransactionalEmailError: class TransactionalEmailError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "TransactionalEmailError";
    }
  },
  db: {
    notification: {
      findMany: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    notificationEmailDelivery: {
      create: vi.fn(),
    },
  },
  role: "OWNER" as OrganizationRole,
  syncOrganizationReminderRecords: vi.fn(),
  assertPersistentRateLimit: vi.fn(),
  sendTransactionalEmail: vi.fn(),
  recordSupportAccess: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@qoovex/db", () => ({ db: mocks.db }));
vi.mock("@shared/server/access-errors", () => ({ AccessError: mocks.AccessError }));
vi.mock("./domain-access-service", () => ({
  requireOrganizationDomainAccess: vi.fn(async (_permission: string, allowedRoles: readonly OrganizationRole[]) => {
    if (!allowedRoles.includes(mocks.role)) throw new mocks.AccessError("Risorsa non disponibile.", 404);
    return {
      context: { userId: "user-1" },
      organizationId: "org-1",
      actorRole: mocks.role,
    };
  }),
}));
vi.mock("./reminder-service", () => ({ syncOrganizationReminderRecords: mocks.syncOrganizationReminderRecords }));
vi.mock("@shared/server/rate-limit", () => ({
  assertPersistentRateLimit: mocks.assertPersistentRateLimit,
  RateLimitExceededError: mocks.RateLimitExceededError,
}));
vi.mock("@shared/server/support-access-service", () => ({ recordSupportAccess: mocks.recordSupportAccess }));
vi.mock("@shared/server/transactional-email-service", () => ({
  sendTransactionalEmail: mocks.sendTransactionalEmail,
  TransactionalEmailError: mocks.TransactionalEmailError,
}));

import {
  previewNotificationEmailDigest,
  sendNotificationEmailDigestToMe,
  sendSingleNotificationEmailToMe,
} from "./notification-email-service";

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

function setRole(role: OrganizationRole) {
  mocks.role = role;
}

beforeEach(() => {
  mocks.db.notification.findMany.mockReset();
  mocks.db.notification.count.mockReset();
  mocks.db.notification.findFirst.mockReset();
  mocks.db.user.findUnique.mockReset();
  mocks.db.notificationEmailDelivery.create.mockReset();
  mocks.syncOrganizationReminderRecords.mockReset();
  mocks.assertPersistentRateLimit.mockReset();
  mocks.sendTransactionalEmail.mockReset();
  mocks.recordSupportAccess.mockReset();
  setRole("OWNER");

  mocks.syncOrganizationReminderRecords.mockResolvedValue({ created: 0, updated: 0, skipped: 0 });
  mocks.db.notification.findMany.mockResolvedValue([notificationRecord]);
  mocks.db.notification.count.mockResolvedValue(1);
  mocks.db.notification.findFirst.mockResolvedValue(notificationRecord);
  mocks.db.user.findUnique.mockResolvedValue({ email: "owner@example.com", emailVerified: now });
  mocks.assertPersistentRateLimit.mockResolvedValue(undefined);
  mocks.sendTransactionalEmail.mockResolvedValue({ providerMessageId: "email-1" });
  mocks.db.notificationEmailDelivery.create.mockResolvedValue({ id: "delivery-1" });
  mocks.recordSupportAccess.mockResolvedValue(undefined);
});

describe("notification email service", () => {
  it("lets Owners and Collaborators with notification permissions preview email digest", async () => {
    for (const role of ["OWNER", "COLLABORATOR"] as const) {
      setRole(role);
      await expect(previewNotificationEmailDigest()).resolves.toMatchObject({ unreadCount: 1 });
    }

    expect(mocks.db.notification.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ organizationId: "org-1", dismissedAt: null, readAt: null }),
      take: 10,
    }));
  });

  it("keeps collaborator notification access permission-driven", async () => {
    setRole("COLLABORATOR");
    await expect(previewNotificationEmailDigest()).resolves.toMatchObject({ unreadCount: 1 });
  });

  it("returns a safe preview payload", async () => {
    const preview = await previewNotificationEmailDigest();
    const serialized = JSON.stringify(preview);

    expect(preview.items[0]).toMatchObject({ title: "Scadenza registrata superata", actionHref: "/deadlines" });
    expect(serialized).not.toContain("organizationId");
    expect(serialized).not.toContain("dedupeKey");
    expect(serialized).not.toContain("blobKey");
    expect(serialized).not.toContain("tokenHash");
    expect(serialized).not.toContain("downloadUrl");
    expect(serialized).not.toContain("owner@example.com");
  });

  it("sends digest only to the current verified user email", async () => {
    const response = await sendNotificationEmailDigestToMe();
    expect(response).toMatchObject({ sent: true, notificationCount: 1 });

    expect(mocks.db.user.findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
      select: { email: true, emailVerified: true },
    });
    expect(mocks.assertPersistentRateLimit).toHaveBeenCalledWith(expect.objectContaining({
      identifier: "org-1:user-1",
      bucket: "notification-email-digest",
      limit: 1,
    }));
    expect(mocks.sendTransactionalEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: "owner@example.com",
      template: expect.objectContaining({ kind: "notification-digest" }),
    }));
    expect(mocks.db.notificationEmailDelivery.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        organizationId: "org-1",
        userId: "user-1",
        type: "DIGEST",
        status: "SENT",
        recipientEmail: "owner@example.com",
        notificationCount: 1,
        providerMessageId: "email-1",
      }),
    }));
    expect(JSON.stringify(response)).not.toContain("owner@example.com");
  });

  it("rejects digest send when user email is missing or not verified", async () => {
    mocks.db.user.findUnique.mockResolvedValue({ email: "owner@example.com", emailVerified: null });
    await expect(sendNotificationEmailDigestToMe()).rejects.toMatchObject({ status: 409 });

    mocks.db.user.findUnique.mockResolvedValue({ email: "", emailVerified: now });
    await expect(sendNotificationEmailDigestToMe()).rejects.toMatchObject({ status: 409 });
  });

  it("rate limits manual digest sends with a safe error", async () => {
    mocks.assertPersistentRateLimit.mockRejectedValue(new mocks.RateLimitExceededError());
    await expect(sendNotificationEmailDigestToMe()).rejects.toMatchObject({ status: 409, message: "Troppe richieste. Riprova tra qualche minuto." });
    expect(mocks.sendTransactionalEmail).not.toHaveBeenCalled();
    expect(mocks.db.notificationEmailDelivery.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: "SKIPPED", errorCode: "RATE_LIMIT" }),
    }));
  });

  it("sends a single visible notification to the current user only", async () => {
    await expect(sendSingleNotificationEmailToMe("notification-1")).resolves.toMatchObject({
      sent: true,
      notification: { id: "notification-1" },
    });

    expect(mocks.db.notification.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        id: "notification-1",
        organizationId: "org-1",
        dismissedAt: null,
      }),
    }));
    expect(mocks.sendTransactionalEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: "owner@example.com",
      template: expect.objectContaining({ kind: "notification-single" }),
    }));
    expect(mocks.db.notificationEmailDelivery.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        notificationId: "notification-1",
        type: "SINGLE_NOTIFICATION",
        status: "SENT",
      }),
    }));
  });

  it("surfaces provider errors without provider internals", async () => {
    mocks.sendTransactionalEmail.mockRejectedValue(new mocks.TransactionalEmailError("Invio email non riuscito."));
    await expect(sendNotificationEmailDigestToMe()).rejects.toMatchObject({ status: 409, message: "Invio email non riuscito." });
    expect(mocks.db.notificationEmailDelivery.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: "FAILED", errorCode: "PROVIDER_ERROR" }),
    }));
  });
});
