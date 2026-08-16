import assert from "node:assert/strict";
import test from "node:test";
import {
  assertDatabaseTargetForCommand,
  assertVercelDatabaseEnvironmentMarker,
  isLocalPrismaDevTarget,
  isLoopbackDatabaseConnection,
} from "../src/database-target-guard";

test("recognizes loopback PostgreSQL targets", () => {
  assert.equal(isLoopbackDatabaseConnection("postgresql://user:pass@localhost:5432/qoovex"), true);
  assert.equal(isLoopbackDatabaseConnection("postgresql://user:pass@127.0.0.1:5432/qoovex"), true);
  assert.equal(isLoopbackDatabaseConnection("postgresql://user:pass@db.example.test:5432/qoovex"), false);
});

test("serializes every declared local Prisma Dev target without affecting CI PostgreSQL", () => {
  const nonCanonicalPort = "postgresql://user:pass@localhost:51261/qoovex_ci";
  assert.equal(isLocalPrismaDevTarget(nonCanonicalPort, { QOOVEX_DATABASE_ENVIRONMENT: "local" }), true);
  assert.equal(isLocalPrismaDevTarget(nonCanonicalPort, { QOOVEX_DATABASE_ENVIRONMENT: "test" }), false);
  assert.equal(isLocalPrismaDevTarget("postgresql://user:pass@db.example.test:5432/qoovex", { QOOVEX_DATABASE_ENVIRONMENT: "local" }), false);
});

test("refuses remote local targets unless maintenance is explicitly attested", () => {
  const remote = { DATABASE_URL: "postgresql://user:pass@db.example.test:5432/qoovex" };
  assert.throws(() => assertDatabaseTargetForCommand("studio", remote), /loopback database/);
  assert.doesNotThrow(() => assertDatabaseTargetForCommand("studio", {
    ...remote,
    QOOVEX_ALLOW_REMOTE_DATABASE: "1",
    QOOVEX_REMOTE_DATABASE_ATTESTATION: "I_ACKNOWLEDGE_REMOTE_DATABASE",
  }));
});

test("requires preview and production markers to match Vercel", () => {
  const remote = { DATABASE_URL: "postgresql://user:pass@db.example.test:5432/qoovex" };
  assert.throws(() => assertDatabaseTargetForCommand("runtime", { ...remote, VERCEL_ENV: "preview" }), /must match VERCEL_ENV/);
  assert.throws(() => assertDatabaseTargetForCommand("runtime", { ...remote, VERCEL_ENV: "preview", QOOVEX_DATABASE_ENVIRONMENT: "production" }), /must match VERCEL_ENV/);
  assert.doesNotThrow(() => assertDatabaseTargetForCommand("runtime", { ...remote, VERCEL_ENV: "preview", QOOVEX_DATABASE_ENVIRONMENT: "preview" }));
  assert.doesNotThrow(() => assertVercelDatabaseEnvironmentMarker({ ...remote, VERCEL_ENV: "production" }));
  assert.throws(() => assertVercelDatabaseEnvironmentMarker({ ...remote, VERCEL_ENV: "preview", QOOVEX_DATABASE_ENVIRONMENT: "production" }), /does not match VERCEL_ENV/);
});
