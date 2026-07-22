import {
  FIXTURE_EMAIL_PATTERN,
  getFixtureReasons,
  loadFixtureTargetEnvironment,
  maskFixtureEmail,
  type FixtureTarget,
} from "./fixture-target";

function readTargetArgument(): FixtureTarget {
  const target = process.argv[2]?.trim();
  if (target === "local" || target === "production") return target;
  throw new Error("[fixture-inventory] Expected target: local or production.");
}

async function main() {
  const target = readTargetArgument();
  loadFixtureTargetEnvironment(target);
  const { prisma } = await import("../lib/prisma");

  try {
    const [organizations, unassignedFixtureUsers] = await Promise.all([
      prisma.organization.findMany({
        select: {
          id: true,
          name: true,
          code: true,
          createdAt: true,
          memberships: {
            select: {
              role: true,
              revokedAt: true,
              user: { select: { id: true, email: true } },
            },
          },
          _count: {
            select: {
              workers: true,
              jobSites: true,
              documentTypes: true,
              documentRequirements: true,
              documents: true,
              documentVersions: true,
              deadlines: true,
              calendarEvents: true,
              checklists: true,
              checklistItems: true,
              evidence: true,
              documentPackages: true,
              documentPackageItems: true,
              shareLinks: true,
              notifications: true,
              notificationPreferences: true,
              notificationEmailDeliveries: true,
              productAuditEvents: true,
              memberships: true,
              invitations: true,
              supportSessions: true,
              supportEvents: true,
              mfaRecoveryRequests: true,
              workerUserLinks: true,
              jobSiteUserAssignments: true,
              jobSiteWorkerAssignments: true,
            },
          },
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      }),
      prisma.user.findMany({
        where: {
          organizationMembership: null,
          OR: [
            { email: { endsWith: "@qoovex.local", mode: "insensitive" } },
            { email: { endsWith: "@example.test", mode: "insensitive" } },
          ],
        },
        select: { id: true, email: true, createdAt: true },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      }),
    ]);

    const candidateOrganizations = organizations.filter((organization) => {
      return getFixtureReasons({
        code: organization.code,
        name: organization.name,
        memberEmails: organization.memberships.map((membership) => membership.user.email),
      }).length > 0;
    });
    const candidateOrganizationIds = candidateOrganizations.map((organization) => organization.id);
    const candidateUsers = candidateOrganizations.flatMap((organization) =>
      organization.memberships.map((membership) => membership.user)
    );
    const candidateUserIds = [...new Set(candidateUsers.map((user) => user.id))];
    const candidateEmails = [...new Set(candidateUsers.map((user) => user.email))];
    const [
      dataControlJobs,
      accounts,
      sessions,
      credentials,
      authCodes,
      authRateLimits,
      securityAuditEvents,
      authDevices,
      mfaBackupCodes,
      verificationTokens,
      documentVersionBlobs,
      evidenceBlobs,
      dataControlJobBlobs,
      avatarBlobs,
      totalUsers,
      totalAuthCodes,
      totalVerificationTokens,
      totalSecurityAuditEvents,
      totalDataControlJobs,
      totalRuntimeErrors,
      fixtureAuthCodes,
      fixtureSecurityAuditEvents,
      authCodePurposeGroups,
      securityEventTypeGroups,
      recentRuntimeErrors,
    ] = await Promise.all([
      prisma.dataControlJob.count({ where: { organizationId: { in: candidateOrganizationIds } } }),
      prisma.account.count({ where: { userId: { in: candidateUserIds } } }),
      prisma.session.count({ where: { userId: { in: candidateUserIds } } }),
      prisma.userCredential.count({ where: { userId: { in: candidateUserIds } } }),
      prisma.authCode.count({ where: { OR: [{ userId: { in: candidateUserIds } }, { email: { in: candidateEmails } }] } }),
      prisma.authRateLimit.count({ where: { userId: { in: candidateUserIds } } }),
      prisma.securityAuditEvent.count({ where: { OR: [{ userId: { in: candidateUserIds } }, { email: { in: candidateEmails } }] } }),
      prisma.authDevice.count({ where: { userId: { in: candidateUserIds } } }),
      prisma.mfaBackupCode.count({ where: { userId: { in: candidateUserIds } } }),
      prisma.verificationToken.count({ where: { identifier: { in: candidateEmails } } }),
      prisma.documentVersion.count({ where: { organizationId: { in: candidateOrganizationIds } } }),
      prisma.evidence.count({ where: { organizationId: { in: candidateOrganizationIds }, blobKey: { not: null } } }),
      prisma.dataControlJob.count({ where: { organizationId: { in: candidateOrganizationIds }, blobKey: { not: null } } }),
      prisma.user.count({ where: { id: { in: candidateUserIds }, avatarBlobPathname: { not: null } } }),
      prisma.user.count(),
      prisma.authCode.count(),
      prisma.verificationToken.count(),
      prisma.securityAuditEvent.count(),
      prisma.dataControlJob.count(),
      prisma.runtimeErrorEvent.count(),
      prisma.authCode.count({
        where: {
          OR: [
            { email: { endsWith: "@qoovex.local", mode: "insensitive" } },
            { email: { endsWith: "@example.test", mode: "insensitive" } },
          ],
        },
      }),
      prisma.securityAuditEvent.count({
        where: {
          OR: [
            { email: { endsWith: "@qoovex.local", mode: "insensitive" } },
            { email: { endsWith: "@example.test", mode: "insensitive" } },
          ],
        },
      }),
      prisma.authCode.groupBy({ by: ["purpose"], _count: { _all: true }, orderBy: { purpose: "asc" } }),
      prisma.securityAuditEvent.groupBy({ by: ["type"], _count: { _all: true }, orderBy: { type: "asc" } }),
      prisma.runtimeErrorEvent.findMany({
        select: {
          id: true,
          status: true,
          source: true,
          routePath: true,
          requestMethod: true,
          errorName: true,
          occurrenceCount: true,
          lastSeenAt: true,
        },
        orderBy: [{ lastSeenAt: "desc" }, { id: "asc" }],
        take: 20,
      }),
    ]);

    const report = organizations.map((organization) => {
      const reasons = getFixtureReasons({
        code: organization.code,
        name: organization.name,
        memberEmails: organization.memberships.map((membership) => membership.user.email),
      });

      return {
        id: organization.id,
        name: organization.name,
        code: organization.code,
        createdAt: organization.createdAt.toISOString(),
        candidate: reasons.length > 0,
        reasons,
        memberships: organization.memberships.map((membership) => ({
          userId: membership.user.id,
          role: membership.role,
          revoked: membership.revokedAt !== null,
          email: maskFixtureEmail(membership.user.email),
          fixtureEmail: FIXTURE_EMAIL_PATTERN.test(membership.user.email),
        })),
        counts: organization._count,
      };
    });

    console.log(JSON.stringify({
      target,
      organizationCount: report.length,
      candidateOrganizationCount: report.filter((organization) => organization.candidate).length,
      databaseTotals: {
        users: totalUsers,
        authCodes: totalAuthCodes,
        verificationTokens: totalVerificationTokens,
        securityAuditEvents: totalSecurityAuditEvents,
        dataControlJobs: totalDataControlJobs,
        runtimeErrors: totalRuntimeErrors,
        fixtureAuthCodes,
        fixtureSecurityAuditEvents,
      },
      residualSummaries: {
        authCodesByPurpose: authCodePurposeGroups.map((group) => ({
          purpose: group.purpose,
          count: group._count._all,
        })),
        securityEventsByType: securityEventTypeGroups.map((group) => ({
          type: group.type,
          count: group._count._all,
        })),
        recentRuntimeErrors: recentRuntimeErrors.map((error) => ({
          ...error,
          lastSeenAt: error.lastSeenAt.toISOString(),
        })),
      },
      organizations: report,
      candidateCleanupTotals: {
        dataControlJobs,
        authArtifacts: {
          accounts,
          sessions,
          credentials,
          authCodes,
          authRateLimits,
          securityAuditEvents,
          authDevices,
          mfaBackupCodes,
          verificationTokens,
        },
        blobReferences: {
          documentVersions: documentVersionBlobs,
          evidence: evidenceBlobs,
          dataControlJobs: dataControlJobBlobs,
          avatars: avatarBlobs,
        },
      },
      unassignedFixtureUsers: unassignedFixtureUsers.map((user) => ({
        id: user.id,
        email: maskFixtureEmail(user.email),
        createdAt: user.createdAt.toISOString(),
      })),
    }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "[fixture-inventory] Unexpected failure.");
  process.exitCode = 1;
});
