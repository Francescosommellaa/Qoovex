import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import {
  assertProductionFixtureCandidate,
  loadFixtureTargetEnvironment,
  maskFixtureEmail,
} from "./fixture-target";

const CLEANUP_ATTESTATION = "I_ACKNOWLEDGE_FIXTURE_ONLY_DELETION";

function readRequiredArgument(index: number, label: string) {
  const value = process.argv[index]?.trim();
  if (!value) throw new Error(`[fixture-cleanup] Missing ${label}.`);
  return value;
}

function readRequiredEnvironment(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`[fixture-cleanup] Missing ${name}.`);
  return value;
}

function verifyBackup(organizationId: string) {
  const backupPath = readRequiredEnvironment("QOOVEX_PRODUCTION_FIXTURE_BACKUP_REF");
  const expectedSha256 = readRequiredEnvironment("QOOVEX_PRODUCTION_FIXTURE_BACKUP_SHA256").toLowerCase();
  if (!existsSync(backupPath)) throw new Error("[fixture-cleanup] Backup file does not exist.");

  const backup = readFileSync(backupPath);
  const actualSha256 = createHash("sha256").update(backup).digest("hex");
  if (actualSha256 !== expectedSha256) throw new Error("[fixture-cleanup] Backup checksum does not match.");

  const payload = JSON.parse(backup.toString("utf8")) as {
    format?: unknown;
    organizationId?: unknown;
  };
  if (payload.format !== "qoovex-production-fixture-backup-v1" || payload.organizationId !== organizationId) {
    throw new Error("[fixture-cleanup] Backup is not bound to the requested organization.");
  }
}

function assertApplyGate(organizationId: string) {
  if (process.env.QOOVEX_PRODUCTION_FIXTURE_CLEANUP_APPROVED?.trim() !== "1") {
    throw new Error("[fixture-cleanup] Explicit cleanup approval is missing.");
  }
  if (process.env.QOOVEX_PRODUCTION_FIXTURE_CLEANUP_ATTESTATION?.trim() !== CLEANUP_ATTESTATION) {
    throw new Error("[fixture-cleanup] Cleanup attestation is missing or invalid.");
  }
  if (readRequiredEnvironment("QOOVEX_EXPECTED_FIXTURE_ORGANIZATION_ID") !== organizationId) {
    throw new Error("[fixture-cleanup] Expected organization id does not match.");
  }
  if (readRequiredEnvironment("QOOVEX_EXPECTED_PRODUCTION_FIXTURE_BLOB_COUNT") !== "0") {
    throw new Error("[fixture-cleanup] Cleanup refused because the verified Blob count is not zero.");
  }
  verifyBackup(organizationId);
}

async function main() {
  const organizationId = readRequiredArgument(2, "organization id");
  const apply = process.argv.includes("--apply");
  loadFixtureTargetEnvironment("production");
  const { prisma } = await import("../lib/prisma");

  try {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        code: true,
        memberships: {
          select: { user: { select: { id: true, email: true } } },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        },
      },
    });
    if (!organization) throw new Error("[fixture-cleanup] Organization not found.");

    const memberUserIds = organization.memberships.map((membership) => membership.user.id);
    const memberEmails = organization.memberships.map((membership) => membership.user.email);
    const safetyReasons = assertProductionFixtureCandidate({
      code: organization.code,
      name: organization.name,
      memberEmails,
    });

    const preview = {
      organizationId,
      organizationName: organization.name,
      organizationCode: organization.code,
      safetyReasons,
      users: organization.memberships.map((membership) => ({
        id: membership.user.id,
        email: maskFixtureEmail(membership.user.email),
      })),
      apply,
    };

    if (!apply) {
      console.log(JSON.stringify(preview, null, 2));
      return;
    }

    assertApplyGate(organizationId);
    const deleted = await prisma.$transaction(async (tx) => {
      const dataControlJobs = await tx.dataControlJob.deleteMany({ where: { organizationId } });
      const verificationTokens = await tx.verificationToken.deleteMany({
        where: { identifier: { in: memberEmails } },
      });
      const authCodes = await tx.authCode.deleteMany({
        where: { OR: [{ userId: { in: memberUserIds } }, { email: { in: memberEmails } }] },
      });
      const securityAuditEvents = await tx.securityAuditEvent.deleteMany({
        where: { OR: [{ userId: { in: memberUserIds } }, { email: { in: memberEmails } }] },
      });
      await tx.organization.delete({ where: { id: organizationId } });
      const users = await tx.user.deleteMany({
        where: { id: { in: memberUserIds }, email: { in: memberEmails } },
      });

      return {
        organizations: 1,
        users: users.count,
        dataControlJobs: dataControlJobs.count,
        verificationTokens: verificationTokens.count,
        authCodes: authCodes.count,
        securityAuditEvents: securityAuditEvents.count,
      };
    }, { timeout: 30_000 });

    const [remainingOrganization, remainingUsers, remainingDataControlJobs] = await Promise.all([
      prisma.organization.count({ where: { id: organizationId } }),
      prisma.user.count({ where: { id: { in: memberUserIds } } }),
      prisma.dataControlJob.count({ where: { organizationId } }),
    ]);
    if (remainingOrganization !== 0 || remainingUsers !== 0 || remainingDataControlJobs !== 0) {
      throw new Error("[fixture-cleanup] Post-delete verification failed.");
    }

    console.log(JSON.stringify({
      ...preview,
      deleted,
      verifiedRemaining: {
        organizations: remainingOrganization,
        users: remainingUsers,
        dataControlJobs: remainingDataControlJobs,
      },
    }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "[fixture-cleanup] Unexpected failure.");
  process.exitCode = 1;
});
