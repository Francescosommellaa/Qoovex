import "server-only";

import { db, Prisma } from "@qoovex/db";
import type {
  JobSiteAttentionState,
  JobSiteListResponse,
  JobSiteOperationalListItem,
  JobSiteOperationalPhase,
  JobSiteOperationalSummary,
  JobSiteOverviewResponse,
} from "@qoovex/types";
import { jobSiteAttentionStates, jobSiteOperationalPhases } from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { recordSupportAccess } from "@shared/server/support-access-service";
import { trimOptionalText } from "./document-domain-validation";
import { requireOrganizationDomainAccess } from "./domain-access-service";
import { canReadJobSite, getResourceScope } from "./resource-scope-service";

const JOBSITE_READ_ROLES = ["OWNER", "COLLABORATOR"] as const;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;
const UPCOMING_DAYS = 30;

const operationalRelationsSelect = {
  documents: { where: { archivedAt: null }, select: { documentTypeId: true, status: true } },
  requirements: { where: { archivedAt: null, isRequired: true }, select: { documentTypeId: true } },
  deadlines: { where: { archivedAt: null }, select: { title: true, dueDate: true, status: true } },
  checklists: {
    where: { archivedAt: null },
    select: { items: { select: { status: true } } },
  },
  documentPackages: { where: { archivedAt: null }, select: { status: true } },
  userAssignments: { where: { archivedAt: null, assignmentRole: "SITE_MANAGER" as const }, select: { id: true } },
  workerAssignments: { where: { archivedAt: null }, select: { id: true } },
} as const;

const operationalJobSiteSelect = {
  id: true,
  organizationId: true,
  name: true,
  address: true,
  clientName: true,
  status: true,
  operationalPhase: true,
  startDate: true,
  endDate: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  archivedAt: true,
  ...operationalRelationsSelect,
} as const;

type OperationalJobSiteRow = Prisma.JobSiteGetPayload<{ select: typeof operationalJobSiteSelect }>;

function parsePositiveInt(value: unknown, fallback: number, max: number, label: string) {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = typeof value === "string" ? Number(value) : value;
  if (typeof parsed !== "number" || !Number.isInteger(parsed) || parsed < 1 || parsed > max) {
    throw new AccessError(`${label} non valido.`, 409);
  }
  return parsed;
}

function parseCsv<T extends string>(value: unknown, allowed: readonly T[], label: string): T[] {
  if (value === undefined || value === null || value === "") return [];
  const values = (Array.isArray(value) ? value : String(value).split(",")).map((item) => String(item).trim()).filter(Boolean);
  if (values.some((item) => !allowed.includes(item as T))) throw new AccessError(`${label} non valido.`, 409);
  return [...new Set(values)] as T[];
}

function summarize(row: OperationalJobSiteRow, now = new Date()): JobSiteOperationalSummary {
  const upcomingLimit = new Date(now);
  upcomingLimit.setDate(upcomingLimit.getDate() + UPCOMING_DAYS);
  const documentedTypes = new Set(row.documents.filter((item) => item.status !== "ARCHIVED").map((item) => item.documentTypeId).filter(Boolean));
  const unmetRequirements = row.requirements.filter((item) => item.documentTypeId && !documentedTypes.has(item.documentTypeId)).length;
  const missingDocuments = row.documents.filter((item) => item.status === "MISSING").length + unmetRequirements;
  const expiredDocuments = row.documents.filter((item) => item.status === "EXPIRED").length;
  const documentsToReview = row.documents.filter((item) => item.status === "TO_REVIEW").length;
  const checklistItems = row.checklists.flatMap((checklist) => checklist.items);
  const openChecklistItems = checklistItems.filter((item) => item.status === "OPEN").length;
  const checklistItemsToReview = checklistItems.filter((item) => item.status === "TO_REVIEW").length;
  const overdueDeadlines = row.deadlines.filter((item) => item.status === "EXPIRED" || (item.status !== "DONE" && item.dueDate < now)).length;
  const upcomingDeadlines = row.deadlines.filter((item) => item.status !== "DONE" && item.status !== "ARCHIVED" && item.dueDate >= now && item.dueDate <= upcomingLimit).length;
  const managerCount = row.userAssignments.length;
  const workerCount = row.workerAssignments.length;
  const readyPackages = row.documentPackages.filter((item) => item.status === "READY_FOR_REVIEW").length;
  const nextDeadlineRow = row.deadlines.filter((item) => item.status !== "DONE" && item.status !== "ARCHIVED").sort((left, right) => left.dueDate.getTime() - right.dueDate.getTime())[0] ?? null;
  const attentionStates: JobSiteAttentionState[] = [];
  if (missingDocuments) attentionStates.push("MISSING_DOCUMENTS");
  if (expiredDocuments) attentionStates.push("EXPIRED_DOCUMENTS");
  if (documentsToReview) attentionStates.push("DOCUMENTS_TO_REVIEW");
  if (openChecklistItems || checklistItemsToReview) attentionStates.push("OPEN_CHECKLIST_ITEMS");
  if (overdueDeadlines) attentionStates.push("OVERDUE_DEADLINES");
  if (upcomingDeadlines) attentionStates.push("UPCOMING_DEADLINES");
  if (!managerCount) attentionStates.push("NO_MANAGER");
  if (!workerCount) attentionStates.push("NO_WORKERS");
  if (readyPackages) attentionStates.push("READY_PACKAGES");
  return {
    missingDocuments,
    expiredDocuments,
    documentsToReview,
    openChecklistItems,
    checklistItemsToReview,
    overdueDeadlines,
    upcomingDeadlines,
    managerCount,
    workerCount,
    readyPackages,
    attentionStates,
    attentionScore: overdueDeadlines * 8 + expiredDocuments * 6 + missingDocuments * 5 + documentsToReview * 4 + checklistItemsToReview * 4 + openChecklistItems * 2 + (!managerCount ? 5 : 0) + (!workerCount ? 3 : 0) + upcomingDeadlines + readyPackages,
    nextDeadline: nextDeadlineRow ? { title: nextDeadlineRow.title, dueDate: nextDeadlineRow.dueDate.toISOString() } : null,
  };
}

function toListItem(row: OperationalJobSiteRow): JobSiteOperationalListItem {
  return {
    id: row.id,
    organizationId: row.organizationId,
    name: row.name,
    address: row.address,
    clientName: row.clientName,
    status: row.status,
    operationalPhase: row.operationalPhase,
    startDate: row.startDate?.toISOString() ?? null,
    endDate: row.endDate?.toISOString() ?? null,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    archivedAt: row.archivedAt?.toISOString() ?? null,
    summary: summarize(row),
  };
}

function attentionWhere(states: JobSiteAttentionState[], now: Date): Prisma.JobSiteWhereInput[] {
  return states.map((state) => {
    if (state === "MISSING_DOCUMENTS") return { documents: { some: { archivedAt: null, status: "MISSING" } } };
    if (state === "EXPIRED_DOCUMENTS") return { documents: { some: { archivedAt: null, status: "EXPIRED" } } };
    if (state === "DOCUMENTS_TO_REVIEW") return { documents: { some: { archivedAt: null, status: "TO_REVIEW" } } };
    if (state === "OPEN_CHECKLIST_ITEMS") return { checklists: { some: { archivedAt: null, items: { some: { status: { in: ["OPEN", "TO_REVIEW"] } } } } } };
    if (state === "OVERDUE_DEADLINES") return { deadlines: { some: { archivedAt: null, OR: [{ status: "EXPIRED" }, { dueDate: { lt: now }, status: { notIn: ["DONE", "ARCHIVED"] } }] } } };
    if (state === "UPCOMING_DEADLINES") { const limit = new Date(now); limit.setDate(limit.getDate() + UPCOMING_DAYS); return { deadlines: { some: { archivedAt: null, dueDate: { gte: now, lte: limit }, status: { notIn: ["DONE", "ARCHIVED"] } } } }; }
    if (state === "NO_MANAGER") return { userAssignments: { none: { archivedAt: null, assignmentRole: "SITE_MANAGER" } } };
    if (state === "NO_WORKERS") return { workerAssignments: { none: { archivedAt: null } } };
    return { documentPackages: { some: { archivedAt: null, status: "READY_FOR_REVIEW" } } };
  });
}

export async function listOperationalJobSites(input: { search?: unknown; phase?: unknown; attention?: unknown; page?: unknown; pageSize?: unknown; archived?: boolean } = {}): Promise<JobSiteListResponse> {
  const { context, organizationId } = await requireOrganizationDomainAccess("jobSites:read", JOBSITE_READ_ROLES);
  const scope = await getResourceScope(context);
  const page = parsePositiveInt(input.page, 1, 100_000, "Pagina");
  const pageSize = parsePositiveInt(input.pageSize, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, "Dimensione pagina");
  const search = trimOptionalText(input.search, "Ricerca", 160);
  const phases = parseCsv(input.phase, jobSiteOperationalPhases, "Fase");
  const attention = parseCsv(input.attention, jobSiteAttentionStates, "Filtro attenzione");
  const now = new Date();
  const where: Prisma.JobSiteWhereInput = {
    organizationId,
    archivedAt: input.archived ? { not: null } : null,
    ...(scope.fullAccess ? {} : { id: { in: scope.visibleJobSiteIds } }),
    ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { clientName: { contains: search, mode: "insensitive" } }, { address: { contains: search, mode: "insensitive" } }] } : {}),
    ...(phases.length ? { operationalPhase: { in: phases } } : {}),
    ...(attention.length ? { AND: attentionWhere(attention, now) } : {}),
  };
  const [rows, total] = await Promise.all([
    db.jobSite.findMany({ where, select: operationalJobSiteSelect, orderBy: [{ updatedAt: "desc" }, { id: "asc" }], skip: (page - 1) * pageSize, take: pageSize }),
    db.jobSite.count({ where }),
  ]);
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: input.archived ? "job-sites-archive" : "job-sites" });
  return { items: rows.map(toListItem), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)), generatedAt: now.toISOString() };
}

export async function getJobSiteOverview(): Promise<JobSiteOverviewResponse> {
  const { context, organizationId } = await requireOrganizationDomainAccess("jobSites:read", JOBSITE_READ_ROLES);
  const scope = await getResourceScope(context);
  const where = { organizationId, archivedAt: null, ...(scope.fullAccess ? {} : { id: { in: scope.visibleJobSiteIds } }) };
  const rows = await db.jobSite.findMany({ where, select: operationalJobSiteSelect, orderBy: [{ updatedAt: "desc" }] });
  const documents = await db.document.findMany({ where: { organizationId, archivedAt: null, jobSiteId: { not: null }, jobSite: where }, select: { id: true, jobSiteId: true, title: true, updatedAt: true }, orderBy: [{ updatedAt: "desc" }], take: 6 });
  const checklists = await db.checklist.findMany({ where: { organizationId, archivedAt: null, jobSiteId: { not: null }, jobSite: where }, select: { id: true, jobSiteId: true, name: true, updatedAt: true }, orderBy: [{ updatedAt: "desc" }], take: 6 });
  const evidence = await db.evidence.findMany({ where: { organizationId, archivedAt: null, jobSiteId: { not: null }, jobSite: where }, select: { id: true, jobSiteId: true, title: true, createdAt: true }, orderBy: [{ createdAt: "desc" }], take: 6 });
  const packages = await db.documentPackage.findMany({ where: { organizationId, archivedAt: null, jobSiteId: { not: null }, jobSite: where }, select: { id: true, jobSiteId: true, title: true, updatedAt: true }, orderBy: [{ updatedAt: "desc" }], take: 6 });
  const items = rows.map(toListItem);
  const emptySummary: JobSiteOperationalSummary = { missingDocuments: 0, expiredDocuments: 0, documentsToReview: 0, openChecklistItems: 0, checklistItemsToReview: 0, overdueDeadlines: 0, upcomingDeadlines: 0, managerCount: 0, workerCount: 0, readyPackages: 0, attentionScore: 0, attentionStates: [], nextDeadline: null };
  const totals = items.reduce((sum, item) => {
    for (const key of ["missingDocuments", "expiredDocuments", "documentsToReview", "openChecklistItems", "checklistItemsToReview", "overdueDeadlines", "upcomingDeadlines", "managerCount", "workerCount", "readyPackages", "attentionScore"] as const) sum[key] += item.summary[key];
    return sum;
  }, { ...emptySummary });
  const phaseCounts: JobSiteOverviewResponse["phaseCounts"] = { DRAFT: 0, PREPARATION: 0, IN_PROGRESS: 0, PAUSED: 0, CLOSING: 0, COMPLETED: 0, UNSET: 0 };
  for (const item of items) phaseCounts[item.operationalPhase ?? "UNSET"] += 1;
  const names = new Map(rows.map((row) => [row.id, row.name]));
  const recentActivity = [
    ...documents.map((item) => ({ id: item.id, jobSiteId: item.jobSiteId!, jobSiteName: names.get(item.jobSiteId!) ?? "Cantiere", kind: "DOCUMENT" as const, label: item.title, updatedAt: item.updatedAt.toISOString(), href: `/job-sites/${item.jobSiteId}?section=documents` })),
    ...checklists.map((item) => ({ id: item.id, jobSiteId: item.jobSiteId!, jobSiteName: names.get(item.jobSiteId!) ?? "Cantiere", kind: "CHECKLIST" as const, label: item.name, updatedAt: item.updatedAt.toISOString(), href: `/job-sites/${item.jobSiteId}?section=activities` })),
    ...evidence.map((item) => ({ id: item.id, jobSiteId: item.jobSiteId!, jobSiteName: names.get(item.jobSiteId!) ?? "Cantiere", kind: "EVIDENCE" as const, label: item.title, updatedAt: item.createdAt.toISOString(), href: `/job-sites/${item.jobSiteId}?section=evidence` })),
    ...packages.map((item) => ({ id: item.id, jobSiteId: item.jobSiteId!, jobSiteName: names.get(item.jobSiteId!) ?? "Cantiere", kind: "DOCUMENT_PACKAGE" as const, label: item.title, updatedAt: item.updatedAt.toISOString(), href: `/job-sites/${item.jobSiteId}?section=sharing` })),
  ].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 10);
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "job-sites-overview" });
  return { phaseCounts, totals: { ...totals, activeJobSites: items.length }, attentionQueue: items.filter((item) => item.summary.attentionScore > 0).sort((a, b) => b.summary.attentionScore - a.summary.attentionScore || a.name.localeCompare(b.name)).slice(0, 8), recentActivity, generatedAt: new Date().toISOString() };
}

export async function getJobSiteShell(jobSiteId: string, includeArchived = false) {
  const { context, organizationId } = await requireOrganizationDomainAccess("jobSites:read", JOBSITE_READ_ROLES);
  const scope = await getResourceScope(context);
  const row = await db.jobSite.findFirst({ where: { id: jobSiteId, organizationId, ...(includeArchived ? {} : { archivedAt: null }) }, select: operationalJobSiteSelect });
  if (!row || !canReadJobSite(scope, row.id)) throw new AccessError("Cantiere non trovato.", 404);
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "job-site", resourceId: row.id });
  return toListItem(row);
}
