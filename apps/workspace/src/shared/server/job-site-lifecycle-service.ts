import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { db, Prisma } from "@qoovex/db";
import { z } from "zod";
import { AccessError } from "./access-errors";
import { requireAccountRole } from "./account-role-service";
import { requireClientJobSiteContext, requireClientJobSiteDetailContext, requireOrganizationContext, requirePrimaryIdentity } from "./access-context-service";
import { fingerprintPayload, initialAgreementPayloadSchema } from "./job-site-contracts";
import { enqueueJobSiteProcess } from "./job-site-process-service";
import { runSerializableTransaction } from "./serializable-transaction";
import { sendTransactionalEmail } from "./transactional-email-service";
import { executeIdempotentJobSiteMutation } from "./job-site-idempotency-service";
import type { JobSiteActor } from "./job-site-authorization-service";
import { recordProductAuditEvent } from "./product-audit-service";

const CLIENT_INVITATION_TTL_MS = 14 * 24 * 60 * 60 * 1000;

const createJobSiteSchema = z.object({
  name: z.string().trim().min(2).max(160),
  address: z.string().trim().max(500).nullable().optional(),
  description: z.string().trim().max(4000).nullable().optional(),
  startDate: z.string().datetime().nullable().optional(),
  estimatedCompletionAt: z.string().datetime().nullable().optional(),
}).strict();

const inviteClientSchema = z.object({ email: z.string().trim().email().transform((value) => value.toLowerCase()) }).strict();
const propertySchema = z.object({ displayName: z.string().trim().min(1).max(160), addressLine: z.string().trim().max(500).nullable().optional(), city: z.string().trim().max(160).nullable().optional(), postalCode: z.string().trim().max(32).nullable().optional(), countryCode: z.string().trim().regex(/^[A-Z]{2}$/).nullable().optional(), privateNotes: z.string().trim().max(4000).nullable().optional() }).strict();

function requireContextPermission(context: Awaited<ReturnType<typeof requireOrganizationContext>>, permission: (typeof context.permissions)[number]) {
  if (!context.permissions.includes(permission)) throw new AccessError("Risorsa non disponibile.", 404);
}

const closureOpenStepStatuses = new Set(["NOT_STARTED", "IN_PROGRESS", "WAITING", "WORK_COMPLETED", "CHANGES_REQUESTED"]);
const closureOpenProposalStatuses = ["DRAFT", "PROPOSED", "COUNTERED"] as const;
const closureOpenRequestStatuses = ["OPEN", "RESPONDED"] as const;
const closureOpenPaymentStatuses = ["DRAFT", "REQUESTED", "TRANSFER_DECLARED", "UNDER_REVIEW", "DISPUTED"] as const;
const closureOpenDisputeStatuses = ["OPEN", "IN_DISCUSSION"] as const;
const closureActiveEconomicProcessDefinitions = ["CHANGE_NEGOTIATION@1", "PAYMENT_REQUEST@1"] as const;
const closureActiveProcessStatuses = ["PENDING", "RUNNING", "WAITING"] as const;

export async function listOrganizationJobSites(organizationId: string) {
  const context = await requireOrganizationContext(organizationId);
  requireContextPermission(context, "jobSites:read");
  return db.jobSite.findMany({
    where: {
      organizationId,
      ...(context.role === "OWNER" || context.scopeMode === "FULL" ? {} : { participants: { some: { membershipId: context.membershipId, status: "ACTIVE" } } }),
    },
    select: { id: true, organizationId: true, name: true, address: true, description: true, status: true, revision: true, estimatedCompletionAt: true, createdAt: true, updatedAt: true },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });
}

export async function createJobSite(organizationId: string, idempotencyKey: string, rawInput: unknown) {
  await requireAccountRole("BUSINESS");
  const context = await requireOrganizationContext(organizationId);
  requireContextPermission(context, "jobSites:create");
  const input = createJobSiteSchema.parse(rawInput);
  if (!idempotencyKey.trim() || idempotencyKey.length > 200) throw new AccessError("Idempotency-Key non valida.", 409, "IDEMPOTENCY_KEY_REQUIRED");
  const inputFingerprint = fingerprintPayload(input);
  const existing = await db.jobSiteActionReceipt.findUnique({ where: { organizationId_action_idempotencyKey: { organizationId, action: "JOB_SITE_CREATE@1", idempotencyKey } }, select: { inputFingerprint: true, result: true, resultingRevision: true } });
  if (existing) {
    if (existing.inputFingerprint !== inputFingerprint) throw new AccessError("Idempotency-Key gia usata con un input differente.", 409, "IDEMPOTENCY_FINGERPRINT_MISMATCH");
    return { ...(existing.result as Record<string, unknown>), replayed: true, revision: existing.resultingRevision };
  }
  const result = await runSerializableTransaction(async (tx) => {
    const jobSite = await tx.jobSite.create({
      data: {
        organizationId,
        name: input.name,
        address: input.address ?? null,
        description: input.description ?? null,
        status: "DRAFT",
        revision: 1,
        historicalCreatorUserId: context.userId,
        startDate: input.startDate ? new Date(input.startDate) : null,
        estimatedCompletionAt: input.estimatedCompletionAt ? new Date(input.estimatedCompletionAt) : null,
        estimatedCompletionAuthorId: input.estimatedCompletionAt ? context.userId : null,
        estimatedCompletionSetAt: input.estimatedCompletionAt ? new Date() : null,
      },
      select: { id: true, name: true, status: true, revision: true },
    });
    const participant = await tx.jobSiteParticipant.create({
      data: {
        organizationId,
        jobSiteId: jobSite.id,
        userId: context.userId,
        membershipId: context.membershipId,
        kind: "ORGANIZATION_MEMBER",
        status: "ACTIVE",
        publicRoleLabel: "Responsabile del cantiere",
        activeKey: `${jobSite.id}:${context.userId}:ORGANIZATION_MEMBER`,
        userSideKey: `${jobSite.id}:${context.userId}`,
        activatedAt: new Date(),
        createdByUserId: context.userId,
      },
      select: { id: true, accessVersion: true },
    });
    await tx.jobSite.update({ where: { id: jobSite.id }, data: { responsibleParticipantId: participant.id, timelineSequence: 1 } });
    const timelinePayload = { schemaVersion: 1, name: input.name };
    await tx.jobSiteTimelineEvent.create({ data: { organizationId, jobSiteId: jobSite.id, sequence: 1, type: "JOB_SITE_CREATED", audience: "INTERNAL", disclosure: "GENERAL", actorKind: "ORGANIZATION_MEMBER", actorUserId: context.userId, actorParticipantId: participant.id, title: "Cantiere creato", payload: timelinePayload, fingerprint: fingerprintPayload(timelinePayload) } });
    const receiptResult = { ...jobSite, responsibleParticipantId: participant.id };
    await tx.jobSiteActionReceipt.create({ data: { organizationId, jobSiteId: jobSite.id, action: "JOB_SITE_CREATE@1", idempotencyKey, inputFingerprint, result: receiptResult, resultFingerprint: fingerprintPayload(receiptResult), actorUserId: context.userId, actorParticipantId: participant.id, expectedRevision: 0, resultingRevision: 1 } });
    return receiptResult;
  }, { shouldRetry: (error) => error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002" });
  await recordProductAuditEvent({ organizationId, actorUserId: context.userId, actorRole: context.role, action: "JOB_SITE_CREATED", entityType: "JOB_SITE", entityId: result.id });
  return { ...result, replayed: false };
}

export async function getOrganizationJobSiteDetail(organizationId: string, jobSiteId: string) {
  const context = await requireOrganizationContext(organizationId);
  requireContextPermission(context, "jobSites:read");
  const jobSite = await db.jobSite.findFirst({
    where: { id: jobSiteId, organizationId, ...(context.role === "OWNER" || context.scopeMode === "FULL" ? {} : { participants: { some: { membershipId: context.membershipId, status: "ACTIVE" } } }) },
    include: {
      initialAgreement: { include: { currentVersion: true, versions: { orderBy: { version: "desc" }, take: 10, include: { consents: true } } } },
      participants: { where: { OR: [{ kind: "ORGANIZATION_MEMBER", status: "ACTIVE" }, { kind: "CLIENT", status: { in: ["PENDING", "ACTIVE", "SUSPENDED"] } }] }, select: { id: true, kind: true, status: true, publicRoleLabel: true, user: { select: { firstName: true, lastName: true } } }, orderBy: { createdAt: "asc" } },
      clientInvitations: { where: { status: "PENDING" }, select: { id: true, emailNormalized: true, status: true, expiresAt: true }, orderBy: { createdAt: "desc" } },
      steps: { orderBy: { sortOrder: "asc" } },
      timelineEvents: { orderBy: { sequence: "desc" }, take: 50 },
      requests: { where: { status: { in: ["OPEN", "RESPONDED"] } }, orderBy: { updatedAt: "desc" } },
      changeProposals: { orderBy: { updatedAt: "desc" }, take: 50, include: { currentVersion: true } },
      paymentRequests: {
        orderBy: { updatedAt: "desc" },
        take: 50,
        select: {
          id: true, status: true, amountMinor: true, reason: true, requestedAt: true, dueAt: true, confirmedAt: true, createdAt: true,
          requestedByParticipant: { select: { publicRoleLabel: true, user: { select: { firstName: true, lastName: true } } } },
        },
      },
      disputes: { orderBy: { openedAt: "desc" }, take: 50 },
      closures: { orderBy: { proposedAt: "desc" }, take: 10, include: { consents: { select: { decision: true, participant: { select: { kind: true } } } } } },
      exports: { orderBy: { createdAt: "desc" }, take: 20 },
      postClosureRequests: { orderBy: { createdAt: "desc" }, take: 20 },
      reopeningProposals: { orderBy: { proposedAt: "desc" }, take: 20, include: { consents: { select: { decision: true, participant: { select: { id: true, kind: true } } } } } },
      authorityGrants: { where: { status: "ACTIVE" }, orderBy: { createdAt: "desc" } },
      legalHolds: { orderBy: { placedAt: "desc" }, take: 20 },
      processes: { orderBy: { createdAt: "desc" }, take: 20, include: { steps: { orderBy: { ordinal: "asc" } } } },
      attachments: { orderBy: { createdAt: "desc" }, take: 100, select: { id: true, category: true, sourceId: true, originalFileName: true, size: true, createdAt: true, publications: { where: { withdrawnAt: null }, select: { audience: true } } } },
    },
  });
  if (!jobSite) throw new AccessError("Cantiere non trovato.", 404);
  const availableMemberships = await db.organizationMembership.findMany({ where: { organizationId, revokedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }, select: { id: true, user: { select: { firstName: true, lastName: true, email: true } } }, orderBy: { createdAt: "asc" } });
  return { ...jobSite, processes: jobSite.processes.map((process) => ({ ...process, steps: process.steps.map((step) => ({ ...step, name: step.key })) })), availableMemberships };
}

export async function getOrganizationClosureReadiness(organizationId: string, jobSiteId: string) {
  const context = await requireOrganizationContext(organizationId);
  requireContextPermission(context, "jobSites:read");
  const jobSite = await db.jobSite.findFirst({
    where: { id: jobSiteId, organizationId, ...(context.role === "OWNER" || context.scopeMode === "FULL" ? {} : { participants: { some: { membershipId: context.membershipId, status: "ACTIVE" } } }) },
    select: {
      steps: { orderBy: { sortOrder: "asc" }, select: { id: true, status: true, title: true } },
      changeProposals: { where: { status: { in: [...closureOpenProposalStatuses] } }, orderBy: { updatedAt: "desc" }, select: { id: true, status: true } },
      requests: { where: { status: { in: [...closureOpenRequestStatuses] } }, orderBy: { updatedAt: "desc" }, select: { id: true, status: true, title: true } },
      paymentRequests: { where: { status: { in: [...closureOpenPaymentStatuses] } }, orderBy: { updatedAt: "desc" }, select: { amountMinor: true, id: true, reason: true, status: true } },
      disputes: { where: { status: { in: [...closureOpenDisputeStatuses] } }, orderBy: { updatedAt: "desc" }, select: { id: true, status: true, title: true } },
      processes: { where: { definitionKey: { in: [...closureActiveEconomicProcessDefinitions] }, status: { in: [...closureActiveProcessStatuses] } }, orderBy: { createdAt: "desc" }, select: { definitionKey: true, id: true, status: true } },
    },
  });
  if (!jobSite) throw new AccessError("Cantiere non trovato.", 404);
  return {
    steps: jobSite.steps,
    openSteps: jobSite.steps.filter((step) => closureOpenStepStatuses.has(step.status)),
    openProposals: jobSite.changeProposals,
    openRequests: jobSite.requests,
    openPayments: jobSite.paymentRequests,
    openDisputes: jobSite.disputes,
    openProcesses: jobSite.processes,
  };
}

export async function getOrganizationPaymentReviewDetails(organizationId: string, jobSiteId: string) {
  const context = await requireOrganizationContext(organizationId);
  requireContextPermission(context, "jobSites:read");
  const jobSite = await db.jobSite.findFirst({
    where: { id: jobSiteId, organizationId },
    select: {
      paymentRequests: {
        orderBy: { updatedAt: "desc" },
        take: 50,
        select: {
          id: true,
          transferDeclarations: {
            select: {
              amountMinor: true, transferredAt: true, method: true, reference: true, note: true, createdAt: true,
              declaredByParticipant: { select: { publicRoleLabel: true, user: { select: { firstName: true, lastName: true } } } },
              receiptAttachment: { select: { id: true, originalFileName: true } },
            },
          },
          reviews: {
            orderBy: { createdAt: "desc" },
            take: 10,
            select: {
              outcome: true, note: true, createdAt: true,
              reviewedByParticipant: { select: { publicRoleLabel: true, user: { select: { firstName: true, lastName: true } } } },
            },
          },
        },
      },
    },
  });
  if (!jobSite) throw new AccessError("Cantiere non trovato.", 404);
  return jobSite.paymentRequests;
}

type RequestInteractionAction = "RESPOND" | "RESOLVE" | "WITHDRAW";
type RequestConversationViewer = { canRespond: boolean; participantId: string; side: "CLIENT" | "ORGANIZATION_MEMBER" };

function requestInteractionsByRequestId(events: Array<{ actorParticipant: { publicRoleLabel: string | null; user: { firstName: string | null; lastName: string | null } } | null; createdAt: Date; payload: unknown }>) {
  const interactions = new Map<string, Array<{ action: RequestInteractionAction; actor: NonNullable<typeof events[number]["actorParticipant"]>; createdAt: Date; message: string }>>();
  for (const event of events) {
    if (!event.actorParticipant || !event.payload || typeof event.payload !== "object" || Array.isArray(event.payload)) continue;
    const payload = event.payload as Record<string, unknown>;
    const requestId = payload.requestId;
    const action = payload.action;
    const message = payload.message;
    if (typeof requestId !== "string" || !["RESPOND", "RESOLVE", "WITHDRAW"].includes(String(action)) || typeof message !== "string") continue;
    const entries = interactions.get(requestId) ?? [];
    entries.push({ action: action as RequestInteractionAction, actor: event.actorParticipant, createdAt: event.createdAt, message });
    interactions.set(requestId, entries);
  }
  return interactions;
}

function presentRequestConversationActions(request: { assignedSide: "CLIENT" | "ORGANIZATION_MEMBER"; openedByParticipantId: string; status: "OPEN" | "RESPONDED" | "RESOLVED" | "WITHDRAWN" }, viewer: RequestConversationViewer) {
  if (!["OPEN", "RESPONDED"].includes(request.status)) return [];
  if (request.openedByParticipantId === viewer.participantId) return [{ value: "RESOLVE", label: "Segna come risolta" }, { value: "WITHDRAW", label: "Ritira la richiesta" }] as const;
  return request.assignedSide === viewer.side && viewer.canRespond ? [{ value: "RESPOND", label: "Invia una risposta" }] as const : [];
}

function presentRequestConversations(requests: Array<{
  assignedSide: "CLIENT" | "ORGANIZATION_MEMBER";
  blocking: boolean;
  body: string;
  createdAt: Date;
  id: string;
  openedByParticipant: { publicRoleLabel: string | null; user: { firstName: string | null; lastName: string | null } };
  openedByParticipantId: string;
    resolvedAt: Date | null;
    status: "OPEN" | "RESPONDED" | "RESOLVED" | "WITHDRAWN";
    title: string;
    type: "CLARIFICATION" | "INFORMATION" | "WORK_UPDATE" | "DOCUMENT" | "ISSUE" | "OTHER";
}>, interactionsByRequest: ReturnType<typeof requestInteractionsByRequestId>, viewer: RequestConversationViewer) {
  return requests.map((request) => ({ ...request, availableActions: presentRequestConversationActions(request, viewer), interactions: interactionsByRequest.get(request.id) ?? [] }));
}

const requestConversationSelect = {
  id: true, assignedSide: true, blocking: true, body: true, createdAt: true, openedByParticipantId: true, resolvedAt: true, status: true, title: true, type: true,
  openedByParticipant: { select: { publicRoleLabel: true, user: { select: { firstName: true, lastName: true } } } },
} as const;

const requestConversationEventSelect = {
  actorParticipant: { select: { publicRoleLabel: true, user: { select: { firstName: true, lastName: true } } } },
  createdAt: true,
  payload: true,
} as const;

export async function getOrganizationRequestConversations(organizationId: string, jobSiteId: string) {
  const context = await requireOrganizationContext(organizationId);
  requireContextPermission(context, "jobSites:read");
  const viewer = await db.jobSiteParticipant.findFirst({ where: { organizationId, jobSiteId, membershipId: context.membershipId, userId: context.userId, kind: "ORGANIZATION_MEMBER", status: "ACTIVE" }, select: { id: true } });
  const jobSite = await db.jobSite.findFirst({
    where: { id: jobSiteId, organizationId, ...(context.role === "OWNER" || context.scopeMode === "FULL" ? {} : { participants: { some: { membershipId: context.membershipId, status: "ACTIVE" } } }) },
    select: {
      requests: { orderBy: { updatedAt: "desc" }, take: 50, select: requestConversationSelect },
      timelineEvents: { orderBy: { createdAt: "asc" }, take: 200, select: requestConversationEventSelect },
    },
  });
  if (!jobSite) throw new AccessError("Cantiere non trovato.", 404);
  const requestViewer = { canRespond: Boolean(viewer) && context.permissions.includes("jobSite:requests:respond"), participantId: viewer?.id ?? "", side: "ORGANIZATION_MEMBER" as const };
  return presentRequestConversations(jobSite.requests, requestInteractionsByRequestId(jobSite.timelineEvents), requestViewer);
}

export async function getClientRequestConversations(jobSiteId: string) {
  const viewer = await requireClientJobSiteContext(jobSiteId);
  const jobSite = await db.jobSite.findFirst({
    where: { id: jobSiteId, organizationId: viewer.organizationId },
    select: {
      requests: { orderBy: { updatedAt: "desc" }, take: 50, select: requestConversationSelect },
      timelineEvents: { where: { audience: "SHARED" }, orderBy: { createdAt: "asc" }, take: 200, select: requestConversationEventSelect },
    },
  });
  if (!jobSite) throw new AccessError("Cantiere non trovato.", 404);
  return presentRequestConversations(jobSite.requests, requestInteractionsByRequestId(jobSite.timelineEvents), { canRespond: true, participantId: viewer.id, side: "CLIENT" });
}

type DisagreementInteractionAction = "RESPOND" | "AGREE" | "WITHDRAW" | "CLOSE_WITHOUT_AGREEMENT";

function disagreementInteractionsByDisagreementId(events: Array<{ actorParticipant: { publicRoleLabel: string | null; user: { firstName: string | null; lastName: string | null } } | null; createdAt: Date; payload: unknown }>) {
  const interactions = new Map<string, Array<{ action: DisagreementInteractionAction; actor: NonNullable<typeof events[number]["actorParticipant"]>; createdAt: Date; message: string }>>();
  for (const event of events) {
    if (!event.actorParticipant || !event.payload || typeof event.payload !== "object" || Array.isArray(event.payload)) continue;
    const payload = event.payload as Record<string, unknown>;
    const disagreementId = payload.disputeId;
    const action = payload.action;
    const message = payload.message;
    if (typeof disagreementId !== "string" || !["RESPOND", "AGREE", "WITHDRAW", "CLOSE_WITHOUT_AGREEMENT"].includes(String(action)) || typeof message !== "string") continue;
    const entries = interactions.get(disagreementId) ?? [];
    entries.push({ action: action as DisagreementInteractionAction, actor: event.actorParticipant, createdAt: event.createdAt, message });
    interactions.set(disagreementId, entries);
  }
  return interactions;
}

function presentDisagreementActions(disagreement: { openedByParticipantId: string; status: "OPEN" | "IN_DISCUSSION" | "RESOLVED_BY_AGREEMENT" | "WITHDRAWN" | "CLOSED_WITHOUT_AGREEMENT" }, viewer: RequestConversationViewer) {
  if (!["OPEN", "IN_DISCUSSION"].includes(disagreement.status)) return [];
  if (!viewer.canRespond) return [];
  const actions = [
    { value: "RESPOND", label: "Aggiungi la tua posizione" },
    { value: "AGREE", label: "Registra accordo" },
    { value: "CLOSE_WITHOUT_AGREEMENT", label: "Registra mancato accordo" },
  ] as const;
  return disagreement.openedByParticipantId === viewer.participantId
    ? [...actions, { value: "WITHDRAW", label: "Ritira il disaccordo" }] as const
    : actions;
}

function presentDisagreementConversations(disagreements: Array<{
  description: string;
  id: string;
  openedAt: Date;
  openedByParticipant: { publicRoleLabel: string | null; user: { firstName: string | null; lastName: string | null } };
  openedByParticipantId: string;
  status: "OPEN" | "IN_DISCUSSION" | "RESOLVED_BY_AGREEMENT" | "WITHDRAWN" | "CLOSED_WITHOUT_AGREEMENT";
  title: string;
}>, interactionsByDisagreement: ReturnType<typeof disagreementInteractionsByDisagreementId>, viewer: RequestConversationViewer) {
  return disagreements.map((disagreement) => ({ ...disagreement, availableActions: presentDisagreementActions(disagreement, viewer), interactions: interactionsByDisagreement.get(disagreement.id) ?? [] }));
}

const disagreementConversationSelect = {
  description: true, id: true, openedAt: true, openedByParticipantId: true, status: true, title: true,
  openedByParticipant: { select: { publicRoleLabel: true, user: { select: { firstName: true, lastName: true } } } },
} as const;

export async function getOrganizationDisagreementConversations(organizationId: string, jobSiteId: string) {
  const context = await requireOrganizationContext(organizationId);
  requireContextPermission(context, "jobSites:read");
  const viewer = await db.jobSiteParticipant.findFirst({ where: { organizationId, jobSiteId, membershipId: context.membershipId, userId: context.userId, kind: "ORGANIZATION_MEMBER", status: "ACTIVE" }, select: { id: true } });
  const jobSite = await db.jobSite.findFirst({
    where: { id: jobSiteId, organizationId, ...(context.role === "OWNER" || context.scopeMode === "FULL" ? {} : { participants: { some: { membershipId: context.membershipId, status: "ACTIVE" } } }) },
    select: {
      disputes: { orderBy: { updatedAt: "desc" }, take: 50, select: disagreementConversationSelect },
      timelineEvents: { orderBy: { createdAt: "asc" }, take: 200, select: requestConversationEventSelect },
    },
  });
  if (!jobSite) throw new AccessError("Cantiere non trovato.", 404);
  return presentDisagreementConversations(jobSite.disputes, disagreementInteractionsByDisagreementId(jobSite.timelineEvents), { canRespond: Boolean(viewer) && context.permissions.includes("jobSite:disputes:respond"), participantId: viewer?.id ?? "", side: "ORGANIZATION_MEMBER" });
}

export async function getClientDisagreementConversations(jobSiteId: string) {
  const viewer = await requireClientJobSiteContext(jobSiteId);
  const jobSite = await db.jobSite.findFirst({
    where: { id: jobSiteId, organizationId: viewer.organizationId },
    select: {
      disputes: { orderBy: { updatedAt: "desc" }, take: 50, select: disagreementConversationSelect },
      timelineEvents: { where: { audience: "SHARED" }, orderBy: { createdAt: "asc" }, take: 200, select: requestConversationEventSelect },
    },
  });
  if (!jobSite) throw new AccessError("Cantiere non trovato.", 404);
  return presentDisagreementConversations(jobSite.disputes, disagreementInteractionsByDisagreementId(jobSite.timelineEvents), { canRespond: true, participantId: viewer.id, side: "CLIENT" });
}

export async function acceptPrimaryClientInvitation(rawToken: string) {
  const identity = await requireAccountRole("CLIENT");
  if (!identity.emailVerified) throw new AccessError("Email verificata richiesta.", 403);
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  return runSerializableTransaction(async (tx) => {
    const invitation = await tx.jobSiteClientInvitation.findUnique({ where: { tokenHash }, include: { jobSite: { select: { id: true, organizationId: true, revision: true, status: true } } } });
    if (!invitation || invitation.status !== "PENDING" || invitation.expiresAt <= new Date()) throw new AccessError("Invito scaduto o non disponibile.", 410);
    if (invitation.organizationId !== invitation.jobSite.organizationId || invitation.jobSite.status !== "WAITING_FOR_CLIENT") throw new AccessError("Invito non disponibile nello stato corrente.", 410);
    if (identity.email.toLowerCase() !== invitation.emailNormalized) throw new AccessError("L'invito appartiene a un'altra email.", 403);
    if (await tx.jobSiteParticipant.findFirst({ where: { jobSiteId: invitation.jobSiteId, userId: identity.id }, select: { id: true } })) throw new AccessError("Lo stesso account non puo rappresentare entrambe le parti.", 409);
    const participant = await tx.jobSiteParticipant.create({
      data: {
        organizationId: invitation.organizationId,
        jobSiteId: invitation.jobSiteId,
        userId: identity.id,
        kind: "CLIENT",
        status: "PENDING",
        publicRoleLabel: "Cliente principale",
        activeKey: null,
        primaryClientKey: `${invitation.jobSiteId}:PRIMARY_CLIENT`,
        userSideKey: `${invitation.jobSiteId}:${identity.id}`,
        invitedAt: invitation.createdAt,
        activatedAt: null,
        createdByUserId: invitation.invitedByUserId,
      },
      select: { id: true, jobSiteId: true, status: true, activatedAt: true },
    });
    const accepted = await tx.jobSiteClientInvitation.updateMany({ where: { id: invitation.id, status: "PENDING" }, data: { status: "ACCEPTED", activeKey: null, acceptedAt: new Date(), acceptedByParticipantId: participant.id } });
    if (accepted.count !== 1) throw new AccessError("Invito scaduto o non disponibile.", 410);
    const updated = await tx.jobSite.updateMany({ where: { id: invitation.jobSiteId, revision: invitation.jobSite.revision }, data: { status: "PENDING_INITIAL_CONFIRMATION", revision: { increment: 1 } } });
    if (updated.count !== 1) throw new AccessError("Il cantiere e stato modificato. Riprova.", 409, "STALE_REVISION");
    return participant;
  });
}

export type ClientInvitationPageState =
  | { kind: "READY"; organizationName: string; jobSiteName: string; jobSiteAddress: string | null }
  | { kind: "EXPIRED" | "REVOKED" | "ALREADY_ACCEPTED" | "ACCEPTED_ACCESS_UNAVAILABLE" | "WRONG_ACCOUNT_EMAIL" | "ACCOUNT_ROLE_MISMATCH" | "EMAIL_VERIFICATION_REQUIRED" | "ACCOUNT_ALREADY_PARTICIPATES" | "SESSION_UNAVAILABLE" | "UNAVAILABLE" }
  | { kind: "ALREADY_ACCEPTED_WITH_ACCESS"; jobSiteId: string };

export async function getClientInvitationPageState(rawToken: string): Promise<ClientInvitationPageState> {
  let identity: Awaited<ReturnType<typeof requirePrimaryIdentity>>;
  try {
    identity = await requirePrimaryIdentity();
  } catch (error) {
    if (error instanceof AccessError && error.status === 401) return { kind: "SESSION_UNAVAILABLE" };
    throw error;
  }

  if (!rawToken) return { kind: "UNAVAILABLE" };

  const invitation = await db.jobSiteClientInvitation.findUnique({
    where: { tokenHash: createHash("sha256").update(rawToken).digest("hex") },
    select: {
      organizationId: true,
      jobSiteId: true,
      emailNormalized: true,
      status: true,
      expiresAt: true,
      acceptedByParticipant: { select: { userId: true, jobSiteId: true, status: true } },
      jobSite: {
        select: {
          organizationId: true,
          status: true,
          name: true,
          address: true,
          organization: { select: { name: true } },
          participants: { where: { userId: identity.id }, select: { kind: true, status: true }, take: 1 },
        },
      },
    },
  });

  if (!invitation || invitation.organizationId !== invitation.jobSite.organizationId) return { kind: "UNAVAILABLE" };
  if (invitation.status === "REVOKED") return { kind: "REVOKED" };
  if (invitation.status === "ACCEPTED") {
    const acceptedParticipant = invitation.acceptedByParticipant;
    if (acceptedParticipant?.userId === identity.id && (acceptedParticipant.status === "PENDING" || acceptedParticipant.status === "ACTIVE")) {
      return { kind: "ALREADY_ACCEPTED_WITH_ACCESS", jobSiteId: acceptedParticipant.jobSiteId };
    }
    return { kind: acceptedParticipant?.userId === identity.id ? "ACCEPTED_ACCESS_UNAVAILABLE" : "ALREADY_ACCEPTED" };
  }
  if (invitation.expiresAt <= new Date()) return { kind: "EXPIRED" };
  if (invitation.status !== "PENDING" || invitation.jobSite.status !== "WAITING_FOR_CLIENT") return { kind: "UNAVAILABLE" };
  if (!identity.emailVerified) return { kind: "EMAIL_VERIFICATION_REQUIRED" };
  if (identity.accountRole !== "CLIENT") return { kind: "ACCOUNT_ROLE_MISMATCH" };
  if (identity.email.toLowerCase() !== invitation.emailNormalized) return { kind: "WRONG_ACCOUNT_EMAIL" };

  const existingParticipant = invitation.jobSite.participants[0];
  if (existingParticipant) {
    if (existingParticipant.kind === "CLIENT" && (existingParticipant.status === "PENDING" || existingParticipant.status === "ACTIVE")) {
      return { kind: "ALREADY_ACCEPTED_WITH_ACCESS", jobSiteId: invitation.jobSiteId };
    }
    return { kind: "ACCOUNT_ALREADY_PARTICIPATES" };
  }

  return {
    kind: "READY",
    organizationName: invitation.jobSite.organization.name,
    jobSiteName: invitation.jobSite.name,
    jobSiteAddress: invitation.jobSite.address,
  };
}

export async function invitePrimaryClientIdempotent(input: { actor: JobSiteActor; idempotencyKey: string; rawInput: unknown }) {
  const request = inviteClientSchema.extend({ expectedRevision: z.number().int().positive() }).parse(input.rawInput);
  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + CLIENT_INVITATION_TTL_MS);
  const execution = await executeIdempotentJobSiteMutation({
    actor: input.actor, action: "CLIENT_INVITATION_CREATE@1", idempotencyKey: input.idempotencyKey, expectedRevision: request.expectedRevision, request,
    operation: async (tx) => {
      const jobSite = await tx.jobSite.findFirst({ where: { id: input.actor.jobSiteId, organizationId: input.actor.organizationId, status: { in: ["DRAFT", "WAITING_FOR_CLIENT"] } }, select: { id: true, name: true, organization: { select: { name: true } } } });
      if (!jobSite) throw new AccessError("Cantiere non disponibile per l'invito.", 409);
      if (await tx.jobSiteParticipant.findFirst({ where: { jobSiteId: input.actor.jobSiteId, kind: "CLIENT", status: { in: ["INVITED", "PENDING", "ACTIVE"] } }, select: { id: true } })) throw new AccessError("Il cantiere ha già un cliente principale.", 409);
      await tx.jobSiteClientInvitation.updateMany({ where: { jobSiteId: input.actor.jobSiteId, status: "PENDING" }, data: { status: "SUPERSEDED", activeKey: null, supersededAt: new Date() } });
      const invitation = await tx.jobSiteClientInvitation.create({ data: { organizationId: input.actor.organizationId, jobSiteId: input.actor.jobSiteId, emailNormalized: request.email, tokenHash, activeKey: `${input.actor.jobSiteId}:CLIENT`, status: "PENDING", invitedByUserId: input.actor.userId, expiresAt }, select: { id: true } });
      await tx.jobSite.update({ where: { id: input.actor.jobSiteId }, data: { status: "WAITING_FOR_CLIENT" } });
      return { invitationId: invitation.id, expiresAt: expiresAt.toISOString(), organizationName: jobSite.organization.name, jobSiteName: jobSite.name };
    },
  });
  if (!execution.replayed) {
    await enqueueJobSiteProcess({ organizationId: input.actor.organizationId, jobSiteId: input.actor.jobSiteId, definitionKey: "CLIENT_INVITATION@1", businessKey: execution.result.invitationId, payload: { invitationId: execution.result.invitationId } });
    await sendTransactionalEmail({ to: request.email, template: { kind: "client-invitation", organizationName: execution.result.organizationName, jobSiteName: execution.result.jobSiteName, acceptUrl: `${process.env.AUTH_URL ?? "http://localhost:3001"}/client/invitations/${rawToken}`, expiresAt }, idempotencyKey: `client-invitation:${execution.result.invitationId}` });
  }
  return { id: execution.result.invitationId, expiresAt: execution.result.expiresAt, replayed: execution.replayed, revision: execution.revision };
}

export async function publishInitialAgreementIdempotent(input: { actor: JobSiteActor; idempotencyKey: string; rawInput: unknown }) {
  const request = z.object({ expectedRevision: z.number().int().positive(), payload: initialAgreementPayloadSchema }).strict().parse(input.rawInput);
  return executeIdempotentJobSiteMutation({ actor: input.actor, action: "INITIAL_AGREEMENT_PUBLISH@1", idempotencyKey: input.idempotencyKey, expectedRevision: request.expectedRevision, request, operation: async (tx) => {
    const jobSite = await tx.jobSite.findFirst({ where: { id: input.actor.jobSiteId, organizationId: input.actor.organizationId, status: "PENDING_INITIAL_CONFIRMATION" }, select: { id: true } });
    if (!jobSite) throw new AccessError("Cantiere non disponibile per la conferma iniziale.", 409);
    const agreement = await tx.jobSiteInitialAgreement.upsert({ where: { jobSiteId: input.actor.jobSiteId }, create: { organizationId: input.actor.organizationId, jobSiteId: input.actor.jobSiteId, status: "DRAFT", createdByUserId: input.actor.userId }, update: {}, select: { id: true, _count: { select: { versions: true } } } });
    const version = await tx.jobSiteInitialAgreementVersion.create({ data: { agreementId: agreement.id, version: agreement._count.versions + 1, payload: request.payload as Prisma.InputJsonValue, fingerprint: fingerprintPayload(request.payload), createdByUserId: input.actor.userId }, select: { id: true, version: true } });
    await tx.jobSiteInitialAgreement.update({ where: { id: agreement.id }, data: { status: "PENDING_CLIENT_CONFIRMATION", currentVersionId: version.id } });
    return { agreementVersionId: version.id, version: version.version };
  } });
}

const invitationRevokeSchema = z.object({ expectedRevision: z.number().int().positive(), invitationId: z.string().min(1) }).strict();
export async function revokePrimaryClientInvitation(input: { actor: JobSiteActor; idempotencyKey: string; rawInput: unknown }) {
  const request = invitationRevokeSchema.parse(input.rawInput);
  return executeIdempotentJobSiteMutation({ actor: input.actor, action: "CLIENT_INVITATION_REVOKE@1", idempotencyKey: input.idempotencyKey, expectedRevision: request.expectedRevision, request, operation: async (tx) => {
    const updated = await tx.jobSiteClientInvitation.updateMany({ where: { id: request.invitationId, jobSiteId: input.actor.jobSiteId, organizationId: input.actor.organizationId, status: "PENDING" }, data: { status: "REVOKED", activeKey: null, revokedAt: new Date() } });
    if (updated.count !== 1) throw new AccessError("Invito cliente non disponibile.", 404);
    await tx.jobSite.update({ where: { id: input.actor.jobSiteId }, data: { status: "DRAFT" } });
    return { invitationId: request.invitationId, status: "REVOKED" };
  } });
}

const participantLifecycleSchema = z.object({ expectedRevision: z.number().int().positive(), participantId: z.string().min(1), action: z.enum(["SUSPEND", "REACTIVATE", "REVOKE"]), reason: z.string().trim().min(10).max(2000) }).strict();
export async function transitionClientParticipation(input: { actor: JobSiteActor; idempotencyKey: string; rawInput: unknown }) {
  const request = participantLifecycleSchema.parse(input.rawInput);
  return executeIdempotentJobSiteMutation({ actor: input.actor, action: `CLIENT_PARTICIPATION_${request.action}@1`, idempotencyKey: input.idempotencyKey, expectedRevision: request.expectedRevision, request, operation: async (tx) => {
    const participant = await tx.jobSiteParticipant.findFirst({ where: { id: request.participantId, jobSiteId: input.actor.jobSiteId, organizationId: input.actor.organizationId, kind: "CLIENT", status: request.action === "REACTIVATE" ? "SUSPENDED" : { in: ["PENDING", "ACTIVE", "SUSPENDED"] } }, select: { id: true, userId: true } });
    if (!participant) throw new AccessError("Partecipazione cliente non disponibile.", 404);
    const status = request.action === "SUSPEND" ? "SUSPENDED" : request.action === "REACTIVATE" ? "ACTIVE" : "REVOKED";
    await tx.jobSiteParticipant.update({ where: { id: participant.id }, data: { status, accessVersion: { increment: 1 }, activeKey: status === "ACTIVE" ? `${input.actor.jobSiteId}:${participant.userId}:CLIENT` : null, primaryClientKey: status === "REVOKED" ? null : `${input.actor.jobSiteId}:PRIMARY_CLIENT`, ...(status === "SUSPENDED" ? { suspendedAt: new Date() } : {}), ...(status === "ACTIVE" ? { suspendedAt: null, activatedAt: new Date() } : {}), ...(status === "REVOKED" ? { revokedAt: new Date(), endedAt: new Date(), endReason: request.reason, endedByUserId: input.actor.userId } : {}) } });
    await tx.jobSiteAuthorityGrant.updateMany({ where: { participantId: participant.id, status: "ACTIVE" }, data: { status: "REVOKED", activeKey: null, revokedAt: new Date(), revokedByUserId: input.actor.userId } });
    return { participantId: participant.id, status };
  } });
}

export async function listClientHome() {
  const identity = await requireAccountRole("CLIENT");
  const [properties, participants] = await Promise.all([
    db.clientProperty.findMany({ where: { userId: identity.id, archivedAt: null }, include: { jobSites: { where: { archivedAt: null }, include: { jobSite: { select: { id: true, name: true, status: true, estimatedCompletionAt: true, organization: { select: { id: true, name: true, code: true } } } } } } }, orderBy: { displayName: "asc" } }),
    db.jobSiteParticipant.findMany({ where: { userId: identity.id, kind: "CLIENT", status: { in: ["PENDING", "ACTIVE"] } }, select: { id: true, jobSite: { select: { id: true, name: true, status: true, estimatedCompletionAt: true, organization: { select: { id: true, name: true, code: true } }, propertyLinks: { where: { archivedAt: null }, select: { id: true } } } } }, orderBy: { jobSite: { updatedAt: "desc" } } }),
  ]);
  return { properties, unlinkedJobSites: participants.filter((participant) => participant.jobSite.propertyLinks.length === 0) };
}

export async function createClientProperty(rawInput: unknown) {
  const identity = await requireAccountRole("CLIENT");
  const input = propertySchema.parse(rawInput);
  return db.clientProperty.create({ data: { userId: identity.id, displayName: input.displayName, addressLine: input.addressLine ?? null, city: input.city ?? null, postalCode: input.postalCode ?? null, countryCode: input.countryCode ?? null, privateNotes: input.privateNotes ?? null }, select: { id: true, displayName: true, addressLine: true, city: true, postalCode: true, countryCode: true, privateNotes: true, createdAt: true } });
}

export async function linkClientProperty(propertyId: string, jobSiteId: string) {
  const identity = await requireAccountRole("CLIENT");
  const [property, participant] = await Promise.all([
    db.clientProperty.findFirst({ where: { id: propertyId, userId: identity.id, archivedAt: null }, select: { id: true } }),
    db.jobSiteParticipant.findFirst({ where: { jobSiteId, userId: identity.id, kind: "CLIENT", status: "ACTIVE" }, select: { organizationId: true } }),
  ]);
  if (!property || !participant) throw new AccessError("Risorsa non disponibile.", 404);
  return db.clientPropertyJobSiteLink.upsert({ where: { jobSiteId }, create: { organizationId: participant.organizationId, propertyId, jobSiteId, linkedByUserId: identity.id }, update: { propertyId, archivedAt: null, linkedByUserId: identity.id } });
}

export async function getClientJobSiteDetail(jobSiteId: string) {
  const participant = await requireClientJobSiteDetailContext(jobSiteId);
  if (participant.status === "PENDING") {
    const pendingJobSite = await db.jobSite.findFirst({
      where: { id: jobSiteId, organizationId: participant.organizationId, status: "PENDING_INITIAL_CONFIRMATION" },
      select: {
        id: true, name: true, address: true, description: true, status: true, revision: true, estimatedCompletionAt: true, closedAt: true,
        organization: { select: { id: true, name: true, code: true } },
        initialAgreement: { select: { status: true, currentVersion: { select: { id: true, version: true, payload: true, fingerprint: true } } } },
      },
    });
    if (!pendingJobSite) throw new AccessError("Cantiere non trovato.", 404);
    return {
      ...pendingJobSite,
      participants: [], steps: [], requests: [], timelineEvents: [], changeProposals: [], paymentRequests: [], disputes: [], closures: [], postClosureRequests: [], reopeningProposals: [], attachments: [],
    };
  }
  const jobSite = await db.jobSite.findFirst({
    where: { id: jobSiteId, organizationId: participant.organizationId },
    select: {
      id: true, name: true, address: true, description: true, status: true, revision: true, estimatedCompletionAt: true, closedAt: true,
      organization: { select: { id: true, name: true, code: true } },
      initialAgreement: { select: { status: true, currentVersion: { select: { id: true, version: true, payload: true, fingerprint: true } } } },
      participants: { where: { kind: "ORGANIZATION_MEMBER", status: "ACTIVE" }, select: { id: true, publicRoleLabel: true, user: { select: { firstName: true, lastName: true } } } },
      steps: { orderBy: { sortOrder: "asc" } },
      requests: { where: { status: { in: ["OPEN", "RESPONDED"] } }, orderBy: { updatedAt: "desc" } },
      timelineEvents: { where: { audience: "SHARED" }, orderBy: { sequence: "desc" }, take: 50 },
      changeProposals: { where: { status: { not: "DRAFT" } }, orderBy: { updatedAt: "desc" }, include: { currentVersion: true } },
      paymentRequests: {
        where: { status: { not: "DRAFT" } },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true, status: true, amountMinor: true, reason: true, requestedAt: true, dueAt: true, confirmedAt: true, createdAt: true,
          requestedByParticipant: { select: { publicRoleLabel: true, user: { select: { firstName: true, lastName: true } } } },
        },
      },
      disputes: { orderBy: { openedAt: "desc" } },
      closures: { orderBy: { proposedAt: "desc" }, take: 10, include: { consents: { select: { decision: true, participant: { select: { kind: true } } } } } },
      postClosureRequests: { orderBy: { createdAt: "desc" }, take: 20 },
      reopeningProposals: { orderBy: { proposedAt: "desc" }, take: 20, include: { consents: { select: { decision: true, participant: { select: { id: true, kind: true } } } } } },
      attachments: { where: { publications: { some: { audience: "SHARED", withdrawnAt: null } } }, select: { id: true, category: true, sourceId: true, originalFileName: true, size: true, createdAt: true } },
    },
  });
  if (!jobSite) throw new AccessError("Cantiere non trovato.", 404);
  return jobSite;
}
