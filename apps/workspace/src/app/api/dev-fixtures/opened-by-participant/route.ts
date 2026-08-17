import { db } from "@qoovex/db";
import { AccessError, asAccessResponse } from "@shared/server/access-errors";
import { requireIdentity } from "@shared/server/access-context-service";
import { hashPassword } from "@shared/server/auth-password";
import { isCurrentDevAuthIdentity } from "@shared/server/dev-auth";
import { isAuthenticatedFixtureEnvironment } from "@shared/server/e2e-fixture-guard";

function fixtureRunId(value: unknown) {
  if (typeof value !== "string" || !/^\d{8,20}$/.test(value)) throw new AccessError("Fixture non valida.", 409);
  return value;
}

async function requireFixtureAccess() {
  if (!isAuthenticatedFixtureEnvironment()) throw new AccessError("Risorsa non disponibile.", 404);
  const identity = await requireIdentity();
  if (!(await isCurrentDevAuthIdentity(identity.id))) throw new AccessError("Risorsa non disponibile.", 404);
}

function fixtureIdentity(runId: string, key: "org-a" | "client-a" | "org-b" | "client-b") {
  return {
    email: `opened-${key}-${runId}@example.test`,
    username: `opened_${key.replace("-", "_")}_${runId}`,
  };
}

export async function POST(request: Request) {
  try {
    await requireFixtureAccess();
    const runId = fixtureRunId((await request.json() as { runId?: unknown }).runId);
    const password = `Qoovex-E2E-${runId}!`;
    const passwordHash = await hashPassword(password);
    const now = new Date();
    const identities = {
      organizationA: fixtureIdentity(runId, "org-a"),
      clientA: fixtureIdentity(runId, "client-a"),
      organizationB: fixtureIdentity(runId, "org-b"),
      clientB: fixtureIdentity(runId, "client-b"),
    };

    const fixture = await db.$transaction(async (tx) => {
      const organizationAUser = await tx.user.create({ data: { ...identities.organizationA, firstName: "Azienda", lastName: "Fixture A", emailVerified: now, accountRole: "BUSINESS", credential: { create: { passwordHash } } }, select: { id: true, email: true } });
      const clientAUser = await tx.user.create({ data: { ...identities.clientA, firstName: "Cliente", lastName: "Fixture A", emailVerified: now, accountRole: "CLIENT", credential: { create: { passwordHash } } }, select: { id: true, email: true } });
      const organizationBUser = await tx.user.create({ data: { ...identities.organizationB, firstName: "Azienda", lastName: "Fixture B", emailVerified: now, accountRole: "BUSINESS", credential: { create: { passwordHash } } }, select: { id: true, email: true } });
      const clientBUser = await tx.user.create({ data: { ...identities.clientB, firstName: "Cliente", lastName: "Fixture B", emailVerified: now, accountRole: "CLIENT", credential: { create: { passwordHash } } }, select: { id: true, email: true } });

      const organizationA = await tx.organization.create({ data: { name: `Organization E2E A ${runId}`, code: `E2EA-${runId}`, createdById: organizationAUser.id }, select: { id: true } });
      const organizationB = await tx.organization.create({ data: { name: `Organization E2E B ${runId}`, code: `E2EB-${runId}`, createdById: organizationBUser.id }, select: { id: true } });
      const membershipA = await tx.organizationMembership.create({ data: { organizationId: organizationA.id, userId: organizationAUser.id, role: "OWNER", scopeMode: "FULL" }, select: { id: true } });
      const membershipB = await tx.organizationMembership.create({ data: { organizationId: organizationB.id, userId: organizationBUser.id, role: "OWNER", scopeMode: "FULL" }, select: { id: true } });
      const jobSiteA = await tx.jobSite.create({ data: { organizationId: organizationA.id, name: `Cantiere E2E A ${runId}`, status: "ACTIVE", revision: 1 }, select: { id: true } });
      const jobSiteB = await tx.jobSite.create({ data: { organizationId: organizationB.id, name: `Cantiere E2E B ${runId}`, status: "ACTIVE", revision: 1 }, select: { id: true } });
      const participantA = await tx.jobSiteParticipant.create({ data: { organizationId: organizationA.id, jobSiteId: jobSiteA.id, userId: organizationAUser.id, membershipId: membershipA.id, kind: "ORGANIZATION_MEMBER", status: "ACTIVE", publicRoleLabel: "Responsabile lavori", activeKey: `${jobSiteA.id}:${organizationAUser.id}:ORGANIZATION_MEMBER`, userSideKey: `${jobSiteA.id}:${organizationAUser.id}`, activatedAt: now, createdByUserId: organizationAUser.id }, select: { id: true } });
      const clientParticipantA = await tx.jobSiteParticipant.create({ data: { organizationId: organizationA.id, jobSiteId: jobSiteA.id, userId: clientAUser.id, kind: "CLIENT", status: "ACTIVE", activeKey: `${jobSiteA.id}:${clientAUser.id}:CLIENT`, primaryClientKey: `${jobSiteA.id}:PRIMARY_CLIENT`, userSideKey: `${jobSiteA.id}:${clientAUser.id}`, activatedAt: now, createdByUserId: organizationAUser.id }, select: { id: true } });
      const participantB = await tx.jobSiteParticipant.create({ data: { organizationId: organizationB.id, jobSiteId: jobSiteB.id, userId: organizationBUser.id, membershipId: membershipB.id, kind: "ORGANIZATION_MEMBER", status: "ACTIVE", publicRoleLabel: "Responsabile lavori", activeKey: `${jobSiteB.id}:${organizationBUser.id}:ORGANIZATION_MEMBER`, userSideKey: `${jobSiteB.id}:${organizationBUser.id}`, activatedAt: now, createdByUserId: organizationBUser.id }, select: { id: true } });
      const clientParticipantB = await tx.jobSiteParticipant.create({ data: { organizationId: organizationB.id, jobSiteId: jobSiteB.id, userId: clientBUser.id, kind: "CLIENT", status: "ACTIVE", activeKey: `${jobSiteB.id}:${clientBUser.id}:CLIENT`, primaryClientKey: `${jobSiteB.id}:PRIMARY_CLIENT`, userSideKey: `${jobSiteB.id}:${clientBUser.id}`, activatedAt: now, createdByUserId: organizationBUser.id }, select: { id: true } });
      const clientMemberships = await tx.organizationMembership.count({
        where: { userId: { in: [clientAUser.id, clientBUser.id] } },
      });
      if (clientMemberships !== 0) throw new AccessError("Fixture non valida.", 409);
      return { organizationA, organizationB, organizationAUser, clientAUser, organizationBUser, clientBUser, jobSiteA, jobSiteB, participantA, clientParticipantA, participantB, clientParticipantB, verification: { clientMemberships } };
    });

    return Response.json({ runId, password, ...fixture }, { status: 201 });
  } catch (error) {
    return asAccessResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireFixtureAccess();
    const body = await request.json() as { runId?: unknown; organizationIds?: unknown; jobSiteIds?: unknown; userIds?: unknown };
    const runId = fixtureRunId(body.runId);
    const organizationIds = Array.isArray(body.organizationIds) ? body.organizationIds.filter((value): value is string => typeof value === "string") : [];
    const jobSiteIds = Array.isArray(body.jobSiteIds) ? body.jobSiteIds.filter((value): value is string => typeof value === "string") : [];
    const userIds = Array.isArray(body.userIds) ? body.userIds.filter((value): value is string => typeof value === "string") : [];
    if (organizationIds.length !== 2 || jobSiteIds.length !== 2 || userIds.length !== 4) throw new AccessError("Fixture non valida.", 409);

    const [organizations, jobSites, users] = await Promise.all([
      db.organization.findMany({ where: { id: { in: organizationIds }, code: { in: [`E2EA-${runId}`, `E2EB-${runId}`] } }, select: { id: true } }),
      db.jobSite.findMany({ where: { id: { in: jobSiteIds }, organizationId: { in: organizationIds } }, select: { id: true } }),
      db.user.findMany({ where: { id: { in: userIds }, email: { endsWith: `-${runId}@example.test` }, username: { startsWith: "opened_" } }, select: { id: true, email: true } }),
    ]);
    if (organizations.length !== 2 || jobSites.length !== 2 || users.length !== 4) throw new AccessError("Fixture non valida.", 409);
    const fixtureEmails = users.map((user) => user.email);

    await db.$transaction([
      db.notificationDelivery.deleteMany({ where: { organizationId: { in: organizationIds }, userId: { in: userIds } } }),
      db.notification.deleteMany({ where: { organizationId: { in: organizationIds }, userId: { in: userIds } } }),
      db.jobSiteActionReceipt.deleteMany({ where: { jobSiteId: { in: jobSiteIds } } }),
      db.jobSiteRequest.deleteMany({ where: { jobSiteId: { in: jobSiteIds } } }),
      db.jobSiteTimelineEvent.deleteMany({ where: { jobSiteId: { in: jobSiteIds } } }),
      db.jobSiteParticipant.deleteMany({ where: { jobSiteId: { in: jobSiteIds } } }),
      db.jobSite.deleteMany({ where: { id: { in: jobSiteIds } } }),
      db.organizationMembership.deleteMany({ where: { organizationId: { in: organizationIds }, userId: { in: userIds } } }),
      db.productAuditEvent.deleteMany({ where: { organizationId: { in: organizationIds } } }),
      db.organization.deleteMany({ where: { id: { in: organizationIds } } }),
      db.securityAuditEvent.deleteMany({ where: { OR: [{ userId: { in: userIds } }, { email: { in: fixtureEmails } }] } }),
      db.user.deleteMany({ where: { id: { in: userIds }, email: { in: fixtureEmails } } }),
    ]);
    const remaining = await db.user.count({ where: { id: { in: userIds } } });
    return Response.json({ deleted: true, remaining });
  } catch (error) {
    return asAccessResponse(error);
  }
}
