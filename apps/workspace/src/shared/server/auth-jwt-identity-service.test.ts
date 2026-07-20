import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@qoovex/db", () => ({ db: { user: { findUnique: mocks.findUnique } } }));

import { loadAuthJwtIdentity } from "./auth-jwt-identity-service";

describe("auth jwt identity service", () => {
  beforeEach(() => mocks.findUnique.mockReset());

  it("loads identity and credential state in one tenant-independent user query", async () => {
    const passwordUpdatedAt = new Date("2026-07-20T10:00:00.000Z");
    mocks.findUnique.mockResolvedValue({
      authVersion: 4,
      platformRole: "USER",
      suspendedAt: null,
      credential: { passwordUpdatedAt },
    });

    await expect(loadAuthJwtIdentity("user-1")).resolves.toEqual({
      authVersion: 4,
      platformRole: "USER",
      suspendedAt: null,
      passwordUpdatedAt,
    });
    expect(mocks.findUnique).toHaveBeenCalledTimes(1);
    expect(mocks.findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
      select: {
        authVersion: true,
        platformRole: true,
        suspendedAt: true,
        credential: { select: { passwordUpdatedAt: true } },
      },
    });
  });

  it("returns null for a deleted user and supports accounts without credentials", async () => {
    mocks.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({
      authVersion: 1,
      platformRole: "USER",
      suspendedAt: null,
      credential: null,
    });

    await expect(loadAuthJwtIdentity("missing")).resolves.toBeNull();
    await expect(loadAuthJwtIdentity("oauth-user")).resolves.toMatchObject({ passwordUpdatedAt: null });
  });
});
