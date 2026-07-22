import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { loadFixtureTargetEnvironment } from "./fixture-target";

const CLEANUP_ATTESTATION = "I_ACKNOWLEDGE_FIXTURE_RESIDUAL_DELETION";
const FIXTURE_EMAIL_FILTERS = [
  { endsWith: "@qoovex.local", mode: "insensitive" as const },
  { endsWith: "@example.test", mode: "insensitive" as const },
];

function readRequiredEnvironment(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`[fixture-residual-cleanup] Missing ${name}.`);
  return value;
}

function assertApplyGate() {
  if (process.env.QOOVEX_PRODUCTION_FIXTURE_CLEANUP_APPROVED?.trim() !== "1") {
    throw new Error("[fixture-residual-cleanup] Explicit cleanup approval is missing.");
  }
  if (process.env.QOOVEX_PRODUCTION_FIXTURE_CLEANUP_ATTESTATION?.trim() !== CLEANUP_ATTESTATION) {
    throw new Error("[fixture-residual-cleanup] Cleanup attestation is missing or invalid.");
  }
  const backupPath = readRequiredEnvironment("QOOVEX_PRODUCTION_FIXTURE_BACKUP_REF");
  const expectedSha256 = readRequiredEnvironment("QOOVEX_PRODUCTION_FIXTURE_BACKUP_SHA256").toLowerCase();
  if (!existsSync(backupPath)) throw new Error("[fixture-residual-cleanup] Backup file does not exist.");
  const backup = readFileSync(backupPath);
  if (createHash("sha256").update(backup).digest("hex") !== expectedSha256) {
    throw new Error("[fixture-residual-cleanup] Backup checksum does not match.");
  }
  const payload = JSON.parse(backup.toString("utf8")) as { format?: unknown };
  if (payload.format !== "qoovex-production-fixture-residual-backup-v1") {
    throw new Error("[fixture-residual-cleanup] Backup format does not match.");
  }
}

async function main() {
  const apply = process.argv.includes("--apply");
  loadFixtureTargetEnvironment("production");
  const { prisma } = await import("../lib/prisma");

  try {
    const [authCodes, verificationTokens, securityAuditEvents] = await Promise.all([
      prisma.authCode.count({ where: { OR: FIXTURE_EMAIL_FILTERS.map((email) => ({ email })) } }),
      prisma.verificationToken.count({ where: { OR: FIXTURE_EMAIL_FILTERS.map((identifier) => ({ identifier })) } }),
      prisma.securityAuditEvent.count({ where: { OR: FIXTURE_EMAIL_FILTERS.map((email) => ({ email })) } }),
    ]);
    const preview = { apply, fixtureRecords: { authCodes, verificationTokens, securityAuditEvents } };
    if (!apply) {
      console.log(JSON.stringify(preview, null, 2));
      return;
    }

    assertApplyGate();
    const deleted = await prisma.$transaction(async (tx) => {
      const deletedAuthCodes = await tx.authCode.deleteMany({ where: { OR: FIXTURE_EMAIL_FILTERS.map((email) => ({ email })) } });
      const deletedVerificationTokens = await tx.verificationToken.deleteMany({ where: { OR: FIXTURE_EMAIL_FILTERS.map((identifier) => ({ identifier })) } });
      const deletedSecurityAuditEvents = await tx.securityAuditEvent.deleteMany({ where: { OR: FIXTURE_EMAIL_FILTERS.map((email) => ({ email })) } });
      return {
        authCodes: deletedAuthCodes.count,
        verificationTokens: deletedVerificationTokens.count,
        securityAuditEvents: deletedSecurityAuditEvents.count,
      };
    });

    const [remainingAuthCodes, remainingVerificationTokens, remainingSecurityAuditEvents] = await Promise.all([
      prisma.authCode.count({ where: { OR: FIXTURE_EMAIL_FILTERS.map((email) => ({ email })) } }),
      prisma.verificationToken.count({ where: { OR: FIXTURE_EMAIL_FILTERS.map((identifier) => ({ identifier })) } }),
      prisma.securityAuditEvent.count({ where: { OR: FIXTURE_EMAIL_FILTERS.map((email) => ({ email })) } }),
    ]);
    if (remainingAuthCodes !== 0 || remainingVerificationTokens !== 0 || remainingSecurityAuditEvents !== 0) {
      throw new Error("[fixture-residual-cleanup] Post-delete verification failed.");
    }

    console.log(JSON.stringify({
      ...preview,
      deleted,
      verifiedRemaining: {
        authCodes: remainingAuthCodes,
        verificationTokens: remainingVerificationTokens,
        securityAuditEvents: remainingSecurityAuditEvents,
      },
    }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "[fixture-residual-cleanup] Unexpected failure.");
  process.exitCode = 1;
});
