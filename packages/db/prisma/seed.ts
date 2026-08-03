import "dotenv/config";

import { createHash } from "node:crypto";

import { prisma } from "../lib/prisma";
import { assertDatabaseTargetForCommand } from "../src/database-target-guard";

const LOCAL_DATABASE_PORT = 51225;
const USER_ID = "dev_qoovex_local_user";
const ORGANIZATION_ID = "local_demo_organization";

function fingerprint(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function assertLocalSeedTarget() {
  assertDatabaseTargetForCommand("local vNext fixture seed");
  if (process.env.QOOVEX_DATABASE_ENVIRONMENT?.trim() !== "local") throw new Error("[seed] QOOVEX_DATABASE_ENVIRONMENT must be local.");
  const connection = process.env.DATABASE_URL?.trim() || process.env.DATABASE_PRISMA_DATABASE_URL?.trim() || process.env.DATABASE_POSTGRES_URL?.trim();
  if (!connection || Number(new URL(connection).port) !== LOCAL_DATABASE_PORT) throw new Error(`[seed] Expected local database port ${LOCAL_DATABASE_PORT}.`);
}

async function main() {
  assertLocalSeedTarget();
  await prisma.$transaction(async (tx) => {
    const previousOrganizationIds = (
      await tx.organization.findMany({
        where: { OR: [{ id: ORGANIZATION_ID }, { code: { in: ["QOOVEX-LOCAL-FOUNDATION", "QOOVEX-LOCAL-VNEXT"] } }] },
        select: { id: true },
      })
    ).map(({ id }) => id);
    if (previousOrganizationIds.length > 0) {
      const previousJobSiteIds = (
        await tx.jobSite.findMany({
          where: { organizationId: { in: previousOrganizationIds } },
          select: { id: true },
        })
      ).map(({ id }) => id);
      if (previousJobSiteIds.length > 0) {
        await tx.jobSite.updateMany({
          where: { id: { in: previousJobSiteIds } },
          data: { responsibleParticipantId: null },
        });
        await tx.jobSiteTimelineEvent.deleteMany({ where: { jobSiteId: { in: previousJobSiteIds } } });
        await tx.jobSiteWorkerAssignment.deleteMany({ where: { jobSiteId: { in: previousJobSiteIds } } });
        await tx.jobSiteParticipant.deleteMany({ where: { jobSiteId: { in: previousJobSiteIds } } });
      }
      await tx.jobSite.deleteMany({ where: { organizationId: { in: previousOrganizationIds } } });
      await tx.notification.deleteMany({ where: { organizationId: { in: previousOrganizationIds }, dedupeKey: "vnext-ready" } });
      await tx.document.deleteMany({ where: { organizationId: { in: previousOrganizationIds }, title: "File foundation senza versione" } });
      await tx.evidence.deleteMany({ where: { organizationId: { in: previousOrganizationIds }, title: "Prova foundation" } });
      await tx.worker.deleteMany({ where: { organizationId: { in: previousOrganizationIds }, displayName: "Operatore Demo" } });
    }
    await tx.user.upsert({ where: { id: USER_ID }, update: { email: "owner.local@qoovex.test", username: "owner-local", name: "Owner Locale", firstName: "Owner", lastName: "Locale", platformRole: "USER" }, create: { id: USER_ID, email: "owner.local@qoovex.test", username: "owner-local", name: "Owner Locale", firstName: "Owner", lastName: "Locale", platformRole: "USER", emailVerified: new Date() } });
    const organization = await tx.organization.upsert({ where: { id: ORGANIZATION_ID }, update: { name: "Qoovex vNext Locale", code: "QOOVEX-LOCAL-VNEXT" }, create: { id: ORGANIZATION_ID, name: "Qoovex vNext Locale", code: "QOOVEX-LOCAL-VNEXT" } });
    await tx.organizationProfile.upsert({ where: { organizationId: organization.id }, update: { legalName: "Qoovex vNext Locale" }, create: { organizationId: organization.id, legalName: "Qoovex vNext Locale" } });
    const membership = await tx.organizationMembership.upsert({ where: { organizationId_userId: { organizationId: organization.id, userId: USER_ID } }, update: { role: "OWNER", preset: null, scopeMode: "FULL", permissionKeys: [], revokedAt: null }, create: { organizationId: organization.id, userId: USER_ID, role: "OWNER", preset: null, scopeMode: "FULL", permissionKeys: [] } });
    const worker = await tx.worker.create({ data: { organizationId: organization.id, displayName: "Operatore Demo", roleLabel: "Ruolo operativo", notes: "Fixture locale foundation." } });
    const jobSite = await tx.jobSite.create({ data: { organizationId: organization.id, name: "Ristrutturazione dimostrativa", address: "Via Esempio 1", description: "Fixture locale vNext in stato DRAFT.", notes: "Nessun cliente o accordo viene inventato dal seed.", status: "DRAFT", revision: 1, timelineSequence: 1, historicalCreatorUserId: USER_ID } });
    const participant = await tx.jobSiteParticipant.create({ data: { organizationId: organization.id, jobSiteId: jobSite.id, userId: USER_ID, membershipId: membership.id, kind: "ORGANIZATION_MEMBER", status: "ACTIVE", publicRoleLabel: "Responsabile del cantiere", activeKey: `${jobSite.id}:${USER_ID}:ORGANIZATION_MEMBER`, userSideKey: `${jobSite.id}:${USER_ID}`, activatedAt: new Date(), createdByUserId: USER_ID } });
    await tx.jobSite.update({ where: { id: jobSite.id }, data: { responsibleParticipantId: participant.id } });
    const timelinePayload = { schemaVersion: 1, name: jobSite.name };
    await tx.jobSiteTimelineEvent.create({ data: { organizationId: organization.id, jobSiteId: jobSite.id, sequence: 1, type: "JOB_SITE_CREATED", audience: "INTERNAL", disclosure: "GENERAL", actorKind: "ORGANIZATION_MEMBER", actorUserId: USER_ID, actorParticipantId: participant.id, title: "Cantiere creato", payload: timelinePayload, fingerprint: fingerprint(timelinePayload) } });
    await tx.jobSiteWorkerAssignment.create({ data: { organizationId: organization.id, jobSiteId: jobSite.id, workerId: worker.id, assignedById: USER_ID, operationalRoleLabel: "Operatore" } });
    await tx.document.create({ data: { organizationId: organization.id, ownerType: "ORGANIZATION", title: "File foundation senza versione", notes: "Nessun Blob viene creato dal seed." } });
    await tx.evidence.create({ data: { organizationId: organization.id, type: "NOTE", title: "Prova foundation", description: "Nota generica dimostrativa.", createdById: USER_ID } });
    await tx.notification.create({ data: { organizationId: organization.id, userId: USER_ID, type: "SYSTEM", severity: "INFO", title: "Qoovex vNext disponibile", message: "La fixture locale contiene soltanto dati sintetici.", sourceType: "SYSTEM", dedupeKey: "vnext-ready" } });
  });
  console.log("[seed] Local vNext fixture created without client simulation or Blob writes.");
}

main().finally(async () => prisma.$disconnect());
