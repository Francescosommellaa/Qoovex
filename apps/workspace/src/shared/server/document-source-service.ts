import "server-only";

import { db, type Prisma } from "@qoovex/db";
import type { DocumentCategoryKey, DocumentSourceType } from "@qoovex/types";
import { documentCategoryKeys, documentSourceTypes } from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { appendContextTimelineEvent } from "./context-timeline-service";
import { isEnumValue, trimOptionalId, trimRequiredText } from "./document-domain-validation";
import { requireOrganizationDomainAccess } from "./domain-access-service";
import { auditActorFromContext, recordProductAuditEventBestEffort } from "./product-audit-service";
import { canReadDocument, getResourceScope } from "./resource-scope-service";

const policySelect = {
  id: true,
  organizationId: true,
  documentTypeId: true,
  categoryKey: true,
  sourceType: true,
  responsibleUserId: true,
  label: true,
  triggerKinds: true,
  allowSharing: true,
  allowAi: true,
  enabled: true,
  createdAt: true,
  updatedAt: true,
  archivedAt: true,
} as const;

const checkSelect = {
  id: true,
  organizationId: true,
  policyId: true,
  documentId: true,
  status: true,
  triggerKind: true,
  summary: true,
  errorCode: true,
  nextCheckAt: true,
  requestedById: true,
  createdAt: true,
  completedAt: true,
} as const;

function assertAllowedFields(input: Record<string, unknown>, allowed: readonly string[]) {
  const allowedSet = new Set(allowed);
  const unexpected = Object.keys(input).filter((key) => !allowedSet.has(key));
  if (unexpected.length) throw new AccessError("Dati fonte non consentiti.", 409);
}

function parseCategory(value: unknown): DocumentCategoryKey {
  if (!isEnumValue(documentCategoryKeys, value)) throw new AccessError("Categoria documentale non valida.", 409);
  return value;
}

function parseSourceType(value: unknown): Extract<DocumentSourceType, "DIRECT_UPLOAD" | "GUIDED_MANUAL"> {
  if (!isEnumValue(documentSourceTypes, value) || value === "AUTHORIZED_INTEGRATION") throw new AccessError("La fonte autorizzata richiede un'integrazione approvata separatamente.", 409);
  return value;
}

function parseBoolean(value: unknown, label: string, fallback?: boolean) {
  if (value === undefined && fallback !== undefined) return fallback;
  if (typeof value !== "boolean") throw new AccessError(`${label} non valido.`, 409);
  return value;
}

function parseTriggers(value: unknown): string[] {
  if (value === undefined) return ["MANUAL"];
  if (!Array.isArray(value) || value.length < 1 || value.length > 12) throw new AccessError("Trigger fonte non validi.", 409);
  return [...new Set(value.map((item) => trimRequiredText(item, "Trigger fonte", 2, 80).toUpperCase()))];
}

function toPolicyResponse<T extends { createdAt: Date; updatedAt: Date; archivedAt: Date | null; allowAi: boolean }>(policy: T) {
  return { ...policy, allowAi: false as const, createdAt: policy.createdAt.toISOString(), updatedAt: policy.updatedAt.toISOString(), archivedAt: policy.archivedAt?.toISOString() ?? null };
}

function toCheckResponse<T extends { nextCheckAt: Date | null; createdAt: Date; completedAt: Date | null }>(check: T) {
  return { ...check, nextCheckAt: check.nextCheckAt?.toISOString() ?? null, createdAt: check.createdAt.toISOString(), completedAt: check.completedAt?.toISOString() ?? null };
}

async function assertResponsibleUser(organizationId: string, userId: string | null | undefined) {
  if (!userId) return null;
  const membership = await db.organizationMembership.findFirst({ where: { organizationId, userId, revokedAt: null }, select: { userId: true } });
  if (!membership) throw new AccessError("Responsabile fonte non disponibile.", 404);
  return membership.userId;
}

async function assertDocumentType(organizationId: string, documentTypeId: string | null | undefined, categoryKey: DocumentCategoryKey) {
  if (!documentTypeId) return null;
  const type = await db.documentType.findFirst({ where: { id: documentTypeId, organizationId, archivedAt: null, categoryKey }, select: { id: true } });
  if (!type) throw new AccessError("Tipo documento non coerente con la categoria.", 409);
  return type.id;
}

function policyVisibility(scope: Awaited<ReturnType<typeof getResourceScope>>): Prisma.DocumentSourcePolicyWhereInput {
  return scope.fullAccess ? {} : { responsibleUserId: scope.context.userId };
}

export async function listDocumentSourcePolicies() {
  const { context, organizationId } = await requireOrganizationDomainAccess("documentSources:read");
  const scope = await getResourceScope(context);
  const policies = await db.documentSourcePolicy.findMany({ where: { organizationId, archivedAt: null, ...policyVisibility(scope) }, select: policySelect, orderBy: [{ categoryKey: "asc" }, { label: "asc" }] });
  return policies.map(toPolicyResponse);
}

export async function createDocumentSourcePolicy(input: Record<string, unknown>) {
  assertAllowedFields(input, ["documentTypeId", "categoryKey", "sourceType", "responsibleUserId", "label", "triggerKinds", "allowSharing", "enabled"]);
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documentSources:manage");
  const categoryKey = parseCategory(input.categoryKey);
  if (categoryKey === "UNCLASSIFIED" || categoryKey === "WORKER_RESTRICTED_ADMINISTRATION") throw new AccessError("La categoria non puo avere una fonte operativa attiva.", 409);
  const sourceType = parseSourceType(input.sourceType);
  const documentTypeId = await assertDocumentType(organizationId, trimOptionalId(input.documentTypeId, "Tipo documento"), categoryKey);
  const responsibleUserId = await assertResponsibleUser(organizationId, trimOptionalId(input.responsibleUserId, "Responsabile"));
  const label = trimRequiredText(input.label, "Nome fonte", 2, 160);
  const triggerKinds = parseTriggers(input.triggerKinds);
  const allowSharing = parseBoolean(input.allowSharing, "Condivisione fonte", false);
  const enabled = parseBoolean(input.enabled, "Stato fonte", true);
  const policy = await db.documentSourcePolicy.create({ data: { organizationId, documentTypeId, categoryKey, sourceType, responsibleUserId, label, triggerKinds, allowSharing, allowAi: false, enabled }, select: policySelect });
  await recordProductAuditEventBestEffort({ organizationId, ...auditActorFromContext(context, actorRole), action: "DOCUMENT_SOURCE_POLICY_CREATED", entityType: "DOCUMENT_SOURCE_POLICY", entityId: policy.id, metadata: { categoryKey, sourceType } });
  return toPolicyResponse(policy);
}

export async function updateDocumentSourcePolicy(policyId: string, input: Record<string, unknown>) {
  assertAllowedFields(input, ["documentTypeId", "sourceType", "responsibleUserId", "label", "triggerKinds", "allowSharing", "enabled"]);
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documentSources:manage");
  const existing = await db.documentSourcePolicy.findFirst({ where: { id: policyId, organizationId, archivedAt: null }, select: policySelect });
  if (!existing) throw new AccessError("Fonte documentale non trovata.", 404);
  const categoryKey = input.categoryKey === undefined ? existing.categoryKey : parseCategory(input.categoryKey);
  const data: Prisma.DocumentSourcePolicyUpdateInput = {
    ...(input.sourceType === undefined ? {} : { sourceType: parseSourceType(input.sourceType) }),
    ...(input.label === undefined ? {} : { label: trimRequiredText(input.label, "Nome fonte", 2, 160) }),
    ...(input.triggerKinds === undefined ? {} : { triggerKinds: parseTriggers(input.triggerKinds) }),
    ...(input.allowSharing === undefined ? {} : { allowSharing: parseBoolean(input.allowSharing, "Condivisione fonte") }),
    ...(input.enabled === undefined ? {} : { enabled: parseBoolean(input.enabled, "Stato fonte") }),
  };
  if (input.documentTypeId !== undefined) {
    const documentTypeId = await assertDocumentType(organizationId, trimOptionalId(input.documentTypeId, "Tipo documento"), categoryKey);
    data.documentType = documentTypeId ? { connect: { id: documentTypeId } } : { disconnect: true };
  }
  if (input.responsibleUserId !== undefined) {
    const responsibleUserId = await assertResponsibleUser(organizationId, trimOptionalId(input.responsibleUserId, "Responsabile"));
    data.responsibleUser = responsibleUserId ? { connect: { id: responsibleUserId } } : { disconnect: true };
  }
  if (!Object.keys(data).length) throw new AccessError("Nessun dato fonte da aggiornare.", 409);
  const policy = await db.documentSourcePolicy.update({ where: { id: existing.id }, data, select: policySelect });
  await recordProductAuditEventBestEffort({ organizationId, ...auditActorFromContext(context, actorRole), action: "DOCUMENT_SOURCE_POLICY_UPDATED", entityType: "DOCUMENT_SOURCE_POLICY", entityId: policy.id, metadata: { categoryKey: policy.categoryKey, sourceType: policy.sourceType } });
  return toPolicyResponse(policy);
}

export async function runDocumentSourceCheck(input: Record<string, unknown>) {
  assertAllowedFields(input, ["policyId", "triggerKind", "documentId"]);
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documentSources:check");
  const scope = await getResourceScope(context);
  const policyId = trimRequiredText(input.policyId, "Fonte documentale", 1, 191);
  const policy = await db.documentSourcePolicy.findFirst({ where: { id: policyId, organizationId, archivedAt: null, enabled: true, ...policyVisibility(scope) }, select: policySelect });
  if (!policy) throw new AccessError("Fonte documentale non trovata.", 404);
  const triggerKind = trimRequiredText(input.triggerKind, "Trigger controllo", 2, 80).toUpperCase();
  if (!policy.triggerKinds.includes(triggerKind) && triggerKind !== "MANUAL") throw new AccessError("Trigger non configurato per la fonte.", 409);
  const documentId = trimOptionalId(input.documentId, "Documento") ?? null;
  let currentDocument: { id: string; currentVersionId: string | null } | null = null;
  if (documentId) {
    const document = await db.document.findFirst({ where: { id: documentId, organizationId, archivedAt: null, documentType: { is: { categoryKey: policy.categoryKey } } }, select: { id: true, currentVersionId: true, documentTypeId: true, ownerType: true, workerId: true, jobSiteId: true } });
    if (!document || !canReadDocument(scope, document)) throw new AccessError("Documento non trovato.", 404);
    currentDocument = document;
  }
  const status = currentDocument?.currentVersionId ? "COMPLETED" as const : "NEEDS_ACTION" as const;
  const summary = status === "COMPLETED" ? "Documento corrente presente; nessuna acquisizione necessaria." : "Acquisizione manuale richiesta; nessun connettore e stato eseguito.";
  const completedAt = new Date();
  const check = await db.$transaction(async (tx) => {
    const created = await tx.documentSourceCheck.create({ data: { organizationId, policyId: policy.id, documentId, status, triggerKind, summary, requestedById: context.userId, completedAt }, select: checkSelect });
    if (status === "NEEDS_ACTION") {
      const existingRequest = await tx.operationalRequest.findFirst({ where: { organizationId, targetType: "DOCUMENT_SOURCE", targetId: policy.id, status: { in: ["OPEN", "IN_PROGRESS"] } }, select: { id: true } });
      if (!existingRequest) {
        await tx.operationalRequest.create({ data: { organizationId, targetType: "DOCUMENT_SOURCE", targetId: policy.id, title: `Acquisisci: ${policy.label}`, description: summary, assigneeUserId: policy.responsibleUserId, createdById: context.userId }, select: { id: true } });
      }
    }
    await appendContextTimelineEvent({ organizationId, eventKey: `document-source-check:${created.id}:completed`, targetType: "DOCUMENT_SOURCE", targetId: policy.id, eventType: "DOCUMENT_SOURCE_CHECKED", title: "Controllo fonte completato", summary, metadata: { checkId: created.id, status, documentId }, actorUserId: context.userId, actorRole, sourceType: "USER_ACTION", sourceId: created.id }, tx);
    return created;
  });
  await recordProductAuditEventBestEffort({ organizationId, ...auditActorFromContext(context, actorRole), action: "DOCUMENT_SOURCE_CHECK_CREATED", entityType: "DOCUMENT_SOURCE_CHECK", entityId: check.id, metadata: { status, triggerKind } });
  return toCheckResponse(check);
}

export async function registerDocumentAcquisition(input: Record<string, unknown>) {
  assertAllowedFields(input, ["policyId", "checkId", "documentId", "documentVersionId", "sourceType", "provenanceLabel"]);
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documentSources:check");
  const scope = await getResourceScope(context);
  const documentId = trimRequiredText(input.documentId, "Documento", 1, 191);
  const documentVersionId = trimOptionalId(input.documentVersionId, "Versione documento") ?? null;
  const sourceType = parseSourceType(input.sourceType);
  const provenanceLabel = trimRequiredText(input.provenanceLabel, "Provenienza", 2, 240);
  const document = await db.document.findFirst({ where: { id: documentId, organizationId, archivedAt: null }, select: { id: true, documentTypeId: true, ownerType: true, workerId: true, jobSiteId: true } });
  if (!document || !canReadDocument(scope, document)) throw new AccessError("Documento non trovato.", 404);
  let checksum: string | null = null;
  if (documentVersionId) {
    const version = await db.documentVersion.findFirst({ where: { id: documentVersionId, organizationId, documentId, archivedAt: null }, select: { checksum: true } });
    if (!version) throw new AccessError("Versione documento non trovata.", 404);
    checksum = version.checksum;
  }
  const policyId = trimOptionalId(input.policyId, "Fonte documentale") ?? null;
  if (policyId) {
    const policy = await db.documentSourcePolicy.findFirst({ where: { id: policyId, organizationId, archivedAt: null, ...policyVisibility(scope) }, select: { id: true } });
    if (!policy) throw new AccessError("Fonte documentale non trovata.", 404);
  }
  const checkId = trimOptionalId(input.checkId, "Controllo fonte") ?? null;
  if (checkId) {
    const check = await db.documentSourceCheck.findFirst({ where: { id: checkId, organizationId, ...(policyId ? { policyId } : {}) }, select: { id: true } });
    if (!check) throw new AccessError("Controllo fonte non trovato.", 404);
  }
  const acquisition = await db.documentAcquisition.create({ data: { organizationId, policyId, checkId, documentId, documentVersionId, sourceType, status: documentVersionId ? "COMPLETED" : "PENDING_REVIEW", provenanceLabel, checksum, confirmedById: documentVersionId ? context.userId : null, confirmedAt: documentVersionId ? new Date() : null }, select: { id: true, status: true, createdAt: true } });
  await recordProductAuditEventBestEffort({ organizationId, ...auditActorFromContext(context, actorRole), action: "DOCUMENT_ACQUISITION_CREATED", entityType: "DOCUMENT_ACQUISITION", entityId: acquisition.id, metadata: { sourceType, status: acquisition.status } });
  return { ...acquisition, createdAt: acquisition.createdAt.toISOString() };
}
