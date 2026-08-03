import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUser: vi.fn(),
  findRecovery: vi.fn(),
  updateRecoveries: vi.fn(),
  createAudit: vi.fn(),
  createNotification: vi.fn(),
  findOwnerMembership: vi.fn(),
  verifyCurrentFactorForUser: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@shared/server/mfa-service", () => ({
  MfaError: class MfaError extends Error {
    constructor(message: string, public readonly status: number) { super(message); }
  },
  verifyCurrentFactorForUser: mocks.verifyCurrentFactorForUser,
}));
vi.mock("@shared/server/auth-code-service", () => ({
  AuthCodeError: class AuthCodeError extends Error {},
  issueAuthCode: vi.fn(),
  verifyAuthCode: vi.fn(),
}));
vi.mock("@shared/server/rate-limit", () => ({ assertPersistentRateLimit: vi.fn() }));
vi.mock("@shared/server/security-audit-service", () => ({ recordSecurityEvent: vi.fn() }));
vi.mock("@shared/server/transactional-email-service", () => ({ sendTransactionalEmail: vi.fn() }));
vi.mock("@qoovex/db", () => {
  const tx = {
    mfaRecoveryRequest: { updateMany: mocks.updateRecoveries },
    securityAuditEvent: { create: mocks.createAudit },
    notification: { create: mocks.createNotification },
  };
  return {
    db: {
      user: { findUnique: mocks.findUser },
      organization: { findUnique: vi.fn(async () => ({ name: "Azienda Test" })) },
      mfaRecoveryRequest: { findFirst: mocks.findRecovery, updateMany: vi.fn() },
      organizationMembership: { findUnique: vi.fn(), findFirst: mocks.findOwnerMembership, findMany: vi.fn(async () => []) },
      notification: { create: mocks.createNotification },
      $transaction: vi.fn(async (callback: (client: typeof tx) => unknown) => callback(tx)),
    },
  };
});

import { decideMfaRecoveryRequest } from "./mfa-recovery-service";

beforeEach(() => {
  mocks.findUser.mockReset().mockResolvedValue({
    id: "owner-1",
    email: "owner@example.com",
    authVersion: 2,
    organizationMemberships: [{ organizationId: "org-1", role: "OWNER", revokedAt: null }],
  });
  mocks.findRecovery.mockReset();
  mocks.updateRecoveries.mockReset().mockResolvedValue({ count: 1 });
  mocks.createAudit.mockReset().mockResolvedValue({});
  mocks.createNotification.mockReset().mockResolvedValue({});
  mocks.findOwnerMembership.mockReset().mockResolvedValue({ organizationId: "org-1", role: "OWNER", revokedAt: null });
  mocks.verifyCurrentFactorForUser.mockReset().mockResolvedValue(true);
});

describe("OWNER MFA recovery decision", () => {
  it("cannot approve a request outside the OWNER organization", async () => {
    mocks.findRecovery.mockResolvedValue(null);
    await expect(decideMfaRecoveryRequest({
      ownerUserId: "owner-1",
      requestId: "request-other-org",
      decision: "approve",
      currentCode: "123456",
    })).rejects.toMatchObject({ status: 409 });
  });

  it("cannot self-approve and atomically claims the first valid decision", async () => {
    mocks.findRecovery.mockResolvedValueOnce({ id: "request-1", userId: "owner-1", organizationId: "org-1", user: { email: "owner@example.com" } });
    await expect(decideMfaRecoveryRequest({ ownerUserId: "owner-1", requestId: "request-1", decision: "approve", currentCode: "123456" }))
      .rejects.toMatchObject({ status: 409 });

    mocks.findRecovery.mockResolvedValueOnce({ id: "request-2", userId: "member-1", organizationId: "org-1", user: { email: "member@example.com" } });
    await expect(decideMfaRecoveryRequest({ ownerUserId: "owner-1", requestId: "request-2", decision: "approve", currentCode: "123456" }))
      .resolves.toEqual({ id: "request-2", status: "APPROVED" });
    expect(mocks.updateRecoveries).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ organizationId: "org-1", status: "PENDING" }),
    }));
  });
});
