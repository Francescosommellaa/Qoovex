import "server-only";

import { db } from "@qoovex/db";
import type { NotificationSeverity, NotificationSourceType, NotificationType } from "@qoovex/types";
import { recordSupportAccess } from "@shared/server/support-access-service";
import { requireOrganizationDomainAccess } from "./domain-access-service";

const REMINDER_ACCESS_ROLES = ["OWNER", "ADMIN", "SAFETY_CONSULTANT"] as const;

export const UPCOMING_DEADLINE_WINDOW_DAYS = 30;

interface ReminderCandidate {
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  sourceType: NotificationSourceType;
  sourceId: string;
  actionHref: string;
}

export interface ReminderSyncResult {
  created: number;
  updated: number;
  skipped: number;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short", year: "numeric" }).format(value);
}

function dedupeKey(candidate: ReminderCandidate) {
  return `${candidate.type}:${candidate.sourceType}:${candidate.sourceId}:organization`;
}

async function ensureNotification(organizationId: string, candidate: ReminderCandidate): Promise<"created" | "updated" | "skipped"> {
  const key = dedupeKey(candidate);
  const existing = await db.notification.findUnique({
    where: { organizationId_dedupeKey: { organizationId, dedupeKey: key } },
    select: { id: true, title: true, message: true, severity: true, actionHref: true, dismissedAt: true },
  });

  if (existing?.dismissedAt) return "skipped";

  if (!existing) {
    await db.notification.create({
      data: {
        organizationId,
        userId: null,
        type: candidate.type,
        severity: candidate.severity,
        title: candidate.title,
        message: candidate.message,
        sourceType: candidate.sourceType,
        sourceId: candidate.sourceId,
        dedupeKey: key,
        actionHref: candidate.actionHref,
      },
      select: { id: true },
    });
    return "created";
  }

  if (
    existing.title === candidate.title &&
    existing.message === candidate.message &&
    existing.severity === candidate.severity &&
    existing.actionHref === candidate.actionHref
  ) {
    return "skipped";
  }

  await db.notification.update({
    where: { id: existing.id },
    data: {
      title: candidate.title,
      message: candidate.message,
      severity: candidate.severity,
      actionHref: candidate.actionHref,
    },
    select: { id: true },
  });
  return "updated";
}

async function collectReminderCandidates(organizationId: string, now: Date): Promise<ReminderCandidate[]> {
  const upcomingUntil = addDays(now, UPCOMING_DEADLINE_WINDOW_DAYS);
  const [deadlines, documents, packagesReadyForReview, shareLinks] = await Promise.all([
    db.deadline.findMany({
      where: {
        organizationId,
        archivedAt: null,
        status: { notIn: ["DONE", "ARCHIVED"] },
        dueDate: { lte: upcomingUntil },
      },
      select: { id: true, title: true, dueDate: true },
      orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
    }),
    db.document.findMany({
      where: { organizationId, archivedAt: null, status: { in: ["TO_REVIEW", "EXPIRED", "EXPIRING_SOON"] } },
      select: { id: true, title: true, status: true, expiryDate: true },
      orderBy: [{ updatedAt: "desc" }],
    }),
    db.documentPackage.findMany({
      where: { organizationId, archivedAt: null, status: "READY_FOR_REVIEW" },
      select: { id: true, title: true },
      orderBy: [{ updatedAt: "desc" }],
    }),
    db.shareLink.findMany({
      where: {
        organizationId,
        documentPackage: { archivedAt: null },
        OR: [
          { revokedAt: { not: null } },
          { revokedAt: null, expiresAt: { not: null, gt: now, lte: upcomingUntil } },
        ],
      },
      select: {
        id: true,
        expiresAt: true,
        revokedAt: true,
        documentPackageId: true,
        documentPackage: { select: { title: true } },
      },
      orderBy: [{ createdAt: "desc" }],
    }),
  ]);

  const candidates: ReminderCandidate[] = [];

  for (const deadline of deadlines) {
    const overdue = deadline.dueDate.getTime() < now.getTime();
    candidates.push({
      type: overdue ? "DEADLINE_OVERDUE" : "DEADLINE_UPCOMING",
      severity: overdue ? "WARNING" : "ATTENTION",
      title: overdue ? "Scadenza registrata superata" : "Scadenza registrata in arrivo",
      message: `${deadline.title} - data registrata ${formatDate(deadline.dueDate)}.`,
      sourceType: "DEADLINE",
      sourceId: deadline.id,
      actionHref: "/deadlines",
    });
  }

  for (const document of documents) {
    if (document.status === "TO_REVIEW") {
      candidates.push({
        type: "DOCUMENT_TO_REVIEW",
        severity: "ATTENTION",
        title: "Documento da verificare",
        message: `${document.title} richiede un controllo operativo.`,
        sourceType: "DOCUMENT",
        sourceId: document.id,
        actionHref: `/documents/${document.id}`,
      });
    }
    if (document.status === "EXPIRED") {
      candidates.push({
        type: "DOCUMENT_EXPIRED",
        severity: "WARNING",
        title: "Documento scaduto",
        message: `${document.title} ha una scadenza registrata superata.`,
        sourceType: "DOCUMENT",
        sourceId: document.id,
        actionHref: `/documents/${document.id}`,
      });
    }
    if (document.status === "EXPIRING_SOON") {
      candidates.push({
        type: "DOCUMENT_EXPIRING_SOON",
        severity: "ATTENTION",
        title: "Documento in scadenza",
        message: `${document.title}${document.expiryDate ? ` - scadenza registrata ${formatDate(document.expiryDate)}` : ""}.`,
        sourceType: "DOCUMENT",
        sourceId: document.id,
        actionHref: `/documents/${document.id}`,
      });
    }
  }

  for (const documentPackage of packagesReadyForReview) {
    candidates.push({
      type: "PACKAGE_READY_FOR_REVIEW",
      severity: "INFO",
      title: "Pacchetto pronto per revisione",
      message: `${documentPackage.title} e pronto per una revisione operativa.`,
      sourceType: "DOCUMENT_PACKAGE",
      sourceId: documentPackage.id,
      actionHref: `/document-packages/${documentPackage.id}`,
    });
  }

  for (const shareLink of shareLinks) {
    if (shareLink.revokedAt) {
      candidates.push({
        type: "SHARE_LINK_REVOKED",
        severity: "INFO",
        title: "Link di condivisione revocato",
        message: `${shareLink.documentPackage.title}: un link di condivisione risulta revocato.`,
        sourceType: "SHARE_LINK",
        sourceId: shareLink.id,
        actionHref: `/document-packages/${shareLink.documentPackageId}`,
      });
    } else if (shareLink.expiresAt) {
      candidates.push({
        type: "SHARE_LINK_EXPIRING",
        severity: "ATTENTION",
        title: "Link di condivisione in scadenza",
        message: `${shareLink.documentPackage.title} - scadenza link ${formatDate(shareLink.expiresAt)}.`,
        sourceType: "SHARE_LINK",
        sourceId: shareLink.id,
        actionHref: `/document-packages/${shareLink.documentPackageId}`,
      });
    }
  }

  return candidates;
}

export async function syncOrganizationReminderRecords(organizationId: string, now = new Date()): Promise<ReminderSyncResult> {
  const candidates = await collectReminderCandidates(organizationId, now);
  const result: ReminderSyncResult = { created: 0, updated: 0, skipped: 0 };

  for (const candidate of candidates) {
    const outcome = await ensureNotification(organizationId, candidate);
    result[outcome] += 1;
  }

  return result;
}

export async function syncOrganizationReminders() {
  const { context, organizationId } = await requireOrganizationDomainAccess("organization:read", REMINDER_ACCESS_ROLES);
  const result = await syncOrganizationReminderRecords(organizationId);
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "reminders-sync" });
  return { ...result, generatedAt: new Date().toISOString() };
}
