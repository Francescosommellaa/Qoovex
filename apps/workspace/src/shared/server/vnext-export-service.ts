import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { Zip, ZipPassThrough, strToU8 } from "fflate";
import { db, Prisma } from "@qoovex/db";
import { AccessError } from "./access-errors";
import { getPrivateBlob, putPrivateBlob } from "./blob-storage-service";
import { canonicalize, fingerprintPayload } from "./vnext-contracts";
import { requireIdentity } from "./access-context-service";
import { sendTransactionalEmail } from "./transactional-email-service";
import { buildAbsoluteWorkspaceUrl } from "./workspace-url-service";
import { recordProductAuditEventBestEffort } from "./product-audit-service";

const ACCESS_LINK_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const DOWNLOAD_GRANT_TTL_MS = 15 * 60 * 1000;
const ARCHIVE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_EXPORT_BYTES = 500 * 1024 * 1024;

function safeFileName(value: string) {
  const normalized = value.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized.slice(0, 180) || "file";
}

async function buildZipStream(input: { manifest: Record<string, unknown>; attachments: Array<{ id: string; blobKey: string; originalFileName: string }> }) {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      return (async () => {
        const zip = new Zip((error, chunk, final) => {
          if (error) { controller.error(error); return; }
          controller.enqueue(chunk);
          if (final) controller.close();
        });
        const manifest = new ZipPassThrough("manifest.json");
        zip.add(manifest);
        manifest.push(strToU8(JSON.stringify(canonicalize(input.manifest), null, 2)), true);
        const index = new ZipPassThrough("indice.txt");
        zip.add(index);
        index.push(strToU8(`Qoovex export\nAllegati: ${input.attachments.length}\n`), true);
        for (const attachment of input.attachments) {
          const blob = await getPrivateBlob(attachment.blobKey);
          if (!blob) throw new Error(`EXPORT_ATTACHMENT_MISSING:${attachment.id}`);
          const file = new ZipPassThrough(`file/${attachment.id}-${safeFileName(attachment.originalFileName)}`);
          zip.add(file);
          const reader = blob.stream.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            file.push(value, false);
          }
          file.push(new Uint8Array(), true);
        }
        zip.end();
      })().catch((error: unknown) => controller.error(error));
    },
  });
  return stream;
}

export async function generateJobSiteExport(exportId: string) {
  const exportRecord = await db.jobSiteExport.findUnique({
    where: { id: exportId },
    include: {
      jobSite: {
        include: {
          participants: { select: { id: true, kind: true, status: true, publicRoleLabel: true, user: { select: { firstName: true, lastName: true } } } },
          steps: { orderBy: { sortOrder: "asc" } },
          timelineEvents: { orderBy: { sequence: "asc" } },
          changeProposals: { include: { versions: { include: { effects: true, consents: true }, orderBy: { version: "asc" } } } },
          paymentRequests: { include: { transferDeclarations: true, reviews: true } },
          closures: { include: { consents: true } },
          attachments: { where: { archivedAt: null }, include: { publications: { where: { withdrawnAt: null } } } },
        },
      },
    },
  });
  if (!exportRecord || !["PENDING", "RUNNING"].includes(exportRecord.status)) throw new AccessError("Export non disponibile.", 409);
  const client = exportRecord.audience === "CLIENT";
  const events = exportRecord.jobSite.timelineEvents.filter((event) => !client || event.audience === "SHARED");
  const attachments = exportRecord.jobSite.attachments.filter((attachment) => !client || attachment.publications.some((publication) => publication.audience === "SHARED"));
  const manifest = {
    schemaVersion: 1,
    exportId: exportRecord.id,
    audience: exportRecord.audience,
    generatedAt: new Date().toISOString(),
    jobSite: { id: exportRecord.jobSite.id, name: exportRecord.jobSite.name, address: exportRecord.jobSite.address, status: exportRecord.jobSite.status, closedAt: exportRecord.jobSite.closedAt },
    participants: exportRecord.jobSite.participants.map((participant) => ({ id: participant.id, kind: participant.kind, status: participant.status, publicRoleLabel: participant.publicRoleLabel, name: [participant.user.firstName, participant.user.lastName].filter(Boolean).join(" ") })),
    steps: exportRecord.jobSite.steps.map(({ economicValueMinor, ...step }) => ({ ...step, economicValueMinor: economicValueMinor?.toString() ?? null })),
    timeline: events.map(({ payload, ...event }) => ({ ...event, sequence: event.sequence.toString(), payload })),
    proposals: exportRecord.jobSite.changeProposals.filter((proposal) => !client || proposal.status !== "DRAFT"),
    payments: exportRecord.jobSite.paymentRequests.filter((payment) => !client || payment.status !== "DRAFT").map(({ amountMinor, transferDeclarations, ...payment }) => ({ ...payment, amountMinor: amountMinor.toString(), transferDeclarations: transferDeclarations.map(({ amountMinor: declared, ...declaration }) => ({ ...declaration, amountMinor: declared.toString() })) })),
    closures: exportRecord.jobSite.closures,
    attachments: attachments.map((attachment) => ({ id: attachment.id, category: attachment.category, originalFileName: attachment.originalFileName, mimeType: attachment.mimeType, size: attachment.size, checksumSha256: attachment.checksumSha256 })),
  };
  const manifestFingerprint = fingerprintPayload(manifest);
  await db.jobSiteExport.update({ where: { id: exportRecord.id }, data: { status: "RUNNING", manifestFingerprint } });
  const stream = await buildZipStream({ manifest, attachments: attachments.map((attachment) => ({ id: attachment.id, blobKey: attachment.blobKey, originalFileName: attachment.originalFileName })) });
  const archiveHash = createHash("sha256");
  const hashingStream = new TransformStream<Uint8Array, Uint8Array>({ transform(chunk, controller) { archiveHash.update(chunk); controller.enqueue(chunk); } });
  const blobKey = `organizations/${exportRecord.organizationId}/job-sites/${exportRecord.jobSiteId}/exports/${exportRecord.id}.zip`;
  await putPrivateBlob({ pathname: blobKey, body: stream.pipeThrough(hashingStream), contentType: "application/zip", maximumSizeInBytes: MAX_EXPORT_BYTES, allowOverwrite: true });
  const archiveChecksum = archiveHash.digest("hex");
  const stored = await getPrivateBlob(blobKey);
  if (!stored) throw new Error("EXPORT_BLOB_NOT_FOUND_AFTER_WRITE");
  const availableUntil = new Date(Date.now() + ARCHIVE_TTL_MS);
  const rawAccessToken = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(rawAccessToken).digest("hex");
  await db.$transaction([
    db.jobSiteExport.update({ where: { id: exportRecord.id }, data: { status: "READY", blobKey, size: stored.size, checksumSha256: archiveChecksum, availableUntil, completedAt: new Date() } }),
    db.jobSiteExportAccessLink.create({ data: { exportId: exportRecord.id, tokenHash, activeKey: `${exportRecord.id}:ACCESS`, expiresAt: new Date(Date.now() + ACCESS_LINK_TTL_MS) } }),
  ]);
  const requester = exportRecord.audience === "CLIENT"
    ? await db.user.findFirst({ where: { jobSiteParticipants: { some: { jobSiteId: exportRecord.jobSiteId, kind: "CLIENT", status: "ACTIVE" } } }, select: { id: true, email: true } })
    : await db.user.findUnique({ where: { id: exportRecord.requestedByUserId }, select: { id: true, email: true } });
  const accessPath = `/exports/access/${encodeURIComponent(rawAccessToken)}`;
  if (requester) {
    await Promise.allSettled([
      db.notification.create({ data: { organizationId: exportRecord.organizationId, userId: requester.id, type: "EXPORT_READY", severity: "INFO", title: "Export pronto", message: `L'export di ${exportRecord.jobSite.name} e pronto.`, sourceType: "EXPORT", sourceId: exportRecord.id, dedupeKey: `job-site-export:${exportRecord.id}:ready`, actionHref: accessPath } }),
      sendTransactionalEmail({ to: requester.email, template: { kind: "export-ready", jobSiteName: exportRecord.jobSite.name, accessUrl: buildAbsoluteWorkspaceUrl(accessPath), expiresAt: new Date(Date.now() + ACCESS_LINK_TTL_MS) }, idempotencyKey: `job-site-export:${exportRecord.id}:ready` }),
    ]);
  }
  return { exportId: exportRecord.id, accessToken: rawAccessToken, accessExpiresAt: new Date(Date.now() + ACCESS_LINK_TTL_MS).toISOString(), availableUntil: availableUntil.toISOString() };
}

async function assertExportAccess(userId: string, exportId: string) {
  const exportRecord = await db.jobSiteExport.findFirst({
    where: { id: exportId, status: "READY", availableUntil: { gt: new Date() }, OR: [
      { audience: "CLIENT", jobSite: { participants: { some: { userId, kind: "CLIENT", status: "ACTIVE" } } } },
      { audience: "ORGANIZATION", jobSite: { participants: { some: { userId, kind: "ORGANIZATION_MEMBER", status: "ACTIVE" } } } },
    ] },
    select: { id: true, blobKey: true },
  });
  if (!exportRecord?.blobKey) throw new AccessError("Export non disponibile.", 404);
  return exportRecord;
}

export async function exchangeExportAccessToken(rawToken: string) {
  const identity = await requireIdentity();
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const link = await db.jobSiteExportAccessLink.findFirst({ where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() }, export: { status: "READY", availableUntil: { gt: new Date() } } }, select: { id: true, exportId: true } });
  if (!link) throw new AccessError("Link export scaduto o non disponibile.", 410);
  await assertExportAccess(identity.id, link.exportId);
  const rawGrant = randomBytes(32).toString("base64url");
  const grantHash = createHash("sha256").update(rawGrant).digest("hex");
  await db.jobSiteExportDownloadGrant.create({ data: { exportId: link.exportId, userId: identity.id, tokenHash: grantHash, activeKey: `${link.exportId}:${identity.id}`, expiresAt: new Date(Date.now() + DOWNLOAD_GRANT_TTL_MS) } });
  return { exportId: link.exportId, downloadGrant: rawGrant, expiresAt: new Date(Date.now() + DOWNLOAD_GRANT_TTL_MS).toISOString() };
}

export async function downloadExportWithGrant(rawGrant: string) {
  const identity = await requireIdentity();
  const tokenHash = createHash("sha256").update(rawGrant).digest("hex");
  const grant = await db.jobSiteExportDownloadGrant.findFirst({ where: { tokenHash, userId: identity.id, revokedAt: null, consumedAt: null, expiresAt: { gt: new Date() } }, select: { id: true, exportId: true } });
  if (!grant) throw new AccessError("Grant download scaduto o non disponibile.", 410);
  const exportRecord = await assertExportAccess(identity.id, grant.exportId);
  const blob = await getPrivateBlob(exportRecord.blobKey!);
  if (!blob) throw new AccessError("Archivio export non disponibile.", 404);
  await db.jobSiteExportDownloadGrant.update({ where: { id: grant.id }, data: { consumedAt: new Date(), activeKey: null } });
  const exportInfo = await db.jobSiteExport.findUnique({ where: { id: grant.exportId }, select: { organizationId: true } });
  if (exportInfo) await recordProductAuditEventBestEffort({ organizationId: exportInfo.organizationId, actorUserId: identity.id, action: "JOB_SITE_EXPORT_DOWNLOADED", entityType: "JOB_SITE_EXPORT", entityId: grant.exportId });
  return { stream: blob.stream, size: blob.size, fileName: `qoovex-${grant.exportId}.zip` };
}
