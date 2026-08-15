import "server-only";

import { db } from "@qoovex/db";
import type { OrganizationContactKind } from "@qoovex/types";
import { organizationContactKinds } from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { isEnumValue, trimOptionalId, trimOptionalText, trimRequiredText } from "./input-validation";
import { requireOrganizationDomainAccess } from "./domain-access-service";
import { auditActorFromContext, recordProductAuditEventBestEffort } from "./product-audit-service";

const profileSelect = {
  id: true,
  organizationId: true,
  legalName: true,
  taxCode: true,
  vatNumber: true,
  registeredOfficeAddress: true,
  operatingDescription: true,
  specializations: true,
  createdAt: true,
  updatedAt: true,
} as const;

const contactSelect = {
  id: true,
  organizationId: true,
  userId: true,
  kind: true,
  name: true,
  email: true,
  phone: true,
  position: true,
  isPrimary: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
  archivedAt: true,
} as const;

function parseContactKind(value: unknown): OrganizationContactKind {
  const aliases: Record<string, OrganizationContactKind> = { OPERATIONS: "GENERAL", DOCUMENTS: "TECHNICAL", OTHER: "GENERAL" };
  if (typeof value === "string" && aliases[value]) return aliases[value];
  if (!isEnumValue(organizationContactKinds, value)) throw new AccessError("Tipo contatto non valido.", 409);
  return value;
}

function parseOptionalBoolean(value: unknown, label: string) {
  if (value === undefined) return undefined;
  if (typeof value !== "boolean") throw new AccessError(`${label} non valido.`, 409);
  return value;
}

function parseOptionalSortOrder(value: unknown) {
  if (value === undefined) return undefined;
  if (!Number.isSafeInteger(value) || Number(value) < 0 || Number(value) > 10_000) throw new AccessError("Ordine contatto non valido.", 409);
  return Number(value);
}

function normalizeSpecializations(value: unknown): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length > 20) throw new AccessError("Specializzazioni non valide.", 409);
  const normalized = value.map((item) => trimRequiredText(item, "Specializzazione", 2, 80));
  return [...new Set(normalized)];
}

function toProfileResponse(profile: Awaited<ReturnType<typeof db.organizationProfile.findUnique>>) {
  if (!profile) return null;
  return { ...profile, createdAt: profile.createdAt.toISOString(), updatedAt: profile.updatedAt.toISOString() };
}

function toContactResponse(contact: {
  id: string;
  organizationId: string;
  userId: string | null;
  kind: OrganizationContactKind;
  name: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
}) {
  return { ...contact, createdAt: contact.createdAt.toISOString(), updatedAt: contact.updatedAt.toISOString(), archivedAt: contact.archivedAt?.toISOString() ?? null };
}

async function assertContactUser(organizationId: string, userId: string | null | undefined) {
  if (!userId) return null;
  const membership = await db.organizationMembership.findFirst({ where: { organizationId, userId, revokedAt: null }, select: { userId: true } });
  if (!membership) throw new AccessError("Utente contatto non disponibile.", 404);
  return membership.userId;
}

export async function getOrganizationProfile() {
  const { organizationId } = await requireOrganizationDomainAccess("organizationProfile:read");
  const organization = await db.organization.findFirst({
    where: { id: organizationId },
    select: {
      id: true,
      name: true,
      code: true,
      profile: { select: profileSelect },
      contacts: { where: { archivedAt: null }, select: contactSelect, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
    },
  });
  if (!organization) throw new AccessError("Azienda non trovata.", 404);
  return {
    organization: { id: organization.id, name: organization.name, code: organization.code },
    profile: toProfileResponse(organization.profile),
    contacts: organization.contacts.map(toContactResponse),
  };
}

export async function updateOrganizationProfile(input: Record<string, unknown>) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("organizationProfile:update");
  const data = {
    legalName: input.legalName === undefined ? undefined : trimRequiredText(input.legalName, "Ragione sociale", 2, 160),
    taxCode: trimOptionalText(input.taxCode, "Codice fiscale", 32),
    vatNumber: trimOptionalText(input.vatNumber, "Partita IVA", 32),
    registeredOfficeAddress: trimOptionalText(input.registeredOfficeAddress, "Sede legale", 500),
    operatingDescription: trimOptionalText(input.operatingDescription, "Descrizione attivita", 4000),
    specializations: normalizeSpecializations(input.specializations),
  };
  const defined = Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
  if (!Object.keys(defined).length) throw new AccessError("Nessun dato azienda da aggiornare.", 409);
  const profile = await db.$transaction(async (tx) => {
    const updatedProfile = await tx.organizationProfile.upsert({
      where: { organizationId },
      create: { organizationId, ...defined },
      update: defined,
      select: profileSelect,
    });
    if (data.legalName !== undefined) {
      await tx.organization.update({ where: { id: organizationId }, data: { name: data.legalName } });
    }
    return updatedProfile;
  });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "ORGANIZATION_PROFILE_UPDATED",
    entityType: "ORGANIZATION_PROFILE",
    entityId: profile.id,
    metadata: { fieldsChanged: Object.keys(defined).length },
  });
  return toProfileResponse(profile);
}

function normalizeContactInput(input: Record<string, unknown>, partial = false) {
  const data = {
    userId: trimOptionalId(input.userId, "Utente"),
    kind: input.kind === undefined && partial ? undefined : parseContactKind(input.kind),
    name: input.name === undefined && partial ? undefined : trimRequiredText(input.name, "Nome contatto", 2, 160),
    email: trimOptionalText(input.email, "Email", 320),
    phone: trimOptionalText(input.phone, "Telefono", 80),
    position: trimOptionalText(input.position, "Responsabilita", 160),
    isPrimary: parseOptionalBoolean(input.isPrimary, "Contatto principale"),
    sortOrder: parseOptionalSortOrder(input.sortOrder),
  };
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
}

export async function createOrganizationContact(input: Record<string, unknown>) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("organizationProfile:update");
  const data = normalizeContactInput(input) as {
    userId?: string | null;
    kind: OrganizationContactKind;
    name: string;
    email?: string | null;
    phone?: string | null;
    position?: string | null;
    isPrimary?: boolean;
    sortOrder?: number;
  };
  if (data.userId) await assertContactUser(organizationId, data.userId);
  const contact = await db.$transaction(async (tx) => {
    if (data.isPrimary) await tx.organizationContact.updateMany({ where: { organizationId, archivedAt: null, kind: data.kind }, data: { isPrimary: false } });
    return tx.organizationContact.create({ data: { organizationId, ...data }, select: contactSelect });
  });
  await recordProductAuditEventBestEffort({ organizationId, ...auditActorFromContext(context, actorRole), action: "ORGANIZATION_CONTACT_CREATED", entityType: "ORGANIZATION_CONTACT", entityId: contact.id, metadata: { kind: contact.kind } });
  return toContactResponse(contact);
}

export async function updateOrganizationContact(contactId: string, input: Record<string, unknown>) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("organizationProfile:update");
  const existing = await db.organizationContact.findFirst({ where: { id: contactId, organizationId, archivedAt: null }, select: { id: true, kind: true } });
  if (!existing) throw new AccessError("Contatto non trovato.", 404);
  const data = normalizeContactInput(input, true);
  if (!Object.keys(data).length) throw new AccessError("Nessun dato contatto da aggiornare.", 409);
  if (typeof data.userId === "string") await assertContactUser(organizationId, data.userId);
  const nextKind = (data.kind as OrganizationContactKind | undefined) ?? existing.kind;
  const contact = await db.$transaction(async (tx) => {
    if (data.isPrimary === true) await tx.organizationContact.updateMany({ where: { organizationId, archivedAt: null, kind: nextKind, id: { not: existing.id } }, data: { isPrimary: false } });
    return tx.organizationContact.update({ where: { id: existing.id }, data, select: contactSelect });
  });
  await recordProductAuditEventBestEffort({ organizationId, ...auditActorFromContext(context, actorRole), action: "ORGANIZATION_CONTACT_UPDATED", entityType: "ORGANIZATION_CONTACT", entityId: contact.id, metadata: { kind: contact.kind } });
  return toContactResponse(contact);
}

export async function archiveOrganizationContact(contactId: string) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("organizationProfile:update");
  const existing = await db.organizationContact.findFirst({ where: { id: contactId, organizationId, archivedAt: null }, select: { id: true } });
  if (!existing) throw new AccessError("Contatto non trovato.", 404);
  const contact = await db.organizationContact.update({ where: { id: existing.id }, data: { archivedAt: new Date(), isPrimary: false }, select: contactSelect });
  await recordProductAuditEventBestEffort({ organizationId, ...auditActorFromContext(context, actorRole), action: "ORGANIZATION_CONTACT_ARCHIVED", entityType: "ORGANIZATION_CONTACT", entityId: contact.id, metadata: { archived: true } });
  return { contact: toContactResponse(contact), archived: true as const };
}
