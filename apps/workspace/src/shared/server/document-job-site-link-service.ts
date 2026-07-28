import "server-only";

import { db } from "@qoovex/db";
import { AccessError } from "@shared/server/access-errors";
import { parseOptionalDate, trimOptionalText } from "./document-domain-validation";
import { requireOrganizationDomainAccess } from "./domain-access-service";
import { appendContextTimelineEvent } from "./context-timeline-service";
import { auditActorFromContext, recordProductAuditEventBestEffort } from "./product-audit-service";
import { canReadDocument, canReadJobSite, getResourceScope } from "./resource-scope-service";

const linkSelect = {
  id: true,
  organizationId: true,
  documentId: true,
  jobSiteId: true,
  purpose: true,
  validFrom: true,
  validTo: true,
  linkedById: true,
  unlinkedAt: true,
  unlinkedById: true,
  unlinkReason: true,
  createdAt: true,
  updatedAt: true,
} as const;

function toResponse(link: {
  id: string;
  organizationId: string;
  documentId: string;
  jobSiteId: string;
  purpose: string | null;
  validFrom: Date | null;
  validTo: Date | null;
  linkedById: string;
  unlinkedAt: Date | null;
  unlinkedById: string | null;
  unlinkReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...link,
    validFrom: link.validFrom?.toISOString() ?? null,
    validTo: link.validTo?.toISOString() ?? null,
    unlinkedAt: link.unlinkedAt?.toISOString() ?? null,
    createdAt: link.createdAt.toISOString(),
    updatedAt: link.updatedAt.toISOString(),
  };
}

async function getAccessibleDocument(organizationId: string, documentId: string, scope: Awaited<ReturnType<typeof getResourceScope>>) {
  const document = await db.document.findFirst({
    where: { id: documentId, organizationId, archivedAt: null },
    select: { id: true, title: true, ownerType: true, workerId: true, jobSiteId: true, documentTypeId: true },
  });
  if (!document || !canReadDocument(scope, document)) throw new AccessError("Documento non trovato.", 404);
  return document;
}

export async function listDocumentJobSiteLinks(documentId: string) {
  const { context, organizationId } = await requireOrganizationDomainAccess("documents:read");
  const scope = await getResourceScope(context);
  await getAccessibleDocument(organizationId, documentId, scope);
  const links = await db.documentJobSiteLink.findMany({
    where: { organizationId, documentId, unlinkedAt: null },
    select: linkSelect,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
  return links.filter((link) => canReadJobSite(scope, link.jobSiteId)).map(toResponse);
}

export async function createDocumentJobSiteLink(documentId: string, input: Record<string, unknown>) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documents:update");
  const scope = await getResourceScope(context);
  const document = await getAccessibleDocument(organizationId, documentId, scope);
  if (document.ownerType === "JOB_SITE") throw new AccessError("Un documento gia proprietario del cantiere non richiede un collegamento aggiuntivo.", 409);
  const jobSiteId = typeof input.jobSiteId === "string" ? input.jobSiteId.trim() : "";
  if (!jobSiteId) throw new AccessError("Cantiere non valido.", 409);
  const jobSite = await db.jobSite.findFirst({ where: { id: jobSiteId, organizationId, archivedAt: null }, select: { id: true, name: true } });
  if (!jobSite || !canReadJobSite(scope, jobSite.id)) throw new AccessError("Cantiere non trovato.", 404);
  const purpose = trimOptionalText(input.purpose, "Finalita collegamento", 500) ?? null;
  const validFrom = parseOptionalDate(input.validFrom, "Inizio validita") ?? null;
  const validTo = parseOptionalDate(input.validTo, "Fine validita") ?? null;
  if (validFrom && validTo && validTo <= validFrom) throw new AccessError("La fine validita deve essere successiva all'inizio.", 409);
  const duplicate = await db.documentJobSiteLink.findFirst({ where: { organizationId, documentId, jobSiteId, unlinkedAt: null }, select: { id: true } });
  if (duplicate) throw new AccessError("Documento gia collegato al cantiere.", 409);

  const link = await db.$transaction(async (tx) => {
    const created = await tx.documentJobSiteLink.create({
      data: { organizationId, documentId, jobSiteId, purpose, validFrom, validTo, linkedById: context.userId },
      select: linkSelect,
    });
    await appendContextTimelineEvent({
      organizationId,
      eventKey: `document-job-site-link:${created.id}:document`,
      targetType: "DOCUMENT",
      targetId: documentId,
      eventType: "DOCUMENT_LINKED_TO_JOB_SITE",
      title: "Documento collegato al cantiere",
      summary: jobSite.name,
      metadata: { jobSiteId, linkId: created.id },
      actorUserId: context.userId,
      actorRole,
      sourceType: "USER_ACTION",
      sourceId: created.id,
    }, tx);
    await appendContextTimelineEvent({
      organizationId,
      eventKey: `document-job-site-link:${created.id}:job-site`,
      targetType: "JOB_SITE",
      targetId: jobSiteId,
      eventType: "DOCUMENT_LINKED_TO_JOB_SITE",
      title: "Documento collegato",
      summary: document.title,
      metadata: { documentId, linkId: created.id },
      actorUserId: context.userId,
      actorRole,
      sourceType: "USER_ACTION",
      sourceId: created.id,
    }, tx);
    return created;
  });
  await recordProductAuditEventBestEffort({ organizationId, ...auditActorFromContext(context, actorRole), action: "DOCUMENT_JOB_SITE_LINK_CREATED", entityType: "DOCUMENT_JOB_SITE_LINK", entityId: link.id, metadata: { documentId, jobSiteId } });
  return toResponse(link);
}

export async function archiveDocumentJobSiteLink(documentId: string, linkId: string, input: Record<string, unknown> = {}) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documents:update");
  const scope = await getResourceScope(context);
  await getAccessibleDocument(organizationId, documentId, scope);
  const existing = await db.documentJobSiteLink.findFirst({ where: { id: linkId, organizationId, documentId, unlinkedAt: null }, select: { id: true, jobSiteId: true } });
  if (!existing || !canReadJobSite(scope, existing.jobSiteId)) throw new AccessError("Collegamento non trovato.", 404);
  const unlinkReason = trimOptionalText(input.reason, "Motivo scollegamento", 1000) ?? "Collegamento concluso manualmente.";
  const unlinkedAt = new Date();
  const link = await db.$transaction(async (tx) => {
    const updated = await tx.documentJobSiteLink.update({ where: { id: existing.id }, data: { unlinkedAt, unlinkedById: context.userId, unlinkReason }, select: linkSelect });
    await appendContextTimelineEvent({ organizationId, eventKey: `document-job-site-link:${updated.id}:document:unlinked`, targetType: "DOCUMENT", targetId: documentId, eventType: "DOCUMENT_UNLINKED_FROM_JOB_SITE", title: "Collegamento al cantiere concluso", summary: unlinkReason, metadata: { jobSiteId: updated.jobSiteId, linkId: updated.id }, actorUserId: context.userId, actorRole, sourceType: "USER_ACTION", sourceId: updated.id }, tx);
    await appendContextTimelineEvent({ organizationId, eventKey: `document-job-site-link:${updated.id}:job-site:unlinked`, targetType: "JOB_SITE", targetId: updated.jobSiteId, eventType: "DOCUMENT_UNLINKED_FROM_JOB_SITE", title: "Collegamento documento concluso", summary: unlinkReason, metadata: { documentId, linkId: updated.id }, actorUserId: context.userId, actorRole, sourceType: "USER_ACTION", sourceId: updated.id }, tx);
    return updated;
  });
  await recordProductAuditEventBestEffort({ organizationId, ...auditActorFromContext(context, actorRole), action: "DOCUMENT_JOB_SITE_LINK_ARCHIVED", entityType: "DOCUMENT_JOB_SITE_LINK", entityId: link.id, metadata: { documentId, jobSiteId: link.jobSiteId } });
  return { link: toResponse(link), archived: true as const };
}
