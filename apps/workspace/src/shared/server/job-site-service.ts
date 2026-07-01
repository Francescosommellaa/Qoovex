import "server-only";

import { db } from "@qoovex/db";
import type { RecordStatus } from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { recordSupportAccess } from "@shared/server/support-access-service";
import { trimOptionalText, trimRequiredText } from "./document-domain-validation";
import { requireOrganizationDomainAccess } from "./domain-access-service";
import { parseEditableRecordStatus, parseOptionalDateRange, rejectSensitiveFields } from "./worker-jobsite-validation";

const JOBSITE_MANAGE_ROLES = ["OWNER", "ADMIN"] as const;
const JOBSITE_READ_ROLES = ["OWNER", "ADMIN", "SAFETY_CONSULTANT"] as const;

const jobSiteSelect = {
  id: true,
  organizationId: true,
  name: true,
  address: true,
  clientName: true,
  status: true,
  startDate: true,
  endDate: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  archivedAt: true,
} as const;

export interface CreateJobSiteInput extends Record<string, unknown> {
  name?: unknown;
  address?: unknown;
  clientName?: unknown;
  status?: unknown;
  startDate?: unknown;
  endDate?: unknown;
  notes?: unknown;
}

export interface UpdateJobSiteInput extends Record<string, unknown> {
  name?: unknown;
  address?: unknown;
  clientName?: unknown;
  status?: unknown;
  startDate?: unknown;
  endDate?: unknown;
  notes?: unknown;
}

export async function listJobSites() {
  const { context, organizationId } = await requireOrganizationDomainAccess("jobSites:read", JOBSITE_READ_ROLES);
  const jobSites = await db.jobSite.findMany({
    where: { organizationId, archivedAt: null },
    select: jobSiteSelect,
    orderBy: [{ name: "asc" }, { createdAt: "asc" }],
  });
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "job-sites" });
  return jobSites;
}

export async function getJobSite(jobSiteId: string) {
  const { context, organizationId } = await requireOrganizationDomainAccess("jobSites:read", JOBSITE_READ_ROLES);
  const jobSite = await db.jobSite.findFirst({ where: { id: jobSiteId, organizationId, archivedAt: null }, select: jobSiteSelect });
  if (!jobSite) throw new AccessError("Cantiere non trovato.", 404);
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "job-site", resourceId: jobSite.id });
  return jobSite;
}

export async function createJobSite(input: CreateJobSiteInput) {
  rejectSensitiveFields(input);
  const { context, organizationId } = await requireOrganizationDomainAccess("jobSites:create", JOBSITE_MANAGE_ROLES);
  const name = trimRequiredText(input.name, "Nome cantiere", 2, 160);
  const address = trimOptionalText(input.address, "Indirizzo cantiere", 500) ?? null;
  const clientName = trimOptionalText(input.clientName, "Nome committente", 160) ?? null;
  const status = input.status === undefined ? "ACTIVE" : parseEditableRecordStatus(input.status);
  const dates = parseOptionalDateRange({ startDate: input.startDate, endDate: input.endDate });
  const notes = trimOptionalText(input.notes, "Note cantiere", 4000) ?? null;

  const jobSite = await db.jobSite.create({
    data: { organizationId, name, address, clientName, status, startDate: dates.resolvedStartDate, endDate: dates.resolvedEndDate, notes },
    select: jobSiteSelect,
  });
  await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "job-site", resourceId: jobSite.id });
  return jobSite;
}

export async function updateJobSite(jobSiteId: string, input: UpdateJobSiteInput) {
  rejectSensitiveFields(input);
  const { context, organizationId } = await requireOrganizationDomainAccess("jobSites:update", JOBSITE_MANAGE_ROLES);
  const existing = await db.jobSite.findFirst({
    where: { id: jobSiteId, organizationId, archivedAt: null },
    select: { id: true, startDate: true, endDate: true },
  });
  if (!existing) throw new AccessError("Cantiere non trovato.", 404);

  const dates = parseOptionalDateRange({
    startDate: input.startDate,
    endDate: input.endDate,
    currentStartDate: existing.startDate,
    currentEndDate: existing.endDate,
  });
  const data: {
    name?: string;
    address?: string | null;
    clientName?: string | null;
    status?: RecordStatus;
    startDate?: Date | null;
    endDate?: Date | null;
    notes?: string | null;
  } = {};
  if (input.name !== undefined) data.name = trimRequiredText(input.name, "Nome cantiere", 2, 160);
  if (input.address !== undefined) data.address = trimOptionalText(input.address, "Indirizzo cantiere", 500) ?? null;
  if (input.clientName !== undefined) data.clientName = trimOptionalText(input.clientName, "Nome committente", 160) ?? null;
  if (input.status !== undefined) data.status = parseEditableRecordStatus(input.status);
  if (input.startDate !== undefined) data.startDate = dates.startDate ?? null;
  if (input.endDate !== undefined) data.endDate = dates.endDate ?? null;
  if (input.notes !== undefined) data.notes = trimOptionalText(input.notes, "Note cantiere", 4000) ?? null;
  if (!Object.keys(data).length) throw new AccessError("Nessun dato cantiere da aggiornare.", 409);

  const jobSite = await db.jobSite.update({ where: { id: existing.id }, data, select: jobSiteSelect });
  await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "job-site", resourceId: jobSite.id });
  return jobSite;
}

export async function archiveJobSite(jobSiteId: string) {
  const { context, organizationId } = await requireOrganizationDomainAccess("jobSites:archive", JOBSITE_MANAGE_ROLES);
  const existing = await db.jobSite.findFirst({ where: { id: jobSiteId, organizationId, archivedAt: null }, select: { id: true } });
  if (!existing) throw new AccessError("Cantiere non trovato.", 404);
  await recordSupportAccess({ userId: context.userId, action: "SENSITIVE", resourceType: "job-site", resourceId: existing.id });
  const jobSite = await db.jobSite.update({
    where: { id: existing.id },
    data: { archivedAt: new Date(), status: "ARCHIVED" },
    select: jobSiteSelect,
  });
  return jobSite;
}
