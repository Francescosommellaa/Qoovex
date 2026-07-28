import "server-only";

import { db } from "@qoovex/db";
import type { CalendarEventKind, CalendarEventPriority, CalendarEventSource, CalendarEventStatus, OrganizationRole } from "@qoovex/types";
import { calendarEventKinds, calendarEventPriorities, calendarEventStatuses } from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { recordSupportAccess } from "@shared/server/support-access-service";
import { isEnumValue, parseRequiredDate, trimOptionalId, trimRequiredText } from "./document-domain-validation";
import { requireOrganizationDomainAccess } from "./domain-access-service";
import { auditActorFromContext, recordProductAuditEventBestEffort } from "./product-audit-service";
import { getResourceScope } from "./resource-scope-service";

const CALENDAR_ROLES = ["OWNER", "COLLABORATOR"] as const;
const CALENDAR_MANAGE_ROLES = ["OWNER", "COLLABORATOR"] as const;
const MAX_RANGE_DAYS = 550;

const calendarEventSelect = {
  id: true,
  organizationId: true,
  title: true,
  description: true,
  startAt: true,
  endAt: true,
  allDay: true,
  kind: true,
  priority: true,
  status: true,
  source: true,
  externalUid: true,
  assignedToId: true,
  jobSiteId: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
  archivedAt: true,
  assignedTo: { select: { id: true, name: true, email: true, organizationMembership: { select: { role: true, revokedAt: true } } } },
  jobSite: { select: { id: true, name: true } },
} as const;

export interface CalendarEventInput {
  title?: unknown;
  description?: unknown;
  startAt?: unknown;
  endAt?: unknown;
  allDay?: unknown;
  kind?: unknown;
  priority?: unknown;
  status?: unknown;
  assignedToId?: unknown;
  jobSiteId?: unknown;
}

export interface CalendarEventImportInput extends CalendarEventInput {
  externalUid?: unknown;
}

function userLabel(user: { name: string | null; email: string }) {
  return user.name?.trim() || user.email;
}

function toCalendarEventResponse<T extends {
  assignedTo: { id: string; name: string | null; email: string; organizationMembership: { role: OrganizationRole; revokedAt: Date | null } | null } | null;
}>(event: T) {
  return {
    ...event,
    assignedTo: event.assignedTo && !event.assignedTo.organizationMembership?.revokedAt ? {
      id: event.assignedTo.id,
      label: userLabel(event.assignedTo),
      email: event.assignedTo.email,
      role: event.assignedTo.organizationMembership?.role ?? null,
    } : null,
  };
}

function parseKind(value: unknown): CalendarEventKind {
  if (!isEnumValue(calendarEventKinds, value)) throw new AccessError("Tipo impegno non valido.", 409);
  return value;
}

function parsePriority(value: unknown): CalendarEventPriority {
  if (!isEnumValue(calendarEventPriorities, value)) throw new AccessError("Priorita non valida.", 409);
  return value;
}

function parseStatus(value: unknown): CalendarEventStatus {
  if (!isEnumValue(calendarEventStatuses, value) || value === "ARCHIVED") throw new AccessError("Stato impegno non valido.", 409);
  return value;
}

function parseAllDay(value: unknown) {
  if (value === undefined) return false;
  if (typeof value !== "boolean") throw new AccessError("Valore giornata intera non valido.", 409);
  return value;
}

function parseDescription(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") throw new AccessError("Descrizione non valida.", 409);
  const description = value.trim();
  if (description.length > 4000) throw new AccessError("La descrizione non puo superare 4000 caratteri.", 409);
  return description || null;
}

function assertTimeRange(startAt: Date, endAt: Date) {
  if (endAt <= startAt) throw new AccessError("La fine deve essere successiva all'inizio.", 409);
  const maxDuration = 366 * 24 * 60 * 60 * 1000;
  if (endAt.getTime() - startAt.getTime() > maxDuration) throw new AccessError("Un impegno non puo durare piu di un anno.", 409);
}

async function assertAssignee(organizationId: string, assignedToId: string | null) {
  if (!assignedToId) return null;
  const membership = await db.organizationMembership.findFirst({
    where: { organizationId, userId: assignedToId, revokedAt: null },
    select: { userId: true },
  });
  if (!membership) throw new AccessError("Persona non disponibile per questa Azienda.", 404);
  return membership.userId;
}

async function assertJobSite(organizationId: string, jobSiteId: string | null) {
  if (!jobSiteId) return null;
  const jobSite = await db.jobSite.findFirst({ where: { organizationId, id: jobSiteId, archivedAt: null }, select: { id: true } });
  if (!jobSite) throw new AccessError("Cantiere non trovato.", 404);
  return jobSite.id;
}

function parseRange(input: { start?: unknown; end?: unknown }) {
  const start = input.start === undefined ? new Date(Date.now() - 90 * 86400000) : parseRequiredDate(input.start, "Inizio intervallo");
  const end = input.end === undefined ? new Date(Date.now() + 365 * 86400000) : parseRequiredDate(input.end, "Fine intervallo");
  if (end <= start) throw new AccessError("Intervallo calendario non valido.", 409);
  if (end.getTime() - start.getTime() > MAX_RANGE_DAYS * 86400000) throw new AccessError("Intervallo calendario troppo ampio.", 409);
  return { start, end };
}

function visibilityWhere(input: {
  fullAccess: boolean;
  preset: string | null;
  userId: string;
  siteManagerJobSiteIds: string[];
}) {
  if (input.fullAccess) return undefined;
  if (input.preset === "SITE_MANAGER") {
    return { OR: [{ assignedToId: input.userId }, { jobSiteId: { in: input.siteManagerJobSiteIds } }] };
  }
  return { assignedToId: input.userId };
}

export async function listCalendarEvents(input: { start?: unknown; end?: unknown; assignedToId?: unknown } = {}) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("calendar:read", CALENDAR_ROLES);
  const range = parseRange(input);
  const scope = await getResourceScope(context);
  const requestedAssignee = trimOptionalId(input.assignedToId, "Persona");
  const visibility = visibilityWhere({ fullAccess: scope.fullAccess, preset: scope.preset, userId: context.userId, siteManagerJobSiteIds: scope.siteManagerJobSiteIds });
  if (requestedAssignee && !scope.fullAccess && requestedAssignee !== context.userId) {
    throw new AccessError("Calendario persona non disponibile.", 404);
  }
  const events = await db.calendarEvent.findMany({
    where: {
      organizationId,
      archivedAt: null,
      startAt: { lt: range.end },
      endAt: { gt: range.start },
      ...(requestedAssignee ? { assignedToId: requestedAssignee } : visibility),
    },
    select: calendarEventSelect,
    orderBy: [{ startAt: "asc" }, { priority: "desc" }, { createdAt: "asc" }],
  });
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "calendar-events" });
  return events.map(toCalendarEventResponse);
}

export async function listCalendarParticipants() {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("calendar:read", CALENDAR_ROLES);
  const memberships = await db.organizationMembership.findMany({
    where: {
      organizationId,
      revokedAt: null,
      ...(context.permissions.includes("calendar:manage") ? {} : { userId: context.userId }),
    },
    select: { role: true, user: { select: { id: true, name: true, email: true } } },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });
  return memberships.map(({ role, user }) => ({ id: user.id, label: userLabel(user), email: user.email, role }));
}

async function createCalendarEventRecord(
  organizationId: string,
  createdById: string,
  input: CalendarEventImportInput,
  source: CalendarEventSource,
) {
  const title = trimRequiredText(input.title, "Titolo impegno", 2, 160);
  const startAt = parseRequiredDate(input.startAt, "Inizio");
  const endAt = parseRequiredDate(input.endAt, "Fine");
  assertTimeRange(startAt, endAt);
  const assignedToId = await assertAssignee(organizationId, trimOptionalId(input.assignedToId, "Persona") ?? null);
  const jobSiteId = await assertJobSite(organizationId, trimOptionalId(input.jobSiteId, "Cantiere") ?? null);
  const externalUid = source === "ICALENDAR_IMPORT" ? trimOptionalId(input.externalUid, "UID esterno") : null;
  return db.calendarEvent.create({
    data: {
      organizationId,
      title,
      description: parseDescription(input.description),
      startAt,
      endAt,
      allDay: parseAllDay(input.allDay),
      kind: input.kind === undefined ? "EVENT" : parseKind(input.kind),
      priority: input.priority === undefined ? "MEDIUM" : parsePriority(input.priority),
      status: input.status === undefined ? "PLANNED" : parseStatus(input.status),
      source,
      externalUid,
      assignedToId,
      jobSiteId,
      createdById,
    },
    select: calendarEventSelect,
  });
}

export async function createCalendarEvent(input: CalendarEventInput) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("calendar:manage", CALENDAR_MANAGE_ROLES);
  const event = await createCalendarEventRecord(organizationId, context.userId, input, "QOOVEX");
  await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "calendar-event", resourceId: event.id });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "CALENDAR_EVENT_CREATED",
    entityType: "CALENDAR_EVENT",
    entityId: event.id,
    metadata: { kind: event.kind, priority: event.priority },
  });
  return toCalendarEventResponse(event);
}

export async function importCalendarEvents(inputs: CalendarEventImportInput[]) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("calendar:manage", CALENDAR_MANAGE_ROLES);
  if (!inputs.length || inputs.length > 200) throw new AccessError("Il file deve contenere da 1 a 200 eventi.", 409);
  let imported = 0;
  let skipped = 0;
  for (const input of inputs) {
    try {
      const event = await createCalendarEventRecord(organizationId, context.userId, input, "ICALENDAR_IMPORT");
      imported += 1;
      await recordProductAuditEventBestEffort({
        organizationId,
        ...auditActorFromContext(context, actorRole),
        action: "CALENDAR_EVENT_CREATED",
        entityType: "CALENDAR_EVENT",
        entityId: event.id,
        metadata: { kind: event.kind, source: "ICALENDAR_IMPORT" },
      });
    } catch (error) {
      if (typeof error === "object" && error && "code" in error && error.code === "P2002") skipped += 1;
      else throw error;
    }
  }
  return { imported, skipped };
}

export async function updateCalendarEvent(eventId: string, input: CalendarEventInput) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("calendar:read", CALENDAR_ROLES);
  const existing = await db.calendarEvent.findFirst({ where: { id: eventId, organizationId, archivedAt: null }, select: calendarEventSelect });
  if (!existing) throw new AccessError("Impegno non trovato.", 404);
  const canManage = context.permissions.includes("calendar:manage");
  const submittedKeys = Object.entries(input).filter(([, value]) => value !== undefined).map(([key]) => key);
  if (!canManage && (existing.assignedToId !== context.userId || submittedKeys.some((key) => key !== "status"))) {
    throw new AccessError("Puoi aggiornare soltanto lo stato degli impegni assegnati a te.", 403);
  }

  const startAt = input.startAt === undefined ? existing.startAt : parseRequiredDate(input.startAt, "Inizio");
  const endAt = input.endAt === undefined ? existing.endAt : parseRequiredDate(input.endAt, "Fine");
  assertTimeRange(startAt, endAt);
  const data: Record<string, unknown> = {};
  if (input.title !== undefined) data.title = trimRequiredText(input.title, "Titolo impegno", 2, 160);
  if (input.description !== undefined) data.description = parseDescription(input.description);
  if (input.startAt !== undefined) data.startAt = startAt;
  if (input.endAt !== undefined) data.endAt = endAt;
  if (input.allDay !== undefined) data.allDay = parseAllDay(input.allDay);
  if (input.kind !== undefined) data.kind = parseKind(input.kind);
  if (input.priority !== undefined) data.priority = parsePriority(input.priority);
  if (input.status !== undefined) data.status = parseStatus(input.status);
  if (input.assignedToId !== undefined) data.assignedToId = await assertAssignee(organizationId, trimOptionalId(input.assignedToId, "Persona") ?? null);
  if (input.jobSiteId !== undefined) data.jobSiteId = await assertJobSite(organizationId, trimOptionalId(input.jobSiteId, "Cantiere") ?? null);
  if (!Object.keys(data).length) throw new AccessError("Nessun dato impegno da aggiornare.", 409);
  const event = await db.calendarEvent.update({ where: { id: existing.id }, data, select: calendarEventSelect });
  await recordSupportAccess({ userId: context.userId, action: "WRITE", resourceType: "calendar-event", resourceId: event.id });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "CALENDAR_EVENT_UPDATED",
    entityType: "CALENDAR_EVENT",
    entityId: event.id,
    metadata: { kind: event.kind, priority: event.priority, status: event.status },
  });
  return toCalendarEventResponse(event);
}

export async function archiveCalendarEvent(eventId: string) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("calendar:manage", CALENDAR_MANAGE_ROLES);
  const existing = await db.calendarEvent.findFirst({ where: { id: eventId, organizationId, archivedAt: null }, select: { id: true } });
  if (!existing) throw new AccessError("Impegno non trovato.", 404);
  const event = await db.calendarEvent.update({
    where: { id: existing.id },
    data: { archivedAt: new Date(), status: "ARCHIVED" },
    select: calendarEventSelect,
  });
  await recordSupportAccess({ userId: context.userId, action: "SENSITIVE", resourceType: "calendar-event", resourceId: event.id });
  await recordProductAuditEventBestEffort({
    organizationId,
    ...auditActorFromContext(context, actorRole),
    action: "CALENDAR_EVENT_ARCHIVED",
    entityType: "CALENDAR_EVENT",
    entityId: event.id,
  });
  return toCalendarEventResponse(event);
}
