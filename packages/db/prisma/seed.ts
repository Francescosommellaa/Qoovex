import "dotenv/config";

import { prisma } from "../lib/prisma";
import { assertDatabaseTargetForCommand } from "../src/database-target-guard";

const LOCAL_DATABASE_PORT = 51225;
const USER_ID = "dev_qoovex_local_user";
const ORGANIZATION_ID = "local_demo_organization";

function assertLocalSeedTarget() {
  assertDatabaseTargetForCommand("local foundation fixture seed");
  if (process.env.QOOVEX_DATABASE_ENVIRONMENT?.trim() !== "local") throw new Error("[seed] QOOVEX_DATABASE_ENVIRONMENT must be local.");
  const connection = process.env.DATABASE_URL?.trim() || process.env.DATABASE_PRISMA_DATABASE_URL?.trim() || process.env.DATABASE_POSTGRES_URL?.trim();
  if (!connection || Number(new URL(connection).port) !== LOCAL_DATABASE_PORT) throw new Error(`[seed] Expected local database port ${LOCAL_DATABASE_PORT}.`);
}

async function main() {
  assertLocalSeedTarget();
  await prisma.$transaction(async (tx) => {
    await tx.organization.deleteMany({ where: { OR: [{ id: ORGANIZATION_ID }, { code: "QOOVEX-LOCAL-FOUNDATION" }] } });
    await tx.user.upsert({ where: { id: USER_ID }, update: { email: "owner.local@qoovex.test", username: "owner-local", name: "Owner Locale", firstName: "Owner", lastName: "Locale", platformRole: "USER" }, create: { id: USER_ID, email: "owner.local@qoovex.test", username: "owner-local", name: "Owner Locale", firstName: "Owner", lastName: "Locale", platformRole: "USER", emailVerified: new Date() } });
    const organization = await tx.organization.create({ data: { id: ORGANIZATION_ID, name: "Qoovex Foundation Locale", code: "QOOVEX-LOCAL-FOUNDATION", memberships: { create: { userId: USER_ID, role: "OWNER", preset: "CUSTOM", scopeMode: "FULL", permissionKeys: [] } }, profile: { create: { legalName: "Qoovex Foundation Locale" } } } });
    const worker = await tx.worker.create({ data: { organizationId: organization.id, displayName: "Operatore Demo", roleLabel: "Ruolo operativo", notes: "Fixture locale foundation." } });
    const jobSite = await tx.jobSite.create({ data: { organizationId: organization.id, name: "Cantiere foundation", address: "Indirizzo dimostrativo", notes: "Record minimo senza lifecycle prodotto." } });
    await tx.jobSiteWorkerAssignment.create({ data: { organizationId: organization.id, jobSiteId: jobSite.id, workerId: worker.id, assignedById: USER_ID, operationalRoleLabel: "Operatore" } });
    await tx.document.create({ data: { organizationId: organization.id, ownerType: "ORGANIZATION", title: "File foundation senza versione", notes: "Nessun Blob viene creato dal seed." } });
    await tx.evidence.create({ data: { organizationId: organization.id, type: "NOTE", title: "Prova foundation", description: "Nota generica dimostrativa.", createdById: USER_ID } });
    await tx.notification.create({ data: { organizationId: organization.id, userId: USER_ID, type: "SYSTEM", severity: "INFO", title: "Foundation disponibile", message: "Le funzionalita prodotto vNext non sono incluse in questa build.", sourceType: "SYSTEM", dedupeKey: "foundation-ready" } });
  });
  console.log("[seed] Local foundation fixture created without Blob writes.");
}

main().finally(async () => prisma.$disconnect());
