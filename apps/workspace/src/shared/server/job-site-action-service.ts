import "server-only";

import { db, Prisma, type TimelineEventType } from "@qoovex/db";
import { AccessError } from "./access-errors";
import { canonicalize, effectPayloadSchemas, fingerprintPayload, jobSiteActionInputSchema, type JobSiteActionInput } from "./job-site-contracts";
import { enqueueJobSiteProcess } from "./job-site-process-service";
import { runSerializableTransaction } from "./serializable-transaction";
import { revalidateActor, requireEconomicAuthority, type JobSiteActor } from "./job-site-authorization-service";
import { queueJobSiteNotifications } from "./job-site-notification-service";
import { recordProductAuditEvent } from "./product-audit-service";

function json(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

async function appendTimelineEvent(tx: Prisma.TransactionClient, input: {
  actor: JobSiteActor;
  type: TimelineEventType;
  audience?: "INTERNAL" | "SHARED";
  disclosure?: "GENERAL" | "COMMERCIAL" | "RESTRICTED_COMMERCIAL";
  payload: Record<string, unknown>;
  stepId?: string | null;
}) {
  const sequence = await tx.jobSite.update({ where: { id: input.actor.jobSiteId }, data: { timelineSequence: { increment: 1 } }, select: { timelineSequence: true } });
  return tx.jobSiteTimelineEvent.create({
    data: {
      organizationId: input.actor.organizationId,
      jobSiteId: input.actor.jobSiteId,
      sequence: sequence.timelineSequence,
      type: input.type,
      audience: input.audience ?? "SHARED",
      disclosure: input.disclosure ?? "GENERAL",
      actorKind: input.actor.side,
      actorUserId: input.actor.userId,
      actorParticipantId: input.actor.participantId,
      stepId: input.stepId ?? null,
      payload: json(input.payload),
      fingerprint: fingerprintPayload(input.payload),
    },
    select: { id: true, sequence: true },
  });
}

async function requireAuthority(actor: JobSiteActor, capability: "COMMERCIAL_NEGOTIATE" | "COMMERCIAL_ACCEPT" | "PAYMENT_REQUEST" | "PAYMENT_CONFIRM_RECEIPT") {
  if (actor.side !== "ORGANIZATION_MEMBER") throw new AccessError("Azione riservata all'Azienda.", 403);
  return requireEconomicAuthority(actor.participantId, capability);
}

async function applyProposalEffects(tx: Prisma.TransactionClient, actor: JobSiteActor, effects: Array<{ id: string; type: keyof typeof effectPayloadSchemas; payload: unknown }>) {
  for (const effect of effects) {
    const payload = effectPayloadSchemas[effect.type].parse(effect.payload) as Record<string, unknown>;
    let targetType = "JOB_SITE";
    let targetId = actor.jobSiteId;
    let beforeSnapshot: unknown = null;
    let afterSnapshot: unknown = null;
    if (effect.type === "STEP_CREATE") {
      const maximum = await tx.jobSiteStep.aggregate({ where: { jobSiteId: actor.jobSiteId }, _max: { sortOrder: true } });
      const created = await tx.jobSiteStep.create({ data: { organizationId: actor.organizationId, jobSiteId: actor.jobSiteId, title: String(payload.title), description: payload.description == null ? null : String(payload.description), expectedOutcome: payload.expectedOutcome == null ? null : String(payload.expectedOutcome), sortOrder: (maximum._max.sortOrder ?? -1) + 1, createdByUserId: actor.userId }, select: { id: true, title: true, description: true, expectedOutcome: true, status: true, revision: true } });
      targetType = "JOB_SITE_STEP"; targetId = created.id; afterSnapshot = created;
    } else if (effect.type === "STEP_UPDATE") {
      const step = await tx.jobSiteStep.findFirst({ where: { id: String(payload.stepId), jobSiteId: actor.jobSiteId }, select: { id: true, title: true, description: true, expectedOutcome: true, status: true, revision: true } });
      if (!step) throw new AccessError("Step della proposta non disponibile.", 409, "PROPOSAL_EFFECT_TARGET_MISSING");
      beforeSnapshot = step; targetType = "JOB_SITE_STEP"; targetId = step.id;
      afterSnapshot = await tx.jobSiteStep.update({ where: { id: step.id }, data: { ...(payload.title !== undefined ? { title: String(payload.title) } : {}), ...(payload.description !== undefined ? { description: payload.description == null ? null : String(payload.description) } : {}), ...(payload.expectedOutcome !== undefined ? { expectedOutcome: payload.expectedOutcome == null ? null : String(payload.expectedOutcome) } : {}), revision: { increment: 1 } }, select: { id: true, title: true, description: true, expectedOutcome: true, status: true, revision: true } });
    } else if (effect.type === "STEP_CANCEL") {
      const step = await tx.jobSiteStep.findFirst({ where: { id: String(payload.stepId), jobSiteId: actor.jobSiteId }, select: { id: true, status: true, revision: true } });
      if (!step) throw new AccessError("Step della proposta non disponibile.", 409, "PROPOSAL_EFFECT_TARGET_MISSING");
      beforeSnapshot = step; targetType = "JOB_SITE_STEP"; targetId = step.id;
      afterSnapshot = await tx.jobSiteStep.update({ where: { id: step.id }, data: { status: "CANCELLED", cancelledAt: new Date(), revision: { increment: 1 } }, select: { id: true, status: true, revision: true } });
    } else if (effect.type === "STEP_ASSIGN_USER") {
      const [step, participant] = await Promise.all([tx.jobSiteStep.findFirst({ where: { id: String(payload.stepId), jobSiteId: actor.jobSiteId }, select: { id: true } }), tx.jobSiteParticipant.findFirst({ where: { id: String(payload.participantId), jobSiteId: actor.jobSiteId, status: "ACTIVE" }, select: { id: true } })]);
      if (!step || !participant) throw new AccessError("Assegnazione della proposta non disponibile.", 409, "PROPOSAL_EFFECT_TARGET_MISSING");
      const previous = await tx.jobSiteStepUserAssignment.findUnique({ where: { stepId_participantId: { stepId: step.id, participantId: participant.id } }, select: { stepId: true, participantId: true, roleLabel: true, endedAt: true } });
      beforeSnapshot = previous; targetType = "STEP_USER_ASSIGNMENT"; targetId = `${step.id}:${participant.id}`;
      afterSnapshot = await tx.jobSiteStepUserAssignment.upsert({ where: { stepId_participantId: { stepId: step.id, participantId: participant.id } }, create: { stepId: step.id, participantId: participant.id, roleLabel: payload.roleLabel == null ? null : String(payload.roleLabel), assignedByUserId: actor.userId }, update: { endedAt: null, roleLabel: payload.roleLabel == null ? null : String(payload.roleLabel) }, select: { stepId: true, participantId: true, roleLabel: true, endedAt: true } });
    } else if (effect.type === "STEP_UNASSIGN_USER") {
      const assignment = await tx.jobSiteStepUserAssignment.findFirst({ where: { stepId: String(payload.stepId), participantId: String(payload.participantId), endedAt: null, step: { jobSiteId: actor.jobSiteId }, participant: { jobSiteId: actor.jobSiteId } }, select: { stepId: true, participantId: true, roleLabel: true, endedAt: true } });
      if (!assignment) throw new AccessError("Assegnazione della proposta non disponibile.", 409, "PROPOSAL_EFFECT_TARGET_MISSING");
      beforeSnapshot = assignment; targetType = "STEP_USER_ASSIGNMENT"; targetId = `${assignment.stepId}:${assignment.participantId}`;
      afterSnapshot = await tx.jobSiteStepUserAssignment.update({ where: { stepId_participantId: { stepId: assignment.stepId, participantId: assignment.participantId } }, data: { endedAt: new Date() }, select: { stepId: true, participantId: true, roleLabel: true, endedAt: true } });
    } else if (effect.type === "STEP_ASSIGN_WORKER") {
      const [step, workerAssignment] = await Promise.all([tx.jobSiteStep.findFirst({ where: { id: String(payload.stepId), jobSiteId: actor.jobSiteId }, select: { id: true } }), tx.jobSiteWorkerAssignment.findFirst({ where: { workerId: String(payload.workerId), jobSiteId: actor.jobSiteId, endsAt: null, archivedAt: null }, select: { workerId: true } })]);
      if (!step || !workerAssignment) throw new AccessError("Assegnazione Worker della proposta non disponibile.", 409, "PROPOSAL_EFFECT_TARGET_MISSING");
      const previous = await tx.jobSiteStepWorkerAssignment.findUnique({ where: { stepId_workerId: { stepId: step.id, workerId: workerAssignment.workerId } }, select: { stepId: true, workerId: true, roleLabel: true, endedAt: true } });
      beforeSnapshot = previous; targetType = "STEP_WORKER_ASSIGNMENT"; targetId = `${step.id}:${workerAssignment.workerId}`;
      afterSnapshot = await tx.jobSiteStepWorkerAssignment.upsert({ where: { stepId_workerId: { stepId: step.id, workerId: workerAssignment.workerId } }, create: { stepId: step.id, workerId: workerAssignment.workerId, roleLabel: payload.roleLabel == null ? null : String(payload.roleLabel), assignedByUserId: actor.userId }, update: { endedAt: null, roleLabel: payload.roleLabel == null ? null : String(payload.roleLabel) }, select: { stepId: true, workerId: true, roleLabel: true, endedAt: true } });
    } else if (effect.type === "STEP_UNASSIGN_WORKER") {
      const assignment = await tx.jobSiteStepWorkerAssignment.findFirst({ where: { stepId: String(payload.stepId), workerId: String(payload.workerId), endedAt: null, step: { jobSiteId: actor.jobSiteId } }, select: { stepId: true, workerId: true, roleLabel: true, endedAt: true } });
      if (!assignment) throw new AccessError("Assegnazione Worker della proposta non disponibile.", 409, "PROPOSAL_EFFECT_TARGET_MISSING");
      beforeSnapshot = assignment; targetType = "STEP_WORKER_ASSIGNMENT"; targetId = `${assignment.stepId}:${assignment.workerId}`;
      afterSnapshot = await tx.jobSiteStepWorkerAssignment.update({ where: { stepId_workerId: { stepId: assignment.stepId, workerId: assignment.workerId } }, data: { endedAt: new Date() }, select: { stepId: true, workerId: true, roleLabel: true, endedAt: true } });
    } else if (effect.type === "ESTIMATED_COMPLETION_UPDATE") {
      beforeSnapshot = await tx.jobSite.findUniqueOrThrow({ where: { id: actor.jobSiteId }, select: { id: true, estimatedCompletionAt: true, estimatedCompletionAuthorId: true, estimatedCompletionSetAt: true } });
      afterSnapshot = await tx.jobSite.update({ where: { id: actor.jobSiteId }, data: { estimatedCompletionAt: payload.estimatedCompletionAt ? new Date(String(payload.estimatedCompletionAt)) : null, estimatedCompletionAuthorId: actor.userId, estimatedCompletionSetAt: new Date() }, select: { id: true, estimatedCompletionAt: true, estimatedCompletionAuthorId: true, estimatedCompletionSetAt: true } });
    } else {
      beforeSnapshot = { commercialDeltaApplied: false };
      afterSnapshot = { commercialDeltaApplied: true, economicDeltaMinor: String(payload.economicDeltaMinor) };
    }
    const receipt = { targetType, targetId, beforeSnapshot, afterSnapshot };
    await tx.jobSiteChangeProposalEffect.update({ where: { id: effect.id }, data: { targetType, targetId, beforeSnapshot: beforeSnapshot === null ? Prisma.DbNull : json(canonicalize(beforeSnapshot)), afterSnapshot: afterSnapshot === null ? Prisma.DbNull : json(canonicalize(afterSnapshot)), receiptFingerprint: fingerprintPayload(receipt), appliedAt: new Date() } });
  }
}

async function executeActionBody(tx: Prisma.TransactionClient, actor: JobSiteActor, input: JobSiteActionInput, internal: boolean) {
  const siteState = await tx.jobSite.findFirst({ where: { id: actor.jobSiteId, organizationId: actor.organizationId }, select: { status: true } });
  if (!siteState) throw new AccessError("Cantiere non trovato.", 404);
  const requireStatus = (...allowed: typeof siteState.status[]) => { if (!allowed.includes(siteState.status)) throw new AccessError("Azione non disponibile nello stato corrente del cantiere.", 409, "JOB_SITE_STATE_CONFLICT"); };
  switch (input.action) {
    case "CLIENT_PARTICIPATION_ACTIVATE@1": {
      if (!internal) throw new AccessError("Azione interna.", 404);
      await tx.jobSiteParticipant.updateMany({ where: { id: actor.participantId, status: { in: ["INVITED", "PENDING"] } }, data: { status: "ACTIVE", activatedAt: new Date(), activeKey: `${actor.jobSiteId}:${actor.userId}:CLIENT` } });
      return { participantId: actor.participantId, status: "ACTIVE" };
    }
    case "INITIAL_AGREEMENT_CONFIRM@1": {
      requireStatus("PENDING_INITIAL_CONFIRMATION");
      if (actor.side !== "CLIENT") throw new AccessError("Conferma riservata al cliente principale.", 403);
      const participant = await tx.jobSiteParticipant.findFirst({ where: { id: actor.participantId, userId: actor.userId, organizationId: actor.organizationId, jobSiteId: actor.jobSiteId, kind: "CLIENT", status: "PENDING", accessVersion: actor.participantAccessVersion }, select: { id: true } });
      if (!participant) throw new AccessError("Partecipazione cliente non disponibile per la conferma.", 409);
      const version = await tx.jobSiteInitialAgreementVersion.findFirst({ where: { id: input.agreementVersionId, agreement: { organizationId: actor.organizationId, jobSiteId: actor.jobSiteId, currentVersionId: input.agreementVersionId, status: "PENDING_CLIENT_CONFIRMATION" } }, select: { id: true, fingerprint: true, agreementId: true } });
      if (!version) throw new AccessError("Versione del riepilogo non disponibile.", 409);
      await tx.jobSiteInitialAgreementConsent.create({ data: { versionId: version.id, participantId: actor.participantId, decision: input.decision, fingerprint: version.fingerprint } });
      const agreement = await tx.jobSiteInitialAgreement.updateMany({ where: { id: version.agreementId, organizationId: actor.organizationId, jobSiteId: actor.jobSiteId, currentVersionId: version.id, status: "PENDING_CLIENT_CONFIRMATION" }, data: input.decision === "ACCEPTED" ? { status: "CONFIRMED", confirmedAt: new Date() } : { status: "DRAFT" } });
      if (agreement.count !== 1) throw new AccessError("Versione del riepilogo non disponibile.", 409);
      if (input.decision === "ACCEPTED") {
        const activated = await tx.jobSiteParticipant.updateMany({ where: { id: actor.participantId, userId: actor.userId, organizationId: actor.organizationId, jobSiteId: actor.jobSiteId, kind: "CLIENT", status: "PENDING", accessVersion: actor.participantAccessVersion }, data: { status: "ACTIVE", accessVersion: { increment: 1 }, activeKey: `${actor.jobSiteId}:${actor.userId}:CLIENT`, primaryClientKey: `${actor.jobSiteId}:PRIMARY_CLIENT`, activatedAt: new Date() } });
        if (activated.count !== 1) throw new AccessError("Partecipazione cliente gia attivata o non disponibile.", 409);
        const activatedJobSite = await tx.jobSite.updateMany({ where: { id: actor.jobSiteId, organizationId: actor.organizationId, status: "PENDING_INITIAL_CONFIRMATION" }, data: { status: "ACTIVE" } });
        if (activatedJobSite.count !== 1) throw new AccessError("Il cantiere non e disponibile per l'attivazione.", 409);
      }
      await appendTimelineEvent(tx, { actor, type: input.decision === "ACCEPTED" ? "WORK_UPDATE" : "CLARIFICATION_REQUESTED", payload: { schemaVersion: 1, agreementVersionId: version.id, decision: input.decision } });
      return { agreementVersionId: version.id, decision: input.decision };
    }
    case "STEP_STATUS_TRANSITION@1": {
      const step = await tx.jobSiteStep.findFirst({ where: { id: input.stepId, jobSiteId: actor.jobSiteId }, select: { id: true, status: true, revision: true, jobSite: { select: { status: true } } } });
      if (!step) throw new AccessError("Step non trovato.", 404);
      if (step.jobSite.status !== "ACTIVE" && !(actor.side === "ORGANIZATION_MEMBER" && input.nextStatus === "CANCELLED" && ["DRAFT", "WAITING_FOR_CLIENT", "PENDING_INITIAL_CONFIRMATION"].includes(step.jobSite.status))) throw new AccessError("Transizione step non disponibile nello stato corrente.", 409);
      const transitions: Record<string, readonly string[]> = { NOT_STARTED: ["IN_PROGRESS", "WAITING", "CANCELLED"], IN_PROGRESS: ["WAITING", "WORK_COMPLETED"], WAITING: ["IN_PROGRESS", "WORK_COMPLETED"], CHANGES_REQUESTED: ["IN_PROGRESS", "WORK_COMPLETED"], WORK_COMPLETED: ["CHANGES_REQUESTED", "CONFIRMED"] };
      if (!transitions[step.status]?.includes(input.nextStatus)) throw new AccessError("Transizione step non autorizzata.", 409);
      if (actor.side === "CLIENT" ? !["CHANGES_REQUESTED", "CONFIRMED"].includes(input.nextStatus) : ["CHANGES_REQUESTED", "CONFIRMED"].includes(input.nextStatus)) throw new AccessError("Transizione step non autorizzata per questa parte.", 403);
      if (input.nextStatus === "CANCELLED" && ["ACTIVE", "CLOSURE_PROPOSED", "CLOSED", "ARCHIVED"].includes(step.jobSite.status)) throw new AccessError("Dopo l'attivazione la cancellazione di uno step richiede una proposta accettata.", 409);
      await tx.jobSiteStep.update({ where: { id: step.id }, data: { status: input.nextStatus, revision: { increment: 1 }, ...(input.nextStatus === "CANCELLED" ? { cancelledAt: new Date() } : {}) } });
      const type: TimelineEventType = input.nextStatus === "WORK_COMPLETED" ? "STEP_READY_FOR_REVIEW" : input.nextStatus === "CONFIRMED" ? "STEP_CONFIRMED" : input.nextStatus === "CHANGES_REQUESTED" ? "STEP_REOPENED" : "STEP_UPDATED";
      await appendTimelineEvent(tx, { actor, type, stepId: step.id, payload: { schemaVersion: 1, previousStatus: step.status, nextStatus: input.nextStatus } });
      return { stepId: step.id, status: input.nextStatus };
    }
    case "CHANGE_PROPOSAL_APPLY@1": {
      requireStatus("ACTIVE");
      const proposal = await tx.jobSiteChangeProposal.findFirst({ where: { id: input.proposalId, jobSiteId: actor.jobSiteId, currentVersionId: input.versionId, status: { in: ["PROPOSED", "COUNTERED"] } }, include: { currentVersion: { include: { effects: { orderBy: { ordinal: "asc" } } } } } });
      if (!proposal?.currentVersion || proposal.representedSide === actor.side) throw new AccessError("Proposta non disponibile per questa parte.", 409);
      const authorityGrantId = actor.side === "ORGANIZATION_MEMBER" ? await requireAuthority(actor, "COMMERCIAL_ACCEPT") : null;
      await tx.jobSiteChangeProposalConsent.create({ data: { versionId: input.versionId, participantId: actor.participantId, decision: input.decision, fingerprint: proposal.currentVersion.fingerprint } });
      await tx.jobSiteChangeProposal.update({ where: { id: proposal.id }, data: input.decision === "ACCEPTED" ? { status: "ACCEPTED", acceptedAt: new Date(), activeKey: null } : { status: "REJECTED", rejectedAt: new Date(), activeKey: null } });
      if (input.decision === "ACCEPTED") await applyProposalEffects(tx, actor, proposal.currentVersion.effects as Array<{ id: string; type: keyof typeof effectPayloadSchemas; payload: unknown }>);
      await appendTimelineEvent(tx, { actor, type: input.decision === "ACCEPTED" ? "CHANGE_ACCEPTED" : "CHANGE_REJECTED", disclosure: "COMMERCIAL", payload: { schemaVersion: 1, proposalId: proposal.id, versionId: input.versionId, decision: input.decision } });
      return { proposalId: proposal.id, versionId: input.versionId, status: input.decision === "ACCEPTED" ? "ACCEPTED" : "REJECTED", authorityGrantId };
    }
    case "PAYMENT_REQUEST_CREATE@1": {
      requireStatus("ACTIVE");
      const authorityGrantId = await requireAuthority(actor, "PAYMENT_REQUEST");
      const profile = await tx.organizationPaymentProfile.findFirst({ where: { id: input.paymentProfileId, organizationId: actor.organizationId, archivedAt: null, currentVersionId: { not: null } }, select: { id: true, currentVersionId: true } });
      if (!profile) throw new AccessError("Profilo pagamento non disponibile.", 409);
      const [stepCount, proposalCount] = await Promise.all([
        tx.jobSiteStep.count({ where: { id: { in: input.stepIds }, jobSiteId: actor.jobSiteId } }),
        tx.jobSiteChangeProposal.count({ where: { id: { in: input.proposalIds }, jobSiteId: actor.jobSiteId, status: "ACCEPTED" } }),
      ]);
      if (stepCount !== new Set(input.stepIds).size || proposalCount !== new Set(input.proposalIds).size) throw new AccessError("Step o proposte collegate non sono disponibili.", 409, "PAYMENT_LINK_TARGET_INVALID");
      const request = await tx.jobSitePaymentRequest.create({ data: { organizationId: actor.organizationId, jobSiteId: actor.jobSiteId, paymentProfileId: profile.id, paymentProfileVersionId: profile.currentVersionId!, status: "REQUESTED", amountMinor: input.amountMinor, reason: input.reason, requestedByParticipantId: actor.participantId, requestedAt: new Date(), dueAt: input.dueAt ? new Date(input.dueAt) : null, stepLinks: { create: input.stepIds.map((stepId) => ({ stepId })) }, proposalLinks: { create: input.proposalIds.map((proposalId) => ({ proposalId })) } }, select: { id: true, amountMinor: true } });
      await appendTimelineEvent(tx, { actor, type: "PAYMENT_REQUESTED", disclosure: "RESTRICTED_COMMERCIAL", payload: { schemaVersion: 1, paymentRequestId: request.id, amountMinor: request.amountMinor.toString() } });
      return { paymentRequestId: request.id, status: "REQUESTED", amountMinor: request.amountMinor.toString(), authorityGrantId };
    }
    case "PAYMENT_TRANSFER_DECLARE@1": {
      requireStatus("ACTIVE");
      if (actor.side !== "CLIENT") throw new AccessError("Dichiarazione riservata al cliente.", 403);
      const request = await tx.jobSitePaymentRequest.findFirst({ where: { id: input.paymentRequestId, jobSiteId: actor.jobSiteId, status: "REQUESTED" }, select: { id: true, amountMinor: true } });
      if (!request || request.amountMinor !== input.amountMinor) throw new AccessError("La dichiarazione deve corrispondere alla richiesta. Usa richieste separate per pagamenti parziali.", 409);
      if (input.receiptAttachmentId) {
        const receipt = await tx.jobSiteAttachment.findFirst({ where: { id: input.receiptAttachmentId, jobSiteId: actor.jobSiteId, category: "PAYMENT_RECEIPT", sourceId: request.id, archivedAt: null, publications: { some: { audience: "SHARED", withdrawnAt: null } } }, select: { id: true } });
        if (!receipt) throw new AccessError("Ricevuta non disponibile.", 404);
      }
      const declaration = await tx.jobSitePaymentTransferDeclaration.create({ data: { paymentRequestId: request.id, declaredByParticipantId: actor.participantId, amountMinor: input.amountMinor, transferredAt: new Date(input.transferredAt), method: input.method, reference: input.reference, note: input.note, receiptAttachmentId: input.receiptAttachmentId, fingerprint: fingerprintPayload(input) }, select: { id: true } });
      await tx.jobSitePaymentRequest.update({ where: { id: request.id }, data: { status: "TRANSFER_DECLARED", revision: { increment: 1 } } });
      await appendTimelineEvent(tx, { actor, type: "PAYMENT_TRANSFER_DECLARED", disclosure: "RESTRICTED_COMMERCIAL", payload: { schemaVersion: 1, paymentRequestId: request.id, declarationId: declaration.id } });
      return { paymentRequestId: request.id, declarationId: declaration.id, status: "TRANSFER_DECLARED" };
    }
    case "PAYMENT_RECEIPT_CONFIRM@1": {
      requireStatus("ACTIVE");
      const authorityGrantId = await requireAuthority(actor, "PAYMENT_CONFIRM_RECEIPT");
      const request = await tx.jobSitePaymentRequest.findFirst({ where: { id: input.paymentRequestId, jobSiteId: actor.jobSiteId, status: { in: ["TRANSFER_DECLARED", "UNDER_REVIEW"] } }, select: { id: true } });
      if (!request) throw new AccessError("Pagamento non disponibile per la verifica.", 409);
      await tx.jobSitePaymentReview.create({ data: { paymentRequestId: request.id, reviewedByParticipantId: actor.participantId, outcome: input.outcome, note: input.note } });
      const status = input.outcome === "CONFIRMED_RECEIVED" ? "CONFIRMED" : input.outcome === "CLARIFICATION_REQUIRED" ? "UNDER_REVIEW" : "DISPUTED";
      await tx.jobSitePaymentRequest.update({ where: { id: request.id }, data: { status, revision: { increment: 1 }, ...(status === "CONFIRMED" ? { confirmedAt: new Date() } : {}) } });
      await appendTimelineEvent(tx, { actor, type: status === "CONFIRMED" ? "PAYMENT_CONFIRMED" : "PAYMENT_DISPUTED", disclosure: "RESTRICTED_COMMERCIAL", payload: { schemaVersion: 1, paymentRequestId: request.id, outcome: input.outcome } });
      return { paymentRequestId: request.id, status, authorityGrantId };
    }
    case "DISPUTE_PRESERVATION_CREATE@1": {
      const dispute = await tx.jobSiteDispute.findFirst({ where: { id: input.disputeId, jobSiteId: actor.jobSiteId }, include: { references: true } });
      if (!dispute) throw new AccessError("Disputa non trovata.", 404);
      const snapshot = { schemaVersion: 1, disputeId: dispute.id, status: dispute.status, references: dispute.references.map((reference) => ({ type: reference.type, targetId: reference.targetId })), preservedAt: new Date().toISOString() };
      const preservation = await tx.jobSiteDisputePreservation.create({ data: { disputeId: dispute.id, snapshot: json(snapshot), fingerprint: fingerprintPayload(snapshot) }, select: { id: true } });
      return { disputeId: dispute.id, preservationId: preservation.id };
    }
    case "JOB_SITE_CLOSE@1": {
      requireStatus("CLOSURE_PROPOSED");
      const closure = await tx.jobSiteClosure.findFirst({ where: { id: input.closureId, jobSiteId: actor.jobSiteId, status: { in: ["PENDING_CLIENT_CONFIRMATION", "CLIENT_CONFIRMED"] } }, select: { id: true, fingerprint: true, jobSiteRevision: true } });
      if (!closure || closure.jobSiteRevision !== input.expectedRevision) throw new AccessError("Riepilogo chiusura obsoleto.", 409, "STALE_CLOSURE");
      await tx.jobSiteClosureConsent.create({ data: { closureId: closure.id, participantId: actor.participantId, decision: input.decision, fingerprint: closure.fingerprint } });
      if (input.decision === "REJECTED") {
        await tx.jobSiteClosure.update({ where: { id: closure.id }, data: { status: "REJECTED", withdrawnAt: new Date() } });
        await tx.jobSite.update({ where: { id: actor.jobSiteId }, data: { status: "ACTIVE" } });
        return { closureId: closure.id, status: "REJECTED" };
      }
      const consents = await tx.jobSiteClosureConsent.findMany({ where: { closureId: closure.id, decision: "ACCEPTED" }, select: { participant: { select: { kind: true } } } });
      const clientConfirmed = consents.some((consent) => consent.participant.kind === "CLIENT");
      const organizationConfirmed = consents.some((consent) => consent.participant.kind === "ORGANIZATION_MEMBER");
      const closed = clientConfirmed && organizationConfirmed;
      await tx.jobSiteClosure.update({ where: { id: closure.id }, data: { status: closed ? "FINALIZED" : "CLIENT_CONFIRMED", jobSiteRevision: input.expectedRevision + 1, ...(closed ? { closedAt: new Date() } : {}) } });
      let exportIds: string[] = [];
      if (closed) {
        await tx.jobSite.update({ where: { id: actor.jobSiteId }, data: { status: "CLOSED", closedAt: new Date() } });
        const [clientExport, organizationExport] = await Promise.all([
          tx.jobSiteExport.create({ data: { organizationId: actor.organizationId, jobSiteId: actor.jobSiteId, audience: "CLIENT", status: "PENDING", requestedByUserId: actor.userId, requestedByParticipantId: actor.participantId }, select: { id: true } }),
          tx.jobSiteExport.create({ data: { organizationId: actor.organizationId, jobSiteId: actor.jobSiteId, audience: "ORGANIZATION", status: "PENDING", requestedByUserId: actor.userId, requestedByParticipantId: actor.participantId }, select: { id: true } }),
        ]);
        exportIds = [clientExport.id, organizationExport.id];
      }
      await appendTimelineEvent(tx, { actor, type: "CLOSURE_CONFIRMED", payload: { schemaVersion: 1, closureId: closure.id, closed } });
      return { closureId: closure.id, status: closed ? "FINALIZED" : "CLIENT_CONFIRMED", exportIds };
    }
    case "JOB_SITE_REOPEN@1": {
      requireStatus("CLOSED", "ARCHIVED");
      const proposal = await tx.jobSiteReopeningProposal.findFirst({ where: { id: input.reopeningProposalId, jobSiteId: actor.jobSiteId, status: "PROPOSED" }, select: { id: true, fingerprint: true } });
      if (!proposal) throw new AccessError("Proposta di riapertura non disponibile.", 409);
      await tx.jobSiteReopeningConsent.create({ data: { proposalId: proposal.id, participantId: actor.participantId, decision: input.decision, fingerprint: proposal.fingerprint } });
      if (input.decision === "REJECTED") {
        await tx.jobSiteReopeningProposal.update({ where: { id: proposal.id }, data: { status: "REJECTED" } });
        return { reopeningProposalId: proposal.id, status: "REJECTED" };
      }
      const consents = await tx.jobSiteReopeningConsent.findMany({ where: { proposalId: proposal.id, decision: "ACCEPTED" }, select: { participant: { select: { kind: true } } } });
      const accepted = consents.some((consent) => consent.participant.kind === "CLIENT") && consents.some((consent) => consent.participant.kind === "ORGANIZATION_MEMBER");
      if (accepted) {
        await tx.jobSiteReopeningProposal.update({ where: { id: proposal.id }, data: { status: "FINALIZED", appliedAt: new Date() } });
        await tx.jobSite.update({ where: { id: actor.jobSiteId }, data: { status: "ACTIVE", closedAt: null } });
        await appendTimelineEvent(tx, { actor, type: "JOB_SITE_REOPENED", payload: { schemaVersion: 1, reopeningProposalId: proposal.id } });
      }
      if (!accepted) await tx.jobSiteReopeningProposal.update({ where: { id: proposal.id }, data: { status: "COUNTERPARTY_CONFIRMED" } });
      return { reopeningProposalId: proposal.id, status: accepted ? "FINALIZED" : "COUNTERPARTY_CONFIRMED" };
    }
    case "JOB_SITE_EXPORT_CREATE@1": {
      requireStatus("CLOSED", "ARCHIVED");
      if ((actor.side === "CLIENT" && input.audience !== "CLIENT") || (actor.side === "ORGANIZATION_MEMBER" && input.audience !== "ORGANIZATION")) throw new AccessError("Audience export non autorizzata.", 403);
      const exportRecord = await tx.jobSiteExport.create({ data: { organizationId: actor.organizationId, jobSiteId: actor.jobSiteId, audience: input.audience, status: "PENDING", requestedByUserId: actor.userId, requestedByParticipantId: actor.participantId }, select: { id: true } });
      return { exportId: exportRecord.id, status: "PENDING", audience: input.audience };
    }
    case "JOB_SITE_ARCHIVE@1": {
      if (actor.side !== "ORGANIZATION_MEMBER") throw new AccessError("Azione riservata all'Azienda.", 403);
      const [pendingReopening, failedExport] = await Promise.all([
        tx.jobSiteReopeningProposal.count({ where: { jobSiteId: actor.jobSiteId, status: { in: ["PROPOSED", "COUNTERPARTY_CONFIRMED"] } } }),
        tx.jobSiteExport.count({ where: { jobSiteId: actor.jobSiteId, status: "FAILED" } }),
      ]);
      if (pendingReopening || failedExport) throw new AccessError("Riaperture pendenti o export critici non gestiti impediscono l'archiviazione.", 409);
      const archived = await tx.jobSite.updateMany({ where: { id: actor.jobSiteId, status: "CLOSED" }, data: { status: "ARCHIVED", archivedAt: new Date() } });
      if (archived.count !== 1) throw new AccessError("Solo un cantiere chiuso puo essere archiviato.", 409);
      await appendTimelineEvent(tx, { actor, type: "JOB_SITE_ARCHIVED", payload: { schemaVersion: 1, jobSiteId: actor.jobSiteId } });
      return { jobSiteId: actor.jobSiteId, status: "ARCHIVED" };
    }
    case "ATTACHMENT_FINALIZE@1": {
      if (!internal) throw new AccessError("Azione interna.", 404);
      const attachment = await tx.jobSiteAttachment.create({ data: { organizationId: actor.organizationId, jobSiteId: actor.jobSiteId, category: input.category, sourceKind: input.sourceKind, sourceId: input.sourceId, blobKey: input.blobKey, originalFileName: input.originalFileName, mimeType: input.mimeType, size: input.size, checksumSha256: input.checksumSha256, uploadedByUserId: actor.userId }, select: { id: true } });
      return { attachmentId: attachment.id };
    }
  }
}

export async function executeJobSiteAction(input: {
  actor: JobSiteActor;
  idempotencyKey: string;
  action: unknown;
  internal?: boolean;
}) {
  if (!input.idempotencyKey.trim() || input.idempotencyKey.length > 200) throw new AccessError("Idempotency-Key non valida.", 409, "IDEMPOTENCY_KEY_REQUIRED");
  const action = jobSiteActionInputSchema.parse(input.action);
  await revalidateActor(input.actor, { allowPendingClient: action.action === "INITIAL_AGREEMENT_CONFIRM@1" });
  const inputFingerprint = fingerprintPayload(action);
  const existing = await db.jobSiteActionReceipt.findUnique({
    where: { organizationId_action_idempotencyKey: { organizationId: input.actor.organizationId, action: action.action, idempotencyKey: input.idempotencyKey } },
    select: { inputFingerprint: true, result: true, resultingRevision: true },
  });
  if (existing) {
    if (existing.inputFingerprint !== inputFingerprint) throw new AccessError("Idempotency-Key gia usata con un input differente.", 409, "IDEMPOTENCY_FINGERPRINT_MISMATCH");
    return { replayed: true, result: existing.result, revision: existing.resultingRevision };
  }

  const execution = await runSerializableTransaction(async (tx) => {
    const jobSite = await tx.jobSite.findFirst({ where: { id: input.actor.jobSiteId, organizationId: input.actor.organizationId }, select: { id: true, revision: true } });
    if (!jobSite) throw new AccessError("Cantiere non trovato.", 404);
    if (jobSite.revision !== action.expectedRevision) throw new AccessError("Il cantiere e stato modificato.", 409, "STALE_REVISION");
    const result = await executeActionBody(tx, input.actor, action, input.internal === true);
    const updated = await tx.jobSite.updateMany({ where: { id: jobSite.id, revision: action.expectedRevision }, data: { revision: { increment: 1 } } });
    if (updated.count !== 1) throw new AccessError("Il cantiere e stato modificato.", 409, "STALE_REVISION");
    const resultingRevision = action.expectedRevision + 1;
    await tx.jobSiteActionReceipt.create({
      data: {
        organizationId: input.actor.organizationId,
        jobSiteId: input.actor.jobSiteId,
        action: action.action,
        idempotencyKey: input.idempotencyKey,
        inputFingerprint,
        result: json(result),
        resultFingerprint: fingerprintPayload(result),
        actorUserId: input.actor.userId,
        actorParticipantId: input.actor.participantId,
        expectedRevision: action.expectedRevision,
        resultingRevision,
      },
    });
    await queueJobSiteNotifications(tx, { actor: input.actor, action: action.action, idempotencyKey: input.idempotencyKey, result });
    return { result, revision: resultingRevision };
  }, { shouldRetry: (error) => error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002" });

  const processDefinition = {
    "INITIAL_AGREEMENT_CONFIRM@1": "JOB_SITE_INITIAL_CONFIRMATION@1",
    "CHANGE_PROPOSAL_APPLY@1": "CHANGE_NEGOTIATION@1",
    "PAYMENT_REQUEST_CREATE@1": "PAYMENT_REQUEST@1",
    "PAYMENT_TRANSFER_DECLARE@1": "PAYMENT_REQUEST@1",
    "PAYMENT_RECEIPT_CONFIRM@1": "PAYMENT_REQUEST@1",
    "JOB_SITE_CLOSE@1": "JOB_SITE_CLOSURE@1",
    "JOB_SITE_REOPEN@1": "JOB_SITE_REOPENING@1",
    "JOB_SITE_EXPORT_CREATE@1": "JOB_SITE_EXPORT@1",
  } as const;
  const definition = processDefinition[action.action as keyof typeof processDefinition];
  if (definition) {
    const result = execution.result && typeof execution.result === "object" && !Array.isArray(execution.result)
      ? execution.result as Record<string, unknown>
      : {};
    await enqueueJobSiteProcess({
      organizationId: input.actor.organizationId,
      jobSiteId: input.actor.jobSiteId,
      definitionKey: definition,
      businessKey: input.idempotencyKey,
      payload: { action: action.action, receiptRevision: execution.revision, ...(typeof result.exportId === "string" ? { exportId: result.exportId } : {}) },
    });
  }
  if (action.action === "JOB_SITE_CLOSE@1") {
    const result = execution.result as Record<string, unknown>;
    const exportIds = Array.isArray(result.exportIds) ? result.exportIds.filter((value): value is string => typeof value === "string") : [];
    await Promise.all(exportIds.map((exportId) => enqueueJobSiteProcess({ organizationId: input.actor.organizationId, jobSiteId: input.actor.jobSiteId, definitionKey: "JOB_SITE_EXPORT@1", businessKey: exportId, payload: { exportId } })));
  }
  await recordProductAuditEvent({ organizationId: input.actor.organizationId, actorUserId: input.actor.userId, actorRole: input.actor.role, action: "JOB_SITE_ACTION_EXECUTED", entityType: "JOB_SITE", entityId: input.actor.jobSiteId, metadata: { automatic: input.internal === true } });
  return { replayed: false, ...execution };
}
