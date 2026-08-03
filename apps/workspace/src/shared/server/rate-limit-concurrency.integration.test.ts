import crypto from "crypto";
import { afterAll, describe, expect, it, vi } from "vitest";

const environment = vi.hoisted(() => {
  const value = process.env.DATABASE_URL?.trim();
  if (!value) return { isLocalCiDatabase: false };
  try {
    const url = new URL(value);
    const isAttestedLocalE2e = process.env.QOOVEX_E2E_MODE === "1"
      && process.env.QOOVEX_E2E_DATABASE_TARGET === value
      && process.env.QOOVEX_E2E_RUN_ATTESTATION === "I_ACKNOWLEDGE_FIXTURE_SCOPED_CLEANUP";
    return {
      isLocalCiDatabase: new Set(["localhost", "127.0.0.1", "::1"]).has(url.hostname)
        && (url.pathname.replace(/^\//, "") === "qoovex_ci" || isAttestedLocalE2e),
    };
  } catch {
    return { isLocalCiDatabase: false };
  }
});

if (process.env.CI && !environment.isLocalCiDatabase) {
  throw new Error("CI must run rate-limit concurrency tests against the local qoovex_ci PostgreSQL database.");
}

vi.mock("server-only", () => ({}));
vi.mock("@qoovex/db", async (importOriginal) => {
  if (environment.isLocalCiDatabase) return importOriginal();
  return {
    db: {},
    Prisma: { sql: () => undefined },
  };
});

import { db } from "@qoovex/db";
import { assertPersistentRateLimit, createPersistentRateLimitKey } from "./rate-limit";

const describeOnLocalCi = environment.isLocalCiDatabase ? describe : describe.skip;
const identifiers: string[] = [];

afterAll(async () => {
  if (!environment.isLocalCiDatabase || !identifiers.length) return;
  await db.authRateLimit.deleteMany({
    where: { key: { in: identifiers.map((identifier) => createPersistentRateLimitKey("integration:concurrency", identifier)) } },
  });
});

describeOnLocalCi("persistent rate limit concurrency on PostgreSQL", () => {
  it("admits exactly the configured limit under concurrency", async () => {
    process.env.QOOVEX_AUDIT_SECRET = "rate-limit-integration-secret-at-least-32-characters";
    const identifier = `subject-${crypto.randomUUID()}@example.test`;
    identifiers.push(identifier);

    const results = await Promise.allSettled(Array.from({ length: 16 }, () =>
      assertPersistentRateLimit({
        identifier,
        bucket: "integration:concurrency",
        limit: 5,
        windowMs: 60_000,
      })));

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(5);
    expect(results.filter((result) => result.status === "rejected")).toHaveLength(11);

    const stored = await db.authRateLimit.findUniqueOrThrow({
      where: { key: createPersistentRateLimitKey("integration:concurrency", identifier) },
      select: { key: true, count: true },
    });
    expect(stored.count).toBe(5);
    expect(stored.key).not.toContain(identifier);
  });
});
