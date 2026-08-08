import "server-only";

import { db, Prisma } from "@qoovex/db";
import { z } from "zod";
import { AccessError } from "./access-errors";
import { requireOrganizationContext } from "./access-context-service";
import { appendTimelineSchema, closureSnapshotSchema, createProposalSchema, createStepSchema, effectPayloadSchemas, fingerprintPayload } from "./job-site-contracts";
import { executeIdempotentJobSiteMutation } from "./job-site-idempotency-service";
import { enqueueJobSiteProcess } from "./job-site-process-service";
import { recordProductAuditEvent } from "./product-audit-service";

function encodeTimelineCursor(sequence: bigint) { return Buffer.from(sequence.toString(), "utf8").toString("base64url"); }
function decodeTimelineCursor(cursor: string | null) { if (!cursor) return null; try { return BigInt(Buffer.from(cursor, "base64url").toString("utf8")); } catch { throw new AccessError("Cursor timeline non valido.", 409); } }

export async function listTimeline(input: { actor: JobSiteActor; cursor: string | null }) {
  await revalidateActor(input.actor);
  const before = decodeTimelineCursor(input.cursor);
  const events = await db.jobSiteTimelineEvent.findMany({
    where: { jobSiteId: input.actor.jobSiteId, ...(input.actor.side === "CLIENT" ? { audience: "SHARED" as const } : {}), ...(before === null ? {} : { sequence: { lt: before } }) },
    select: { id: true, jobSiteId: true, sequence: true, type: true, audience: true, disclosure: true, actorKind: true, stepId: true, title: true, body: true, replyToEventId: true, payload: true, occurredAt: true, createdAt: true },
    orderBy: { sequence: "desc" }, take: 51,
  });
  const more = events.length > 50;
  if (more) events.pop();
  return { items: events.map((event) => ({ ...event, sequence: event.sequence.toString() })), nextCursor: more && events.length ? encodeTimelineCursor(events[events.length - 1]!.sequence) : null };
}

const responsibleSchema = z.object({ expectedRevision: z.number().int().positive(), participantId: z.string().min(1) }).strict();
export async function changeJobSiteResponsible(input: { actor: JobSiteActor; idempotencyKey: string; body: unknown }) {
  if (input.actor.side !== "ORGANIZATION_MEMBER") throw new AccessError("Azione riservata all'Azienda.", 403);
  const body = responsibleSchema.parse(input.body);
  return executeIdempotentJobSiteMutation({ actor: input.actor, action: "JOB_SITE_RESPONSIBLE_CHANGE@1", idempotencyKey: input.idempotencyKey, expectedRevision: body.expectedRevision, request: body, operation: async (tx) => {
    const participant = await tx.jobSiteParticipant.findFirst({ where: { id: body.participantId, jobSiteId: input.actor.jobSiteId, organizationId: input.actor.organizationId, kind: "ORGANIZATION_MEMBER", status: "ACTIVE" }, select: { id: true } });
    if (!participant) throw new AccessError("Responsabile non disponibile.", 404);
    await tx.jobSite.update({ where: { id: input.actor.jobSiteId }, data: { responsibleParticipantId: participant.id } });
    return { responsibleParticipantId: participant.id };
  } });
}
import { revalidateActor, requireEconomicAuthority, type JobSiteActor } from "./job-site-authorization-service";

async function nextTimelineSequence(tx: Prisma.TransactionClient, jobSiteId: string) {
  return (await tx.jobSite.update({ where: { id: jobSiteId }, data: { timelineSequence: { increment: 1 } }, select: { timelineSequence: true } })).timelineSequence;
}

async function requireSiteStatus(tx: Prisma.TransactionClient, jobSiteId: string, allowed: readonly string[]) {
  const site = await tx.jobSite.findUnique({ where: { id: jobSiteId }, select: { status: true } });
  if (!site || !allowed.includes(site.status)) throw new AccessError("Azione non disponibile nello stato corrente del cantiere.", 409, "JOB_SITE_STATE_CONFLICT");
  return site.status;
}

export async function appendTimeline(input: { actor: JobSiteActor; idempotencyKey: string; body: unknown }) {
  const body = appendTimelineSchema.parse(input.body);
  if (input.actor.side === "CLIENT" && body.audience !== "SHARED") throw new AccessError("Il cliente puo pubblicare soltanto nella timeline condivisa.", 403);
  if (input.actor.side === "CLIENT" && body.disclosure === "RESTRICTED_COMMERCIAL") throw new AccessError("Disclosure non disponibile per un commento cliente.", 403);
  return executeIdempotentJobSiteMutation({
    actor: input.actor,
    action: "TIMELINE_APPEND@1",
    idempotencyKey: input.idempotencyKey,
    expectedRevision: body.expectedRevision,
    request: body,
    operation: async (tx) => {
      await requireSiteStatus(tx, input.actor.jobSiteId, input.actor.side === "CLIENT" ? ["ACTIVE", "CLOSURE_PROPOSED"] : ["DRAFT", "WAITING_FOR_CLIENT", "PENDING_INITIAL_CONFIRMATION", "ACTIVE", "CLOSURE_PROPOSED"]);
      if (body.attachmentIds.length) {
        const count = await tx.jobSiteAttachment.count({ where: { id: { in: body.attachmentIds }, jobSiteId: input.actor.jobSiteId, archivedAt: null } });
        if (count !== body.attachmentIds.length) throw new AccessError("Uno o piu allegati non sono disponibili.", 404);
      }
      if (body.replyToEventId) {
        const replyTarget = await tx.jobSiteTimelineEvent.findFirst({ where: { id: body.replyToEventId, jobSiteId: input.actor.jobSiteId, ...(input.actor.side === "CLIENT" ? { audience: "SHARED" } : {}) }, select: { id: true } });
        if (!replyTarget) throw new AccessError("Evento a cui rispondere non disponibile.", 404);
      }
      const sequence = await nextTimelineSequence(tx, input.actor.jobSiteId);
      const event = await tx.jobSiteTimelineEvent.create({ data: { organizationId: input.actor.organizationId, jobSiteId: input.actor.jobSiteId, sequence, type: body.type, audience: body.audience, disclosure: body.disclosure, actorKind: input.actor.side, actorUserId: input.actor.userId, actorParticipantId: input.actor.participantId, stepId: body.stepId ?? null, title: body.payload.title, body: body.payload.body, replyToEventId: body.replyToEventId ?? null, payload: body.payload as Prisma.InputJsonValue, fingerprint: fingerprintPayload(body.payload), attachments: { create: body.attachmentIds.map((attachmentId) => ({ attachmentId })) } }, select: { id: true, sequence: true } });
      if (body.audience === "SHARED" && body.attachmentIds.length) await tx.jobSiteAttachmentPublication.createMany({ data: body.attachmentIds.map((attachmentId) => ({ attachmentId, eventId: event.id, audience: "SHARED", disclosure: body.disclosure, publishedByUserId: input.actor.userId })) });
      return { eventId: event.id, sequence: event.sequence.toString() };
    },
  });
}

export async function createStep(input: { actor: JobSiteActor; idempotencyKey: string; body: unknown; expectedRevision: number }) {
  if (input.actor.side !== "ORGANIZATION_MEMBER") throw new AccessError("Azione riservata all'Azienda.", 403);
  const body = createStepSchema.parse(input.body);
  return executeIdempotentJobSiteMutation({
    actor: input.actor, action: "STEP_CREATE@1", idempotencyKey: input.idempotencyKey, expectedRevision: input.expectedRevision, request: body,
    operation: async (tx) => {
      const site = await tx.jobSite.findUnique({ where: { id: input.actor.jobSiteId }, select: { status: true } });
      if (!site || ["ACTIVE", "CLOSURE_PROPOSED", "CLOSED", "ARCHIVED"].includes(site.status)) throw new AccessError("Dopo l'attivazione un nuovo step richiede una proposta accettata.", 409);
      const step = await tx.jobSiteStep.create({ data: { organizationId: input.actor.organizationId, jobSiteId: input.actor.jobSiteId, title: body.title, description: body.description ?? null, expectedOutcome: body.expectedOutcome ?? null, sortOrder: body.sortOrder, indicativeDate: body.indicativeDate ? new Date(body.indicativeDate) : null, estimatedCompletionAt: body.estimatedCompletionAt ? new Date(body.estimatedCompletionAt) : null, economicValueMinor: body.economicValueMinor, createdByUserId: input.actor.userId }, select: { id: true, status: true } });
      const sequence = await nextTimelineSequence(tx, input.actor.jobSiteId);
      await tx.jobSiteTimelineEvent.create({ data: { organizationId: input.actor.organizationId, jobSiteId: input.actor.jobSiteId, sequence, type: "STEP_CREATED", audience: "SHARED", disclosure: body.economicValueMinor == null ? "GENERAL" : "COMMERCIAL", actorKind: input.actor.side, actorUserId: input.actor.userId, actorParticipantId: input.actor.participantId, stepId: step.id, payload: { schemaVersion: 1, stepId: step.id, title: body.title }, fingerprint: fingerprintPayload({ stepId: step.id, title: body.title }) } });
      return { stepId: step.id, status: step.status };
    },
  });
}

const createRequestSchema = z.object({ expectedRevision: z.number().int().positive(), type: z.enum(["CLARIFICATION", "INFORMATION", "WORK_UPDATE", "DOCUMENT", "ISSUE", "OTHER"]), title: z.string().trim().min(1).max(200), body: z.string().trim().min(1).max(10_000), blocking: z.boolean().default(false), stepId: z.string().min(1).nullable().optional(), proposalId: z.string().min(1).nullable().optional(), paymentRequestId: z.string().min(1).nullable().optional(), timelineEventId: z.string().min(1).nullable().optional() }).strict();

export async function createStructuredRequest(input: { actor: JobSiteActor; idempotencyKey: string; body: unknown }) {
  const body = createRequestSchema.parse(input.body);
  return executeIdempotentJobSiteMutation({ actor: input.actor, action: "JOB_SITE_REQUEST_CREATE@1", idempotencyKey: input.idempotencyKey, expectedRevision: body.expectedRevision, request: body, operation: async (tx) => {
    await requireSiteStatus(tx, input.actor.jobSiteId, ["ACTIVE", "CLOSURE_PROPOSED"]);
    const request = await tx.jobSiteRequest.create({ data: { organizationId: input.actor.organizationId, jobSiteId: input.actor.jobSiteId, openedByParticipantId: input.actor.participantId, type: body.type, assignedSide: input.actor.side === "CLIENT" ? "ORGANIZATION_MEMBER" : "CLIENT", title: body.title, body: body.body, blocking: body.blocking, stepId: body.stepId ?? null, proposalId: body.proposalId ?? null, paymentRequestId: body.paymentRequestId ?? null, timelineEventId: body.timelineEventId ?? null }, select: { id: true, status: true } });
    const sequence = await nextTimelineSequence(tx, input.actor.jobSiteId);
    const payload = { schemaVersion: 1, requestId: request.id, title: body.title, requestType: body.type };
    await tx.jobSiteTimelineEvent.create({ data: { organizationId: input.actor.organizationId, jobSiteId: input.actor.jobSiteId, sequence, type: "CLARIFICATION_REQUESTED", audience: "SHARED", disclosure: "GENERAL", actorKind: input.actor.side, actorUserId: input.actor.userId, actorParticipantId: input.actor.participantId, stepId: body.stepId ?? null, payload, fingerprint: fingerprintPayload(payload) } });
    return { requestId: request.id, status: request.status };
  } });
}

const requestTransitionSchema = z.object({ expectedRevision: z.number().int().positive(), action: z.enum(["RESPOND", "RESOLVE", "WITHDRAW"]), message: z.string().trim().min(1).max(10_000) }).strict();

export async function transitionStructuredRequest(input: { actor: JobSiteActor; requestId: string; idempotencyKey: string; body: unknown }) {
  const body = requestTransitionSchema.parse(input.body);
  return executeIdempotentJobSiteMutation({ actor: input.actor, action: `JOB_SITE_REQUEST_${body.action}@1`, idempotencyKey: input.idempotencyKey, expectedRevision: body.expectedRevision, request: body, operation: async (tx) => {
    await requireSiteStatus(tx, input.actor.jobSiteId, ["ACTIVE", "CLOSURE_PROPOSED"]);
    const request = await tx.jobSiteRequest.findFirst({ where: { id: input.requestId, jobSiteId: input.actor.jobSiteId, status: { in: ["OPEN", "RESPONDED"] } }, select: { id: true, openedByParticipantId: true, assignedSide: true, stepId: true } });
    if (!request) throw new AccessError("Richiesta non disponibile.", 409);
    const owns = request.openedByParticipantId === input.actor.participantId;
    if (body.action === "RESPOND" && request.assignedSide !== input.actor.side) throw new AccessError("Risposta non autorizzata.", 403);
    if ((body.action === "RESOLVE" || body.action === "WITHDRAW") && !owns) throw new AccessError("Solo chi ha aperto la richiesta può chiuderla.", 403);
    const status = body.action === "RESPOND" ? "RESPONDED" : body.action === "RESOLVE" ? "RESOLVED" : "WITHDRAWN";
    await tx.jobSiteRequest.update({ where: { id: request.id }, data: { status, revision: { increment: 1 }, ...(status === "RESOLVED" ? { resolvedAt: new Date() } : {}) } });
    const sequence = await nextTimelineSequence(tx, input.actor.jobSiteId);
    const payload = { schemaVersion: 1, requestId: request.id, action: body.action, message: body.message };
    await tx.jobSiteTimelineEvent.create({ data: { organizationId: input.actor.organizationId, jobSiteId: input.actor.jobSiteId, sequence, type: body.action === "RESPOND" ? "CLARIFICATION_RESPONDED" : "WORK_UPDATE", audience: "SHARED", disclosure: "GENERAL", actorKind: input.actor.side, actorUserId: input.actor.userId, actorParticipantId: input.actor.participantId, stepId: request.stepId, payload, fingerprint: fingerprintPayload(payload) } });
    return { requestId: request.id, status };
  } });
}

export async function createChangeProposal(input: { actor: JobSiteActor; idempotencyKey: string; body: unknown }) {
  const body = createProposalSchema.parse(input.body);
  if (body.representedSide !== input.actor.side) throw new AccessError("La parte rappresentata non coincide con l'attore.", 403);
  const authorityGrantId = input.actor.side === "ORGANIZATION_MEMBER" ? await requireEconomicAuthority(input.actor.participantId, "COMMERCIAL_NEGOTIATE") : null;
  const normalizedEffects = body.effects.map((effect, ordinal) => ({ ...effect, ordinal, payload: effectPayloadSchemas[effect.type].parse(effect.payload) }));
  const execution = await executeIdempotentJobSiteMutation({
    actor: input.actor, action: "CHANGE_PROPOSAL_CREATE@1", idempotencyKey: input.idempotencyKey, expectedRevision: body.expectedRevision, request: body,
    operation: async (tx) => {
      await requireSiteStatus(tx, input.actor.jobSiteId, ["ACTIVE"]);
      const proposal = await tx.jobSiteChangeProposal.create({ data: { organizationId: input.actor.organizationId, jobSiteId: input.actor.jobSiteId, status: "DRAFT", representedSide: body.representedSide, createdByParticipantId: input.actor.participantId, activeKey: `${input.actor.jobSiteId}:${input.idempotencyKey}`, expiresAt: body.expiresAt ? new Date(body.expiresAt) : null }, select: { id: true } });
      const versionFingerprint = fingerprintPayload({ payload: body.payload, effects: normalizedEffects });
      const version = await tx.jobSiteChangeProposalVersion.create({ data: { proposalId: proposal.id, version: 1, payload: body.payload as Prisma.InputJsonValue, fingerprint: versionFingerprint, previousPriceMinor: body.payload.previousPriceMinor == null ? null : BigInt(body.payload.previousPriceMinor), economicDeltaMinor: body.payload.economicDeltaMinor == null ? null : BigInt(body.payload.economicDeltaMinor), rangeMinimumMinor: body.payload.rangeMinimumMinor == null ? null : BigInt(body.payload.rangeMinimumMinor), rangeMaximumMinor: body.payload.rangeMaximumMinor == null ? null : BigInt(body.payload.rangeMaximumMinor), estimatedCompletionAt: body.payload.estimatedCompletionAt ? new Date(body.payload.estimatedCompletionAt) : null, createdByParticipantId: input.actor.participantId, effects: { create: normalizedEffects.map((effect) => ({ ordinal: effect.ordinal, type: effect.type, payload: effect.payload as Prisma.InputJsonValue, fingerprint: fingerprintPayload(effect.payload) })) } }, select: { id: true } });
      await tx.jobSiteChangeProposalConsent.create({ data: { versionId: version.id, participantId: input.actor.participantId, decision: "ACCEPTED", fingerprint: versionFingerprint } });
      await tx.jobSiteChangeProposal.update({ where: { id: proposal.id }, data: { status: "PROPOSED", currentVersionId: version.id } });
      const sequence = await nextTimelineSequence(tx, input.actor.jobSiteId);
      await tx.jobSiteTimelineEvent.create({ data: { organizationId: input.actor.organizationId, jobSiteId: input.actor.jobSiteId, sequence, type: "CHANGE_PROPOSED", audience: "SHARED", disclosure: "COMMERCIAL", actorKind: input.actor.side, actorUserId: input.actor.userId, actorParticipantId: input.actor.participantId, payload: { schemaVersion: 1, proposalId: proposal.id, versionId: version.id }, fingerprint: versionFingerprint } });
      return { proposalId: proposal.id, versionId: version.id, status: "PROPOSED", authorityGrantId };
    },
  });
  await enqueueJobSiteProcess({ organizationId: input.actor.organizationId, jobSiteId: input.actor.jobSiteId, definitionKey: "CHANGE_NEGOTIATION@1", businessKey: String(execution.result.proposalId), payload: { proposalId: execution.result.proposalId } });
  return execution;
}

const counterProposalSchema = createProposalSchema.omit({ representedSide: true }).extend({ expectedCurrentVersion: z.number().int().positive() }).strict();

export async function counterChangeProposal(input: { actor: JobSiteActor; proposalId: string; idempotencyKey: string; body: unknown }) {
  const body = counterProposalSchema.parse(input.body);
  const authorityGrantId = input.actor.side === "ORGANIZATION_MEMBER" ? await requireEconomicAuthority(input.actor.participantId, "COMMERCIAL_NEGOTIATE") : null;
  const normalizedEffects = body.effects.map((effect, ordinal) => ({ ...effect, ordinal, payload: effectPayloadSchemas[effect.type].parse(effect.payload) }));
  return executeIdempotentJobSiteMutation({ actor: input.actor, action: "CHANGE_PROPOSAL_COUNTER@1", idempotencyKey: input.idempotencyKey, expectedRevision: body.expectedRevision, request: body, operation: async (tx) => {
    await requireSiteStatus(tx, input.actor.jobSiteId, ["ACTIVE"]);
    const proposal = await tx.jobSiteChangeProposal.findFirst({ where: { id: input.proposalId, jobSiteId: input.actor.jobSiteId, status: { in: ["PROPOSED", "COUNTERED"] }, currentVersion: { version: body.expectedCurrentVersion } }, select: { id: true, representedSide: true } });
    if (!proposal || proposal.representedSide === input.actor.side) throw new AccessError("Proposta non disponibile per una controproposta.", 409, "STALE_PROPOSAL_VERSION");
    const versionNumber = body.expectedCurrentVersion + 1;
    const versionFingerprint = fingerprintPayload({ payload: body.payload, effects: normalizedEffects });
    const version = await tx.jobSiteChangeProposalVersion.create({ data: { proposalId: proposal.id, version: versionNumber, payload: body.payload as Prisma.InputJsonValue, fingerprint: versionFingerprint, previousPriceMinor: body.payload.previousPriceMinor == null ? null : BigInt(body.payload.previousPriceMinor), economicDeltaMinor: body.payload.economicDeltaMinor == null ? null : BigInt(body.payload.economicDeltaMinor), rangeMinimumMinor: body.payload.rangeMinimumMinor == null ? null : BigInt(body.payload.rangeMinimumMinor), rangeMaximumMinor: body.payload.rangeMaximumMinor == null ? null : BigInt(body.payload.rangeMaximumMinor), estimatedCompletionAt: body.payload.estimatedCompletionAt ? new Date(body.payload.estimatedCompletionAt) : null, createdByParticipantId: input.actor.participantId, effects: { create: normalizedEffects.map((effect) => ({ ordinal: effect.ordinal, type: effect.type, payload: effect.payload as Prisma.InputJsonValue, fingerprint: fingerprintPayload(effect.payload) })) }, consents: { create: { participantId: input.actor.participantId, decision: "ACCEPTED", fingerprint: versionFingerprint } } }, select: { id: true } });
    await tx.jobSiteChangeProposal.update({ where: { id: proposal.id }, data: { status: "COUNTERED", representedSide: input.actor.side, currentVersionId: version.id, expiresAt: body.expiresAt ? new Date(body.expiresAt) : null } });
    const sequence = await nextTimelineSequence(tx, input.actor.jobSiteId);
    await tx.jobSiteTimelineEvent.create({ data: { organizationId: input.actor.organizationId, jobSiteId: input.actor.jobSiteId, sequence, type: "CHANGE_COUNTERED", audience: "SHARED", disclosure: "COMMERCIAL", actorKind: input.actor.side, actorUserId: input.actor.userId, actorParticipantId: input.actor.participantId, payload: { schemaVersion: 1, proposalId: proposal.id, versionId: version.id, version: versionNumber }, fingerprint: versionFingerprint } });
    return { proposalId: proposal.id, versionId: version.id, version: versionNumber, status: "COUNTERED", authorityGrantId };
  } });
}

const proposalDecisionSchema = z.object({ expectedRevision: z.number().int().positive(), expectedCurrentVersion: z.number().int().positive() }).strict();

export async function withdrawChangeProposal(input: { actor: JobSiteActor; proposalId: string; idempotencyKey: string; body: unknown }) {
  const body = proposalDecisionSchema.parse(input.body);
  return executeIdempotentJobSiteMutation({ actor: input.actor, action: "CHANGE_PROPOSAL_WITHDRAW@1", idempotencyKey: input.idempotencyKey, expectedRevision: body.expectedRevision, request: body, operation: async (tx) => {
    await requireSiteStatus(tx, input.actor.jobSiteId, ["ACTIVE"]);
    const proposal = await tx.jobSiteChangeProposal.findFirst({ where: { id: input.proposalId, jobSiteId: input.actor.jobSiteId, representedSide: input.actor.side, status: { in: ["PROPOSED", "COUNTERED"] }, currentVersion: { version: body.expectedCurrentVersion } }, select: { id: true } });
    if (!proposal) throw new AccessError("Proposta non disponibile.", 409, "STALE_PROPOSAL_VERSION");
    await tx.jobSiteChangeProposal.update({ where: { id: proposal.id }, data: { status: "WITHDRAWN", activeKey: null, withdrawnAt: new Date() } });
    const sequence = await nextTimelineSequence(tx, input.actor.jobSiteId);
    const payload = { schemaVersion: 1, proposalId: proposal.id, version: body.expectedCurrentVersion };
    await tx.jobSiteTimelineEvent.create({ data: { organizationId: input.actor.organizationId, jobSiteId: input.actor.jobSiteId, sequence, type: "CHANGE_WITHDRAWN", audience: "SHARED", disclosure: "COMMERCIAL", actorKind: input.actor.side, actorUserId: input.actor.userId, actorParticipantId: input.actor.participantId, payload, fingerprint: fingerprintPayload(payload) } });
    return { proposalId: proposal.id, status: "WITHDRAWN" };
  } });
}

export async function expireChangeProposals(now = new Date()) {
  const proposals = await db.jobSiteChangeProposal.findMany({ where: { status: { in: ["PROPOSED", "COUNTERED"] }, expiresAt: { lte: now } }, select: { id: true }, take: 100 });
  if (!proposals.length) return 0;
  return (await db.jobSiteChangeProposal.updateMany({ where: { id: { in: proposals.map((value) => value.id) }, status: { in: ["PROPOSED", "COUNTERED"] } }, data: { status: "EXPIRED", activeKey: null } })).count;
}

const disputeSchema = z.object({ expectedRevision: z.number().int().positive(), title: z.string().trim().min(1).max(200), description: z.string().trim().min(1).max(10_000), references: z.array(z.object({ type: z.enum(["ATTACHMENT", "TIMELINE_EVENT", "STEP", "REQUEST", "CHANGE_PROPOSAL", "PAYMENT_REQUEST", "DISPUTE", "CLOSURE", "EXPORT"]), targetId: z.string().min(1) })).max(100).default([]) }).strict();

export async function createDispute(input: { actor: JobSiteActor; idempotencyKey: string; body: unknown }) {
  const body = disputeSchema.parse(input.body);
  return executeIdempotentJobSiteMutation({ actor: input.actor, action: "DISPUTE_CREATE@1", idempotencyKey: input.idempotencyKey, expectedRevision: body.expectedRevision, request: body, operation: async (tx) => {
    await requireSiteStatus(tx, input.actor.jobSiteId, ["ACTIVE", "CLOSURE_PROPOSED"]);
    const dispute = await tx.jobSiteDispute.create({ data: { organizationId: input.actor.organizationId, jobSiteId: input.actor.jobSiteId, openedByParticipantId: input.actor.participantId, title: body.title, description: body.description, references: { create: body.references } }, select: { id: true, status: true } });
    const preservation = { schemaVersion: 1, disputeId: dispute.id, references: body.references, preservedAt: new Date().toISOString() };
    await tx.jobSiteDisputePreservation.create({ data: { disputeId: dispute.id, snapshot: preservation as Prisma.InputJsonValue, fingerprint: fingerprintPayload(preservation) } });
    const sequence = await nextTimelineSequence(tx, input.actor.jobSiteId);
    await tx.jobSiteTimelineEvent.create({ data: { organizationId: input.actor.organizationId, jobSiteId: input.actor.jobSiteId, sequence, type: "ISSUE_REPORTED", audience: "SHARED", disclosure: "GENERAL", actorKind: input.actor.side, actorUserId: input.actor.userId, actorParticipantId: input.actor.participantId, payload: { schemaVersion: 1, disputeId: dispute.id, title: body.title }, fingerprint: fingerprintPayload({ disputeId: dispute.id, title: body.title }) } });
    return { disputeId: dispute.id, status: dispute.status };
  } });
}

const disputeTransitionSchema = z.object({ expectedRevision: z.number().int().positive(), action: z.enum(["RESPOND", "AGREE", "WITHDRAW", "CLOSE_WITHOUT_AGREEMENT"]), message: z.string().trim().min(1).max(10_000) }).strict();

export async function transitionDispute(input: { actor: JobSiteActor; disputeId: string; idempotencyKey: string; body: unknown }) {
  const body = disputeTransitionSchema.parse(input.body);
  return executeIdempotentJobSiteMutation({ actor: input.actor, action: `DISPUTE_${body.action}@1`, idempotencyKey: input.idempotencyKey, expectedRevision: body.expectedRevision, request: body, operation: async (tx) => {
    await requireSiteStatus(tx, input.actor.jobSiteId, ["ACTIVE", "CLOSURE_PROPOSED"]);
    const dispute = await tx.jobSiteDispute.findFirst({ where: { id: input.disputeId, jobSiteId: input.actor.jobSiteId, status: { in: ["OPEN", "IN_DISCUSSION"] } }, select: { id: true, openedByParticipantId: true } });
    if (!dispute) throw new AccessError("Disputa non disponibile.", 409);
    const resolutionFingerprint = fingerprintPayload({ disputeId: dispute.id, action: body.action, message: body.message });
    let status: "IN_DISCUSSION" | "RESOLVED_BY_AGREEMENT" | "WITHDRAWN" | "CLOSED_WITHOUT_AGREEMENT" = "IN_DISCUSSION";
    if (body.action === "WITHDRAW") {
      if (dispute.openedByParticipantId !== input.actor.participantId) throw new AccessError("Solo l'autore può ritirare la disputa.", 403);
      status = "WITHDRAWN";
    } else if (body.action === "AGREE" || body.action === "CLOSE_WITHOUT_AGREEMENT") {
      await tx.jobSiteDisputeConsent.upsert({ where: { disputeId_participantId_resolutionFingerprint: { disputeId: dispute.id, participantId: input.actor.participantId, resolutionFingerprint } }, create: { disputeId: dispute.id, participantId: input.actor.participantId, decision: body.action === "AGREE" ? "ACCEPTED" : "REJECTED", resolutionFingerprint }, update: {} });
      const consents = await tx.jobSiteDisputeConsent.findMany({ where: { disputeId: dispute.id, resolutionFingerprint }, select: { participant: { select: { kind: true } } } });
      const mutual = consents.some((value) => value.participant.kind === "CLIENT") && consents.some((value) => value.participant.kind === "ORGANIZATION_MEMBER");
      status = mutual ? (body.action === "AGREE" ? "RESOLVED_BY_AGREEMENT" : "CLOSED_WITHOUT_AGREEMENT") : "IN_DISCUSSION";
    }
    await tx.jobSiteDispute.update({ where: { id: dispute.id }, data: { status, revision: { increment: 1 }, ...(status === "WITHDRAWN" ? { withdrawnAt: new Date() } : {}), ...(["RESOLVED_BY_AGREEMENT", "CLOSED_WITHOUT_AGREEMENT"].includes(status) ? { resolvedAt: new Date() } : {}) } });
    const sequence = await nextTimelineSequence(tx, input.actor.jobSiteId);
    const payload = { schemaVersion: 1, disputeId: dispute.id, action: body.action, message: body.message, status };
    await tx.jobSiteTimelineEvent.create({ data: { organizationId: input.actor.organizationId, jobSiteId: input.actor.jobSiteId, sequence, type: status === "RESOLVED_BY_AGREEMENT" || status === "CLOSED_WITHOUT_AGREEMENT" ? "WORK_UPDATE" : "ISSUE_REPORTED", audience: "SHARED", disclosure: "GENERAL", actorKind: input.actor.side, actorUserId: input.actor.userId, actorParticipantId: input.actor.participantId, payload, fingerprint: fingerprintPayload(payload) } });
    return { disputeId: dispute.id, status };
  } });
}

export async function proposeClosure(input: { actor: JobSiteActor; idempotencyKey: string; expectedRevision: number }) {
  if (input.actor.side !== "ORGANIZATION_MEMBER") throw new AccessError("Azione riservata all'Azienda.", 403);
  const authorityGrantId = await requireEconomicAuthority(input.actor.participantId, "CLOSURE_PROPOSE");
  const execution = await executeIdempotentJobSiteMutation({ actor: input.actor, action: "CLOSURE_PROPOSE@1", idempotencyKey: input.idempotencyKey, expectedRevision: input.expectedRevision, request: { expectedRevision: input.expectedRevision }, operation: async (tx) => {
    const [openSteps, proposals, requests, payments, disputes, activeEconomicProcesses, jobSite, participantSnapshot, stepSnapshot, paymentSnapshot] = await Promise.all([
      tx.jobSiteStep.count({ where: { jobSiteId: input.actor.jobSiteId, status: { notIn: ["CONFIRMED", "CANCELLED"] } } }),
      tx.jobSiteChangeProposal.count({ where: { jobSiteId: input.actor.jobSiteId, status: { in: ["DRAFT", "PROPOSED", "COUNTERED"] } } }),
      tx.jobSiteRequest.count({ where: { jobSiteId: input.actor.jobSiteId, status: { in: ["OPEN", "RESPONDED"] } } }),
      tx.jobSitePaymentRequest.count({ where: { jobSiteId: input.actor.jobSiteId, status: { in: ["DRAFT", "REQUESTED", "TRANSFER_DECLARED", "UNDER_REVIEW", "DISPUTED"] } } }),
      tx.jobSiteDispute.count({ where: { jobSiteId: input.actor.jobSiteId, status: { in: ["OPEN", "IN_DISCUSSION"] } } }),
      tx.jobSiteProcess.count({ where: { jobSiteId: input.actor.jobSiteId, definitionKey: { in: ["CHANGE_NEGOTIATION@1", "PAYMENT_REQUEST@1"] }, status: { in: ["PENDING", "RUNNING", "WAITING"] } } }),
      tx.jobSite.findUniqueOrThrow({ where: { id: input.actor.jobSiteId }, select: { id: true, name: true, address: true, estimatedCompletionAt: true, revision: true, timelineSequence: true, status: true } }),
      tx.jobSiteParticipant.findMany({ where: { jobSiteId: input.actor.jobSiteId, status: "ACTIVE" }, select: { id: true, kind: true, publicRoleLabel: true }, orderBy: { createdAt: "asc" } }),
      tx.jobSiteStep.findMany({ where: { jobSiteId: input.actor.jobSiteId }, select: { id: true, title: true, status: true }, orderBy: { sortOrder: "asc" } }),
      tx.jobSitePaymentRequest.findMany({ where: { jobSiteId: input.actor.jobSiteId, status: { not: "DRAFT" } }, select: { id: true, status: true, amountMinor: true }, orderBy: { createdAt: "asc" } }),
    ]);
    if (openSteps || proposals || requests || payments || disputes || activeEconomicProcesses) throw new AccessError("Esistono elementi aperti che impediscono la chiusura.", 409, "CLOSURE_PRECONDITIONS_FAILED");
    if (jobSite.status !== "ACTIVE") throw new AccessError("Il cantiere non e attivo.", 409);
    const snapshot = closureSnapshotSchema.parse({ schemaVersion: 1, jobSiteRevision: jobSite.revision, timelineSequence: jobSite.timelineSequence.toString(), openStepCount: openSteps, negotiatingProposalCount: proposals, unresolvedRequestCount: requests, pendingPaymentCount: payments, openDisputeCount: disputes, statement: "Alla data indicata, le parti registrano che non risultano ulteriori attività, proposte, richieste o pagamenti aperti nello spazio condiviso.", jobSite: { id: jobSite.id, name: jobSite.name, address: jobSite.address, estimatedCompletionAt: jobSite.estimatedCompletionAt?.toISOString() ?? null }, participants: participantSnapshot, steps: stepSnapshot, payments: paymentSnapshot.map((payment) => ({ ...payment, amountMinor: payment.amountMinor.toString() })) });
    const closure = await tx.jobSiteClosure.create({ data: { organizationId: input.actor.organizationId, jobSiteId: input.actor.jobSiteId, status: "PENDING_CLIENT_CONFIRMATION", jobSiteRevision: jobSite.revision + 1, timelineSequence: jobSite.timelineSequence, snapshot: snapshot as Prisma.InputJsonValue, fingerprint: fingerprintPayload(snapshot), proposedByParticipantId: input.actor.participantId }, select: { id: true } });
    await tx.jobSite.update({ where: { id: input.actor.jobSiteId }, data: { status: "CLOSURE_PROPOSED" } });
    return { closureId: closure.id, status: "PENDING_CLIENT_CONFIRMATION", authorityGrantId };
  } });
  await enqueueJobSiteProcess({ organizationId: input.actor.organizationId, jobSiteId: input.actor.jobSiteId, definitionKey: "JOB_SITE_CLOSURE@1", businessKey: String(execution.result.closureId), payload: { closureId: execution.result.closureId } });
  return execution;
}

const postClosureSchema = z.object({ expectedRevision: z.number().int().positive(), title: z.string().trim().min(1).max(200), body: z.string().trim().min(1).max(10_000) }).strict();

export async function createPostClosureRequest(input: { actor: JobSiteActor; idempotencyKey: string; body: unknown }) {
  const body = postClosureSchema.parse(input.body);
  const execution = await executeIdempotentJobSiteMutation({ actor: input.actor, action: "POST_CLOSURE_REQUEST_CREATE@1", idempotencyKey: input.idempotencyKey, expectedRevision: body.expectedRevision, request: body, operation: async (tx) => {
    const jobSite = await tx.jobSite.findUnique({ where: { id: input.actor.jobSiteId }, select: { status: true } });
    if (jobSite?.status !== "CLOSED" && jobSite?.status !== "ARCHIVED") throw new AccessError("Il cantiere non e chiuso.", 409);
    const request = await tx.jobSitePostClosureRequest.create({ data: { organizationId: input.actor.organizationId, jobSiteId: input.actor.jobSiteId, openedByParticipantId: input.actor.participantId, title: body.title, body: body.body }, select: { id: true } });
    const sequence = await nextTimelineSequence(tx, input.actor.jobSiteId);
    await tx.jobSiteTimelineEvent.create({ data: { organizationId: input.actor.organizationId, jobSiteId: input.actor.jobSiteId, sequence, type: "POST_CLOSURE_REQUESTED", audience: "SHARED", disclosure: "GENERAL", actorKind: input.actor.side, actorUserId: input.actor.userId, actorParticipantId: input.actor.participantId, payload: { schemaVersion: 1, postClosureRequestId: request.id, title: body.title }, fingerprint: fingerprintPayload({ postClosureRequestId: request.id, title: body.title }) } });
    return { postClosureRequestId: request.id, status: "OPEN" };
  } });
  await enqueueJobSiteProcess({ organizationId: input.actor.organizationId, jobSiteId: input.actor.jobSiteId, definitionKey: "POST_CLOSURE_REQUEST@1", businessKey: String(execution.result.postClosureRequestId), payload: { postClosureRequestId: execution.result.postClosureRequestId } });
  return execution;
}

const postClosureTransitionSchema = z.object({ expectedRevision: z.number().int().positive(), action: z.enum(["RESPOND", "RESOLVE", "WITHDRAW", "CLOSE_WITHOUT_AGREEMENT"]), message: z.string().trim().min(1).max(10_000) }).strict();

export async function transitionPostClosureRequest(input: { actor: JobSiteActor; postClosureRequestId: string; idempotencyKey: string; body: unknown }) {
  const body = postClosureTransitionSchema.parse(input.body);
  return executeIdempotentJobSiteMutation({ actor: input.actor, action: `POST_CLOSURE_REQUEST_${body.action}@1`, idempotencyKey: input.idempotencyKey, expectedRevision: body.expectedRevision, request: body, operation: async (tx) => {
    const request = await tx.jobSitePostClosureRequest.findFirst({ where: { id: input.postClosureRequestId, jobSiteId: input.actor.jobSiteId, status: { in: ["OPEN", "IN_DISCUSSION"] } }, select: { id: true, openedByParticipantId: true } });
    if (!request) throw new AccessError("Richiesta post-chiusura non disponibile.", 409);
    if ((body.action === "RESOLVE" || body.action === "WITHDRAW") && request.openedByParticipantId !== input.actor.participantId) throw new AccessError("Solo chi ha aperto la richiesta può chiuderla.", 403);
    const status = body.action === "RESPOND" ? "IN_DISCUSSION" : body.action === "RESOLVE" ? "RESOLVED" : body.action === "WITHDRAW" ? "WITHDRAWN" : "CLOSED_WITHOUT_AGREEMENT";
    await tx.jobSitePostClosureRequest.update({ where: { id: request.id }, data: { status, revision: { increment: 1 }, ...(["RESOLVED", "CLOSED_WITHOUT_AGREEMENT"].includes(status) ? { resolvedAt: new Date() } : {}) } });
    const sequence = await nextTimelineSequence(tx, input.actor.jobSiteId);
    const payload = { schemaVersion: 1, postClosureRequestId: request.id, action: body.action, message: body.message, status };
    await tx.jobSiteTimelineEvent.create({ data: { organizationId: input.actor.organizationId, jobSiteId: input.actor.jobSiteId, sequence, type: "POST_CLOSURE_REQUESTED", audience: "SHARED", disclosure: "GENERAL", actorKind: input.actor.side, actorUserId: input.actor.userId, actorParticipantId: input.actor.participantId, payload, fingerprint: fingerprintPayload(payload) } });
    return { postClosureRequestId: request.id, status };
  } });
}

const reopeningSchema = z.object({ expectedRevision: z.number().int().positive(), postClosureRequestId: z.string().min(1).nullable().optional(), reason: z.string().trim().min(1).max(4000) }).strict();

export async function proposeReopening(input: { actor: JobSiteActor; idempotencyKey: string; body: unknown }) {
  const body = reopeningSchema.parse(input.body);
  const execution = await executeIdempotentJobSiteMutation({ actor: input.actor, action: "REOPENING_PROPOSE@1", idempotencyKey: input.idempotencyKey, expectedRevision: body.expectedRevision, request: body, operation: async (tx) => {
    const jobSite = await tx.jobSite.findUnique({ where: { id: input.actor.jobSiteId }, select: { status: true } });
    if (jobSite?.status !== "CLOSED" && jobSite?.status !== "ARCHIVED") throw new AccessError("Il cantiere non e chiuso.", 409);
    if (body.postClosureRequestId) {
      const request = await tx.jobSitePostClosureRequest.findFirst({ where: { id: body.postClosureRequestId, jobSiteId: input.actor.jobSiteId, status: { in: ["OPEN", "IN_DISCUSSION"] } }, select: { id: true } });
      if (!request) throw new AccessError("Richiesta post-chiusura non disponibile.", 404);
    }
    const proposal = await tx.jobSiteReopeningProposal.create({ data: { organizationId: input.actor.organizationId, jobSiteId: input.actor.jobSiteId, postClosureRequestId: body.postClosureRequestId ?? null, status: "PROPOSED", reason: body.reason, fingerprint: fingerprintPayload(body), proposedByParticipantId: input.actor.participantId, consents: { create: { participantId: input.actor.participantId, decision: "ACCEPTED", fingerprint: fingerprintPayload(body) } } }, select: { id: true } });
    if (body.postClosureRequestId) await tx.jobSitePostClosureRequest.update({ where: { id: body.postClosureRequestId }, data: { status: "IN_DISCUSSION", revision: { increment: 1 } } });
    return { reopeningProposalId: proposal.id, status: "PROPOSED" };
  } });
  await enqueueJobSiteProcess({ organizationId: input.actor.organizationId, jobSiteId: input.actor.jobSiteId, definitionKey: "JOB_SITE_REOPENING@1", businessKey: String(execution.result.reopeningProposalId), payload: { reopeningProposalId: execution.result.reopeningProposalId } });
  return execution;
}

const authoritySchema = z.object({ expectedRevision: z.number().int().positive(), participantId: z.string().min(1), capabilities: z.array(z.enum(["COMMERCIAL_NEGOTIATE", "COMMERCIAL_ACCEPT", "PAYMENT_REQUEST", "PAYMENT_CONFIRM_RECEIPT", "CLOSURE_PROPOSE"])).min(1), validFrom: z.string().datetime().optional(), expiresAt: z.string().datetime().nullable().optional(), reason: z.string().trim().min(10).max(2000) }).strict().refine((value) => !value.expiresAt || new Date(value.expiresAt) > new Date(value.validFrom ?? Date.now()), { path: ["expiresAt"], message: "La scadenza deve essere successiva all'inizio della delega." });
const authorityRevokeSchema = z.object({ expectedRevision: z.number().int().positive(), grantId: z.string().min(1) }).strict();

export async function grantEconomicAuthority(input: { actor: JobSiteActor; idempotencyKey: string; rawInput: unknown }) {
  if (input.actor.role !== "OWNER") throw new AccessError("Risorsa non disponibile.", 404);
  const body = authoritySchema.parse(input.rawInput);
  return executeIdempotentJobSiteMutation({ actor: input.actor, action: "AUTHORITY_GRANT@1", idempotencyKey: input.idempotencyKey, expectedRevision: body.expectedRevision, request: body, operation: async (tx) => {
    const participant = await tx.jobSiteParticipant.findFirst({ where: { id: body.participantId, organizationId: input.actor.organizationId, jobSiteId: input.actor.jobSiteId, kind: "ORGANIZATION_MEMBER", status: "ACTIVE" }, select: { id: true, accessVersion: true } });
    if (!participant) throw new AccessError("Partecipante non disponibile.", 404);
    const validFrom = body.validFrom ? new Date(body.validFrom) : new Date();
    const grants = [];
    for (const capability of body.capabilities) grants.push(await tx.jobSiteAuthorityGrant.upsert({ where: { activeKey: `${input.actor.jobSiteId}:${participant.id}:${capability}` }, create: { organizationId: input.actor.organizationId, jobSiteId: input.actor.jobSiteId, participantId: participant.id, participantAccessVersion: participant.accessVersion, capability, status: "ACTIVE", activeKey: `${input.actor.jobSiteId}:${participant.id}:${capability}`, grantedByUserId: input.actor.userId, validFrom, expiresAt: body.expiresAt ? new Date(body.expiresAt) : null, reason: body.reason }, update: { status: "ACTIVE", participantAccessVersion: participant.accessVersion, revokedAt: null, revokedByUserId: null, validFrom, expiresAt: body.expiresAt ? new Date(body.expiresAt) : null, reason: body.reason, grantedByUserId: input.actor.userId } }));
    return { grantIds: grants.map((grant) => grant.id), capabilities: grants.map((grant) => grant.capability) };
  } });
}

export async function revokeEconomicAuthority(input: { actor: JobSiteActor; idempotencyKey: string; rawInput: unknown }) {
  if (input.actor.role !== "OWNER") throw new AccessError("Risorsa non disponibile.", 404);
  const body = authorityRevokeSchema.parse(input.rawInput);
  return executeIdempotentJobSiteMutation({ actor: input.actor, action: "AUTHORITY_REVOKE@1", idempotencyKey: input.idempotencyKey, expectedRevision: body.expectedRevision, request: body, operation: async (tx) => {
    const updated = await tx.jobSiteAuthorityGrant.updateMany({ where: { id: body.grantId, organizationId: input.actor.organizationId, jobSiteId: input.actor.jobSiteId, status: "ACTIVE" }, data: { status: "REVOKED", activeKey: null, revokedAt: new Date(), revokedByUserId: input.actor.userId } });
    if (updated.count !== 1) throw new AccessError("Delega non disponibile.", 404);
    return { grantId: body.grantId, revoked: true };
  } });
}

export async function searchSharedClientContent(actor: JobSiteActor, query: string) {
  if (actor.side !== "CLIENT") throw new AccessError("Risorsa non disponibile.", 404);
  await revalidateActor(actor);
  const q = query.trim();
  if (q.length < 2 || q.length > 120) return { items: [], nextCursor: null };
  const [events, steps, proposals, payments, attachments] = await Promise.all([
    db.jobSiteTimelineEvent.findMany({ where: { jobSiteId: actor.jobSiteId, audience: "SHARED", payload: { string_contains: q } }, select: { id: true, type: true, createdAt: true }, take: 20 }),
    db.jobSiteStep.findMany({ where: { jobSiteId: actor.jobSiteId, OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] }, select: { id: true, title: true, updatedAt: true }, take: 20 }),
    db.jobSiteChangeProposal.findMany({ where: { jobSiteId: actor.jobSiteId, status: { not: "DRAFT" }, currentVersion: { payload: { string_contains: q } } }, select: { id: true, status: true, updatedAt: true }, take: 20 }),
    db.jobSitePaymentRequest.findMany({ where: { jobSiteId: actor.jobSiteId, status: { not: "DRAFT" }, reason: { contains: q, mode: "insensitive" } }, select: { id: true, status: true, updatedAt: true }, take: 20 }),
    db.jobSiteAttachment.findMany({ where: { jobSiteId: actor.jobSiteId, originalFileName: { contains: q, mode: "insensitive" }, publications: { some: { audience: "SHARED", withdrawnAt: null } } }, select: { id: true, originalFileName: true, createdAt: true }, take: 20 }),
  ]);
  return { items: [...events.map((item) => ({ ...item, resultType: "timeline" })), ...steps.map((item) => ({ ...item, resultType: "step" })), ...proposals.map((item) => ({ ...item, resultType: "proposal" })), ...payments.map((item) => ({ ...item, resultType: "payment" })), ...attachments.map((item) => ({ ...item, resultType: "attachment" }))].slice(0, 50), nextCursor: null };
}

export async function searchOrganizationContent(actor: JobSiteActor, query: string) {
  if (actor.side !== "ORGANIZATION_MEMBER") throw new AccessError("Risorsa non disponibile.", 404);
  await revalidateActor(actor);
  const q = query.trim();
  if (q.length < 2 || q.length > 120) return { items: [], nextCursor: null };
  const [events, steps, requests, proposals, payments, attachments] = await Promise.all([
    db.jobSiteTimelineEvent.findMany({ where: { jobSiteId: actor.jobSiteId, OR: [{ title: { contains: q, mode: "insensitive" } }, { body: { contains: q, mode: "insensitive" } }, { payload: { string_contains: q } }] }, select: { id: true, type: true, audience: true, createdAt: true }, take: 20 }),
    db.jobSiteStep.findMany({ where: { jobSiteId: actor.jobSiteId, OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] }, select: { id: true, title: true, updatedAt: true }, take: 20 }),
    db.jobSiteRequest.findMany({ where: { jobSiteId: actor.jobSiteId, OR: [{ title: { contains: q, mode: "insensitive" } }, { body: { contains: q, mode: "insensitive" } }] }, select: { id: true, title: true, status: true, updatedAt: true }, take: 20 }),
    db.jobSiteChangeProposal.findMany({ where: { jobSiteId: actor.jobSiteId, currentVersion: { payload: { string_contains: q } } }, select: { id: true, status: true, updatedAt: true }, take: 20 }),
    db.jobSitePaymentRequest.findMany({ where: { jobSiteId: actor.jobSiteId, reason: { contains: q, mode: "insensitive" } }, select: { id: true, status: true, updatedAt: true }, take: 20 }),
    db.jobSiteAttachment.findMany({ where: { jobSiteId: actor.jobSiteId, originalFileName: { contains: q, mode: "insensitive" } }, select: { id: true, originalFileName: true, createdAt: true }, take: 20 }),
  ]);
  return { items: [...events.map((item) => ({ ...item, resultType: "timeline" })), ...steps.map((item) => ({ ...item, resultType: "step" })), ...requests.map((item) => ({ ...item, resultType: "request" })), ...proposals.map((item) => ({ ...item, resultType: "proposal" })), ...payments.map((item) => ({ ...item, resultType: "payment" })), ...attachments.map((item) => ({ ...item, resultType: "attachment" }))].slice(0, 50), nextCursor: null };
}
