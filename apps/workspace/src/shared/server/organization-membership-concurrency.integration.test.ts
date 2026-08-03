import crypto from "crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

const identity = vi.hoisted(() => ({
  current: null as null | { id: string; email: string; emailVerified: Date | null },
}));
const environment = vi.hoisted(() => {
  const value = process.env.DATABASE_URL?.trim();
  if (!value) return { isLocalCiDatabase: false };
  try {
    const url = new URL(value);
    const isAttestedLocalE2e = process.env.QOOVEX_E2E_MODE === "1"
      && process.env.QOOVEX_E2E_DATABASE_TARGET === value
      && process.env.QOOVEX_E2E_RUN_ATTESTATION === "I_ACKNOWLEDGE_FIXTURE_SCOPED_CLEANUP";
    return {
      isLocalCiDatabase: new Set(["localhost", "127.0.0.1", "::1"]).has(url.hostname)
        && (url.pathname.replace(/^\//, "") === "qoovex_ci" || isAttestedLocalE2e),
    };
  } catch {
    return { isLocalCiDatabase: false };
  }
});

if (process.env.CI && !environment.isLocalCiDatabase) {
  throw new Error("CI must run membership concurrency tests against the local qoovex_ci PostgreSQL database.");
}

vi.mock("server-only", () => ({}));
vi.mock("@shared/server/access-errors", () => ({
  AccessError: class AccessError extends Error {
    constructor(
      message: string,
      public readonly status: 400 | 401 | 403 | 404 | 409 | 410 | 429,
      public readonly code?: string,
    ) {
      super(message);
      this.name = "AccessError";
    }
  },
}));
vi.mock("@qoovex/db", async (importOriginal) => {
  if (environment.isLocalCiDatabase) return importOriginal();
  class PrismaClientKnownRequestError extends Error {
    constructor(public readonly code: string) {
      super(code);
    }
  }
  return {
    db: {},
    Prisma: {
      PrismaClientKnownRequestError,
      TransactionIsolationLevel: { Serializable: "Serializable" },
    },
  };
});
vi.mock("@shared/server/access-context-service", () => ({
  requireIdentity: vi.fn(async () => {
    if (!identity.current) throw new Error("Test identity not configured.");
    return identity.current;
  }),
  getContextOrganizationId: vi.fn(),
  getWorkspaceAccessContext: vi.fn(),
  requirePermission: vi.fn(),
}));
vi.mock("@shared/server/authorization-policy", () => ({ canInviteRole: vi.fn(), canRevokeRole: vi.fn() }));
vi.mock("@shared/server/transactional-email-service", () => ({ sendTransactionalEmail: vi.fn() }));
vi.mock("@shared/server/support-access-service", () => ({ recordSupportAccess: vi.fn() }));

import { db } from "@qoovex/db";
import { createOrganization } from "./organization-access-service";
import { acceptInvitation } from "./organization-invitation-service";

function invitationTokenHash(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

const describeOnLocalCi = environment.isLocalCiDatabase ? describe : describe.skip;
const createdUserIds: string[] = [];
const createdOrganizationIds: string[] = [];

async function createUser(prefix: string) {
  const suffix = crypto.randomUUID();
  const user = await db.user.create({
    data: {
      email: `${prefix}-${suffix}@membership-test.invalid`,
      username: `${prefix}-${suffix}`,
      emailVerified: new Date(),
    },
    select: { id: true, email: true, emailVerified: true },
  });
  createdUserIds.push(user.id);
  return user;
}

async function createOrganizationFixture(name: string, createdById: string) {
  const organization = await db.organization.create({
    data: {
      name,
      code: `QCI-${crypto.randomUUID()}`,
      createdById,
    },
    select: { id: true },
  });
  createdOrganizationIds.push(organization.id);
  return organization;
}

async function createInvitationFixture(input: {
  organizationId: string;
  email: string;
  invitedById: string;
  token: string;
}) {
  return db.organizationInvitation.create({
    data: {
      organizationId: input.organizationId,
      email: input.email,
      role: "COLLABORATOR",
      tokenHash: invitationTokenHash(input.token),
      invitedById: input.invitedById,
      expiresAt: new Date(Date.now() + 60_000),
    },
    select: { id: true, organizationId: true },
  });
}

afterEach(async () => {
  identity.current = null;
  if (!environment.isLocalCiDatabase) return;
  await db.organization.deleteMany({
    where: {
      OR: [
        { id: { in: createdOrganizationIds } },
        { createdById: { in: createdUserIds } },
      ],
    },
  });
  await db.user.deleteMany({ where: { id: { in: createdUserIds } } });
  createdOrganizationIds.length = 0;
  createdUserIds.length = 0;
});

describeOnLocalCi("multi-organization membership concurrency on PostgreSQL", () => {
  it("preserves both organization creation and invitation acceptance", async () => {
    const inviter = await createUser("inviter");
    const user = await createUser("subject");
    const invitedOrganization = await createOrganizationFixture("Invited organization", inviter.id);
    const token = crypto.randomBytes(24).toString("base64url");
    const invitation = await createInvitationFixture({
      organizationId: invitedOrganization.id,
      email: user.email,
      invitedById: inviter.id,
      token,
    });
    identity.current = user;

    const [creation, acceptance] = await Promise.allSettled([
      createOrganization("Concurrent organization"),
      acceptInvitation(token),
    ]);

    expect(creation.status).toBe("fulfilled");
    expect(acceptance.status).toBe("fulfilled");
    const memberships = await db.organizationMembership.findMany({
      where: { userId: user.id },
      select: { organizationId: true, revokedAt: true },
    });
    expect(memberships).toHaveLength(2);
    expect(memberships.every((membership) => membership.revokedAt === null)).toBe(true);

    const storedInvitation = await db.organizationInvitation.findUnique({
      where: { id: invitation.id },
      select: { acceptedAt: true },
    });
    const createdOrganizations = await db.organization.findMany({
      where: { createdById: user.id, name: "Concurrent organization" },
      select: { id: true },
    });
    expect(storedInvitation?.acceptedAt).toBeInstanceOf(Date);
    expect(createdOrganizations).toHaveLength(1);
    expect(memberships.map((membership) => membership.organizationId).sort()).toEqual([createdOrganizations[0]!.id, invitedOrganization.id].sort());
  });

  it("accepts invitations from two distinct organizations without reusing a revoked row", async () => {
    const inviter = await createUser("inviter");
    const user = await createUser("subject");
    const previousOrganization = await createOrganizationFixture("Previous organization", inviter.id);
    const firstOrganization = await createOrganizationFixture("First organization", inviter.id);
    const secondOrganization = await createOrganizationFixture("Second organization", inviter.id);
    await db.organizationMembership.create({
      data: {
        organizationId: previousOrganization.id,
        userId: user.id,
        role: "COLLABORATOR",
        preset: "CUSTOM",
        revokedAt: new Date(),
      },
    });
    const firstToken = crypto.randomBytes(24).toString("base64url");
    const secondToken = crypto.randomBytes(24).toString("base64url");
    const firstInvitation = await createInvitationFixture({
      organizationId: firstOrganization.id,
      email: user.email,
      invitedById: inviter.id,
      token: firstToken,
    });
    const secondInvitation = await createInvitationFixture({
      organizationId: secondOrganization.id,
      email: user.email,
      invitedById: inviter.id,
      token: secondToken,
    });
    identity.current = user;

    const results = await Promise.allSettled([
      acceptInvitation(firstToken),
      acceptInvitation(secondToken),
    ]);

    expect(results.every((result) => result.status === "fulfilled")).toBe(true);
    const memberships = await db.organizationMembership.findMany({
      where: { userId: user.id },
      select: { organizationId: true, revokedAt: true },
    });
    expect(memberships.filter((membership) => membership.revokedAt === null)).toHaveLength(2);
    expect(memberships.find((membership) => membership.organizationId === previousOrganization.id)?.revokedAt).toBeInstanceOf(Date);
    const invitations = await db.organizationInvitation.findMany({
      where: { id: { in: [firstInvitation.id, secondInvitation.id] } },
      select: { organizationId: true, acceptedAt: true },
    });
    const accepted = invitations.filter((invitation) => invitation.acceptedAt !== null);
    expect(accepted).toHaveLength(2);
    expect(await db.organizationMembership.count({ where: { userId: user.id } })).toBe(3);
    await expect(db.user.findUniqueOrThrow({ where: { id: user.id }, select: { authVersion: true } }))
      .resolves.toEqual({ authVersion: 3 });
  });
});
