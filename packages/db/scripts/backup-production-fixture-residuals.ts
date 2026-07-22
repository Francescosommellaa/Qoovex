import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { loadFixtureTargetEnvironment } from "./fixture-target";

const FIXTURE_EMAIL_FILTERS = [
  { endsWith: "@qoovex.local", mode: "insensitive" as const },
  { endsWith: "@example.test", mode: "insensitive" as const },
];

function readBackupPath() {
  const value = process.argv[2]?.trim();
  if (!value) throw new Error("[fixture-residual-backup] Missing backup path.");
  const userProfile = process.env.USERPROFILE?.trim();
  if (!userProfile) throw new Error("[fixture-residual-backup] USERPROFILE is missing.");
  const allowedDirectory = path.resolve(userProfile, "Documents", "Qoovex Backups");
  const backupPath = path.resolve(value);
  const relativePath = path.relative(allowedDirectory, backupPath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath) || path.extname(backupPath) !== ".json") {
    throw new Error("[fixture-residual-backup] Backup must be a JSON file inside Qoovex Backups.");
  }
  return backupPath;
}

async function main() {
  const backupPath = readBackupPath();
  loadFixtureTargetEnvironment("production");
  const { prisma } = await import("../lib/prisma");

  try {
    const [authCodes, verificationTokens, securityAuditEvents] = await Promise.all([
      prisma.authCode.findMany({ where: { OR: FIXTURE_EMAIL_FILTERS.map((email) => ({ email })) }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
      prisma.verificationToken.findMany({ where: { OR: FIXTURE_EMAIL_FILTERS.map((identifier) => ({ identifier })) }, orderBy: [{ identifier: "asc" }, { token: "asc" }] }),
      prisma.securityAuditEvent.findMany({ where: { OR: FIXTURE_EMAIL_FILTERS.map((email) => ({ email })) }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    ]);
    const payload = JSON.stringify({
      format: "qoovex-production-fixture-residual-backup-v1",
      createdAt: new Date().toISOString(),
      records: { authCodes, verificationTokens, securityAuditEvents },
    }, null, 2);
    const sha256 = createHash("sha256").update(payload).digest("hex");
    writeFileSync(backupPath, payload, { encoding: "utf8", flag: "wx" });

    console.log(JSON.stringify({
      backupFile: path.basename(backupPath),
      sha256,
      recordCounts: {
        authCodes: authCodes.length,
        verificationTokens: verificationTokens.length,
        securityAuditEvents: securityAuditEvents.length,
      },
    }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "[fixture-residual-backup] Unexpected failure.");
  process.exitCode = 1;
});
