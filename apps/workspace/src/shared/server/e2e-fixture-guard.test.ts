import { describe, expect, it } from "vitest";
import { isAuthenticatedFixtureEnvironment } from "./e2e-fixture-guard";

const local = {
  NODE_ENV: "development",
  QOOVEX_DATABASE_ENVIRONMENT: "test",
  QOOVEX_E2E_MODE: "1",
  QOOVEX_E2E_RUN_ATTESTATION: "I_ACKNOWLEDGE_FIXTURE_SCOPED_CLEANUP",
  DATABASE_URL: "postgresql://test:test@127.0.0.1:5432/qoovex_ci",
  QOOVEX_E2E_DATABASE_TARGET: "postgresql://test:test@127.0.0.1:5432/qoovex_ci",
} satisfies NodeJS.ProcessEnv;

describe("authenticated E2E fixture guard", () => {
  it("accepts only the attested loopback CI database", () => {
    expect(isAuthenticatedFixtureEnvironment(local)).toBe(true);
  });

  it.each([
    { ...local, QOOVEX_E2E_MODE: "0" },
    { ...local, QOOVEX_E2E_DATABASE_TARGET: "different" },
    { ...local, DATABASE_URL: "postgresql://test:test@db.example.test/qoovex_ci", QOOVEX_E2E_DATABASE_TARGET: "postgresql://test:test@db.example.test/qoovex_ci" },
    { ...local, DATABASE_URL: "postgresql://test:test@127.0.0.1/qoovex", QOOVEX_E2E_DATABASE_TARGET: "postgresql://test:test@127.0.0.1/qoovex" },
    { ...local, VERCEL: "1" },
    { ...local, VERCEL_ENV: "preview" },
    { ...local, VERCEL_ENV: "production" },
    { ...local, NODE_ENV: "production" },
  ])("fails closed outside the authorized fixture target", (env) => {
    expect(isAuthenticatedFixtureEnvironment(env as NodeJS.ProcessEnv)).toBe(false);
  });
});
