import crypto from "node:crypto";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";

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
  throw new Error("CI must run vNext client agreement tests against the local qoovex_ci PostgreSQL database.");
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
import { appendTimeline, listTimeline } from "./vnext-collaboration-service";
import { downloadJobSiteAttachment, resolveClientAttachmentActor } from "./vnext-attachment-service";
import { executeVNextAction } from "./vnext-action-service";
import {
  resolveClientInitialAgreementActor,
  resolveClientJobSiteActor,
  resolveOrganizationJobSiteActor,
  revalidateActor,
} from "./vnext-authorization-service";
import {
  acceptPrimaryClientInvitation,
  createVNextJobSite,
  getClientJobSiteDetail,
  invitePrimaryClientIdempotent,
  publishInitialAgreementIdempotent,
  revokePrimaryClientInvitation,
} from "./vnext-job-site-service";
import { sendTransactionalEmail } from "./transactional-email-service";

const describeOnLocalCi = environment.isLocalCiDatabase ? describe : describe.skip;
const createdUserIds: string[] = [];
const createdOrganizationIds: string[] = [];

type OwnerFixture = Awaited<ReturnType<typeof createOwnerFixture>>;
type ClientFixture = Awaited<ReturnType<typeof createClientFixture>>;

async function createUser(label: string, domain: string) {
  const suffix = crypto.randomUUID();
  const localPart = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const user = await db.user.create({
    data: {
      email: `${localPart}-${suffix}@${domain}`,
      username: `${localPart}-${suffix}`,
      emailVerified: new Date(),
    },
    select: { id: true, email: true },
  });
  createdUserIds.push(user.id);
  return user;
}

async function createOwnerFixture(label: string) {
  const user = await createUser(label, "vnext-client-owner-test.invalid");
  const suffix = crypto.randomUUID();
  const organization = await db.organization.create({
    data: { name: `${label} ${suffix}`, code: `CLIENT-LIFECYCLE-${suffix}`, createdById: user.id },
    select: { id: true },
  });
  createdOrganizationIds.push(organization.id);
  const membership = await db.organizationMembership.create({
    data: { organizationId: organization.id, userId: user.id, role: "OWNER", scopeMode: "FULL" },
    select: { id: true },
  });
  return { user, organization, membership };
}

async function createClientFixture(label: string) {
  return { user: await createUser(label, "vnext-client-lifecycle-test.invalid") };
}

function createdJobSiteId(result: Awaited<ReturnType<typeof createVNextJobSite>>) {
  if (!("id" in result) || typeof result.id !== "string") throw new Error("JobSite creation did not return an identifier.");
  return result.id;
}

function invitationTokenFromLastEmail() {
  const call = vi.mocked(sendTransactionalEmail).mock.calls.at(-1)?.[0];
  if (!call || call.template.kind !== "client-invitation") throw new Error("Client invitation email was not captured.");
  const token = new URL(call.template.acceptUrl).pathname.split("/").filter(Boolean).at(-1);
  if (!token) throw new Error("Client invitation token was not present in the captured URL.");
  return token;
}

async function createAndInvite(owner: OwnerFixture, client: ClientFixture, name: string) {
  identity.currentUserId = owner.user.id;
  const created = await createVNextJobSite(owner.organization.id, `create-${crypto.randomUUID()}`, { name });
  const jobSiteId = createdJobSiteId(created);
  const actor = await resolveOrganizationJobSiteActor({
    organizationId: owner.organization.id,
    jobSiteId,
    permission: "jobSite:participants:manage",
  });
  const invitation = await invitePrimaryClientIdempotent({
    actor,
    idempotencyKey: `invite-${crypto.randomUUID()}`,
    rawInput: { email: client.user.email, expectedRevision: 1 },
  });
  return { jobSiteId, invitationId: invitation.id, token: invitationTokenFromLastEmail() };
}

async function publishAgreement(owner: OwnerFixture, jobSiteId: string) {
  identity.currentUserId = owner.user.id;
  const actor = await resolveOrganizationJobSiteActor({
    organizationId: owner.organization.id,
    jobSiteId,
    permission: "jobSite:update",
  });
  const [jobSite, participants] = await Promise.all([
    db.jobSite.findUniqueOrThrow({ where: { id: jobSiteId }, select: { revision: true, name: true, address: true, description: true, estimatedCompletionAt: true } }),
    db.jobSiteParticipant.findMany({ where: { jobSiteId }, select: { id: true, publicRoleLabel: true }, orderBy: { createdAt: "asc" } }),
  ]);
  const published = await publishInitialAgreementIdempotent({
    actor,
    idempotencyKey: `agreement-${crypto.randomUUID()}`,
    rawInput: {
      expectedRevision: jobSite.revision,
      payload: {
        schemaVersion: 1,
        name: jobSite.name,
        address: jobSite.address,
        description: jobSite.description,
        participantSummary: participants.map((participant) => ({ participantId: participant.id, publicRoleLabel: participant.publicRoleLabel })),
        initialEstimateMinor: null,
        estimatedCompletionAt: jobSite.estimatedCompletionAt?.toISOString() ?? null,
        sharedCommercialNotes: null,
      },
    },
  });
  return {
    agreementVersionId: published.result.agreementVersionId,
    revision: published.revision,
  };
}

async function cleanupFixtures() {
  if (!createdOrganizationIds.length) return;
  const processes = await db.jobSiteProcess.findMany({ where: { organizationId: { in: createdOrganizationIds } }, select: { id: true } });
  const processIds = processes.map((process) => process.id);
  if (processIds.length) {
    await db.jobSiteProcessEvent.deleteMany({ where: { processId: { in: processIds } } });
    await db.jobSiteProcessStep.deleteMany({ where: { processId: { in: processIds } } });
  }
  await db.jobSiteProcess.deleteMany({ where: { organizationId: { in: createdOrganizationIds } } });
  await db.notificationDelivery.deleteMany({ where: { organizationId: { in: createdOrganizationIds } } });
  await db.notificationPreference.deleteMany({ where: { organizationId: { in: createdOrganizationIds } } });
  await db.notification.deleteMany({ where: { organizationId: { in: createdOrganizationIds } } });
  await db.jobSiteActionReceipt.deleteMany({ where: { organizationId: { in: createdOrganizationIds } } });
  await db.jobSiteClientInvitation.deleteMany({ where: { organizationId: { in: createdOrganizationIds } } });
  const agreements = await db.jobSiteInitialAgreement.findMany({ where: { organizationId: { in: createdOrganizationIds } }, select: { id: true } });
  const agreementIds = agreements.map((agreement) => agreement.id);
  if (agreementIds.length) {
    await db.jobSiteInitialAgreementConsent.deleteMany({ where: { version: { agreementId: { in: agreementIds } } } });
    await db.jobSiteInitialAgreement.updateMany({ where: { id: { in: agreementIds } }, data: { currentVersionId: null } });
    await db.jobSiteInitialAgreementVersion.deleteMany({ where: { agreementId: { in: agreementIds } } });
    await db.jobSiteInitialAgreement.deleteMany({ where: { id: { in: agreementIds } } });
  }
  await db.jobSiteTimelineArtifactReference.deleteMany({ where: { event: { organizationId: { in: createdOrganizationIds } } } });
  await db.jobSiteTimelineEventAttachment.deleteMany({ where: { event: { organizationId: { in: createdOrganizationIds } } } });
  await db.jobSiteAttachmentPublication.deleteMany({ where: { attachment: { organizationId: { in: createdOrganizationIds } } } });
  await db.jobSiteTimelineEvent.deleteMany({ where: { organizationId: { in: createdOrganizationIds } } });
  await db.jobSiteAttachment.deleteMany({ where: { organizationId: { in: createdOrganizationIds } } });
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

afterAll(async () => {
  if (!environment.isLocalCiDatabase) return;
  const [organizationCount, ownerCount, clientCount] = await Promise.all([
    db.organization.count({ where: { code: { startsWith: "CLIENT-LIFECYCLE-" } } }),
    db.user.count({ where: { email: { endsWith: "@vnext-client-owner-test.invalid" } } }),
    db.user.count({ where: { email: { endsWith: "@vnext-client-lifecycle-test.invalid" } } }),
  ]);
  expect({ organizationCount, ownerCount, clientCount }).toEqual({ organizationCount: 0, ownerCount: 0, clientCount: 0 });
});

describeOnLocalCi("vNext pending client initial agreement lifecycle on PostgreSQL", () => {
  it("keeps acceptance pending, limits pre-activation access and activates only the exact accepted agreement", async () => {
    const ownerA = await createOwnerFixture("Owner A");
    const ownerB = await createOwnerFixture("Owner B");
    const clientA = await createClientFixture("Client A");
    const clientB = await createClientFixture("Client B");
    const invitationA = await createAndInvite(ownerA, clientA, "Cantiere lifecycle A");
    const invitationB = await createAndInvite(ownerB, clientB, "Cantiere lifecycle B");

    identity.currentUserId = clientB.user.id;
    await expect(acceptPrimaryClientInvitation(invitationA.token)).rejects.toMatchObject({ status: 403 });

    identity.currentUserId = clientA.user.id;
    await expect(acceptPrimaryClientInvitation(invitationA.token)).resolves.toMatchObject({ jobSiteId: invitationA.jobSiteId, status: "PENDING", activatedAt: null });
    await expect(acceptPrimaryClientInvitation(invitationA.token)).rejects.toMatchObject({ status: 410 });

    identity.currentUserId = clientB.user.id;
    await expect(acceptPrimaryClientInvitation(invitationB.token)).resolves.toMatchObject({ jobSiteId: invitationB.jobSiteId, status: "PENDING", activatedAt: null });

    const [storedInvitation, pendingParticipant] = await Promise.all([
      db.jobSiteClientInvitation.findUniqueOrThrow({ where: { id: invitationA.invitationId }, select: { status: true, acceptedAt: true, acceptedByParticipantId: true } }),
      db.jobSiteParticipant.findFirstOrThrow({ where: { jobSiteId: invitationA.jobSiteId, userId: clientA.user.id, kind: "CLIENT" }, select: { id: true, organizationId: true, jobSiteId: true, userId: true, kind: true, status: true, activeKey: true, primaryClientKey: true, activatedAt: true, accessVersion: true } }),
    ]);
    expect(storedInvitation).toMatchObject({ status: "ACCEPTED", acceptedByParticipantId: pendingParticipant.id });
    expect(storedInvitation.acceptedAt).toBeInstanceOf(Date);
    expect(pendingParticipant).toMatchObject({
      organizationId: ownerA.organization.id,
      jobSiteId: invitationA.jobSiteId,
      userId: clientA.user.id,
      kind: "CLIENT",
      status: "PENDING",
      activeKey: null,
      primaryClientKey: `${invitationA.jobSiteId}:PRIMARY_CLIENT`,
      activatedAt: null,
      accessVersion: 1,
    });
    await expect(db.jobSiteParticipant.count({ where: { jobSiteId: invitationA.jobSiteId, kind: "CLIENT" } })).resolves.toBe(1);

    const agreementA = await publishAgreement(ownerA, invitationA.jobSiteId);
    const agreementB = await publishAgreement(ownerB, invitationB.jobSiteId);
    identity.currentUserId = clientA.user.id;

    await expect(resolveClientJobSiteActor(invitationA.jobSiteId)).rejects.toMatchObject({ status: 404 });
    const pendingActor = await resolveClientInitialAgreementActor(invitationA.jobSiteId);
    expect(pendingActor).toMatchObject({
      userId: clientA.user.id,
      organizationId: ownerA.organization.id,
      jobSiteId: invitationA.jobSiteId,
      participantId: pendingParticipant.id,
      participantAccessVersion: 1,
    });
    const pendingDetail = await getClientJobSiteDetail(invitationA.jobSiteId);
    expect(pendingDetail.initialAgreement?.currentVersion?.id).toBe(agreementA.agreementVersionId);
    expect(pendingDetail.timelineEvents).toEqual([]);
    expect(pendingDetail.attachments).toEqual([]);
    expect(pendingDetail.steps).toEqual([]);
    await expect(db.jobSiteTimelineEvent.count({ where: { jobSiteId: invitationA.jobSiteId, audience: "INTERNAL" } })).resolves.toBeGreaterThan(0);

    await expect(listTimeline({ actor: pendingActor, cursor: null })).rejects.toMatchObject({ status: 403, code: "ACCESS_REVOKED" });
    await expect(appendTimeline({
      actor: pendingActor,
      idempotencyKey: `pending-timeline-${crypto.randomUUID()}`,
      body: { expectedRevision: agreementA.revision, type: "COMMENT", audience: "SHARED", disclosure: "GENERAL", payload: { schemaVersion: 1, title: "Non autorizzato", body: null }, attachmentIds: [] },
    })).rejects.toMatchObject({ status: 403, code: "ACCESS_REVOKED" });
    await expect(resolveClientAttachmentActor(invitationA.jobSiteId)).rejects.toMatchObject({ status: 404 });
    await expect(downloadJobSiteAttachment({ actor: pendingActor, attachmentId: "other-attachment" })).rejects.toMatchObject({ status: 403, code: "ACCESS_REVOKED" });
    await expect(resolveClientInitialAgreementActor(invitationB.jobSiteId)).rejects.toMatchObject({ status: 404 });
    await expect(revalidateActor({ ...pendingActor, organizationId: ownerB.organization.id })).rejects.toMatchObject({ status: 403, code: "ACCESS_REVOKED" });

    await expect(executeVNextAction({
      actor: pendingActor,
      idempotencyKey: `wrong-version-${crypto.randomUUID()}`,
      action: { action: "INITIAL_AGREEMENT_CONFIRM@1", expectedRevision: agreementA.revision, agreementVersionId: agreementB.agreementVersionId, decision: "ACCEPTED" },
    })).rejects.toMatchObject({ status: 409 });
    await expect(db.jobSiteInitialAgreementConsent.count({ where: { participantId: pendingParticipant.id } })).resolves.toBe(0);

    const confirmationKey = `confirm-${crypto.randomUUID()}`;
    const confirmation = await executeVNextAction({
      actor: pendingActor,
      idempotencyKey: confirmationKey,
      action: { action: "INITIAL_AGREEMENT_CONFIRM@1", expectedRevision: agreementA.revision, agreementVersionId: agreementA.agreementVersionId, decision: "ACCEPTED" },
    });
    expect(confirmation).toMatchObject({ replayed: false, revision: agreementA.revision + 1, result: { agreementVersionId: agreementA.agreementVersionId, decision: "ACCEPTED" } });

    const [activeParticipant, consent, agreement, activeJobSite] = await Promise.all([
      db.jobSiteParticipant.findUniqueOrThrow({ where: { id: pendingParticipant.id }, select: { status: true, activeKey: true, primaryClientKey: true, activatedAt: true, accessVersion: true } }),
      db.jobSiteInitialAgreementConsent.findUniqueOrThrow({ where: { versionId_participantId: { versionId: agreementA.agreementVersionId, participantId: pendingParticipant.id } }, select: { decision: true, fingerprint: true } }),
      db.jobSiteInitialAgreement.findUniqueOrThrow({ where: { jobSiteId: invitationA.jobSiteId }, select: { status: true, currentVersionId: true, confirmedAt: true, currentVersion: { select: { fingerprint: true } } } }),
      db.jobSite.findUniqueOrThrow({ where: { id: invitationA.jobSiteId }, select: { status: true, revision: true } }),
    ]);
    expect(activeParticipant).toMatchObject({ status: "ACTIVE", activeKey: `${invitationA.jobSiteId}:${clientA.user.id}:CLIENT`, primaryClientKey: `${invitationA.jobSiteId}:PRIMARY_CLIENT`, accessVersion: 2 });
    expect(activeParticipant.activatedAt).toBeInstanceOf(Date);
    expect(consent).toEqual({ decision: "ACCEPTED", fingerprint: agreement.currentVersion?.fingerprint });
    expect(agreement).toMatchObject({ status: "CONFIRMED", currentVersionId: agreementA.agreementVersionId });
    expect(agreement.confirmedAt).toBeInstanceOf(Date);
    expect(activeJobSite).toEqual({ status: "ACTIVE", revision: agreementA.revision + 1 });

    const activeAgreementActor = await resolveClientInitialAgreementActor(invitationA.jobSiteId);
    await expect(executeVNextAction({
      actor: activeAgreementActor,
      idempotencyKey: confirmationKey,
      action: { action: "INITIAL_AGREEMENT_CONFIRM@1", expectedRevision: agreementA.revision, agreementVersionId: agreementA.agreementVersionId, decision: "ACCEPTED" },
    })).resolves.toMatchObject({ replayed: true, revision: agreementA.revision + 1 });
    await expect(resolveClientJobSiteActor(invitationA.jobSiteId)).resolves.toMatchObject({ participantId: pendingParticipant.id, participantAccessVersion: 2 });
    await expect(db.jobSiteInitialAgreementConsent.count({ where: { participantId: pendingParticipant.id } })).resolves.toBe(1);
    const activeDetail = await getClientJobSiteDetail(invitationA.jobSiteId);
    expect(activeDetail.timelineEvents.every((event) => event.audience === "SHARED")).toBe(true);

    identity.currentUserId = clientB.user.id;
    await expect(resolveClientJobSiteActor(invitationA.jobSiteId)).rejects.toMatchObject({ status: 404 });
    await expect(getClientJobSiteDetail(invitationA.jobSiteId)).rejects.toMatchObject({ status: 404 });
  });

  it("rejects expired and revoked invitations without creating client participants", async () => {
    const owner = await createOwnerFixture("Owner invitation guards");
    const expiredClient = await createClientFixture("Expired client");
    const revokedClient = await createClientFixture("Revoked client");
    const expired = await createAndInvite(owner, expiredClient, "Cantiere invito scaduto");
    await db.jobSiteClientInvitation.update({ where: { id: expired.invitationId }, data: { expiresAt: new Date(Date.now() - 1_000) } });
    identity.currentUserId = expiredClient.user.id;
    await expect(acceptPrimaryClientInvitation(expired.token)).rejects.toMatchObject({ status: 410 });

    const revoked = await createAndInvite(owner, revokedClient, "Cantiere invito revocato");
    identity.currentUserId = owner.user.id;
    const ownerActor = await resolveOrganizationJobSiteActor({ organizationId: owner.organization.id, jobSiteId: revoked.jobSiteId, permission: "jobSite:participants:manage" });
    await revokePrimaryClientInvitation({ actor: ownerActor, idempotencyKey: `revoke-${crypto.randomUUID()}`, rawInput: { expectedRevision: 2, invitationId: revoked.invitationId } });
    identity.currentUserId = revokedClient.user.id;
    await expect(acceptPrimaryClientInvitation(revoked.token)).rejects.toMatchObject({ status: 410 });

    await expect(db.jobSiteParticipant.count({ where: { jobSiteId: { in: [expired.jobSiteId, revoked.jobSiteId] }, kind: "CLIENT" } })).resolves.toBe(0);
  });

  it("deduplicates concurrent acceptance and confirmation attempts", async () => {
    const owner = await createOwnerFixture("Owner concurrency");
    const client = await createClientFixture("Concurrent client");
    const invitation = await createAndInvite(owner, client, "Cantiere concorrenza cliente");
    identity.currentUserId = client.user.id;

    const acceptances = await Promise.allSettled([
      acceptPrimaryClientInvitation(invitation.token),
      acceptPrimaryClientInvitation(invitation.token),
    ]);
    expect(acceptances.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    await expect(db.jobSiteParticipant.count({ where: { jobSiteId: invitation.jobSiteId, kind: "CLIENT" } })).resolves.toBe(1);
    await expect(db.jobSiteClientInvitation.findUniqueOrThrow({ where: { id: invitation.invitationId }, select: { status: true } })).resolves.toEqual({ status: "ACCEPTED" });

    const published = await publishAgreement(owner, invitation.jobSiteId);
    identity.currentUserId = client.user.id;
    const pendingActor = await resolveClientInitialAgreementActor(invitation.jobSiteId);
    const confirmationKey = `concurrent-confirm-${crypto.randomUUID()}`;
    const action = { action: "INITIAL_AGREEMENT_CONFIRM@1" as const, expectedRevision: published.revision, agreementVersionId: published.agreementVersionId, decision: "ACCEPTED" as const };
    const confirmations = await Promise.allSettled([
      executeVNextAction({ actor: pendingActor, idempotencyKey: confirmationKey, action }),
      executeVNextAction({ actor: pendingActor, idempotencyKey: confirmationKey, action }),
    ]);
    expect(confirmations.some((result) => result.status === "fulfilled")).toBe(true);
    const participant = await db.jobSiteParticipant.findFirstOrThrow({ where: { jobSiteId: invitation.jobSiteId, userId: client.user.id, kind: "CLIENT" }, select: { id: true, status: true } });
    await expect(db.jobSiteInitialAgreementConsent.count({ where: { participantId: participant.id, versionId: published.agreementVersionId } })).resolves.toBe(1);
    await expect(db.jobSiteActionReceipt.count({ where: { organizationId: owner.organization.id, action: "INITIAL_AGREEMENT_CONFIRM@1", idempotencyKey: confirmationKey } })).resolves.toBe(1);
    expect(participant.status).toBe("ACTIVE");

    const activeActor = await resolveClientInitialAgreementActor(invitation.jobSiteId);
    await expect(executeVNextAction({ actor: activeActor, idempotencyKey: confirmationKey, action })).resolves.toMatchObject({ replayed: true });
    const currentRevision = await db.jobSite.findUniqueOrThrow({ where: { id: invitation.jobSiteId }, select: { revision: true } });
    await expect(executeVNextAction({ actor: activeActor, idempotencyKey: `repeat-${crypto.randomUUID()}`, action: { ...action, expectedRevision: currentRevision.revision } })).rejects.toMatchObject({ status: 409 });
    await expect(db.jobSiteInitialAgreementConsent.count({ where: { participantId: participant.id, versionId: published.agreementVersionId } })).resolves.toBe(1);
  });

  it("rolls back consent, participant activation and JobSite activation when the transaction fails", async () => {
    const owner = await createOwnerFixture("Owner rollback");
    const client = await createClientFixture("Rollback client");
    const invitation = await createAndInvite(owner, client, "Cantiere rollback cliente");
    identity.currentUserId = client.user.id;
    await acceptPrimaryClientInvitation(invitation.token);
    const published = await publishAgreement(owner, invitation.jobSiteId);
    identity.currentUserId = client.user.id;
    const pendingActor = await resolveClientInitialAgreementActor(invitation.jobSiteId);
    const idempotencyKey = `rollback-confirm-${crypto.randomUUID()}`;

    type InteractiveTransaction = <T>(
      operation: (tx: Prisma.TransactionClient) => Promise<T>,
      options?: { maxWait?: number; timeout?: number; isolationLevel?: Prisma.TransactionIsolationLevel },
    ) => Promise<T>;
    const originalTransaction = db.$transaction.bind(db) as InteractiveTransaction;
    const transactionSpy = vi.spyOn(db, "$transaction");
    const forcedFailureTransaction: InteractiveTransaction = async (operation, options) => originalTransaction(async (tx) => {
      await operation(tx);
      throw new Error("FORCED_CLIENT_CONFIRMATION_TRANSACTION_FAILURE");
    }, options);
    transactionSpy.mockImplementationOnce(forcedFailureTransaction as typeof db.$transaction);

    await expect(executeVNextAction({
      actor: pendingActor,
      idempotencyKey,
      action: { action: "INITIAL_AGREEMENT_CONFIRM@1", expectedRevision: published.revision, agreementVersionId: published.agreementVersionId, decision: "ACCEPTED" },
    })).rejects.toThrow("FORCED_CLIENT_CONFIRMATION_TRANSACTION_FAILURE");
    transactionSpy.mockRestore();

    const [participant, agreement, jobSite, consentCount, receiptCount] = await Promise.all([
      db.jobSiteParticipant.findUniqueOrThrow({ where: { id: pendingActor.participantId }, select: { status: true, activeKey: true, activatedAt: true, accessVersion: true } }),
      db.jobSiteInitialAgreement.findUniqueOrThrow({ where: { jobSiteId: invitation.jobSiteId }, select: { status: true, confirmedAt: true } }),
      db.jobSite.findUniqueOrThrow({ where: { id: invitation.jobSiteId }, select: { status: true, revision: true } }),
      db.jobSiteInitialAgreementConsent.count({ where: { participantId: pendingActor.participantId, versionId: published.agreementVersionId } }),
      db.jobSiteActionReceipt.count({ where: { organizationId: owner.organization.id, action: "INITIAL_AGREEMENT_CONFIRM@1", idempotencyKey } }),
    ]);
    expect(participant).toEqual({ status: "PENDING", activeKey: null, activatedAt: null, accessVersion: 1 });
    expect(agreement).toEqual({ status: "PENDING_CLIENT_CONFIRMATION", confirmedAt: null });
    expect(jobSite).toEqual({ status: "PENDING_INITIAL_CONFIRMATION", revision: published.revision });
    expect(consentCount).toBe(0);
    expect(receiptCount).toBe(0);
  });
});
