import "dotenv/config";

import { prisma } from "../lib/prisma";
import type { Prisma } from "../generated/prisma/client";
import { assertDatabaseTargetForCommand } from "../src/database-target-guard";

type LegacyRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER" | "SAFETY_CONSULTANT" | "SITE_MANAGER" | "WORKER" | "COLLABORATOR";
type LegacyPreset = "OPERATIONAL_COLLABORATOR" | "SITE_MANAGER" | "CONSULTANT" | "VIEWER" | "LIMITED_UPLOAD" | "READ_ONLY" | "OPERATIONAL_COLLABORATION" | "DOCUMENT_REVIEWER" | "CUSTOM" | null;

interface MembershipRow {
  id: string;
  organizationId: string;
  role: LegacyRole;
  preset: LegacyPreset;
  permissionKeys: string[];
}

interface InvitationRow extends MembershipRow {
  email: string;
  acceptedAt: Date | null;
  declinedAt: Date | null;
  revokedAt: Date | null;
  expiresAt: Date;
  invitedById: string;
}

const PAGE_SIZE = Math.min(500, Math.max(10, Number(process.argv.find((arg) => arg.startsWith("--page-size="))?.split("=")[1] ?? 100)));
const APPLY = process.argv.includes("--apply");
const START_AFTER = process.argv.find((arg) => arg.startsWith("--after="))?.slice("--after=".length) ?? "";

const ownerPermissions = [
  "organization:read", "organization:update", "members:read", "members:invite", "members:manage",
  "workers:read", "workers:create", "workers:update", "workers:archive",
  "jobSites:read", "jobSites:create", "jobSites:update", "jobSites:archive",
  "documents:read", "documents:file:read", "documents:upload", "documents:update", "documents:verify",
  "documents:expiry:manage", "documents:packages:add", "documents:sensitive:read", "documents:archive",
  "deadlines:read", "deadlines:manage", "calendar:read", "calendar:manage",
  "checklists:read", "checklists:manage", "checklists:complete",
  "evidence:read", "evidence:upload", "evidence:delete",
  "documentPackages:read", "documentPackages:create", "documentPackages:update", "documentPackages:review",
  "documentPackages:approve", "documentPackages:share", "documentPackages:revoke", "documentPackages:access:read",
  "processes:read", "processes:timeline:read", "processes:decide", "processes:exceptions:resolve", "processes:retry",
  "auditLog:read", "assignments:read", "assignments:manage", "settings:update",
] as const;

function targetPreset(role: LegacyRole, preset: LegacyPreset) {
  if (role === "OWNER") return null;
  if (preset === "OPERATIONAL_COLLABORATOR") return "OPERATIONAL_COLLABORATION";
  if (preset === "CONSULTANT") return "DOCUMENT_REVIEWER";
  if (preset === "VIEWER") return "READ_ONLY";
  if (preset) return preset;
  if (role === "VIEWER") return "READ_ONLY";
  if (role === "SITE_MANAGER") return "SITE_MANAGER";
  if (role === "WORKER") return "LIMITED_UPLOAD";
  if (role === "MEMBER") return "OPERATIONAL_COLLABORATION";
  return "CUSTOM";
}

function mappedPermissions(row: MembershipRow) {
  if (row.role === "OWNER") return [...ownerPermissions];
  const permissions = new Set(row.permissionKeys);
  const add = (...values: string[]) => values.forEach((value) => permissions.add(value));
  if (permissions.has("organization:read")) add("processes:read", "processes:timeline:read");
  if (permissions.has("documents:read")) add("documents:file:read");
  if (permissions.has("documents:update")) add("documents:verify", "documents:expiry:manage", "documents:packages:add");
  if (permissions.has("documentPackages:create")) add("documentPackages:update", "documentPackages:review");
  if (permissions.has("documentPackages:share")) add("documentPackages:approve", "documentPackages:revoke", "documentPackages:access:read");
  if (["ADMIN", "SAFETY_CONSULTANT"].includes(row.role)) add("processes:decide");
  if (row.role === "ADMIN") add("documents:sensitive:read", "processes:exceptions:resolve", "processes:retry");
  return [...permissions].sort();
}

function activeInvitationKey(row: InvitationRow, now: Date) {
  if (row.acceptedAt || row.declinedAt || row.revokedAt || row.expiresAt <= now) return null;
  return `${row.organizationId}:${row.email.trim().toLowerCase()}`;
}

async function audit() {
  const [ownerless, duplicateInvites, membershipGrantMismatch, invitationGrantMismatch] = await Promise.all([
    prisma.$queryRawUnsafe<Array<{ count: bigint }>>(`SELECT COUNT(*)::bigint AS count FROM "Organization" o WHERE NOT EXISTS (SELECT 1 FROM "OrganizationMembership" m WHERE m."organizationId" = o.id AND m.role::text = 'OWNER' AND m."revokedAt" IS NULL)`),
    prisma.$queryRawUnsafe<Array<{ count: bigint }>>(`SELECT COUNT(*)::bigint AS count FROM (SELECT "organizationId", lower(email) FROM "OrganizationInvitation" WHERE "acceptedAt" IS NULL AND "declinedAt" IS NULL AND "revokedAt" IS NULL AND "expiresAt" > NOW() GROUP BY "organizationId", lower(email) HAVING COUNT(*) > 1) duplicate_active`),
    prisma.$queryRawUnsafe<Array<{ count: bigint }>>(`SELECT COUNT(*)::bigint AS count FROM "OrganizationMembershipResourceGrant" g JOIN "OrganizationMembership" m ON m.id = g."membershipId" WHERE g."organizationId" <> m."organizationId"`),
    prisma.$queryRawUnsafe<Array<{ count: bigint }>>(`SELECT COUNT(*)::bigint AS count FROM "OrganizationInvitationResourceGrant" g JOIN "OrganizationInvitation" i ON i.id = g."invitationId" WHERE g."organizationId" <> i."organizationId"`),
  ]);
  const result = {
    ownerlessOrganizations: Number(ownerless[0]?.count ?? 0n),
    duplicateActiveInvitations: Number(duplicateInvites[0]?.count ?? 0n),
    crossOrganizationMembershipGrants: Number(membershipGrantMismatch[0]?.count ?? 0n),
    crossOrganizationInvitationGrants: Number(invitationGrantMismatch[0]?.count ?? 0n),
  };
  if (Object.values(result).some(Boolean)) throw new Error(`[access-backfill] Hard stop: ${JSON.stringify(result)}`);
  return result;
}

async function updateMembership(client: Prisma.TransactionClient, row: MembershipRow) {
  const preset = targetPreset(row.role, row.preset);
  const permissions = mappedPermissions(row);
  await client.$executeRawUnsafe(
    `UPDATE "OrganizationMembership" SET role = 'COLLABORATOR'::"OrganizationRole", preset = $1::"OrganizationAccessPreset", "permissionKeys" = $2::text[], "accessVersion" = GREATEST("accessVersion", 2) WHERE id = $3 AND "organizationId" = $4`,
    preset,
    permissions,
    row.id,
    row.organizationId,
  );
}

async function updateInvitation(client: Prisma.TransactionClient, row: InvitationRow, now: Date) {
  const preset = targetPreset(row.role, row.preset);
  const permissions = mappedPermissions(row);
  await client.$executeRawUnsafe(
    `UPDATE "OrganizationInvitation" SET role = 'COLLABORATOR'::"OrganizationRole", preset = $1::"OrganizationAccessPreset", "permissionKeys" = $2::text[], "activeKey" = $3, "accessUpdatedById" = COALESCE("accessUpdatedById", "invitedById"), "accessVersion" = GREATEST("accessVersion", 2) WHERE id = $4 AND "organizationId" = $5`,
    preset,
    permissions,
    activeInvitationKey(row, now),
    row.id,
    row.organizationId,
  );
}

async function run() {
  assertDatabaseTargetForCommand("access-model-backfill");
  const auditResult = await audit();
  const organizations = await prisma.organization.findMany({
    where: START_AFTER ? { id: { gt: START_AFTER } } : undefined,
    select: { id: true },
    orderBy: { id: "asc" },
  });
  let memberships = 0;
  let invitations = 0;
  let lastCheckpoint = START_AFTER || null;
  const now = new Date();

  for (let offset = 0; offset < organizations.length; offset += PAGE_SIZE) {
    const page = organizations.slice(offset, offset + PAGE_SIZE);
    for (const organization of page) {
      const [membershipRows, invitationRows] = await Promise.all([
        prisma.$queryRawUnsafe<MembershipRow[]>(`SELECT id, "organizationId", role::text AS role, preset::text AS preset, "permissionKeys" FROM "OrganizationMembership" WHERE "organizationId" = $1 ORDER BY id`, organization.id),
        prisma.$queryRawUnsafe<InvitationRow[]>(`SELECT id, "organizationId", email, role::text AS role, preset::text AS preset, "permissionKeys", "acceptedAt", "declinedAt", "revokedAt", "expiresAt", "invitedById" FROM "OrganizationInvitation" WHERE "organizationId" = $1 ORDER BY id`, organization.id),
      ]);
      memberships += membershipRows.length;
      invitations += invitationRows.length;
      if (APPLY) {
        await prisma.$transaction(async (tx) => {
          for (const row of membershipRows) {
            if (row.role !== "OWNER") await updateMembership(tx, row);
            else await tx.$executeRawUnsafe(`UPDATE "OrganizationMembership" SET preset = NULL, "permissionKeys" = $1::text[] WHERE id = $2 AND "organizationId" = $3`, [...ownerPermissions], row.id, row.organizationId);
          }
          for (const row of invitationRows) await updateInvitation(tx, row, now);
        });
      }
      lastCheckpoint = organization.id;
    }
    console.log(JSON.stringify({ mode: APPLY ? "apply" : "dry-run", processedOrganizations: Math.min(offset + page.length, organizations.length), checkpoint: lastCheckpoint }));
  }

  if (APPLY) {
    await prisma.$executeRawUnsafe(`UPDATE "User" SET "platformRole" = 'PLATFORM_ADMIN'::"PlatformRole" WHERE "platformRole"::text = 'SUPER_ADMIN'`);
  }
  console.log(JSON.stringify({ mode: APPLY ? "apply" : "dry-run", organizations: organizations.length, memberships, invitations, checkpoint: lastCheckpoint, audit: auditResult }, null, 2));
}

run()
  .finally(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "[access-backfill] Unexpected failure.");
    process.exit(1);
  });
