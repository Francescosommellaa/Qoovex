import "server-only";

import { db } from "@qoovex/db";
import type { DocumentTypeAppliesTo } from "@qoovex/types";
import { documentTypeAppliesToValues } from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { recordSupportAccess } from "@shared/server/support-access-service";
import { isEnumValue, trimOptionalText, trimRequiredText } from "./document-domain-validation";
import { requireOrganizationDomainAccess } from "./domain-access-service";

const FULL_DOCUMENT_ROLES = ["OWNER", "ADMIN"] as const;
const DOCUMENT_READ_ROLES = ["OWNER", "ADMIN", "SAFETY_CONSULTANT"] as const;

const documentTypeSelect = {
  id: true,
  organizationId: true,
  name: true,
  description: true,
  appliesTo: true,
  requiresExpiryDate: true,
  createdAt: true,
  updatedAt: true,
  archivedAt: true,
} as const;

export interface CreateDocumentTypeInput {
  name?: unknown;
  description?: unknown;
  appliesTo?: unknown;
  requiresExpiryDate?: unknown;
}

export interface UpdateDocumentTypeInput {
  name?: unknown;
  description?: unknown;
  appliesTo?: unknown;
  requiresExpiryDate?: unknown;
}

function parseAppliesTo(value: unknown): DocumentTypeAppliesTo {
  if (!isEnumValue(documentTypeAppliesToValues, value)) throw new AccessError("Ambito tipo documento non valido.", 409);
  return value;
}

function parseRequiresExpiryDate(value: unknown) {
  if (value === undefined) return false;
  if (typeof value !== "boolean") throw new AccessError("Indicatore scadenza non valido.", 409);
  return value;
}

export async function listDocumentTypes() {
  const { context, organizationId } = await requireOrganizationDomainAccess("documents:read", DOCUMENT_READ_ROLES);
  const documentTypes = await db.documentType.findMany({
    where: { organizationId, archivedAt: null },
    select: documentTypeSelect,
    orderBy: [{ name: "asc" }, { createdAt: "asc" }],
  });
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "document-types" });
  return documentTypes;
}

export async function createDocumentType(input: CreateDocumentTypeInput) {
  const { context, organizationId } = await requireOrganizationDomainAccess("documents:update", FULL_DOCUMENT_ROLES);
  const name = trimRequiredText(input.name, "Nome tipo documento", 2, 120);
  const description = trimOptionalText(input.description, "Descrizione tipo documento", 2000) ?? null;
  const appliesTo = parseAppliesTo(input.appliesTo);
  const requiresExpiryDate = parseRequiresExpiryDate(input.requiresExpiryDate);

  const documentType = await db.documentType.create({
    data: { organizationId, name, description, appliesTo, requiresExpiryDate },
    select: documentTypeSelect,
  });
  await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "document-type", resourceId: documentType.id });
  return documentType;
}

export async function updateDocumentType(documentTypeId: string, input: UpdateDocumentTypeInput) {
  const { context, organizationId } = await requireOrganizationDomainAccess("documents:update", FULL_DOCUMENT_ROLES);
  const existing = await db.documentType.findFirst({ where: { id: documentTypeId, organizationId, archivedAt: null }, select: { id: true } });
  if (!existing) throw new AccessError("Tipo documento non trovato.", 404);

  const data: {
    name?: string;
    description?: string | null;
    appliesTo?: DocumentTypeAppliesTo;
    requiresExpiryDate?: boolean;
  } = {};
  if (input.name !== undefined) data.name = trimRequiredText(input.name, "Nome tipo documento", 2, 120);
  if (input.description !== undefined) data.description = trimOptionalText(input.description, "Descrizione tipo documento", 2000) ?? null;
  if (input.appliesTo !== undefined) data.appliesTo = parseAppliesTo(input.appliesTo);
  if (input.requiresExpiryDate !== undefined) {
    if (typeof input.requiresExpiryDate !== "boolean") throw new AccessError("Indicatore scadenza non valido.", 409);
    data.requiresExpiryDate = input.requiresExpiryDate;
  }
  if (!Object.keys(data).length) throw new AccessError("Nessun dato tipo documento da aggiornare.", 409);

  const documentType = await db.documentType.update({ where: { id: existing.id }, data, select: documentTypeSelect });
  await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "document-type", resourceId: documentType.id });
  return documentType;
}

export async function archiveDocumentType(documentTypeId: string) {
  const { context, organizationId } = await requireOrganizationDomainAccess("documents:archive", FULL_DOCUMENT_ROLES);
  const existing = await db.documentType.findFirst({ where: { id: documentTypeId, organizationId, archivedAt: null }, select: { id: true } });
  if (!existing) throw new AccessError("Tipo documento non trovato.", 404);
  await recordSupportAccess({ userId: context.userId, action: "SENSITIVE", resourceType: "document-type", resourceId: existing.id });
  const documentType = await db.documentType.update({
    where: { id: existing.id },
    data: { archivedAt: new Date() },
    select: documentTypeSelect,
  });
  return documentType;
}
