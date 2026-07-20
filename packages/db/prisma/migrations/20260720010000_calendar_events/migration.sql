ALTER TYPE "AuditAction" ADD VALUE 'CALENDAR_EVENT_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'CALENDAR_EVENT_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'CALENDAR_EVENT_ARCHIVED';
ALTER TYPE "AuditEntityType" ADD VALUE 'CALENDAR_EVENT';

CREATE TYPE "CalendarEventKind" AS ENUM ('EVENT', 'TASK');
CREATE TYPE "CalendarEventPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE "CalendarEventStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'DONE', 'CANCELLED', 'ARCHIVED');
CREATE TYPE "CalendarEventSource" AS ENUM ('QOOVEX', 'ICALENDAR_IMPORT');

CREATE TABLE "CalendarEvent" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "startAt" TIMESTAMP(3) NOT NULL,
  "endAt" TIMESTAMP(3) NOT NULL,
  "allDay" BOOLEAN NOT NULL DEFAULT false,
  "kind" "CalendarEventKind" NOT NULL DEFAULT 'EVENT',
  "priority" "CalendarEventPriority" NOT NULL DEFAULT 'MEDIUM',
  "status" "CalendarEventStatus" NOT NULL DEFAULT 'PLANNED',
  "source" "CalendarEventSource" NOT NULL DEFAULT 'QOOVEX',
  "externalUid" TEXT,
  "assignedToId" TEXT,
  "jobSiteId" TEXT,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "archivedAt" TIMESTAMP(3),

  CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CalendarEvent_time_range_check" CHECK ("endAt" > "startAt")
);

CREATE UNIQUE INDEX "CalendarEvent_organizationId_externalUid_key" ON "CalendarEvent"("organizationId", "externalUid");
CREATE INDEX "CalendarEvent_organizationId_startAt_endAt_idx" ON "CalendarEvent"("organizationId", "startAt", "endAt");
CREATE INDEX "CalendarEvent_organizationId_assignedToId_archivedAt_idx" ON "CalendarEvent"("organizationId", "assignedToId", "archivedAt");
CREATE INDEX "CalendarEvent_organizationId_jobSiteId_archivedAt_idx" ON "CalendarEvent"("organizationId", "jobSiteId", "archivedAt");
CREATE INDEX "CalendarEvent_organizationId_status_archivedAt_idx" ON "CalendarEvent"("organizationId", "status", "archivedAt");
CREATE INDEX "CalendarEvent_createdById_idx" ON "CalendarEvent"("createdById");

ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "JobSite"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
