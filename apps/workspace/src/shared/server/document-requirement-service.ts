import "server-only";

import { db } from "@qoovex/db";
import type {
  ArchiveDocumentRequirementResponse,
  CreateDocumentRequirementInput,
  DocumentRequirementSummary,
  DocumentOwnerType,
  MissingDocumentRequirementItem,
  MissingDocumentRequirementsResponse,
  RequirementTargetType,
  UpdateDocumentRequirementInput,
} from "@qoovex/types";
import { documentCategoryRegistry, documentTypeAppliesToValues, requirementTargetTypes } from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { assertDocumentTaxonomy, isEnumValue, rejectBinaryPayload, trimOptionalId, trimOptionalText, trimRequiredText } from "./document-domain-validation";
import { requireOrganizationDomainAccess } from "./domain-access-service";
import { auditActorFromContext, recordProductAuditEventBestEffort } from "./product-audit-service";
import { getResourceScope, type ResourceScope } from "./resource-scope-service";
import { recordSupportAccess } from "./support-access-service";

const REQUIREMENT_MANAGE_ROLES = ["OWNER", "ADMIN"] as const;
const REQUIREMENT_READ_ROLES = ["OWNER", "ADMIN", "SAFETY_CONSULTANT"] as const;
const REQUIREMENT_MISSING_ROLES = ["OWNER", "ADMIN", "SAFETY_CONSULTANT", "SITE_MANAGER", "WORKER"] as const;

const requirementSelect = {
  id: true,
  organizationId: true,
  name: true,
  description: true,
  targetType: true,
  documentTypeId: true,
  jobSiteId: true,
  isRequired: true,
  createdAt: true,
  updatedAt: true,
  archivedAt: true,
  documentType: { select: { id: true, name: true, appliesTo: true, categoryKey: true, sensitivity: true } },
  jobSite: { select: { id: true, name: true } },
} as const;

function iso(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}

function toRequirementSummary(requirement: {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  targetType: RequirementTargetType;
  documentTypeId: string | null;
  jobSiteId: string | null;
  isRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
  documentType?: { name: string } | null;
  jobSite?: { name: string } | null;
}): DocumentRequirementSummary {
  return {
    id: requirement.id,
    organizationId: requirement.organizationId,
    name: requirement.name,
    description: requirement.description,
    targetType: requirement.targetType,
    documentTypeId: requirement.documentTypeId,
    documentTypeName: requirement.documentType?.name ?? null,
    jobSiteId: requirement.jobSiteId,
    jobSiteName: requirement.jobSite?.name ?? null,
    isRequired: requirement.isRequired,
    createdAt: requirement.createdAt.toISOString(),
    updatedAt: requirement.updatedAt.toISOString(),
    archivedAt: iso(requirement.archivedAt),
  };
}

function parseTargetType(value: unknown): RequirementTargetType {
  if (!isEnumValue(requirementTargetTypes, value)) throw new AccessError("Target requisito non valido.", 409);
  return value;
}

function assertTargetDocumentTypeMatch(targetType: RequirementTargetType, appliesTo: string) {
  if (!isEnumValue(documentTypeAppliesToValues, appliesTo)) throw new AccessError("Tipo documento non valido.", 409);
  if (targetType === "ORGANIZATION" && appliesTo !== "ORGANIZATION") throw new AccessError("Il requisito azienda richiede un tipo documento azienda.", 409);
  if (targetType === "WORKER" && appliesTo !== "WORKER") throw new AccessError("Il requisito lavoratore richiede un tipo documento lavoratore.", 409);
  if (targetType === "JOB_SITE" && appliesTo !== "JOB_SITE") throw new AccessError("Il requisito cantiere richiede un tipo documento cantiere.", 409);
}

async function assertDocumentTypeForRequirement(organizationId: string, documentTypeId: string, targetType: RequirementTargetType) {
  const documentType = await db.documentType.findFirst({
    where: { id: documentTypeId, organizationId, archivedAt: null },
    select: { id: true, name: true, appliesTo: true, categoryKey: true, sensitivity: true },
  });
  if (!documentType) throw new AccessError("Tipo documento non trovato.", 404);
  assertDocumentTaxonomy(documentType);
  assertTargetDocumentTypeMatch(targetType, documentType.appliesTo);
  return documentType;
}

async function assertJobSiteForRequirement(organizationId: string, targetType: RequirementTargetType, jobSiteId: string | null | undefined) {
  if (targetType !== "JOB_SITE") {
    if (jobSiteId) throw new AccessError("Solo un requisito cantiere puo indicare un cantiere.", 409);
    return null;
  }
  if (!jobSiteId) return null;
  const jobSite = await db.jobSite.findFirst({ where: { id: jobSiteId, organizationId, archivedAt: null }, select: { id: true } });
  if (!jobSite) throw new AccessError("Cantiere non trovato.", 404);
  return jobSite.id;
}

async function parseCreateInput(organizationId: string, input: CreateDocumentRequirementInput | Record<string, unknown>) {
  rejectBinaryPayload(input as Record<string, unknown>);
  const targetType = parseTargetType(input.targetType);
  const documentTypeId = trimOptionalId(input.documentTypeId, "Tipo documento");
  if (!documentTypeId) throw new AccessError("Il primo rilascio richiede un tipo documento configurato.", 409);
  await assertDocumentTypeForRequirement(organizationId, documentTypeId, targetType);
  const jobSiteId = await assertJobSiteForRequirement(organizationId, targetType, trimOptionalId(input.jobSiteId, "Cantiere"));
  return {
    name: trimRequiredText(input.name, "Nome requisito", 2, 160),
    description: trimOptionalText(input.description, "Descrizione requisito", 2000) ?? null,
    targetType,
    documentTypeId,
    jobSiteId,
    isRequired: input.isRequired === undefined ? true : parseBoolean(input.isRequired, "isRequired"),
  };
}

async function parseUpdateInput(organizationId: string, existing: { targetType: RequirementTargetType; documentTypeId: string | null; jobSiteId: string | null }, input: UpdateDocumentRequirementInput | Record<string, unknown>) {
  rejectBinaryPayload(input as Record<string, unknown>);
  const targetType = input.targetType === undefined ? existing.targetType : parseTargetType(input.targetType);
  const documentTypeId = input.documentTypeId === undefined ? existing.documentTypeId : trimOptionalId(input.documentTypeId, "Tipo documento");
  if (!documentTypeId) throw new AccessError("Il primo rilascio richiede un tipo documento configurato.", 409);
  await assertDocumentTypeForRequirement(organizationId, documentTypeId, targetType);
  const jobSiteIdInput = input.jobSiteId === undefined ? existing.jobSiteId : trimOptionalId(input.jobSiteId, "Cantiere");
  const jobSiteId = await assertJobSiteForRequirement(organizationId, targetType, jobSiteIdInput);
  const data: {
    name?: string;
    description?: string | null;
    targetType?: RequirementTargetType;
    documentTypeId?: string;
    jobSiteId?: string | null;
    isRequired?: boolean;
  } = {};
  if (input.name !== undefined) data.name = trimRequiredText(input.name, "Nome requisito", 2, 160);
  if (input.description !== undefined) data.description = trimOptionalText(input.description, "Descrizione requisito", 2000) ?? null;
  if (input.targetType !== undefined) data.targetType = targetType;
  if (input.documentTypeId !== undefined) data.documentTypeId = documentTypeId;
  if (input.jobSiteId !== undefined || input.targetType !== undefined) data.jobSiteId = jobSiteId;
  if (input.isRequired !== undefined) data.isRequired = parseBoolean(input.isRequired, "isRequired");
  if (!Object.keys(data).length) throw new AccessError("Nessun dato requisito da aggiornare.", 409);
  return data;
}

function parseBoolean(value: unknown, label: string) {
  if (typeof value !== "boolean") throw new AccessError(`${label} non valido.`, 409);
  return value;
}

export async function listDocumentRequirements(): Promise<DocumentRequirementSummary[]> {
  const { context, organizationId } = await requireOrganizationDomainAccess("documents:read", REQUIREMENT_READ_ROLES);
  const requirements = await db.documentRequirement.findMany({
    where: { organizationId, archivedAt: null },
    select: requirementSelect,
    orderBy: [{ targetType: "asc" }, { name: "asc" }],
  });
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "document-requirements" });
  return requirements.map(toRequirementSummary);
}

export async function createDocumentRequirement(input: CreateDocumentRequirementInput | Record<string, unknown>): Promise<DocumentRequirementSummary> {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documents:update", REQUIREMENT_MANAGE_ROLES);
  const data = await parseCreateInput(organizationId, input);
  const requirement = await db.documentRequirement.create({ data: { organizationId, ...data }, select: requirementSelect });
  await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "document-requirement", resourceId: requirement.id });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "DOCUMENT_REQUIREMENT_CREATED",
    entityType: "DOCUMENT_REQUIREMENT",
    entityId: requirement.id,
    metadata: { targetType: requirement.targetType },
  });
  return toRequirementSummary(requirement);
}

export async function updateDocumentRequirement(requirementId: string, input: UpdateDocumentRequirementInput | Record<string, unknown>): Promise<DocumentRequirementSummary> {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documents:update", REQUIREMENT_MANAGE_ROLES);
  const existing = await db.documentRequirement.findFirst({
    where: { id: requirementId, organizationId, archivedAt: null },
    select: { id: true, targetType: true, documentTypeId: true, jobSiteId: true },
  });
  if (!existing) throw new AccessError("Requisito documentale non trovato.", 404);
  const data = await parseUpdateInput(organizationId, existing, input);
  const requirement = await db.documentRequirement.update({ where: { id: existing.id }, data, select: requirementSelect });
  await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "document-requirement", resourceId: requirement.id });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "DOCUMENT_REQUIREMENT_UPDATED",
    entityType: "DOCUMENT_REQUIREMENT",
    entityId: requirement.id,
    metadata: { targetType: requirement.targetType },
  });
  return toRequirementSummary(requirement);
}

export async function archiveDocumentRequirement(requirementId: string): Promise<ArchiveDocumentRequirementResponse> {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documents:archive", REQUIREMENT_MANAGE_ROLES);
  const existing = await db.documentRequirement.findFirst({ where: { id: requirementId, organizationId, archivedAt: null }, select: { id: true } });
  if (!existing) throw new AccessError("Requisito documentale non trovato.", 404);
  const requirement = await db.documentRequirement.update({ where: { id: existing.id }, data: { archivedAt: new Date() }, select: requirementSelect });
  await recordSupportAccess({ userId: context.userId, action: "SENSITIVE", resourceType: "document-requirement", resourceId: requirement.id });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "DOCUMENT_REQUIREMENT_ARCHIVED",
    entityType: "DOCUMENT_REQUIREMENT",
    entityId: requirement.id,
    metadata: { targetType: requirement.targetType },
  });
  return { requirement: toRequirementSummary(requirement), archived: true };
}

function targetKey(ownerType: DocumentOwnerType, workerId: string | null, jobSiteId: string | null, documentTypeId: string) {
  return `${ownerType}:${workerId ?? ""}:${jobSiteId ?? ""}:${documentTypeId}`;
}

async function buildVisibleTargets(organizationId: string, scope: ResourceScope) {
  const [workers, jobSites] = await Promise.all([
    scope.fullAccess
      ? db.worker.findMany({ where: { organizationId, archivedAt: null, status: "ACTIVE" }, select: { id: true, displayName: true }, orderBy: { displayName: "asc" } })
      : scope.actorRole === "WORKER" && scope.linkedWorker
        ? Promise.resolve([{ id: scope.linkedWorker.id, displayName: scope.linkedWorker.displayName }])
        : Promise.resolve([]),
    scope.fullAccess
      ? db.jobSite.findMany({ where: { organizationId, archivedAt: null, status: "ACTIVE" }, select: { id: true, name: true }, orderBy: { name: "asc" } })
      : scope.visibleJobSiteIds.length
        ? db.jobSite.findMany({ where: { organizationId, id: { in: scope.visibleJobSiteIds }, archivedAt: null, status: "ACTIVE" }, select: { id: true, name: true }, orderBy: { name: "asc" } })
        : Promise.resolve([]),
  ]);
  return { workers, jobSites };
}

export async function buildMissingDocumentRequirementItemsForScope(input: {
  organizationId: string;
  scope: ResourceScope;
  visibleTargets?: {
    workers: ReadonlyArray<{ id: string; displayName: string }>;
    jobSites: ReadonlyArray<{ id: string; name: string }>;
  };
}): Promise<MissingDocumentRequirementItem[]> {
  const requirements = await db.documentRequirement.findMany({
    where: {
      organizationId: input.organizationId,
      archivedAt: null,
      isRequired: true,
      documentTypeId: { not: null },
      documentType: {
        archivedAt: null,
        categoryKey: { not: "UNCLASSIFIED" },
        ...(input.scope.actorRole === "OWNER" || input.scope.actorRole === "ADMIN" ? {} : { sensitivity: "STANDARD" as const }),
      },
    },
    select: {
      id: true,
      name: true,
      targetType: true,
      documentTypeId: true,
      jobSiteId: true,
      documentType: { select: { id: true, name: true, categoryKey: true } },
    },
    orderBy: [{ targetType: "asc" }, { name: "asc" }],
  });
  if (!requirements.length) return [];

  const visible = input.visibleTargets ?? await buildVisibleTargets(input.organizationId, input.scope);
  const targetFilters = [
    ...(input.scope.fullAccess && requirements.some((item) => item.targetType === "ORGANIZATION") ? [{ ownerType: "ORGANIZATION" as const }] : []),
    ...(visible.workers.length ? [{ ownerType: "WORKER" as const, workerId: { in: visible.workers.map((item) => item.id) } }] : []),
    ...(visible.jobSites.length ? [{ ownerType: "JOB_SITE" as const, jobSiteId: { in: visible.jobSites.map((item) => item.id) } }] : []),
  ];
  const relevantDocumentTypeIds = [...new Set(requirements.flatMap((item) => item.documentTypeId ? [item.documentTypeId] : []))];
  const documents = targetFilters.length && relevantDocumentTypeIds.length
    ? await db.document.findMany({
      where: { organizationId: input.organizationId, archivedAt: null, documentTypeId: { in: relevantDocumentTypeIds }, OR: targetFilters },
      select: { documentTypeId: true, ownerType: true, workerId: true, jobSiteId: true },
    })
    : [];
  const present = new Set(documents.map((document) => targetKey(document.ownerType, document.workerId, document.jobSiteId, document.documentTypeId ?? "")));
  const missing: MissingDocumentRequirementItem[] = [];

  for (const requirement of requirements) {
    if (!requirement.documentTypeId || !requirement.documentType) continue;
    if (requirement.targetType === "ORGANIZATION") {
      if (!input.scope.fullAccess) continue;
      const key = targetKey("ORGANIZATION", null, null, requirement.documentTypeId);
      if (!present.has(key)) {
        missing.push({
          id: `${requirement.id}:organization`,
          requirementId: requirement.id,
          requirementName: requirement.name,
          documentTypeId: requirement.documentTypeId,
          documentTypeName: requirement.documentType.name,
          categoryKey: requirement.documentType.categoryKey,
          categoryLabel: documentCategoryRegistry[requirement.documentType.categoryKey].label,
          targetType: requirement.targetType,
          ownerType: "ORGANIZATION",
          ownerLabel: "Azienda",
        });
      }
    }
    if (requirement.targetType === "WORKER") {
      for (const worker of visible.workers) {
        const key = targetKey("WORKER", worker.id, null, requirement.documentTypeId);
        if (!present.has(key)) {
          missing.push({
            id: `${requirement.id}:worker:${worker.id}`,
            requirementId: requirement.id,
            requirementName: requirement.name,
            documentTypeId: requirement.documentTypeId,
            documentTypeName: requirement.documentType.name,
            categoryKey: requirement.documentType.categoryKey,
            categoryLabel: documentCategoryRegistry[requirement.documentType.categoryKey].label,
            targetType: requirement.targetType,
            ownerType: "WORKER",
            workerId: worker.id,
            workerName: worker.displayName,
            ownerLabel: worker.displayName,
          });
        }
      }
    }
    if (requirement.targetType === "JOB_SITE") {
      const jobSites = requirement.jobSiteId ? visible.jobSites.filter((jobSite) => jobSite.id === requirement.jobSiteId) : visible.jobSites;
      for (const jobSite of jobSites) {
        const key = targetKey("JOB_SITE", null, jobSite.id, requirement.documentTypeId);
        if (!present.has(key)) {
          missing.push({
            id: `${requirement.id}:job-site:${jobSite.id}`,
            requirementId: requirement.id,
            requirementName: requirement.name,
            documentTypeId: requirement.documentTypeId,
            documentTypeName: requirement.documentType.name,
            categoryKey: requirement.documentType.categoryKey,
            categoryLabel: documentCategoryRegistry[requirement.documentType.categoryKey].label,
            targetType: requirement.targetType,
            ownerType: "JOB_SITE",
            jobSiteId: jobSite.id,
            jobSiteName: jobSite.name,
            ownerLabel: jobSite.name,
          });
        }
      }
    }
  }

  return missing.sort((a, b) => `${a.ownerLabel}:${a.requirementName}`.localeCompare(`${b.ownerLabel}:${b.requirementName}`, "it"));
}

export async function getMissingDocumentRequirements(visibleTargets?: {
  workers: ReadonlyArray<{ id: string; displayName: string }>;
  jobSites: ReadonlyArray<{ id: string; name: string }>;
}): Promise<MissingDocumentRequirementsResponse> {
  const { context, organizationId } = await requireOrganizationDomainAccess("documents:read", REQUIREMENT_MISSING_ROLES);
  const scope = await getResourceScope(context);
  const items = await buildMissingDocumentRequirementItemsForScope({ organizationId, scope, visibleTargets });
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "missing-document-requirements" });
  return { items, generatedAt: new Date().toISOString() };
}
