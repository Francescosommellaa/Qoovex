import "server-only";

import { db } from "@qoovex/db";
import type { ChecklistItemStatus, RecordStatus } from "@qoovex/types";
import { checklistItemStatuses } from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { recordSupportAccess } from "@shared/server/support-access-service";
import { isEnumValue, trimOptionalId, trimOptionalText, trimRequiredText } from "./document-domain-validation";
import { requireOrganizationDomainAccess } from "./domain-access-service";
import { parseEditableRecordStatus } from "./worker-jobsite-validation";

const CHECKLIST_ACCESS_ROLES = ["OWNER", "ADMIN", "SAFETY_CONSULTANT"] as const;

const checklistSelect = {
  id: true,
  organizationId: true,
  jobSiteId: true,
  name: true,
  description: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  archivedAt: true,
} as const;

const checklistItemSelect = {
  id: true,
  organizationId: true,
  checklistId: true,
  label: true,
  description: true,
  status: true,
  completedAt: true,
  completedById: true,
  createdAt: true,
  updatedAt: true,
} as const;

export interface ListChecklistsInput {
  jobSiteId?: unknown;
  status?: unknown;
}

export interface CreateChecklistInput extends Record<string, unknown> {
  name?: unknown;
  description?: unknown;
  jobSiteId?: unknown;
  status?: unknown;
}

export interface UpdateChecklistInput extends Record<string, unknown> {
  name?: unknown;
  description?: unknown;
  jobSiteId?: unknown;
  status?: unknown;
}

export interface CreateChecklistItemInput extends Record<string, unknown> {
  label?: unknown;
  description?: unknown;
  status?: unknown;
}

export interface UpdateChecklistItemInput extends Record<string, unknown> {
  label?: unknown;
  description?: unknown;
  status?: unknown;
}

function parseChecklistItemStatus(value: unknown): ChecklistItemStatus {
  if (!isEnumValue(checklistItemStatuses, value)) throw new AccessError("Stato voce checklist non valido.", 409);
  return value;
}

function parseEditableChecklistItemStatus(value: unknown): ChecklistItemStatus {
  const status = parseChecklistItemStatus(value);
  if (status === "ARCHIVED") throw new AccessError("Usa l'archiviazione per archiviare la voce checklist.", 409);
  return status;
}

async function assertActiveJobSite(organizationId: string, jobSiteId: string | null | undefined) {
  if (!jobSiteId) return null;
  const jobSite = await db.jobSite.findFirst({ where: { id: jobSiteId, organizationId, archivedAt: null }, select: { id: true } });
  if (!jobSite) throw new AccessError("Cantiere non trovato.", 404);
  return jobSite.id;
}

async function findActiveChecklist(organizationId: string, checklistId: string) {
  const checklist = await db.checklist.findFirst({
    where: { id: checklistId, organizationId, archivedAt: null },
    select: { id: true, organizationId: true },
  });
  if (!checklist) throw new AccessError("Checklist non trovata.", 404);
  return checklist;
}

async function findActiveChecklistItem(organizationId: string, checklistId: string, itemId: string) {
  const item = await db.checklistItem.findFirst({
    where: { id: itemId, checklistId, organizationId, status: { not: "ARCHIVED" } },
    select: checklistItemSelect,
  });
  if (!item) throw new AccessError("Voce checklist non trovata.", 404);
  return item;
}

function getChecklistItemStatusData(status: ChecklistItemStatus, completedById: string) {
  if (status === "DONE") return { status, completedAt: new Date(), completedById };
  return { status, completedAt: null, completedById: null };
}

export async function listChecklists(input: ListChecklistsInput = {}) {
  const { context, organizationId } = await requireOrganizationDomainAccess("checklists:read", CHECKLIST_ACCESS_ROLES);
  const where: { organizationId: string; archivedAt: null; jobSiteId?: string; status?: RecordStatus } = { organizationId, archivedAt: null };
  const jobSiteId = trimOptionalId(input.jobSiteId, "Cantiere");
  if (jobSiteId) where.jobSiteId = jobSiteId;
  if (input.status !== undefined) where.status = parseEditableRecordStatus(input.status);

  const checklists = await db.checklist.findMany({ where, select: checklistSelect, orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }] });
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "checklists" });
  return checklists;
}

export async function getChecklist(checklistId: string) {
  const { context, organizationId } = await requireOrganizationDomainAccess("checklists:read", CHECKLIST_ACCESS_ROLES);
  const checklist = await db.checklist.findFirst({
    where: { id: checklistId, organizationId, archivedAt: null },
    select: {
      ...checklistSelect,
      items: {
        where: { status: { not: "ARCHIVED" } },
        select: checklistItemSelect,
        orderBy: [{ createdAt: "asc" }],
      },
    },
  });
  if (!checklist) throw new AccessError("Checklist non trovata.", 404);
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "checklist", resourceId: checklist.id });
  return checklist;
}

export async function createChecklist(input: CreateChecklistInput) {
  const { context, organizationId } = await requireOrganizationDomainAccess("checklists:manage", CHECKLIST_ACCESS_ROLES);
  const name = trimRequiredText(input.name, "Nome checklist", 2, 160);
  const description = trimOptionalText(input.description, "Descrizione checklist", 4000) ?? null;
  const jobSiteId = await assertActiveJobSite(organizationId, trimOptionalId(input.jobSiteId, "Cantiere"));
  const status = input.status === undefined ? "ACTIVE" : parseEditableRecordStatus(input.status);

  const checklist = await db.checklist.create({
    data: { organizationId, jobSiteId, name, description, status },
    select: checklistSelect,
  });
  await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "checklist", resourceId: checklist.id });
  return checklist;
}

export async function updateChecklist(checklistId: string, input: UpdateChecklistInput) {
  const { context, organizationId } = await requireOrganizationDomainAccess("checklists:manage", CHECKLIST_ACCESS_ROLES);
  const existing = await db.checklist.findFirst({ where: { id: checklistId, organizationId, archivedAt: null }, select: { id: true } });
  if (!existing) throw new AccessError("Checklist non trovata.", 404);

  const data: { name?: string; description?: string | null; jobSiteId?: string | null; status?: RecordStatus } = {};
  if (input.name !== undefined) data.name = trimRequiredText(input.name, "Nome checklist", 2, 160);
  if (input.description !== undefined) data.description = trimOptionalText(input.description, "Descrizione checklist", 4000) ?? null;
  if (input.jobSiteId !== undefined) data.jobSiteId = await assertActiveJobSite(organizationId, trimOptionalId(input.jobSiteId, "Cantiere"));
  if (input.status !== undefined) data.status = parseEditableRecordStatus(input.status);
  if (!Object.keys(data).length) throw new AccessError("Nessun dato checklist da aggiornare.", 409);

  const checklist = await db.checklist.update({ where: { id: existing.id }, data, select: checklistSelect });
  await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "checklist", resourceId: checklist.id });
  return checklist;
}

export async function archiveChecklist(checklistId: string) {
  const { context, organizationId } = await requireOrganizationDomainAccess("checklists:manage", CHECKLIST_ACCESS_ROLES);
  const existing = await db.checklist.findFirst({ where: { id: checklistId, organizationId, archivedAt: null }, select: { id: true } });
  if (!existing) throw new AccessError("Checklist non trovata.", 404);
  await recordSupportAccess({ userId: context.userId, action: "SENSITIVE", resourceType: "checklist", resourceId: existing.id });
  return db.checklist.update({
    where: { id: existing.id },
    data: { archivedAt: new Date(), status: "ARCHIVED" },
    select: checklistSelect,
  });
}

export async function listChecklistItems(checklistId: string) {
  const { context, organizationId } = await requireOrganizationDomainAccess("checklists:read", CHECKLIST_ACCESS_ROLES);
  await findActiveChecklist(organizationId, checklistId);
  const items = await db.checklistItem.findMany({
    where: { checklistId, organizationId, status: { not: "ARCHIVED" } },
    select: checklistItemSelect,
    orderBy: [{ createdAt: "asc" }],
  });
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "checklist-items", resourceId: checklistId });
  return items;
}

export async function createChecklistItem(checklistId: string, input: CreateChecklistItemInput) {
  const { context, organizationId } = await requireOrganizationDomainAccess("checklists:manage", CHECKLIST_ACCESS_ROLES);
  const checklist = await findActiveChecklist(organizationId, checklistId);
  const label = trimRequiredText(input.label, "Voce checklist", 2, 160);
  const description = trimOptionalText(input.description, "Descrizione voce checklist", 4000) ?? null;
  const status = input.status === undefined ? "OPEN" : parseEditableChecklistItemStatus(input.status);
  const completion = getChecklistItemStatusData(status, context.userId);

  const item = await db.checklistItem.create({
    data: { organizationId, checklistId: checklist.id, label, description, ...completion },
    select: checklistItemSelect,
  });
  await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "checklist-item", resourceId: item.id });
  return item;
}

export async function updateChecklistItem(checklistId: string, itemId: string, input: UpdateChecklistItemInput) {
  const statusOnlyUpdate = input.status !== undefined && input.label === undefined && input.description === undefined;
  const permission = statusOnlyUpdate ? "checklists:complete" : "checklists:manage";
  const { context, organizationId } = await requireOrganizationDomainAccess(permission, CHECKLIST_ACCESS_ROLES);
  await findActiveChecklist(organizationId, checklistId);
  const existing = await findActiveChecklistItem(organizationId, checklistId, itemId);

  const data: { label?: string; description?: string | null; status?: ChecklistItemStatus; completedAt?: Date | null; completedById?: string | null } = {};
  if (input.label !== undefined) data.label = trimRequiredText(input.label, "Voce checklist", 2, 160);
  if (input.description !== undefined) data.description = trimOptionalText(input.description, "Descrizione voce checklist", 4000) ?? null;
  if (input.status !== undefined) Object.assign(data, getChecklistItemStatusData(parseEditableChecklistItemStatus(input.status), context.userId));
  if (!Object.keys(data).length) throw new AccessError("Nessun dato voce checklist da aggiornare.", 409);

  const item = await db.checklistItem.update({ where: { id: existing.id }, data, select: checklistItemSelect });
  await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "checklist-item", resourceId: item.id });
  return item;
}

export async function archiveChecklistItem(checklistId: string, itemId: string) {
  const { context, organizationId } = await requireOrganizationDomainAccess("checklists:manage", CHECKLIST_ACCESS_ROLES);
  await findActiveChecklist(organizationId, checklistId);
  const existing = await findActiveChecklistItem(organizationId, checklistId, itemId);
  await recordSupportAccess({ userId: context.userId, action: "SENSITIVE", resourceType: "checklist-item", resourceId: existing.id });
  const item = await db.checklistItem.update({
    where: { id: existing.id },
    data: { status: "ARCHIVED", completedAt: null, completedById: null },
    select: checklistItemSelect,
  });
  return item;
}
