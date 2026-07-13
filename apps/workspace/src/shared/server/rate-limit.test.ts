import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  queryRaw: vi.fn(),
  deleteMany: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@qoovex/db", () => ({
  db: {
    $queryRaw: mocks.queryRaw,
    authRateLimit: { deleteMany: mocks.deleteMany },
  },
  Prisma: {
    sql: (strings: TemplateStringsArray, ...values: unknown[]) => ({ strings: [...strings], values }),
  },
}));

import {
  RateLimitExceededError,
  assertPersistentRateLimit,
  createPersistentRateLimitKey,
} from "./rate-limit";

describe("persistent rate limit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.QOOVEX_AUDIT_SECRET = "rate-limit-test-secret-at-least-32-characters";
    mocks.queryRaw.mockResolvedValue([{ count: 1 }]);
    mocks.deleteMany.mockResolvedValue({ count: 0 });
  });

  it("uses a stable pseudonymous key without retaining the identifier", async () => {
    const identifier = "Owner@Example.com";
    const key = createPersistentRateLimitKey("auth:signin", identifier.toLowerCase());

    expect(key).toMatch(/^v1:[a-f0-9]{64}$/);
    expect(key).not.toContain("owner@example.com");
    expect(key).toBe(createPersistentRateLimitKey("auth:signin", identifier.toLowerCase()));
    expect(key).not.toBe(createPersistentRateLimitKey("auth:signup", identifier.toLowerCase()));

    await assertPersistentRateLimit({
      identifier,
      bucket: "auth:signin",
      limit: 8,
      windowMs: 60_000,
      userId: "user-1",
    });

    expect(JSON.stringify(mocks.queryRaw.mock.calls)).not.toContain(identifier.toLowerCase());
    expect(mocks.deleteMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ resetAt: expect.any(Object) }),
    }));
  });

  it("throws when the atomic upsert returns no admitted row", async () => {
    mocks.queryRaw.mockResolvedValue([]);

    await expect(assertPersistentRateLimit({
      identifier: "owner@example.com",
      bucket: "auth:signin",
      limit: 1,
      windowMs: 60_000,
    })).rejects.toBeInstanceOf(RateLimitExceededError);
  });
});
