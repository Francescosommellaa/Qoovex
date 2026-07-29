import "server-only";

import { db } from "@qoovex/db";
import type { OrganizationRole } from "@qoovex/types";
import { AccessError } from "./access-errors";
import { requireOrganizationDomainAccess } from "./domain-access-service";
import { getResourceScope } from "./resource-scope-service";

const PEOPLE_OVERVIEW_ROLES = ["OWNER", "COLLABORATOR"] as const;
const PEOPLE_WORKER_ROLES = ["OWNER", "COLLABORATOR"] as const;
const PEOPLE_ACCESS_ROLES = ["OWNER", "COLLABORATOR"] as const;
const PEOPLE_ASSIGNMENT_ROLES = ["OWNER", "COLLABORATOR"] as const;
const ATTENTION_DOCUMENT_STATUSES = ["MISSING", "EXPIRED", "EXPIRING_SOON", "TO_REVIEW"] as const;

export type PeopleAccessState =
  | "NO_ACCESS_REQUIRED"
  | "INVITATION_PENDING"
  | "INVITATION_EXPIRED"
  | "ACCESS_ACTIVE"
  | "ACCESS_SETUP_REQUIRED"
  | "ACCESS_REVOKED";

interface WorkerDirectoryInput {
  q?: unknown;
  status?: unknown;
  attention?: unknown;
  access?: unknown;
  page?: unknown;
  pageSize?: unknown;
}

function normalizeEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() || null;
}

function stringFilter(value: unknown, max = 160) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function boundedInteger(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === "string" || typeof value === "number" ? Number(value) : Number.NaN;
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
}

function invitationState(invitation: { acceptedAt: Date | null; revokedAt: Date | null; expiresAt: Date } | undefined, now: Date) {
  if (!invitation || invitation.acceptedAt) return null;
  if (invitation.revokedAt) return "ACCESS_REVOKED" as const;
  if (invitation.expiresAt <= now) return "INVITATION_EXPIRED" as const;
  return "INVITATION_PENDING" as const;
}

function deriveWorkerAccessState(input: {
  hasActiveLink: boolean;
  hasActiveMembership: boolean;
  invitation?: { acceptedAt: Date | null; revokedAt: Date | null; expiresAt: Date };
  now: Date;
}): PeopleAccessState {
  if (input.hasActiveLink && input.hasActiveMembership) return "ACCESS_ACTIVE";
  if (input.hasActiveLink || input.hasActiveMembership) return "ACCESS_SETUP_REQUIRED";
  return invitationState(input.invitation, input.now) ?? "NO_ACCESS_REQUIRED";
}

export async function getPeopleOverview() {
  const { context, organizationId } = await requireOrganizationDomainAccess("workers:read", PEOPLE_OVERVIEW_ROLES);
  const now = new Date();
  const visibleDocumentWhere = context.permissions.includes("documents:sensitive:read")
    ? {}
    : { OR: [{ documentTypeId: null }, { documentType: { is: { sensitivity: "STANDARD" as const } } }] };
  const [workers, accessIssues, assignmentIssues] = await Promise.all([
    db.worker.findMany({
      where: { organizationId, archivedAt: null },
      select: {
        id: true,
        documents: { where: { archivedAt: null, status: { in: [...ATTENTION_DOCUMENT_STATUSES] }, ...visibleDocumentWhere }, select: { id: true } },
      },
    }),
    db.organizationMembership.count({
      where: {
        organizationId,
        revokedAt: null,
        OR: [
          { role: "COLLABORATOR", preset: "LIMITED_UPLOAD", user: { workerUserLinks: { none: { organizationId, archivedAt: null } } } },
          { role: "COLLABORATOR", preset: "SITE_MANAGER", user: { jobSiteUserAssignments: { none: { organizationId, archivedAt: null } } } },
        ],
      },
    }),
    db.worker.count({
      where: { organizationId, archivedAt: null, jobSiteAssignments: { none: { organizationId, archivedAt: null } } },
    }),
  ]);
  const workersNeedingAttention = workers.filter((worker) => worker.documents.length > 0).length;
  const pendingInvitations = await db.organizationInvitation.count({
    where: { organizationId, acceptedAt: null, revokedAt: null, expiresAt: { gt: now } },
  });
  return {
    generatedAt: now.toISOString(),
    cards: {
      workers: { total: workers.length, attention: workersNeedingAttention },
      access: { pending: pendingInvitations, attention: accessIssues },
      assignments: { attention: assignmentIssues },
    },
  };
}

export async function listPeopleWorkers(input: WorkerDirectoryInput = {}) {
  const { context, organizationId } = await requireOrganizationDomainAccess("workers:read", PEOPLE_WORKER_ROLES);
  const scope = await getResourceScope(context);
  const q = stringFilter(input.q);
  const status = stringFilter(input.status, 40);
  const attention = stringFilter(input.attention, 40);
  const access = stringFilter(input.access, 40) as PeopleAccessState | "";
  const page = boundedInteger(input.page, 1, 1, 10_000);
  const pageSize = boundedInteger(input.pageSize, 20, 10, 50);
  const now = new Date();
  const visibleDocumentWhere = context.permissions.includes("documents:sensitive:read")
    ? {}
    : { OR: [{ documentTypeId: null }, { documentType: { is: { sensitivity: "STANDARD" as const } } }] };

  let visibleWorkerIds: string[] | undefined;
  if (scope.preset === "LIMITED_UPLOAD") visibleWorkerIds = scope.linkedWorker ? [scope.linkedWorker.id] : [];
  if (scope.preset === "SITE_MANAGER") {
    if (!scope.siteManagerJobSiteIds.length) visibleWorkerIds = [];
    else {
      const rows = await db.jobSiteWorkerAssignment.findMany({
        where: { organizationId, archivedAt: null, jobSiteId: { in: scope.siteManagerJobSiteIds } },
        select: { workerId: true },
        distinct: ["workerId"],
      });
      visibleWorkerIds = rows.map((row) => row.workerId);
    }
  }
  const accessWhere = access === "ACCESS_ACTIVE"
    ? { userLinks: { some: { archivedAt: null, user: { organizationMembership: { is: { organizationId, revokedAt: null } } } } } }
    : access === "INVITATION_PENDING"
      ? { invitations: { some: { acceptedAt: null, revokedAt: null, expiresAt: { gt: now } } } }
      : access === "INVITATION_EXPIRED"
        ? { invitations: { some: { acceptedAt: null, revokedAt: null, expiresAt: { lte: now } } } }
        : access === "ACCESS_REVOKED"
          ? { invitations: { some: { acceptedAt: null, revokedAt: { not: null } } } }
          : access === "ACCESS_SETUP_REQUIRED"
            ? { userLinks: { some: { archivedAt: null, user: { organizationMembership: { isNot: { organizationId, revokedAt: null } } } } } }
            : access === "NO_ACCESS_REQUIRED"
              ? { userLinks: { none: { archivedAt: null } }, invitations: { none: { acceptedAt: null, revokedAt: null, expiresAt: { gt: now } } } }
              : {};

  const where = {
    organizationId,
    archivedAt: null,
    ...(visibleWorkerIds ? { id: { in: visibleWorkerIds } } : {}),
    ...(status === "ACTIVE" ? { status: "ACTIVE" as const } : {}),
    ...(q ? {
      OR: [
        { displayName: { contains: q, mode: "insensitive" as const } },
        { email: { contains: q, mode: "insensitive" as const } },
        { roleLabel: { contains: q, mode: "insensitive" as const } },
      ],
    } : {}),
    ...(attention === "document" ? { documents: { some: { archivedAt: null, status: { in: [...ATTENTION_DOCUMENT_STATUSES] }, ...visibleDocumentWhere } } } : {}),
    ...accessWhere,
  };

  const [total, workers] = await Promise.all([
    db.worker.count({ where }),
    db.worker.findMany({
      where,
      select: {
        id: true,
        displayName: true,
        email: true,
        phone: true,
        roleLabel: true,
        status: true,
        documents: {
          where: { archivedAt: null, ...visibleDocumentWhere },
          select: { id: true, status: true, expiryDate: true, title: true },
        },
        deadlines: {
          where: { archivedAt: null, status: { notIn: ["DONE", "ARCHIVED"] } },
          select: { id: true, title: true, dueDate: true, status: true },
          orderBy: [{ dueDate: "asc" }],
          take: 1,
        },
        jobSiteAssignments: {
          where: { archivedAt: null, jobSite: { archivedAt: null } },
          select: { jobSite: { select: { id: true, name: true } } },
          orderBy: [{ jobSite: { name: "asc" } }],
        },
        userLinks: {
          where: { archivedAt: null },
          select: { userId: true, user: { select: { organizationMembership: { select: { organizationId: true, revokedAt: true } } } } },
          take: 1,
        },
      },
      orderBy: [{ displayName: "asc" }, { id: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const workerIds = workers.map((worker) => worker.id);
  const emails = workers.map((worker) => normalizeEmail(worker.email)).filter((email): email is string => Boolean(email));
  const [invitations, memberships] = await Promise.all([
    workerIds.length || emails.length
      ? db.organizationInvitation.findMany({
        where: { organizationId, OR: [{ workerId: { in: workerIds } }, { email: { in: emails } }] },
        select: { workerId: true, email: true, acceptedAt: true, revokedAt: true, expiresAt: true, createdAt: true },
        orderBy: [{ createdAt: "desc" }],
      })
      : [],
    emails.length
      ? db.organizationMembership.findMany({
        where: { organizationId, user: { email: { in: emails } } },
        select: { revokedAt: true, user: { select: { email: true } } },
      })
      : [],
  ]);
  const membershipByEmail = new Map(memberships.map((membership) => [normalizeEmail(membership.user.email), membership]));
  const invitationByWorker = new Map<string, (typeof invitations)[number]>();
  const invitationByEmail = new Map<string, (typeof invitations)[number]>();
  for (const invitation of invitations) {
    if (invitation.workerId && !invitationByWorker.has(invitation.workerId)) invitationByWorker.set(invitation.workerId, invitation);
    const email = normalizeEmail(invitation.email);
    if (email && !invitationByEmail.has(email)) invitationByEmail.set(email, invitation);
  }

  const items = workers.map((worker) => {
    const email = normalizeEmail(worker.email);
    const link = worker.userLinks[0];
    const linkedMembership = link?.user.organizationMembership;
    const accessState = deriveWorkerAccessState({
      hasActiveLink: Boolean(link),
      hasActiveMembership: Boolean(
        (linkedMembership?.organizationId === organizationId && linkedMembership.revokedAt === null)
        || (email && membershipByEmail.get(email)?.revokedAt === null),
      ),
      invitation: invitationByWorker.get(worker.id) ?? (email ? invitationByEmail.get(email) : undefined),
      now,
    });
    const attentionDocuments = worker.documents.filter((document) => ATTENTION_DOCUMENT_STATUSES.includes(document.status as (typeof ATTENTION_DOCUMENT_STATUSES)[number]));
    const redacted = !context.permissions.includes("documents:sensitive:read");
    return {
      id: worker.id,
      displayName: worker.displayName,
      email: redacted ? null : worker.email,
      phone: redacted ? null : worker.phone,
      roleLabel: worker.roleLabel,
      status: worker.status,
      accessState,
      documentAttentionCount: attentionDocuments.length,
      assignmentCount: worker.jobSiteAssignments.length,
      jobSites: worker.jobSiteAssignments.map((assignment) => assignment.jobSite),
      nextDeadline: worker.deadlines[0] ?? null,
      nextAction: attentionDocuments.length
        ? { label: "Controlla documenti", href: `/workers/${worker.id}#documents` }
        : accessState === "ACCESS_SETUP_REQUIRED"
          ? { label: "Completa accesso", href: `/workers/${worker.id}#access` }
          : worker.jobSiteAssignments.length === 0 && context.permissions.includes("assignments:manage")
            ? { label: "Assegna un cantiere", href: `/people/assignments?workerId=${worker.id}` }
            : { label: "Apri profilo", href: `/workers/${worker.id}` },
    };
  });

  return {
    items,
    pagination: { page, pageSize, total, pageCount: Math.max(1, Math.ceil(total / pageSize)) },
    filters: { q, status, attention, access },
  };
}

export async function getPeopleAccessOverview() {
  const { organizationId } = await requireOrganizationDomainAccess("members:read", PEOPLE_ACCESS_ROLES);
  const now = new Date();
  const [memberships, invitations] = await Promise.all([
    db.organizationMembership.findMany({
      where: { organizationId },
      select: {
        id: true,
        role: true,
        preset: true,
        permissionKeys: true,
        scopeMode: true,
        expiresAt: true,
        accessVersion: true,
        updatedAt: true,
        createdAt: true,
        revokedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            workerUserLinks: { where: { organizationId, archivedAt: null }, select: { worker: { select: { id: true, displayName: true } } } },
            jobSiteUserAssignments: { where: { organizationId, archivedAt: null }, select: { jobSite: { select: { id: true, name: true } } } },
          },
        },
      },
      orderBy: [{ revokedAt: "asc" }, { createdAt: "asc" }],
    }),
    db.organizationInvitation.findMany({
      where: { organizationId },
      select: { id: true, email: true, role: true, workerId: true, expiresAt: true, acceptedAt: true, declinedAt: true, revokedAt: true, createdAt: true, worker: { select: { displayName: true } } },
      orderBy: [{ createdAt: "desc" }],
      take: 200,
    }),
  ]);
  const activeUsers = memberships.filter((item) => item.revokedAt === null);
  const incomplete: Array<{ kind: "WORKER_LINK" | "JOB_SITE_SCOPE"; membershipId: string; userId: string; label: string; message: string }> = [];
  for (const membership of activeUsers) {
    if (membership.preset === "LIMITED_UPLOAD" && membership.user.workerUserLinks.length === 0) {
      incomplete.push({ kind: "WORKER_LINK", membershipId: membership.id, userId: membership.user.id, label: membership.user.email, message: "Collega il Collaboratore a un profilo lavoratore." });
    }
    if (membership.preset === "SITE_MANAGER" && membership.user.jobSiteUserAssignments.length === 0) {
      incomplete.push({ kind: "JOB_SITE_SCOPE", membershipId: membership.id, userId: membership.user.id, label: membership.user.email, message: "Assegna almeno un cantiere al Collaboratore." });
    }
  }
  return {
    generatedAt: now.toISOString(),
    activeUsers,
    revokedUsers: memberships.filter((item) => item.revokedAt !== null),
    pendingInvitations: invitations.filter((item) => !item.acceptedAt && !item.declinedAt && !item.revokedAt && item.expiresAt > now),
    expiredInvitations: invitations.filter((item) => !item.acceptedAt && !item.declinedAt && !item.revokedAt && item.expiresAt <= now),
    revokedInvitations: invitations.filter((item) => Boolean(item.revokedAt || item.declinedAt)),
    incomplete,
  };
}

export async function getPeopleAssignmentsOverview() {
  const { organizationId } = await requireOrganizationDomainAccess("assignments:read", PEOPLE_ASSIGNMENT_ROLES);
  const [jobSites, workers, jobSiteCollaborators] = await Promise.all([
    db.jobSite.findMany({
      where: { organizationId, archivedAt: null },
      select: {
        id: true,
        name: true,
        status: true,
        userAssignments: {
          where: { organizationId, archivedAt: null },
          select: { id: true, userId: true, user: { select: { name: true, email: true } } },
        },
        workerAssignments: {
          where: { organizationId, archivedAt: null, worker: { archivedAt: null } },
          select: { id: true, workerId: true, worker: { select: { displayName: true, roleLabel: true } } },
        },
      },
      orderBy: [{ name: "asc" }],
    }),
    db.worker.findMany({
      where: { organizationId, archivedAt: null },
      select: { id: true, displayName: true, roleLabel: true },
      orderBy: [{ displayName: "asc" }],
    }),
    db.organizationMembership.findMany({
      where: { organizationId, revokedAt: null, role: "COLLABORATOR", permissionKeys: { has: "jobSites:read" }, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
      select: { user: { select: { id: true, name: true, email: true } } },
      orderBy: [{ createdAt: "asc" }],
    }),
  ]);
  return {
    jobSites,
    options: {
      workers,
      jobSiteCollaborators: jobSiteCollaborators.map(({ user }) => ({ id: user.id, label: user.name?.trim() || user.email, email: user.email })),
    },
  };
}

export async function getWorkerAccessSummary(workerId: string) {
  const { organizationId } = await requireOrganizationDomainAccess("assignments:read", PEOPLE_ASSIGNMENT_ROLES);
  const worker = await db.worker.findFirst({
    where: { id: workerId, organizationId, archivedAt: null },
    select: {
      userLinks: {
        where: { archivedAt: null },
        select: { user: { select: { organizationMembership: { select: { organizationId: true, revokedAt: true } } } } },
        take: 1,
      },
      invitations: {
        select: { acceptedAt: true, revokedAt: true, expiresAt: true },
        orderBy: [{ createdAt: "desc" }],
        take: 1,
      },
    },
  });
  if (!worker) throw new AccessError("Lavoratore non trovato.", 404);
  const link = worker.userLinks[0];
  return {
    state: deriveWorkerAccessState({
      hasActiveLink: Boolean(link),
      hasActiveMembership: Boolean(link?.user.organizationMembership?.organizationId === organizationId && link.user.organizationMembership.revokedAt === null),
      invitation: worker.invitations[0],
      now: new Date(),
    }),
  };
}

export function canOpenPeopleSection(role: OrganizationRole | null) {
  return role !== null;
}
