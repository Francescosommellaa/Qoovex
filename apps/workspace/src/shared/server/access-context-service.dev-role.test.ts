import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  bootstrapDevUser: vi.fn(),
  findMembership: vi.fn(),
  getActiveSupportSession: vi.fn(),
  getPermissionsForRole: vi.fn(),
  getPermissionsForPreset: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@shared/server/auth/config", () => ({ auth: vi.fn() }));
vi.mock("@shared/server/dev-auth", () => ({ bootstrapDevUser: mocks.bootstrapDevUser }));
vi.mock("@qoovex/db", () => ({
  db: {
    user: { findUnique: vi.fn() },
    organizationMembership: { findMany: mocks.findMembership },
  },
}));
vi.mock("@shared/server/mfa-service", () => ({ isMfaSatisfiedForUser: vi.fn() }));
vi.mock("@shared/server/authorization-policy", () => ({
  getPermissionsForRole: mocks.getPermissionsForRole,
  getPermissionsForPreset: mocks.getPermissionsForPreset,
  getSupportSessionPermissions: vi.fn(() => []),
  sanitizeOrganizationPermissions: vi.fn((values: string[]) => values),
}));
vi.mock("@shared/server/support-access-service", () => ({ getActiveSupportSession: mocks.getActiveSupportSession }));
vi.mock("@shared/server/access-errors", () => ({
  AccessError: class AccessError extends Error {
    constructor(message: string, public readonly status: number, public readonly code?: string) {
      super(message);
    }
  },
}));

import { getWorkspaceAccessContext } from "./access-context-service";

beforeEach(() => {
  mocks.bootstrapDevUser.mockReset().mockResolvedValue({
    id: "dev-user",
    email: "dev@qoovex.local",
    emailVerified: new Date(0),
    platformRole: "USER",
    authVersion: 1,
    mfaEnabled: false,
    devView: "BUSINESS",
  });
  mocks.findMembership.mockReset().mockResolvedValue([{
    id: "membership-1",
    role: "OWNER",
    organization: { id: "org-1", name: "Azienda Dev", code: "DEV" },
  }]);
  mocks.getActiveSupportSession.mockReset().mockResolvedValue(null);
  mocks.getPermissionsForRole.mockReset().mockReturnValue(["organization:read", "jobSites:read"]);
  mocks.getPermissionsForPreset.mockReset().mockReturnValue(["organization:read", "jobSites:read"]);
});

describe("workspace dev role simulation", () => {
  it("uses the signed dev role without changing the persisted membership role", async () => {
    const context = await getWorkspaceAccessContext();

    expect(context.company).toMatchObject({
      role: "OWNER",
      organization: { id: "org-1", name: "Azienda Dev", code: "DEV" },
    });
    expect(context.platformRole).toBe("USER");
    expect(mocks.getPermissionsForRole).toHaveBeenCalledWith("OWNER");
    expect(mocks.findMembership).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ userId: "dev-user", revokedAt: null }) }));
  });

  it("projects the professional development view as a collaborator without changing the membership", async () => {
    mocks.bootstrapDevUser.mockResolvedValueOnce({
      id: "dev-user",
      email: "dev@qoovex.local",
      emailVerified: new Date(0),
      platformRole: "USER",
      authVersion: 1,
      mfaEnabled: false,
      devView: "PROFESSIONAL",
    });

    const context = await getWorkspaceAccessContext();

    expect(context.company).toMatchObject({ role: "COLLABORATOR", preset: "OPERATIONAL_COLLABORATION", scopeMode: "ASSIGNED" });
    expect(mocks.getPermissionsForPreset).toHaveBeenCalledWith("OPERATIONAL_COLLABORATION");
  });
});
