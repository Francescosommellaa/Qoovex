import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "dotenv";
import { isLoopbackDatabaseConnection } from "../src/database-target-guard";

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPOSITORY_ROOT = path.resolve(PACKAGE_ROOT, "../..");
const LOCAL_ENV_FILE = path.join(PACKAGE_ROOT, ".env");
const PRODUCTION_ENV_FILE = path.join(REPOSITORY_ROOT, "apps/workspace/.env.production.local");

export const KNOWN_FIXTURE_ORGANIZATION_CODES = new Set(["QOOVEX-DEMO", "QOOVEX-LOCAL-DEMO"]);
export const FIXTURE_EMAIL_PATTERN = /@(?:qoovex\.local|example\.test)$/iu;
export const FIXTURE_LABEL_PATTERN = /(?:demo|e2e|test|fittizi|esempio)/iu;

export type FixtureTarget = "local" | "production";

export function loadFixtureTargetEnvironment(target: FixtureTarget) {
  const envFile = target === "local" ? LOCAL_ENV_FILE : PRODUCTION_ENV_FILE;
  const parsed = parse(readFileSync(envFile));
  const connectionString = target === "production"
    ? parsed.DATABASE_POSTGRES_URL?.trim() || parsed.DATABASE_URL?.trim()
    : parsed.DATABASE_URL?.trim() || parsed.DATABASE_POSTGRES_URL?.trim();

  if (!connectionString) throw new Error(`[fixture-target] ${target} database connection is missing.`);

  const isLoopback = isLoopbackDatabaseConnection(connectionString);
  if (target === "local" && !isLoopback) {
    throw new Error("[fixture-target] Local operation refused a remote database target.");
  }
  if (target === "production" && isLoopback) {
    throw new Error("[fixture-target] Production operation refused a loopback database target.");
  }

  process.env.DATABASE_URL = connectionString;
  delete process.env.DATABASE_PRISMA_DATABASE_URL;
  delete process.env.DATABASE_POSTGRES_URL;
  process.env.QOOVEX_DATABASE_ENVIRONMENT = target;
  process.env.VERCEL_ENV = target === "production" ? "production" : "development";
}

export function getFixtureReasons(input: { code: string; name: string; memberEmails: string[] }) {
  const fixtureMemberCount = input.memberEmails.filter((email) => FIXTURE_EMAIL_PATTERN.test(email)).length;
  return [
    ...(KNOWN_FIXTURE_ORGANIZATION_CODES.has(input.code) ? ["known-fixture-code"] : []),
    ...(FIXTURE_LABEL_PATTERN.test(`${input.name} ${input.code}`) ? ["fixture-label"] : []),
    ...(input.memberEmails.length > 0 && fixtureMemberCount === input.memberEmails.length
      ? ["all-member-emails-are-fixtures"]
      : []),
  ];
}

export function assertProductionFixtureCandidate(input: { code: string; name: string; memberEmails: string[] }) {
  const reasons = getFixtureReasons(input);
  if (!reasons.includes("all-member-emails-are-fixtures")) {
    throw new Error("[fixture-target] Production cleanup refused: every member must use a fixture email domain.");
  }
  if (!reasons.includes("known-fixture-code") && !reasons.includes("fixture-label")) {
    throw new Error("[fixture-target] Production cleanup refused: organization has no explicit fixture label.");
  }
  return reasons;
}

export function maskFixtureEmail(email: string) {
  const separator = email.lastIndexOf("@");
  if (separator <= 0) return "***";
  return `${email.slice(0, 1)}***${email.slice(separator)}`;
}
