import "server-only";

import { db } from "@qoovex/db";
import type { DocumentCategoryKey, DocumentSensitivity, DocumentTypeAppliesTo } from "@qoovex/types";
import { documentCategoryRegistry, documentTypeAppliesToValues } from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { recordSupportAccess } from "@shared/server/support-access-service";
import { assertDocumentTaxonomy, isEnumValue, parseDocumentCategoryKey, parseDocumentSensitivity, trimOptionalText, trimRequiredText } from "./document-domain-validation";
import { requireOrganizationDomainAccess } from "./domain-access-service";

const FULL_DOCUMENT_ROLES = ["OWNER", "COLLABORATOR"] as const;
const DOCUMENT_READ_ROLES = ["OWNER", "COLLABORATOR"] as const;

const documentTypeSelect = {
  id: true,
  organizationId: true,
  name: true,
  description: true,
  appliesTo: true,
  categoryKey: true,
  sensitivity: true,
  requiresExpiryDate: true,
  createdAt: true,
  updatedAt: true,
  archivedAt: true,
  _count: { select: { documents: true } },
} as const;

export interface CreateDocumentTypeInput {
  name?: unknown;
  description?: unknown;
  appliesTo?: unknown;
  categoryKey?: unknown;
  sensitivity?: unknown;
  requiresExpiryDate?: unknown;
}

export interface UpdateDocumentTypeInput {
  name?: unknown;
  description?: unknown;
  appliesTo?: unknown;
  categoryKey?: unknown;
  sensitivity?: unknown;
  requiresExpiryDate?: unknown;
}

function parseAppliesTo(value: unknown): DocumentTypeAppliesTo {
  if (!isEnumValue(documentTypeAppliesToValues, value)) throw new AccessError("Ambito tipo documento non valido.", 409);
  if (value === "EVIDENCE" || value === "OTHER") throw new AccessError("Questa macroarea non e disponibile nel flusso documentale guidato.", 409);
  return value;
}

function toDocumentTypeRecord<T extends { categoryKey: DocumentCategoryKey; _count?: { documents: number } }>(documentType: T) {
  const { _count, ...record } = documentType;
  return { ...record, categoryLabel: documentCategoryRegistry[documentType.categoryKey].label, documentCount: _count?.documents ?? 0 };
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
  return documentTypes.map(toDocumentTypeRecord);
}

export async function createDocumentType(input: CreateDocumentTypeInput) {
  const { context, organizationId } = await requireOrganizationDomainAccess("documents:update", FULL_DOCUMENT_ROLES);
  const name = trimRequiredText(input.name, "Nome tipo documento", 2, 120);
  const description = trimOptionalText(input.description, "Descrizione tipo documento", 2000) ?? null;
  const appliesTo = parseAppliesTo(input.appliesTo);
  const categoryKey = parseDocumentCategoryKey(input.categoryKey);
  const sensitivity = input.sensitivity === undefined ? "STANDARD" : parseDocumentSensitivity(input.sensitivity);
  assertDocumentTaxonomy({ appliesTo, categoryKey, sensitivity });
  const requiresExpiryDate = parseRequiresExpiryDate(input.requiresExpiryDate);

  const documentType = await db.documentType.create({
    data: { organizationId, name, description, appliesTo, categoryKey, sensitivity, requiresExpiryDate },
    select: documentTypeSelect,
  });
  await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "document-type", resourceId: documentType.id });
  return toDocumentTypeRecord(documentType);
}

export async function updateDocumentType(documentTypeId: string, input: UpdateDocumentTypeInput) {
  const { context, organizationId } = await requireOrganizationDomainAccess("documents:update", FULL_DOCUMENT_ROLES);
  const existing = await db.documentType.findFirst({ where: { id: documentTypeId, organizationId, archivedAt: null }, select: { id: true, appliesTo: true, categoryKey: true, sensitivity: true } });
  if (!existing) throw new AccessError("Tipo documento non trovato.", 404);

  const data: {
    name?: string;
    description?: string | null;
    appliesTo?: DocumentTypeAppliesTo;
    categoryKey?: DocumentCategoryKey;
    sensitivity?: DocumentSensitivity;
    requiresExpiryDate?: boolean;
  } = {};
  if (input.name !== undefined) data.name = trimRequiredText(input.name, "Nome tipo documento", 2, 120);
  if (input.description !== undefined) data.description = trimOptionalText(input.description, "Descrizione tipo documento", 2000) ?? null;
  if (input.appliesTo !== undefined) data.appliesTo = parseAppliesTo(input.appliesTo);
  if (input.categoryKey !== undefined) data.categoryKey = parseDocumentCategoryKey(input.categoryKey);
  if (input.sensitivity !== undefined) data.sensitivity = parseDocumentSensitivity(input.sensitivity);
  if (input.requiresExpiryDate !== undefined) {
    if (typeof input.requiresExpiryDate !== "boolean") throw new AccessError("Indicatore scadenza non valido.", 409);
    data.requiresExpiryDate = input.requiresExpiryDate;
  }
  if (!Object.keys(data).length) throw new AccessError("Nessun dato tipo documento da aggiornare.", 409);

  assertDocumentTaxonomy({
    appliesTo: data.appliesTo ?? existing.appliesTo,
    categoryKey: data.categoryKey ?? existing.categoryKey,
    sensitivity: data.sensitivity ?? existing.sensitivity,
  });

  const documentType = await db.documentType.update({ where: { id: existing.id }, data, select: documentTypeSelect });
  await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "document-type", resourceId: documentType.id });
  return toDocumentTypeRecord(documentType);
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
  return toDocumentTypeRecord(documentType);
}
