import "server-only";

import { createHash } from "node:crypto";
import { z } from "zod";

export const JOB_SITE_SCHEMA_VERSION = 1 as const;

export function canonicalize(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "bigint") return value.toString();
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => [key, canonicalize(nested)]));
  }
  return value;
}

export function fingerprintPayload(value: unknown) {
  return createHash("sha256").update(JSON.stringify(canonicalize(value))).digest("hex");
}

const id = z.string().trim().min(1).max(191);
const minorUnit = z.string().regex(/^\d+$/, "Inserisci un importo valido.").transform((value) => BigInt(value));
const optionalMinorUnit = z.string().regex(/^-?\d+$/).nullable().optional().transform((value) => value == null ? null : BigInt(value));

export const initialAgreementPayloadSchema = z.object({
  schemaVersion: z.literal(JOB_SITE_SCHEMA_VERSION),
  name: z.string().trim().min(2).max(160),
  address: z.string().trim().max(500).nullable(),
  description: z.string().trim().max(4000).nullable(),
  participantSummary: z.array(z.object({ participantId: id, publicRoleLabel: z.string().max(120).nullable() })).max(100),
  initialEstimateMinor: z.string().regex(/^\d+$/).nullable(),
  estimatedCompletionAt: z.string().datetime().nullable(),
  sharedCommercialNotes: z.string().max(4000).nullable(),
}).strict();

export const timelinePayloadSchema = z.object({
  schemaVersion: z.literal(JOB_SITE_SCHEMA_VERSION),
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().max(10_000).nullable(),
  relatedId: id.nullable().optional(),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
}).strict();

export const proposalPayloadSchema = z.object({
  schemaVersion: z.literal(JOB_SITE_SCHEMA_VERSION),
  priceMode: z.enum(["NO_PRICE_CHANGE", "FIXED_DELTA", "RANGE"]),
  changeSummary: z.string().trim().min(1).max(4000),
  reason: z.string().trim().min(1).max(4000),
  affectedStepIds: z.array(id).max(100),
  previousPriceMinor: z.string().regex(/^\d+$/).nullable(),
  economicDeltaMinor: z.string().regex(/^-?\d+$/).nullable(),
  rangeMinimumMinor: z.string().regex(/^\d+$/).nullable(),
  rangeMaximumMinor: z.string().regex(/^\d+$/).nullable(),
  scheduleImpact: z.string().max(2000).nullable(),
  estimatedCompletionAt: z.string().datetime().nullable(),
  collaboratorParticipantIds: z.array(id).max(100),
  conditions: z.string().max(4000).nullable(),
}).strict().superRefine((value, context) => {
  if (value.priceMode === "NO_PRICE_CHANGE" && [value.economicDeltaMinor, value.rangeMinimumMinor, value.rangeMaximumMinor].some((item) => item !== null)) context.addIssue({ code: "custom", path: ["priceMode"], message: "Nessuna variazione economica deve essere priva di importi." });
  if (value.priceMode === "FIXED_DELTA" && value.economicDeltaMinor === null) context.addIssue({ code: "custom", path: ["economicDeltaMinor"], message: "Indica la variazione economica." });
  if (value.priceMode === "RANGE") {
    if (value.rangeMinimumMinor === null || value.rangeMaximumMinor === null) context.addIssue({ code: "custom", path: ["rangeMinimumMinor"], message: "Indica entrambi gli estremi dell'intervallo." });
    else if (BigInt(value.rangeMinimumMinor) > BigInt(value.rangeMaximumMinor)) context.addIssue({ code: "custom", path: ["rangeMaximumMinor"], message: "Il massimo deve essere maggiore o uguale al minimo." });
  }
});

export const closureSnapshotSchema = z.object({
  schemaVersion: z.literal(JOB_SITE_SCHEMA_VERSION),
  jobSiteRevision: z.number().int().positive(),
  timelineSequence: z.string().regex(/^\d+$/),
  openStepCount: z.literal(0),
  negotiatingProposalCount: z.literal(0),
  unresolvedRequestCount: z.literal(0),
  pendingPaymentCount: z.literal(0),
  openDisputeCount: z.literal(0),
  statement: z.string().min(1).max(2000),
  jobSite: z.object({ id: id, name: z.string(), address: z.string().nullable(), estimatedCompletionAt: z.string().datetime().nullable() }).strict(),
  participants: z.array(z.object({ id, kind: z.enum(["ORGANIZATION_MEMBER", "CLIENT"]), publicRoleLabel: z.string().nullable() }).strict()).max(200),
  steps: z.array(z.object({ id, title: z.string(), status: z.string() }).strict()).max(1000),
  payments: z.array(z.object({ id, status: z.string(), amountMinor: z.string().regex(/^\d+$/) }).strict()).max(1000),
}).strict();

export const effectPayloadSchemas = {
  STEP_CREATE: z.object({ title: z.string().min(1).max(200), description: z.string().max(4000).nullable(), expectedOutcome: z.string().max(4000).nullable() }).strict(),
  STEP_UPDATE: z.object({ stepId: id, title: z.string().min(1).max(200).optional(), description: z.string().max(4000).nullable().optional(), expectedOutcome: z.string().max(4000).nullable().optional() }).strict(),
  STEP_CANCEL: z.object({ stepId: id }).strict(),
  STEP_ASSIGN_USER: z.object({ stepId: id, participantId: id, roleLabel: z.string().max(120).nullable() }).strict(),
  STEP_UNASSIGN_USER: z.object({ stepId: id, participantId: id }).strict(),
  STEP_ASSIGN_WORKER: z.object({ stepId: id, workerId: id, roleLabel: z.string().max(120).nullable() }).strict(),
  STEP_UNASSIGN_WORKER: z.object({ stepId: id, workerId: id }).strict(),
  ESTIMATED_COMPLETION_UPDATE: z.object({ estimatedCompletionAt: z.string().datetime().nullable() }).strict(),
  COMMERCIAL_DELTA: z.object({ economicDeltaMinor: z.string().regex(/^-?\d+$/) }).strict(),
} as const;

const actionBase = z.object({ expectedRevision: z.number().int().positive() });

export const jobSiteActionInputSchema = z.discriminatedUnion("action", [
  actionBase.extend({ action: z.literal("CLIENT_PARTICIPATION_ACTIVATE@1"), invitationId: id }),
  actionBase.extend({ action: z.literal("INITIAL_AGREEMENT_CONFIRM@1"), agreementVersionId: id, decision: z.enum(["ACCEPTED", "REJECTED"]) }),
  actionBase.extend({ action: z.literal("STEP_STATUS_TRANSITION@1"), stepId: id, nextStatus: z.enum(["NOT_STARTED", "IN_PROGRESS", "WAITING", "WORK_COMPLETED", "CHANGES_REQUESTED", "CONFIRMED", "CANCELLED"]) }),
  actionBase.extend({ action: z.literal("CHANGE_PROPOSAL_APPLY@1"), proposalId: id, versionId: id, decision: z.enum(["ACCEPTED", "REJECTED"]) }),
  actionBase.extend({ action: z.literal("PAYMENT_REQUEST_CREATE@1"), paymentProfileId: id, amountMinor: minorUnit, reason: z.string().trim().min(1).max(4000), dueAt: z.string().datetime().nullable(), stepIds: z.array(id).max(100), proposalIds: z.array(id).max(100) }),
  actionBase.extend({ action: z.literal("PAYMENT_TRANSFER_DECLARE@1"), paymentRequestId: id, amountMinor: minorUnit, transferredAt: z.string().datetime(), method: z.string().trim().min(1).max(120), reference: z.string().max(200).nullable(), note: z.string().max(2000).nullable(), receiptAttachmentId: id.nullable() }),
  actionBase.extend({ action: z.literal("PAYMENT_RECEIPT_CONFIRM@1"), paymentRequestId: id, outcome: z.enum(["CONFIRMED_RECEIVED", "NOT_RECEIVED", "AMOUNT_MISMATCH", "CLARIFICATION_REQUIRED"]), note: z.string().max(2000).nullable() }),
  actionBase.extend({ action: z.literal("DISPUTE_PRESERVATION_CREATE@1"), disputeId: id }),
  actionBase.extend({ action: z.literal("JOB_SITE_CLOSE@1"), closureId: id, decision: z.enum(["ACCEPTED", "REJECTED"]) }),
  actionBase.extend({ action: z.literal("JOB_SITE_REOPEN@1"), reopeningProposalId: id, decision: z.enum(["ACCEPTED", "REJECTED"]) }),
  actionBase.extend({ action: z.literal("JOB_SITE_EXPORT_CREATE@1"), audience: z.enum(["CLIENT", "ORGANIZATION"]) }),
  actionBase.extend({ action: z.literal("JOB_SITE_ARCHIVE@1") }),
  actionBase.extend({ action: z.literal("ATTACHMENT_FINALIZE@1"), category: z.enum(["PHOTO", "VIDEO", "DOCUMENT", "EVIDENCE", "EXPENSE_RECEIPT", "PAYMENT_RECEIPT", "PROPOSAL", "REQUEST", "DISPUTE", "CLOSURE", "OTHER"]), sourceKind: z.enum(["DOCUMENT_VERSION", "EVIDENCE", "DIRECT_UPLOAD"]), sourceId: id.nullable(), blobKey: z.string().min(1).max(1000), originalFileName: z.string().min(1).max(255), mimeType: z.string().min(1).max(120), size: z.number().int().positive().max(4 * 1024 * 1024), checksumSha256: z.string().regex(/^[a-f0-9]{64}$/) }),
]);

export type JobSiteActionInput = z.infer<typeof jobSiteActionInputSchema>;

export const createStepSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(4000).nullable().optional(),
  expectedOutcome: z.string().trim().max(4000).nullable().optional(),
  sortOrder: z.number().int().min(0).max(100_000),
  indicativeDate: z.string().datetime().nullable().optional(),
  estimatedCompletionAt: z.string().datetime().nullable().optional(),
  economicValueMinor: optionalMinorUnit,
}).strict();

export const appendTimelineSchema = z.object({
  expectedRevision: z.number().int().positive(),
  type: z.enum(["WORK_UPDATE", "COMMENT", "EVIDENCE", "SHARED_EXPENSE", "SHARED_DOCUMENT", "CLARIFICATION_REQUESTED", "CLARIFICATION_RESPONDED", "ISSUE_REPORTED"]),
  audience: z.enum(["INTERNAL", "SHARED"]),
  disclosure: z.enum(["GENERAL", "COMMERCIAL", "RESTRICTED_COMMERCIAL"]),
  stepId: id.nullable().optional(),
  replyToEventId: id.nullable().optional(),
  payload: timelinePayloadSchema,
  attachmentIds: z.array(id).max(20).default([]),
}).strict();

export const createProposalSchema = z.object({
  expectedRevision: z.number().int().positive(),
  representedSide: z.enum(["ORGANIZATION_MEMBER", "CLIENT"]),
  payload: proposalPayloadSchema,
  effects: z.array(z.object({ type: z.enum(["STEP_CREATE", "STEP_UPDATE", "STEP_CANCEL", "STEP_ASSIGN_USER", "STEP_UNASSIGN_USER", "STEP_ASSIGN_WORKER", "STEP_UNASSIGN_WORKER", "ESTIMATED_COMPLETION_UPDATE", "COMMERCIAL_DELTA"]), payload: z.record(z.string(), z.unknown()) }).strict()).max(100),
  expiresAt: z.string().datetime().nullable().optional(),
}).strict();

export function toFieldErrors(error: z.ZodError) {
  return error.flatten().fieldErrors as Record<string, string[]>;
}
