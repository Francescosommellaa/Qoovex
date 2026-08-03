import "server-only";

import { db } from "@qoovex/db";
import { AccessError } from "./access-errors";
import { parseOptionalDate, trimOptionalText } from "./document-domain-validation";
import { requireOrganizationDomainAccess } from "./domain-access-service";
import { auditActorFromContext, recordProductAuditEventBestEffort } from "./product-audit-service";
import { canReadDocument, canReadJobSite, getResourceScope } from "./resource-scope-service";

const select = { id: true, organizationId: true, documentId: true, jobSiteId: true, purpose: true, validFrom: true, validTo: true, linkedById: true, unlinkedAt: true, unlinkedById: true, unlinkReason: true, createdAt: true, updatedAt: true } as const;
function response(value: Awaited<ReturnType<typeof db.documentJobSiteLink.findFirstOrThrow>>) {
  return { ...value, validFrom: value.validFrom?.toISOString() ?? null, validTo: value.validTo?.toISOString() ?? null, unlinkedAt: value.unlinkedAt?.toISOString() ?? null, createdAt: value.createdAt.toISOString(), updatedAt: value.updatedAt.toISOString() };
}
async function authorizeDocument(organizationId: string, documentId: string, scope: Awaited<ReturnType<typeof getResourceScope>>) {
  const value = await db.document.findFirst({ where: { id: documentId, organizationId, archivedAt: null }, select: { id: true, ownerType: true, workerId: true, jobSiteId: true } });
  if (!value || !canReadDocument(scope, value)) throw new AccessError("File non trovato.", 404);
  return value;
}
export async function listDocumentJobSiteLinks(documentId: string) {
  const { context, organizationId } = await requireOrganizationDomainAccess("documents:read");
  const scope = await getResourceScope(context); await authorizeDocument(organizationId, documentId, scope);
  const values = await db.documentJobSiteLink.findMany({ where: { organizationId, documentId, unlinkedAt: null }, select, orderBy: { createdAt: "desc" } });
  return values.filter((value) => canReadJobSite(scope, value.jobSiteId)).map(response);
}
export async function createDocumentJobSiteLink(documentId: string, input: Record<string, unknown>) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documents:update");
  const scope = await getResourceScope(context); await authorizeDocument(organizationId, documentId, scope);
  const jobSiteId = typeof input.jobSiteId === "string" ? input.jobSiteId.trim() : "";
  if (!jobSiteId) throw new AccessError("Cantiere non valido.", 409);
  const site = await db.jobSite.findFirst({ where: { id: jobSiteId, organizationId, archivedAt: null }, select: { id: true } });
  if (!site || !canReadJobSite(scope, site.id)) throw new AccessError("Cantiere non trovato.", 404);
  if (await db.documentJobSiteLink.findFirst({ where: { organizationId, documentId, jobSiteId, unlinkedAt: null }, select: { id: true } })) throw new AccessError("File gia collegato al cantiere.", 409);
  const validFrom = parseOptionalDate(input.validFrom, "Inizio validita") ?? null;
  const validTo = parseOptionalDate(input.validTo, "Fine validita") ?? null;
  if (validFrom && validTo && validTo <= validFrom) throw new AccessError("Intervallo non valido.", 409);
  const value = await db.documentJobSiteLink.create({ data: { organizationId, documentId, jobSiteId, purpose: trimOptionalText(input.purpose, "Finalita", 500) ?? null, validFrom, validTo, linkedById: context.userId }, select });
  await recordProductAuditEventBestEffort({ organizationId, ...auditActorFromContext(context, actorRole), action: "DOCUMENT_JOB_SITE_LINK_CREATED", entityType: "DOCUMENT_JOB_SITE_LINK", entityId: value.id });
  return response(value);
}
export async function archiveDocumentJobSiteLink(documentId: string, linkId: string, input: Record<string, unknown> = {}) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documents:update");
  const scope = await getResourceScope(context); await authorizeDocument(organizationId, documentId, scope);
  const existing = await db.documentJobSiteLink.findFirst({ where: { id: linkId, organizationId, documentId, unlinkedAt: null }, select: { id: true, jobSiteId: true } });
  if (!existing || !canReadJobSite(scope, existing.jobSiteId)) throw new AccessError("Collegamento non trovato.", 404);
  const value = await db.documentJobSiteLink.update({ where: { id: existing.id }, data: { unlinkedAt: new Date(), unlinkedById: context.userId, unlinkReason: trimOptionalText(input.reason, "Motivo", 1000) ?? "Collegamento concluso." }, select });
  await recordProductAuditEventBestEffort({ organizationId, ...auditActorFromContext(context, actorRole), action: "DOCUMENT_JOB_SITE_LINK_ARCHIVED", entityType: "DOCUMENT_JOB_SITE_LINK", entityId: value.id });
  return { link: response(value), archived: true as const };
}
