import "server-only";

import { db, Prisma } from "@qoovex/db";
import type {
  UniversalSearchPage,
  UniversalSearchRequest,
  UniversalSearchResultDto,
  UniversalSearchResultType,
} from "@qoovex/types";
import { universalSearchResultTypes } from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { requireOrganizationDomainAccess } from "@shared/server/domain-access-service";
import { getResourceScope } from "@shared/server/resource-scope-service";
import { processScopeWhere } from "@features/operational-engine/server/operational-read-service";

const SEARCH_ROLES = ["OWNER", "COLLABORATOR"] as const;
const labels: Record<UniversalSearchResultType, string> = {
  DOCUMENT: "Documenti",
  DOCUMENT_TYPE: "Tipi documento",
  WORKER: "Lavoratori",
  JOB_SITE: "Cantieri",
  DEADLINE: "Scadenze",
  CHECKLIST: "Checklist",
  EVIDENCE: "Prove",
  DOCUMENT_PACKAGE: "Condivisioni",
  OPERATIONAL_PROCESS: "Processi",
  OPERATIONAL_DECISION: "Decisioni",
  OPERATIONAL_EXCEPTION: "Eccezioni",
  SHARE_LINK: "Link condivisi",
};

interface CandidateRow {
  type: UniversalSearchResultType;
  id: string;
  title: string;
  context: string | null;
  status: string | null;
  usefulAt: Date | null;
  updatedAt: Date;
  workerId: string | null;
  jobSiteId: string | null;
  processId: string | null;
  packageId: string | null;
}

interface SearchCursor {
  v: 1;
  score: number;
  at: string;
  type: UniversalSearchResultType;
  id: string;
}

function parseRequest(input: UniversalSearchRequest) {
  if (!input || typeof input !== "object" || typeof input.query !== "string") throw new AccessError("Ricerca non valida.", 400);
  const query = input.query.trim().replace(/\s+/g, " ");
  const terms = query.split(" ").filter(Boolean);
  if (query.length < 2 || query.length > 120 || terms.length > 8) throw new AccessError("La ricerca deve contenere da 2 a 120 caratteri e massimo 8 termini.", 400);
  const take = input.take ?? 20;
  if (!Number.isSafeInteger(take) || take < 1 || take > 50) throw new AccessError("Dimensione pagina ricerca non valida.", 400);
  const types = input.types ?? [...universalSearchResultTypes];
  if (!Array.isArray(types) || types.some((type) => !(universalSearchResultTypes as readonly string[]).includes(type))) throw new AccessError("Tipi di ricerca non validi.", 400);
  return { query, terms: terms.map((term) => term.toLocaleLowerCase("it-IT")), take, types: new Set(types) };
}

function decodeCursor(value: unknown): SearchCursor | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || value.length > 500) throw new AccessError("Cursor ricerca non valido.", 400);
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Partial<SearchCursor>;
    if (parsed.v !== 1 || !Number.isSafeInteger(parsed.score) || typeof parsed.at !== "string" || Number.isNaN(Date.parse(parsed.at)) || typeof parsed.type !== "string" || !(universalSearchResultTypes as readonly string[]).includes(parsed.type) || typeof parsed.id !== "string" || !parsed.id) throw new Error("invalid");
    return parsed as SearchCursor;
  } catch {
    throw new AccessError("Cursor ricerca non valido.", 400);
  }
}

function encodeCursor(value: SearchCursor) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function hrefFor(row: CandidateRow) {
  if (row.type === "DOCUMENT") return `/documents/${row.id}`;
  if (row.type === "DOCUMENT_TYPE") return `/settings/document-types/${row.id}`;
  if (row.type === "WORKER") return `/workers/${row.id}`;
  if (row.type === "JOB_SITE") return `/job-sites/${row.id}`;
  if (row.type === "DEADLINE") return `/deadlines/${row.id}`;
  if (row.type === "CHECKLIST") return `/checklists/${row.id}`;
  if (row.type === "EVIDENCE") return `/evidence/${row.id}`;
  if (row.type === "DOCUMENT_PACKAGE") return `/document-packages/${row.id}`;
  if (row.type === "SHARE_LINK") return `/document-packages/${row.packageId ?? ""}`;
  return `/operations/${row.processId ?? row.id}`;
}

function artifactTimelineHref(row: CandidateRow) {
  const supported = new Set(["DOCUMENT", "WORKER", "JOB_SITE", "DEADLINE", "CHECKLIST", "EVIDENCE", "DOCUMENT_PACKAGE", "SHARE_LINK"]);
  return supported.has(row.type) ? `${hrefFor(row)}#timeline` : row.processId || row.type === "OPERATIONAL_PROCESS" ? `/operations/${row.processId ?? row.id}#timeline` : null;
}

function rank(row: CandidateRow, query: string, terms: string[]) {
  const title = row.title.toLocaleLowerCase("it-IT");
  const context = (row.context ?? "").toLocaleLowerCase("it-IT");
  const haystack = `${title} ${context}`;
  let score = 0;
  if (title === query) score += 10_000;
  else if (title.startsWith(query)) score += 7_500;
  if (terms.every((term) => haystack.includes(term))) score += 4_000;
  score += terms.filter((term) => title.includes(term)).length * 500;
  if (["EXPIRED", "BLOCKED", "WAITING_FOR_DECISION", "TO_REVIEW", "OPEN"].includes(row.status ?? "")) score += 100;
  return score;
}

function isAfterCursor(item: { score: number; row: CandidateRow }, cursor: SearchCursor) {
  if (item.score !== cursor.score) return item.score < cursor.score;
  const at = (item.row.usefulAt ?? item.row.updatedAt).toISOString();
  if (at !== cursor.at) return at < cursor.at;
  if (item.row.type !== cursor.type) return item.row.type > cursor.type;
  return item.row.id > cursor.id;
}

function isVisible(row: CandidateRow, input: {
  fullAccess: boolean;
  preset: string | null;
  linkedWorkerId: string | null;
  visibleJobSiteIds: Set<string>;
  visibleWorkerIds: Set<string>;
  visibleProcessIds: Set<string>;
  canShare: boolean;
}) {
  if ((row.type === "DOCUMENT_PACKAGE" || row.type === "SHARE_LINK") && (!input.fullAccess || !input.canShare)) return false;
  if (row.type.startsWith("OPERATIONAL_")) return input.visibleProcessIds.has(row.processId ?? row.id);
  if (input.fullAccess) return true;
  if (row.type === "DOCUMENT_TYPE") return true;
  if (row.type === "WORKER") return row.id === input.linkedWorkerId || input.visibleWorkerIds.has(row.id);
  if (row.type === "JOB_SITE" || row.type === "CHECKLIST") return Boolean(row.jobSiteId && input.visibleJobSiteIds.has(row.jobSiteId));
  if (row.type === "DOCUMENT") {
    if (input.preset === "LIMITED_UPLOAD") return row.workerId === input.linkedWorkerId;
    return Boolean(row.jobSiteId && input.visibleJobSiteIds.has(row.jobSiteId));
  }
  if (row.type === "DEADLINE" || row.type === "EVIDENCE") {
    return row.workerId === input.linkedWorkerId || Boolean(row.jobSiteId && input.visibleJobSiteIds.has(row.jobSiteId));
  }
  return false;
}

async function loadCandidates(organizationId: string, query: string) {
  return db.$transaction(async (tx) => {
    await tx.$executeRaw(Prisma.sql`SET LOCAL statement_timeout = '2000ms'`);
    return tx.$queryRaw<CandidateRow[]>(Prisma.sql`
      WITH candidates AS (
        SELECT 'DOCUMENT'::text AS type, d.id, d.title, dt.name AS context, d.status::text AS status,
          d."expiryDate" AS "usefulAt", d."updatedAt", d."workerId", d."jobSiteId", NULL::text AS "processId", NULL::text AS "packageId",
          to_tsvector('simple', coalesce(d.title, '')) AS document
        FROM "Document" d LEFT JOIN "DocumentType" dt ON dt.id = d."documentTypeId"
        WHERE d."organizationId" = ${organizationId} AND d."archivedAt" IS NULL
        UNION ALL
        SELECT 'DOCUMENT_TYPE', dt.id, dt.name, dt.description, NULL, NULL, dt."updatedAt", NULL, NULL, NULL, NULL,
          to_tsvector('simple', coalesce(dt.name, '') || ' ' || coalesce(dt.description, ''))
        FROM "DocumentType" dt WHERE dt."organizationId" = ${organizationId} AND dt."archivedAt" IS NULL
        UNION ALL
        SELECT 'WORKER', w.id, w."displayName", w."roleLabel", w.status::text, NULL, w."updatedAt", w.id, NULL, NULL, NULL,
          to_tsvector('simple', coalesce(w."displayName", '') || ' ' || coalesce(w."roleLabel", ''))
        FROM "Worker" w WHERE w."organizationId" = ${organizationId} AND w."archivedAt" IS NULL
        UNION ALL
        SELECT 'JOB_SITE', j.id, j.name, coalesce(j."clientName", j.address), j.status::text, j."endDate", j."updatedAt", NULL, j.id, NULL, NULL,
          to_tsvector('simple', coalesce(j.name, '') || ' ' || coalesce(j."clientName", '') || ' ' || coalesce(j.address, ''))
        FROM "JobSite" j WHERE j."organizationId" = ${organizationId} AND j."archivedAt" IS NULL
        UNION ALL
        SELECT 'DEADLINE', d.id, d.title, d."sourceType"::text, d.status::text, d."dueDate", d."updatedAt", d."workerId", d."jobSiteId", NULL, NULL,
          to_tsvector('simple', coalesce(d.title, ''))
        FROM "Deadline" d WHERE d."organizationId" = ${organizationId} AND d."archivedAt" IS NULL
        UNION ALL
        SELECT 'CHECKLIST', c.id, c.name, c.description, c.status::text, NULL, c."updatedAt", NULL, c."jobSiteId", NULL, NULL,
          to_tsvector('simple', coalesce(c.name, '') || ' ' || coalesce(c.description, ''))
        FROM "Checklist" c WHERE c."organizationId" = ${organizationId} AND c."archivedAt" IS NULL
        UNION ALL
        SELECT 'EVIDENCE', e.id, e.title, e.type::text, NULL, e."createdAt", e."createdAt", e."workerId", e."jobSiteId", NULL, NULL,
          to_tsvector('simple', coalesce(e.title, '') || ' ' || coalesce(e.description, ''))
        FROM "Evidence" e WHERE e."organizationId" = ${organizationId} AND e."archivedAt" IS NULL
        UNION ALL
        SELECT 'DOCUMENT_PACKAGE', p.id, p.title, p.description, p.status::text, NULL, p."updatedAt", NULL, p."jobSiteId", NULL, p.id,
          to_tsvector('simple', coalesce(p.title, '') || ' ' || coalesce(p.description, ''))
        FROM "DocumentPackage" p WHERE p."organizationId" = ${organizationId} AND p."archivedAt" IS NULL
        UNION ALL
        SELECT 'OPERATIONAL_PROCESS', p.id, replace(p.type::text, '_', ' '), p."triggerKind", p.status::text, p."updatedAt", p."updatedAt", NULL, NULL, p.id, NULL,
          to_tsvector('simple', coalesce(p."triggerKind", ''))
        FROM "OperationalProcess" p WHERE p."organizationId" = ${organizationId}
        UNION ALL
        SELECT 'OPERATIONAL_DECISION', d.id, d.question, d.explanation, d.status::text, d."createdAt", d."createdAt", NULL, NULL, d."processId", NULL,
          to_tsvector('simple', coalesce(d.question, '') || ' ' || coalesce(d.explanation, ''))
        FROM "OperationalDecision" d WHERE d."organizationId" = ${organizationId}
        UNION ALL
        SELECT 'OPERATIONAL_EXCEPTION', e.id, e.title, e.explanation, e.status::text, coalesce(e."dueAt", e."createdAt"), e."updatedAt", NULL, NULL, e."processId", NULL,
          to_tsvector('simple', coalesce(e.title, '') || ' ' || coalesce(e.explanation, '') || ' ' || coalesce(e."nextStep", ''))
        FROM "OperationalException" e WHERE e."organizationId" = ${organizationId}
        UNION ALL
        SELECT 'SHARE_LINK', s.id, coalesce(s."recipientLabel", s.purpose, 'Link condiviso'), p.title,
          CASE WHEN s."revokedAt" IS NOT NULL THEN 'REVOKED' WHEN coalesce(s."expiredAt", s."expiresAt") <= now() THEN 'EXPIRED' ELSE 'ACTIVE' END,
          s."expiresAt", s."createdAt", NULL, p."jobSiteId", sp."processId", s."documentPackageId",
          to_tsvector('simple', coalesce(s."recipientLabel", '') || ' ' || coalesce(s.purpose, ''))
        FROM "ShareLink" s
        JOIN "DocumentPackage" p ON p.id = s."documentPackageId"
        LEFT JOIN "DocumentPackageShareProposal" sp ON sp.id = s."proposalId"
        WHERE s."organizationId" = ${organizationId}
      )
      SELECT type, id, title, context, status, "usefulAt", "updatedAt", "workerId", "jobSiteId", "processId", "packageId"
      FROM candidates
      WHERE document @@ plainto_tsquery('simple', ${query})
        OR lower(title) = lower(${query})
        OR lower(title) LIKE lower(${`${query}%`})
      LIMIT 600
    `);
  }, { timeout: 2_500 });
}

export async function universalSearch(input: UniversalSearchRequest): Promise<UniversalSearchPage> {
  const parsed = parseRequest(input);
  const cursor = decodeCursor(input.cursor);
  const access = await requireOrganizationDomainAccess("organization:read", SEARCH_ROLES);
  const scope = await getResourceScope(access.context);
  const visibleJobSiteIds = new Set(scope.visibleJobSiteIds);
  const canShare = access.context.permissions.includes("documentPackages:share");
  const [rows, visibleWorkers, visibleProcesses] = await Promise.all([
    loadCandidates(scope.organizationId, parsed.query),
    scope.preset === "SITE_MANAGER" && scope.siteManagerJobSiteIds.length
      ? db.jobSiteWorkerAssignment.findMany({ where: { organizationId: scope.organizationId, archivedAt: null, jobSiteId: { in: scope.siteManagerJobSiteIds } }, select: { workerId: true } })
      : Promise.resolve([]),
    db.operationalProcess.findMany({ where: await processScopeWhere(scope), select: { id: true } }),
  ]);
  const visibility = {
    fullAccess: scope.fullAccess,
    preset: scope.preset,
    linkedWorkerId: scope.linkedWorker?.id ?? null,
    visibleJobSiteIds,
    visibleWorkerIds: new Set(visibleWorkers.map((item) => item.workerId)),
    visibleProcessIds: new Set(visibleProcesses.map((item) => item.id)),
    canShare,
  };
  const normalizedQuery = parsed.query.toLocaleLowerCase("it-IT");
  let ranked = rows
    .filter((row) => parsed.types.has(row.type) && isVisible(row, visibility))
    .map((row) => ({ row, score: rank(row, normalizedQuery, parsed.terms) }))
    .sort((a, b) => b.score - a.score
      || (b.row.usefulAt ?? b.row.updatedAt).getTime() - (a.row.usefulAt ?? a.row.updatedAt).getTime()
      || a.row.type.localeCompare(b.row.type)
      || a.row.id.localeCompare(b.row.id));
  if (cursor) ranked = ranked.filter((item) => isAfterCursor(item, cursor));
  const page = ranked.slice(0, parsed.take);
  const items: UniversalSearchResultDto[] = page.map(({ row }) => ({
    type: row.type,
    id: row.id,
    title: row.title,
    context: row.context,
    status: row.status,
    usefulDate: row.usefulAt?.toISOString() ?? null,
    matchReason: row.title.toLocaleLowerCase("it-IT") === normalizedQuery ? "Corrispondenza esatta" : row.title.toLocaleLowerCase("it-IT").startsWith(normalizedQuery) ? "Corrispondenza iniziale" : "Tutti i termini",
    href: hrefFor(row),
    timelineHref: artifactTimelineHref(row),
    attention: ["EXPIRED", "BLOCKED", "WAITING_FOR_DECISION", "TO_REVIEW", "OPEN"].includes(row.status ?? ""),
  }));
  const last = page.at(-1);
  const nextCursor = ranked.length > parsed.take && last
    ? encodeCursor({ v: 1, score: last.score, at: (last.row.usefulAt ?? last.row.updatedAt).toISOString(), type: last.row.type, id: last.row.id })
    : null;
  const groups = [...new Set(items.map((item) => item.type))].map((type) => ({
    type,
    label: labels[type],
    items: items.filter((item) => item.type === type),
    hasMore: ranked.slice(parsed.take).some((item) => item.row.type === type),
  }));
  return { groups, items, nextCursor };
}
