import crypto from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

const identity = vi.hoisted(() => ({
  currentUserId: null as string | null,
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
  throw new Error("CI must run vNext JobSite creation tests against the local qoovex_ci PostgreSQL database.");
}

vi.mock("server-only", () => ({}));
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
vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  cache: <T extends (...args: never[]) => unknown>(callback: T) => callback,
}));
vi.mock("@shared/server/auth/config", () => ({
  auth: vi.fn(async () => identity.currentUserId
    ? { user: { id: identity.currentUserId, authSessionId: `test:${identity.currentUserId}` } }
    : null),
}));
vi.mock("@shared/server/dev-auth", () => ({ bootstrapDevUser: vi.fn(async () => null) }));
vi.mock("@shared/server/mfa-service", () => ({ isMfaSatisfiedForUser: vi.fn(async () => true) }));
vi.mock("@shared/server/support-access-service", () => ({
  getActiveSupportSession: vi.fn(async () => null),
  recordSupportAccess: vi.fn(),
}));
vi.mock("@shared/server/transactional-email-service", () => ({
  sendTransactionalEmail: vi.fn(async () => ({ id: "integration-test-email" })),
}));

import { db, type Prisma } from "@qoovex/db";
import { sendTransactionalEmail } from "./transactional-email-service";
import { resolveOrganizationJobSiteActor } from "./vnext-authorization-service";
import { createVNextJobSite, invitePrimaryClientIdempotent } from "./vnext-job-site-service";

const describeOnLocalCi = environment.isLocalCiDatabase ? describe : describe.skip;
const createdUserIds: string[] = [];
const createdOrganizationIds: string[] = [];

async function createOwnerFixture(label: string) {
  const suffix = crypto.randomUUID();
  const user = await db.user.create({
    data: {
      email: `${label}-${suffix}@vnext-creation-test.invalid`,
      username: `${label}-${suffix}`,
      emailVerified: new Date(),
    },
    select: { id: true },
  });
  createdUserIds.push(user.id);
  const organization = await db.organization.create({
    data: {
      name: `${label} ${suffix}`,
      code: `VNEXT-${suffix}`,
      createdById: user.id,
    },
    select: { id: true },
  });
  createdOrganizationIds.push(organization.id);
  const membership = await db.organizationMembership.create({
    data: {
      organizationId: organization.id,
      userId: user.id,
      role: "OWNER",
      scopeMode: "FULL",
    },
    select: { id: true, accessVersion: true },
  });
  return { user, organization, membership };
}

async function cleanupFixtures() {
  if (!createdOrganizationIds.length) return;
  const processes = await db.jobSiteProcess.findMany({
    where: { organizationId: { in: createdOrganizationIds } },
    select: { id: true },
  });
  const processIds = processes.map((process) => process.id);
  if (processIds.length) {
    await db.jobSiteProcessEvent.deleteMany({ where: { processId: { in: processIds } } });
    await db.jobSiteProcessStep.deleteMany({ where: { processId: { in: processIds } } });
  }
  await db.jobSiteProcess.deleteMany({ where: { organizationId: { in: createdOrganizationIds } } });
  await db.jobSiteActionReceipt.deleteMany({ where: { organizationId: { in: createdOrganizationIds } } });
  await db.jobSiteClientInvitation.deleteMany({ where: { organizationId: { in: createdOrganizationIds } } });
  await db.jobSiteTimelineEvent.deleteMany({ where: { organizationId: { in: createdOrganizationIds } } });
  await db.jobSiteParticipant.deleteMany({ where: { organizationId: { in: createdOrganizationIds } } });
  await db.jobSite.deleteMany({ where: { organizationId: { in: createdOrganizationIds } } });
  await db.organization.deleteMany({ where: { id: { in: createdOrganizationIds } } });
  await db.user.deleteMany({ where: { id: { in: createdUserIds } } });
}

afterEach(async () => {
  identity.currentUserId = null;
  vi.restoreAllMocks();
  if (!environment.isLocalCiDatabase) return;
  try {
    await cleanupFixtures();
  } finally {
    createdOrganizationIds.length = 0;
    createdUserIds.length = 0;
  }
});

describeOnLocalCi("vNext JobSite creator activation on PostgreSQL", () => {
  it("creates one active organization participant and lets the creator invite the client immediately", async () => {
    const owner = await createOwnerFixture("Creator owner");
    const outsider = await createOwnerFixture("Other organization owner");
    identity.currentUserId = owner.user.id;
    const idempotencyKey = `create-${crypto.randomUUID()}`;

    const created = await createVNextJobSite(owner.organization.id, idempotencyKey, {
      name: "Cantiere creator attivo",
      address: "Via del test 1",
    });

    expect(created).toMatchObject({ status: "DRAFT", revision: 1, replayed: false });
    if (!("id" in created) || typeof created.id !== "string") {
      throw new Error("The initial creation must return the created JobSite identifier.");
    }
    const jobSiteId = created.id;
    const stored = await db.jobSite.findUniqueOrThrow({
      where: { id: jobSiteId },
      select: {
        organizationId: true,
        historicalCreatorUserId: true,
        responsibleParticipantId: true,
        participants: {
          select: {
            id: true,
            organizationId: true,
            jobSiteId: true,
            userId: true,
            membershipId: true,
            kind: true,
            status: true,
            activatedAt: true,
            createdByUserId: true,
          },
        },
      },
    });
    expect(stored.organizationId).toBe(owner.organization.id);
    expect(stored.historicalCreatorUserId).toBe(owner.user.id);
    expect(stored.participants).toHaveLength(1);
    const participant = stored.participants[0]!;
    expect(stored.responsibleParticipantId).toBe(participant.id);
    expect(participant).toMatchObject({
      organizationId: owner.organization.id,
      jobSiteId,
      userId: owner.user.id,
      membershipId: owner.membership.id,
      kind: "ORGANIZATION_MEMBER",
      status: "ACTIVE",
      createdByUserId: owner.user.id,
    });
    expect(participant.activatedAt).toBeInstanceOf(Date);

    const actor = await resolveOrganizationJobSiteActor({
      organizationId: owner.organization.id,
      jobSiteId,
      permission: "jobSite:participants:manage",
    });
    expect(actor).toMatchObject({
      userId: owner.user.id,
      organizationId: owner.organization.id,
      jobSiteId,
      participantId: participant.id,
      membershipId: owner.membership.id,
      side: "ORGANIZATION_MEMBER",
      role: "OWNER",
    });

    const invitation = await invitePrimaryClientIdempotent({
      actor,
      idempotencyKey: `invite-${crypto.randomUUID()}`,
      rawInput: { email: "client@example.invalid", expectedRevision: 1 },
    });
    expect(invitation).toMatchObject({ replayed: false, revision: 2 });
    await expect(db.jobSiteClientInvitation.findUniqueOrThrow({
      where: { id: invitation.id },
      select: { organizationId: true, jobSiteId: true, invitedByUserId: true, status: true },
    })).resolves.toEqual({
      organizationId: owner.organization.id,
      jobSiteId,
      invitedByUserId: owner.user.id,
      status: "PENDING",
    });
    expect(sendTransactionalEmail).toHaveBeenCalledTimes(1);

    const replay = await createVNextJobSite(owner.organization.id, idempotencyKey, {
      name: "Cantiere creator attivo",
      address: "Via del test 1",
    });
    expect(replay).toMatchObject({ id: jobSiteId, revision: 1, replayed: true });
    await expect(db.jobSiteParticipant.count({
      where: { organizationId: owner.organization.id, jobSiteId },
    })).resolves.toBe(1);
    await expect(db.jobSite.count({
      where: { organizationId: owner.organization.id, name: "Cantiere creator attivo" },
    })).resolves.toBe(1);

    identity.currentUserId = outsider.user.id;
    await expect(resolveOrganizationJobSiteActor({
      organizationId: owner.organization.id,
      jobSiteId,
      permission: "jobSite:participants:manage",
    })).rejects.toMatchObject({ status: 404 });
    await expect(resolveOrganizationJobSiteActor({
      organizationId: outsider.organization.id,
      jobSiteId,
      permission: "jobSite:participants:manage",
    })).rejects.toMatchObject({ status: 404 });
  });

  it("rolls back the JobSite and participant when the creation transaction fails", async () => {
    const owner = await createOwnerFixture("Rollback owner");
    identity.currentUserId = owner.user.id;
    const idempotencyKey = `rollback-${crypto.randomUUID()}`;
    type InteractiveTransaction = <T>(
      operation: (tx: Prisma.TransactionClient) => Promise<T>,
      options?: { maxWait?: number; timeout?: number; isolationLevel?: Prisma.TransactionIsolationLevel },
    ) => Promise<T>;
    const originalTransaction = db.$transaction.bind(db) as InteractiveTransaction;
    const transactionSpy = vi.spyOn(db, "$transaction");
    const forcedFailureTransaction: InteractiveTransaction = async (operation, options) => originalTransaction(async (tx) => {
      await operation(tx);
      throw new Error("FORCED_CREATION_TRANSACTION_FAILURE");
    }, options);
    transactionSpy.mockImplementationOnce(forcedFailureTransaction as typeof db.$transaction);

    await expect(createVNextJobSite(owner.organization.id, idempotencyKey, {
      name: "Cantiere rollback atomico",
    })).rejects.toThrow("FORCED_CREATION_TRANSACTION_FAILURE");
    transactionSpy.mockRestore();

    await expect(db.jobSite.count({
      where: { organizationId: owner.organization.id, name: "Cantiere rollback atomico" },
    })).resolves.toBe(0);
    await expect(db.jobSiteParticipant.count({
      where: { organizationId: owner.organization.id },
    })).resolves.toBe(0);
    await expect(db.jobSiteActionReceipt.count({
      where: { organizationId: owner.organization.id, action: "JOB_SITE_CREATE@1", idempotencyKey },
    })).resolves.toBe(0);
  });
});
