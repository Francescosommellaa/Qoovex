import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import path from "node:path";
import {
  assertProductionFixtureCandidate,
  loadFixtureTargetEnvironment,
} from "./fixture-target";

function readRequiredArgument(index: number, label: string) {
  const value = process.argv[index]?.trim();
  if (!value) throw new Error(`[fixture-backup] Missing ${label}.`);
  return value;
}

function assertBackupPath(backupPath: string) {
  const userProfile = process.env.USERPROFILE?.trim();
  if (!userProfile) throw new Error("[fixture-backup] USERPROFILE is missing.");
  const allowedDirectory = path.resolve(userProfile, "Documents", "Qoovex Backups");
  const resolvedPath = path.resolve(backupPath);
  const relativePath = path.relative(allowedDirectory, resolvedPath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath) || path.extname(resolvedPath) !== ".json") {
    throw new Error("[fixture-backup] Backup must be a JSON file inside the encrypted Qoovex Backups directory.");
  }
  return resolvedPath;
}

async function main() {
  const organizationId = readRequiredArgument(2, "organization id");
  const backupPath = assertBackupPath(readRequiredArgument(3, "backup path"));
  loadFixtureTargetEnvironment("production");
  const { prisma } = await import("../lib/prisma");

  try {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        memberships: {
          include: { user: true },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        },
      },
    });
    if (!organization) throw new Error("[fixture-backup] Organization not found.");

    const memberUserIds = organization.memberships.map((membership) => membership.userId);
    const memberEmails = organization.memberships.map((membership) => membership.user.email);
    const reasons = assertProductionFixtureCandidate({
      code: organization.code,
      name: organization.name,
      memberEmails,
    });

    const [
      invitations,
      supportSessions,
      supportAuditEvents,
      productAuditEvents,
      workers,
      jobSites,
      documentTypes,
      documentRequirements,
      documents,
      documentVersions,
      deadlines,
      calendarEvents,
      checklists,
      checklistItems,
      evidence,
      documentPackages,
      documentPackageItems,
      shareLinks,
      notifications,
      notificationPreferences,
      notificationEmailDeliveries,
      workerUserLinks,
      jobSiteUserAssignments,
      jobSiteWorkerAssignments,
      dataControlJobs,
    ] = await Promise.all([
      prisma.organizationInvitation.findMany({ where: { organizationId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
      prisma.supportSession.findMany({ where: { organizationId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
      prisma.supportAuditEvent.findMany({ where: { organizationId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
      prisma.productAuditEvent.findMany({ where: { organizationId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
      prisma.worker.findMany({ where: { organizationId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
      prisma.jobSite.findMany({ where: { organizationId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
      prisma.documentType.findMany({ where: { organizationId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
      prisma.documentRequirement.findMany({ where: { organizationId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
      prisma.document.findMany({ where: { organizationId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
      prisma.documentVersion.findMany({ where: { organizationId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
      prisma.deadline.findMany({ where: { organizationId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
      prisma.calendarEvent.findMany({ where: { organizationId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
      prisma.checklist.findMany({ where: { organizationId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
      prisma.checklistItem.findMany({ where: { organizationId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
      prisma.evidence.findMany({ where: { organizationId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
      prisma.documentPackage.findMany({ where: { organizationId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
      prisma.documentPackageItem.findMany({ where: { organizationId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
      prisma.shareLink.findMany({ where: { organizationId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
      prisma.notification.findMany({ where: { organizationId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
      prisma.notificationPreference.findMany({ where: { organizationId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
      prisma.notificationEmailDelivery.findMany({ where: { organizationId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
      prisma.workerUserLink.findMany({ where: { organizationId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
      prisma.jobSiteUserAssignment.findMany({ where: { organizationId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
      prisma.jobSiteWorkerAssignment.findMany({ where: { organizationId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
      prisma.dataControlJob.findMany({ where: { organizationId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    ]);

    const [
      users,
      accounts,
      sessions,
      credentials,
      authCodes,
      mfaRecoveryRequests,
      authRateLimits,
      securityAuditEvents,
      authDevices,
      mfaBackupCodes,
      verificationTokens,
      resolvedRuntimeErrors,
    ] = await Promise.all([
      prisma.user.findMany({ where: { id: { in: memberUserIds } }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
      prisma.account.findMany({ where: { userId: { in: memberUserIds } }, orderBy: [{ userId: "asc" }, { provider: "asc" }] }),
      prisma.session.findMany({ where: { userId: { in: memberUserIds } }, orderBy: [{ expires: "asc" }, { id: "asc" }] }),
      prisma.userCredential.findMany({ where: { userId: { in: memberUserIds } }, orderBy: { userId: "asc" } }),
      prisma.authCode.findMany({ where: { OR: [{ userId: { in: memberUserIds } }, { email: { in: memberEmails } }] }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
      prisma.mfaRecoveryRequest.findMany({ where: { OR: [{ organizationId }, { userId: { in: memberUserIds } }] }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
      prisma.authRateLimit.findMany({ where: { userId: { in: memberUserIds } }, orderBy: [{ createdAt: "asc" }, { key: "asc" }] }),
      prisma.securityAuditEvent.findMany({ where: { OR: [{ userId: { in: memberUserIds } }, { email: { in: memberEmails } }] }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
      prisma.authDevice.findMany({ where: { userId: { in: memberUserIds } }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
      prisma.mfaBackupCode.findMany({ where: { userId: { in: memberUserIds } }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
      prisma.verificationToken.findMany({ where: { identifier: { in: memberEmails } }, orderBy: [{ identifier: "asc" }, { token: "asc" }] }),
      prisma.runtimeErrorEvent.findMany({ where: { resolvedById: { in: memberUserIds } }, orderBy: [{ firstSeenAt: "asc" }, { id: "asc" }] }),
    ]);

    const records = {
      organizations: [{ ...organization, memberships: undefined }],
      organizationMemberships: organization.memberships.map(({ user: _user, ...membership }) => membership),
      organizationInvitations: invitations,
      supportSessions,
      supportAuditEvents,
      productAuditEvents,
      workers,
      jobSites,
      documentTypes,
      documentRequirements,
      documents,
      documentVersions,
      deadlines,
      calendarEvents,
      checklists,
      checklistItems,
      evidence,
      documentPackages,
      documentPackageItems,
      shareLinks,
      notifications,
      notificationPreferences,
      notificationEmailDeliveries,
      workerUserLinks,
      jobSiteUserAssignments,
      jobSiteWorkerAssignments,
      dataControlJobs,
      users,
      accounts,
      sessions,
      userCredentials: credentials,
      authCodes,
      mfaRecoveryRequests,
      authRateLimits,
      securityAuditEvents,
      authDevices,
      mfaBackupCodes,
      verificationTokens,
      resolvedRuntimeErrors,
    };
    const payload = JSON.stringify({
      format: "qoovex-production-fixture-backup-v1",
      createdAt: new Date().toISOString(),
      organizationId,
      safetyReasons: reasons,
      records,
    }, null, 2);
    const sha256 = createHash("sha256").update(payload).digest("hex");
    writeFileSync(backupPath, payload, { encoding: "utf8", flag: "wx" });

    console.log(JSON.stringify({
      backupFile: path.basename(backupPath),
      sha256,
      recordCounts: Object.fromEntries(
        Object.entries(records).map(([name, rows]) => [name, rows.length])
      ),
    }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "[fixture-backup] Unexpected failure.");
  process.exitCode = 1;
});
