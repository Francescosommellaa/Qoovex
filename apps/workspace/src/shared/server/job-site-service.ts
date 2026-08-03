import "server-only";

import { db } from "@qoovex/db";
import { AccessError } from "./access-errors";
import { trimOptionalText, trimRequiredText } from "./document-domain-validation";
import { requireOrganizationDomainAccess } from "./domain-access-service";
import { auditActorFromContext, recordProductAuditEventBestEffort } from "./product-audit-service";
import { canReadJobSite, getResourceScope } from "./resource-scope-service";
import { parseOptionalDateRange, rejectSensitiveFields } from "./worker-jobsite-validation";

const MANAGE_ROLES = ["OWNER", "COLLABORATOR"] as const;
const READ_ROLES = ["OWNER", "COLLABORATOR"] as const;
const jobSiteSelect = { id: true, organizationId: true, name: true, address: true, description: true, status: true, revision: true, estimatedCompletionAt: true, startDate: true, endDate: true, notes: true, createdAt: true, updatedAt: true, archivedAt: true } as const;

export interface CreateJobSiteInput extends Record<string, unknown> {
  name?: unknown; address?: unknown; description?: unknown; startDate?: unknown; endDate?: unknown; notes?: unknown;
  collaboratorMembershipIds?: unknown; workerIds?: unknown; continueAfterDuplicateWarning?: unknown;
}
export type UpdateJobSiteInput = Omit<CreateJobSiteInput, "collaboratorMembershipIds" | "workerIds" | "continueAfterDuplicateWarning">;

function parseIds(value: unknown, label: string) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !item.trim())) throw new AccessError(`${label} non validi.`, 409);
  return [...new Set(value.map((item) => String(item).trim()))];
}

function parsed(input: UpdateJobSiteInput, partial = false) {
  const dates = parseOptionalDateRange({ startDate: input.startDate, endDate: input.endDate });
  return {
    ...(input.name !== undefined || !partial ? { name: trimRequiredText(input.name, "Nome cantiere", 2, 160) } : {}),
    ...(input.address !== undefined || !partial ? { address: trimOptionalText(input.address, "Indirizzo cantiere", 500) ?? null } : {}),
    ...(input.description !== undefined || !partial ? { description: trimOptionalText(input.description, "Descrizione cantiere", 4000) ?? null } : {}),
    ...(input.startDate !== undefined || input.endDate !== undefined || !partial ? { startDate: dates.resolvedStartDate, endDate: dates.resolvedEndDate } : {}),
    ...(input.notes !== undefined || !partial ? { notes: trimOptionalText(input.notes, "Note cantiere", 4000) ?? null } : {}),
  };
}

export async function findJobSiteDuplicates(input: { name?: unknown; address?: unknown }) {
  const { organizationId } = await requireOrganizationDomainAccess("jobSites:read", READ_ROLES);
  const name = trimRequiredText(input.name, "Nome cantiere", 2, 160);
  const address = trimOptionalText(input.address, "Indirizzo cantiere", 500);
  return db.jobSite.findMany({ where: { organizationId, archivedAt: null, OR: [{ name: { equals: name, mode: "insensitive" } }, ...(address ? [{ address: { equals: address, mode: "insensitive" as const } }] : [])] }, select: jobSiteSelect, take: 5, orderBy: { updatedAt: "desc" } });
}

export async function listJobSites(options: { archived?: boolean; search?: string | null } = {}) {
  const { context, organizationId } = await requireOrganizationDomainAccess("jobSites:read", READ_ROLES);
  const scope = await getResourceScope(context);
  const search = options.search?.trim();
  return db.jobSite.findMany({ where: { organizationId, archivedAt: options.archived ? { not: null } : null, ...(scope.fullAccess ? {} : { id: { in: scope.visibleJobSiteIds } }), ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { address: { contains: search, mode: "insensitive" } }] } : {}) }, select: jobSiteSelect, orderBy: [{ updatedAt: "desc" }, { name: "asc" }] });
}

export async function getJobSite(jobSiteId: string) {
  const { context, organizationId } = await requireOrganizationDomainAccess("jobSites:read", READ_ROLES);
  const scope = await getResourceScope(context);
  const value = await db.jobSite.findFirst({ where: { id: jobSiteId, organizationId }, select: jobSiteSelect });
  if (!value || !canReadJobSite(scope, value.id)) throw new AccessError("Cantiere non trovato.", 404);
  return value;
}

export async function createJobSite(input: CreateJobSiteInput) {
  rejectSensitiveFields(input);
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("jobSites:create", MANAGE_ROLES);
  const data = { ...parsed(input), name: trimRequiredText(input.name, "Nome cantiere", 2, 160) };
  const collaboratorMembershipIds = parseIds(input.collaboratorMembershipIds, "Collaboratori");
  const workerIds = parseIds(input.workerIds, "Lavoratori");
  const duplicate = await db.jobSite.findFirst({ where: { organizationId, archivedAt: null, name: { equals: data.name, mode: "insensitive" } }, select: { id: true } });
  if (duplicate && input.continueAfterDuplicateWarning !== true) throw new AccessError("Esiste gia un cantiere con questo nome.", 409);
  const memberships = collaboratorMembershipIds.length ? await db.organizationMembership.findMany({ where: { id: { in: collaboratorMembershipIds }, organizationId, revokedAt: null }, select: { id: true, userId: true } }) : [];
  if (memberships.length !== collaboratorMembershipIds.length) throw new AccessError("Uno o piu Collaborator non sono disponibili.", 409);
  const created = await db.$transaction(async (tx) => {
    const jobSite = await tx.jobSite.create({ data: { organizationId, ...data, status: "DRAFT", historicalCreatorUserId: context.userId, workerAssignments: workerIds.length ? { create: workerIds.map((workerId) => ({ organizationId, workerId, assignedById: context.userId })) } : undefined }, select: jobSiteSelect });
    if (memberships.length) await tx.jobSiteParticipant.createMany({ data: memberships.map((membership) => ({ organizationId, jobSiteId: jobSite.id, userId: membership.userId, membershipId: membership.id, kind: "ORGANIZATION_MEMBER", status: "ACTIVE", activeKey: `${jobSite.id}:${membership.userId}:ORGANIZATION_MEMBER`, userSideKey: `${jobSite.id}:${membership.userId}`, activatedAt: new Date(), createdByUserId: context.userId })) });
    return jobSite;
  });
  await recordProductAuditEventBestEffort({ organizationId, ...auditActorFromContext(context, actorRole), action: "JOB_SITE_CREATED", entityType: "JOB_SITE", entityId: created.id, outcome: "SUCCESS" });
  return created;
}

export async function updateJobSite(jobSiteId: string, input: UpdateJobSiteInput) {
  rejectSensitiveFields(input);
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("jobSites:update", MANAGE_ROLES);
  await getJobSite(jobSiteId);
  const updated = await db.jobSite.update({ where: { id: jobSiteId, organizationId }, data: { ...parsed(input, true), revision: { increment: 1 } }, select: jobSiteSelect });
  await recordProductAuditEventBestEffort({ organizationId, ...auditActorFromContext(context, actorRole), action: "JOB_SITE_UPDATED", entityType: "JOB_SITE", entityId: updated.id, outcome: "SUCCESS" });
  return updated;
}

export async function archiveJobSite(jobSiteId: string) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("jobSites:archive", MANAGE_ROLES);
  const current = await getJobSite(jobSiteId);
  if (current.status !== "CLOSED") throw new AccessError("Solo un cantiere chiuso puo essere archiviato.", 409);
  const archived = await db.jobSite.update({ where: { id: jobSiteId, organizationId }, data: { status: "ARCHIVED", archivedAt: new Date(), revision: { increment: 1 } }, select: jobSiteSelect });
  await recordProductAuditEventBestEffort({ organizationId, ...auditActorFromContext(context, actorRole), action: "JOB_SITE_ARCHIVED", entityType: "JOB_SITE", entityId: archived.id, outcome: "SUCCESS" });
  return archived;
}
