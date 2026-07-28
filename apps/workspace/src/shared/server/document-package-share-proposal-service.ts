import "server-only";

import crypto from "node:crypto";
import { db, Prisma } from "@qoovex/db";
import type {
  ConfirmDocumentPackageShareProposalInput,
  ConfirmDocumentPackageShareProposalResponse,
  DocumentPackageRevisionDto,
  DocumentPackageRevisionIssueDto,
  DocumentPackageRevisionItemDto,
  DocumentPackageShareProposalDto,
  PrepareDocumentPackageShareProposalInput,
} from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { requireOrganizationDomainAccess } from "@shared/server/domain-access-service";
import { enqueueOperationalProcess } from "@shared/server/operational-process-service";
import { auditActorFromContext } from "@shared/server/product-audit-service";
import { recordSupportAccess } from "@shared/server/support-access-service";
import { createShareToken, hashShareToken } from "@shared/server/share-token-service";

const SHARE_ROLES = ["OWNER", "COLLABORATOR"] as const;
const SHARE_PURPOSE_MAX = 500;
const SHARE_RECIPIENT_MAX = 160;

type OperationalDb = Prisma.TransactionClient;

interface RevisionManifest {
  schemaVersion: 1;
  package: { title: string; description: string | null };
  items: DocumentPackageRevisionItemDto[];
  issues: DocumentPackageRevisionIssueDto[];
}

const packageForRevisionSelect = {
  id: true,
  organizationId: true,
  title: true,
  description: true,
  status: true,
  updatedAt: true,
  archivedAt: true,
  items: {
    select: {
      id: true,
      itemType: true,
      position: true,
      note: true,
      documentId: true,
      documentVersionId: true,
      evidenceId: true,
      checklistId: true,
      createdAt: true,
      document: {
        select: {
          id: true,
          title: true,
          status: true,
          expiryDate: true,
          archivedAt: true,
          documentType: { select: { categoryKey: true, sensitivity: true } },
        },
      },
      documentVersion: {
        select: {
          id: true,
          originalFileName: true,
          mimeType: true,
          size: true,
          archivedAt: true,
          document: {
            select: {
              id: true,
              title: true,
              status: true,
              expiryDate: true,
              archivedAt: true,
              documentType: { select: { categoryKey: true, sensitivity: true } },
            },
          },
        },
      },
      evidence: {
        select: {
          id: true,
          title: true,
          type: true,
          originalFileName: true,
          mimeType: true,
          size: true,
          blobKey: true,
          archivedAt: true,
        },
      },
      checklist: { select: { id: true, name: true, status: true, archivedAt: true } },
    },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }, { id: "asc" }],
  },
} satisfies Prisma.DocumentPackageSelect;

type PackageForRevision = Prisma.DocumentPackageGetPayload<{ select: typeof packageForRevisionSelect }>;

const proposalSelect = {
  id: true,
  organizationId: true,
  documentPackageId: true,
  processId: true,
  decisionId: true,
  targetKind: true,
  recipientLabel: true,
  purpose: true,
  expiresAt: true,
  allowDownload: true,
  status: true,
  approvedAt: true,
  publishedAt: true,
  createdAt: true,
  revision: {
    select: {
      id: true,
      documentPackageId: true,
      revisionNumber: true,
      origin: true,
      status: true,
      manifest: true,
      fingerprint: true,
      preparedAt: true,
      approvedAt: true,
    },
  },
} as const;

function parseTrimmed(value: unknown, label: string, min: number, max: number) {
  if (typeof value !== "string") throw new AccessError(`${label} non valida.`, 400);
  const result = value.trim();
  if (result.length < min || result.length > max) throw new AccessError(`${label} non valida.`, 400);
  return result;
}

function parseOptionalTrimmed(value: unknown, label: string, max: number) {
  if (value === undefined || value === null || value === "") return null;
  return parseTrimmed(value, label, 2, max);
}

function parseProposalInput(input: PrepareDocumentPackageShareProposalInput) {
  if (!input || typeof input !== "object") throw new AccessError("Dati di condivisione non validi.", 400);
  if (input.targetKind !== "NAMED_RECIPIENT" && input.targetKind !== "LINK_PURPOSE") {
    throw new AccessError("Destinazione della condivisione non valida.", 400);
  }
  const recipientLabel = input.targetKind === "NAMED_RECIPIENT"
    ? parseTrimmed(input.recipientLabel, "Destinatario", 2, SHARE_RECIPIENT_MAX)
    : null;
  const purpose = input.targetKind === "LINK_PURPOSE"
    ? parseTrimmed(input.purpose, "Finalita", 3, SHARE_PURPOSE_MAX)
    : parseOptionalTrimmed(input.purpose, "Finalita", SHARE_PURPOSE_MAX);
  if (typeof input.expiresAt !== "string") throw new AccessError("Scadenza link richiesta.", 400);
  const expiresAt = new Date(input.expiresAt);
  if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
    throw new AccessError("Scadenza link non valida.", 409);
  }
  if (input.allowDownload !== undefined && typeof input.allowDownload !== "boolean") {
    throw new AccessError("Permesso di download non valido.", 400);
  }
  return { targetKind: input.targetKind, recipientLabel, purpose, expiresAt, allowDownload: input.allowDownload ?? false };
}

function issue(code: DocumentPackageRevisionIssueDto["code"], severity: DocumentPackageRevisionIssueDto["severity"], title: string, sourceItemId?: string): DocumentPackageRevisionIssueDto {
  return { code, severity, title, sourceItemId: sourceItemId ?? null };
}

function documentIssues(document: {
  status: string;
  expiryDate: Date | null;
  archivedAt: Date | null;
  documentType: { categoryKey: string; sensitivity: string } | null;
}, sourceItemId: string, now: Date) {
  const issues: DocumentPackageRevisionIssueDto[] = [];
  if (document.archivedAt) issues.push(issue("ARCHIVED_REFERENCE", "BLOCKING", "Documento archiviato", sourceItemId));
  if (!document.documentType || document.documentType.categoryKey === "UNCLASSIFIED") issues.push(issue("UNCLASSIFIED_DOCUMENT", "BLOCKING", "Documento da classificare", sourceItemId));
  if (document.documentType && document.documentType.sensitivity !== "STANDARD") issues.push(issue("SENSITIVE_DOCUMENT", "BLOCKING", "Documento non condivisibile con questo flusso", sourceItemId));
  if (document.status === "EXPIRED" || (document.expiryDate && document.expiryDate.getTime() <= now.getTime())) issues.push(issue("EXPIRED_DOCUMENT", "ATTENTION", "Documento scaduto", sourceItemId));
  if (document.status === "TO_REVIEW") issues.push(issue("DOCUMENT_TO_VERIFY", "ATTENTION", "Documento da verificare", sourceItemId));
  return issues;
}

export function buildDocumentPackageRevisionManifest(value: PackageForRevision, now = new Date()): RevisionManifest {
  const items: DocumentPackageRevisionItemDto[] = [];
  const issues: DocumentPackageRevisionIssueDto[] = [];

  for (const item of value.items) {
    const base = {
      id: item.id,
      sourceItemId: item.id,
      itemType: item.itemType,
      position: item.position,
      documentId: item.documentId,
      documentVersionId: item.documentVersionId,
      evidenceId: item.evidenceId,
      checklistId: item.checklistId,
      included: true,
      exclusionReason: null,
      hasFile: false,
    } satisfies DocumentPackageRevisionItemDto;

    if (item.itemType === "DOCUMENT") {
      if (!item.document) {
        issues.push(issue("MISSING_REFERENCE", "BLOCKING", "Documento non disponibile", item.id));
        items.push({ ...base, included: false, exclusionReason: "Documento non disponibile" });
        continue;
      }
      const currentIssues = documentIssues(item.document, item.id, now);
      issues.push(...currentIssues);
      const blocked = currentIssues.some((entry) => entry.severity === "BLOCKING");
      items.push({ ...base, title: item.document.title, status: item.document.status, included: !blocked, exclusionReason: blocked ? "Documento non condivisibile" : null });
      continue;
    }

    if (item.itemType === "DOCUMENT_VERSION") {
      if (!item.documentVersion || item.documentVersion.archivedAt) {
        issues.push(issue("MISSING_REFERENCE", "BLOCKING", "Versione documento non disponibile", item.id));
        items.push({ ...base, included: false, exclusionReason: "Versione non disponibile" });
        continue;
      }
      const currentIssues = documentIssues(item.documentVersion.document, item.id, now);
      issues.push(...currentIssues);
      const blocked = currentIssues.some((entry) => entry.severity === "BLOCKING");
      items.push({
        ...base,
        title: item.documentVersion.document.title,
        status: item.documentVersion.document.status,
        included: !blocked,
        exclusionReason: blocked ? "Versione non condivisibile" : null,
        hasFile: !blocked,
        originalFileName: item.documentVersion.originalFileName,
        mimeType: item.documentVersion.mimeType,
        size: item.documentVersion.size,
      });
      continue;
    }

    if (item.itemType === "EVIDENCE") {
      if (!item.evidence || item.evidence.archivedAt) {
        issues.push(issue("MISSING_REFERENCE", "BLOCKING", "Prova non disponibile", item.id));
        items.push({ ...base, included: false, exclusionReason: "Prova non disponibile" });
        continue;
      }
      items.push({
        ...base,
        title: item.evidence.title,
        status: item.evidence.type,
        hasFile: Boolean(item.evidence.blobKey),
        originalFileName: item.evidence.originalFileName,
        mimeType: item.evidence.mimeType,
        size: item.evidence.size,
      });
      continue;
    }

    if (item.itemType === "CHECKLIST") {
      if (!item.checklist || item.checklist.archivedAt) {
        issues.push(issue("MISSING_REFERENCE", "BLOCKING", "Checklist non disponibile", item.id));
        items.push({ ...base, included: false, exclusionReason: "Checklist non disponibile" });
        continue;
      }
      items.push({ ...base, title: item.checklist.name, status: item.checklist.status });
      continue;
    }

    items.push({ ...base, note: item.note, title: "Nota condivisa" });
  }

  return { schemaVersion: 1, package: { title: value.title, description: value.description }, items, issues };
}

function fingerprintManifest(manifest: RevisionManifest) {
  return crypto.createHash("sha256").update(JSON.stringify(manifest)).digest("hex");
}

async function loadPackageForRevision(client: OperationalDb | typeof db, organizationId: string, packageId: string): Promise<PackageForRevision> {
  const documentPackage = await client.documentPackage.findFirst({
    where: { id: packageId, organizationId, archivedAt: null },
    select: packageForRevisionSelect,
  });
  if (!documentPackage) throw new AccessError("Pacchetto documentale non trovato.", 404);
  return documentPackage;
}

function readManifest(value: Prisma.JsonValue): RevisionManifest {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new AccessError("Revisione del pacchetto non valida.", 409);
  const manifest = value as unknown as RevisionManifest;
  if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.items) || !Array.isArray(manifest.issues)) {
    throw new AccessError("Revisione del pacchetto non valida.", 409);
  }
  return manifest;
}

function toRevisionDto(revision: {
  id: string;
  documentPackageId: string;
  revisionNumber: number;
  origin: DocumentPackageRevisionDto["origin"];
  status: DocumentPackageRevisionDto["status"];
  manifest: Prisma.JsonValue;
  fingerprint: string;
  preparedAt: Date;
  approvedAt: Date | null;
}): DocumentPackageRevisionDto {
  const manifest = readManifest(revision.manifest);
  return {
    id: revision.id,
    documentPackageId: revision.documentPackageId,
    revisionNumber: revision.revisionNumber,
    origin: revision.origin,
    status: revision.status,
    fingerprint: revision.fingerprint,
    packageTitle: manifest.package.title,
    packageDescription: manifest.package.description,
    items: manifest.items,
    issues: manifest.issues,
    preparedAt: revision.preparedAt.toISOString(),
    approvedAt: revision.approvedAt?.toISOString() ?? null,
  };
}

function toProposalDto(value: Prisma.DocumentPackageShareProposalGetPayload<{ select: typeof proposalSelect }>, canConfirm: boolean): DocumentPackageShareProposalDto {
  return {
    id: value.id,
    documentPackageId: value.documentPackageId,
    processId: value.processId,
    decisionId: value.decisionId,
    targetKind: value.targetKind,
    recipientLabel: value.recipientLabel,
    purpose: value.purpose,
    expiresAt: value.expiresAt.toISOString(),
    allowDownload: value.allowDownload,
    status: value.status,
    revision: toRevisionDto(value.revision),
    createdAt: value.createdAt.toISOString(),
    approvedAt: value.approvedAt?.toISOString() ?? null,
    publishedAt: value.publishedAt?.toISOString() ?? null,
    canConfirm: canConfirm && value.status === "READY_FOR_REVIEW",
  };
}

async function findProposal(organizationId: string, packageId: string, proposalId: string) {
  const proposal = await db.documentPackageShareProposal.findFirst({
    where: { id: proposalId, organizationId, documentPackageId: packageId },
    select: proposalSelect,
  });
  if (!proposal) throw new AccessError("Proposta di condivisione non trovata.", 404);
  return proposal;
}

export async function listDocumentPackageShareProposals(packageId: string) {
  const { context, organizationId } = await requireOrganizationDomainAccess("documentPackages:share", SHARE_ROLES);
  await loadPackageForRevision(db, organizationId, packageId);
  const proposals = await db.documentPackageShareProposal.findMany({
    where: { organizationId, documentPackageId: packageId },
    select: proposalSelect,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 20,
  });
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "share-proposals", resourceId: packageId });
  return proposals.map((proposal) => toProposalDto(proposal, true));
}

export async function getDocumentPackageShareProposal(packageId: string, proposalId: string) {
  const { context, organizationId } = await requireOrganizationDomainAccess("documentPackages:share", SHARE_ROLES);
  const proposal = await findProposal(organizationId, packageId, proposalId);
  await recordSupportAccess({ userId: context.userId, action: "READ", resourceType: "share-proposal", resourceId: proposal.id });
  return toProposalDto(proposal, true);
}

export async function prepareDocumentPackageShareProposal(packageId: string, input: PrepareDocumentPackageShareProposalInput) {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documentPackages:share", SHARE_ROLES);
  const normalized = parseProposalInput(input);

  const proposalId = await db.$transaction(async (tx) => {
    const documentPackage = await loadPackageForRevision(tx, organizationId, packageId);
    const manifest = buildDocumentPackageRevisionManifest(documentPackage);
    const fingerprint = fingerprintManifest(manifest);
    const idempotencySeed = JSON.stringify({ packageId, updatedAt: documentPackage.updatedAt.toISOString(), fingerprint, ...normalized, expiresAt: normalized.expiresAt.toISOString(), actor: context.userId });
    const process = await enqueueOperationalProcess({
      organizationId,
      type: "DOCUMENT_PACKAGE_SHARING",
      triggerKind: "PACKAGE_SHARE_REVIEW_REQUESTED",
      idempotencyKey: `package-share:${crypto.createHash("sha256").update(idempotencySeed).digest("hex")}`,
      context: { packageUpdatedAt: documentPackage.updatedAt.toISOString(), fingerprint },
      artifacts: [{ type: "DOCUMENT_PACKAGE", id: documentPackage.id, label: documentPackage.title }],
      actorUserId: context.userId,
      actorRole,
      reliability: "VERIFIED",
      impact: "CONTROLLED",
    }, tx);

    const existing = await tx.documentPackageShareProposal.findUnique({
      where: { organizationId_processId: { organizationId, processId: process.id } },
      select: { id: true },
    });
    if (existing) return existing.id;

    let revision = await tx.documentPackageRevision.findFirst({
      where: { organizationId, documentPackageId: packageId, fingerprint },
      select: { id: true },
      orderBy: { revisionNumber: "desc" },
    });
    if (!revision) {
      const latest = await tx.documentPackageRevision.findFirst({
        where: { organizationId, documentPackageId: packageId },
        select: { revisionNumber: true },
        orderBy: { revisionNumber: "desc" },
      });
      revision = await tx.documentPackageRevision.create({
        data: {
          organizationId,
          documentPackageId: packageId,
          revisionNumber: (latest?.revisionNumber ?? 0) + 1,
          origin: "AUTOMATED_PREPARATION",
          status: "PREPARED",
          manifest: manifest as unknown as Prisma.InputJsonValue,
          fingerprint,
          preparedById: context.userId,
        },
        select: { id: true },
      });
    }

    const steps = await tx.operationalStep.findMany({ where: { processId: process.id }, select: { id: true, key: true } });
    const stepByKey = new Map(steps.map((step) => [step.key, step.id]));
    const waitingStepId = stepByKey.get("wait-for-approval");
    if (!waitingStepId) throw new Error("SHARE_APPROVAL_STEP_MISSING");
    const blockingIssues = manifest.issues.filter((entry) => entry.severity === "BLOCKING");

    const proposal = await tx.documentPackageShareProposal.create({
      data: {
        organizationId,
        documentPackageId: packageId,
        revisionId: revision.id,
        processId: process.id,
        targetKind: normalized.targetKind,
        recipientLabel: normalized.recipientLabel,
        purpose: normalized.purpose,
        expiresAt: normalized.expiresAt,
        allowDownload: normalized.allowDownload,
        status: blockingIssues.length ? "BLOCKED" : "READY_FOR_REVIEW",
        preparedAt: new Date(),
        createdById: context.userId,
      },
      select: { id: true },
    });

    let decisionId: string | null = null;
    if (blockingIssues.length) {
      await tx.operationalException.create({
        data: {
          organizationId,
          processId: process.id,
          stepId: waitingStepId,
          type: "DATA_TO_VERIFY",
          severity: "BLOCKING",
          status: "OPEN",
          title: "Pacchetto non pronto per la condivisione",
          explanation: `${blockingIssues.length} elementi richiedono una correzione prima della conferma.`,
          nextStep: "Correggi il pacchetto e prepara una nuova revisione.",
          activeDedupeKey: `share-proposal-blocked:${proposal.id}`,
        },
      });
    } else {
      const decision = await tx.operationalDecision.create({
        data: {
          organizationId,
          processId: process.id,
          stepId: waitingStepId,
          type: "APPROVE_DOCUMENT_PACKAGE_SHARE",
          status: "OPEN",
          question: "Approvi il contenuto e la creazione del link esterno?",
          explanation: "Controlla destinatario o finalita, contenuto, scadenza e possibilita di download.",
          options: [{ key: "approve-and-create", label: "Approva e crea link" }],
          context: { proposalId: proposal.id, fingerprint },
          activeDedupeKey: `share-proposal-approval:${proposal.id}`,
          reliability: "VERIFIED",
          impact: "CONTROLLED",
        },
        select: { id: true },
      });
      decisionId = decision.id;
      await tx.documentPackageShareProposal.update({ where: { id: proposal.id }, data: { decisionId } });
    }

    await tx.operationalStep.updateMany({
      where: { processId: process.id, key: { in: ["capture-package", "validate-artifacts", "prepare-revision"] } },
      data: { status: "COMPLETED", completedAt: new Date(), resultSummary: { summary: "Revisione minimizzata preparata." } },
    });
    await tx.operationalStep.update({ where: { id: waitingStepId }, data: { status: "BLOCKED", resultSummary: { summary: blockingIssues.length ? "Correzione richiesta." : "Conferma autorizzata richiesta." } } });
    await tx.operationalProcess.update({ where: { id: process.id }, data: { status: blockingIssues.length ? "BLOCKED" : "WAITING_FOR_DECISION", blockedAt: new Date(), resultSummary: { proposalId: proposal.id, blockingIssues: blockingIssues.length } } });
    await tx.operationalEvent.createMany({
      data: [
        { organizationId, processId: process.id, eventKey: `package-prepared:${revision.id}`, kind: "DOMAIN", eventType: "PACKAGE_PREPARED", title: "Pacchetto preparato", summary: `${manifest.items.filter((item) => item.included).length} elementi inclusi nella revisione.`, actorType: "SYSTEM", sourceType: "ENGINE", sourceId: revision.id, reliability: "VERIFIED", impact: "LOW" },
        { organizationId, processId: process.id, stepId: waitingStepId, eventKey: blockingIssues.length ? `proposal-blocked:${proposal.id}` : `decision-requested:${decisionId}`, kind: blockingIssues.length ? "BLOCKED" : "DECISION", eventType: blockingIssues.length ? "PROCESS_BLOCKED" : "DECISION_REQUESTED", title: blockingIssues.length ? "Condivisione da correggere" : "Conferma richiesta", summary: blockingIssues.length ? "Il link non puo essere creato finche gli elementi bloccanti non vengono corretti." : "Nessun link esterno e stato ancora creato.", actorType: "SYSTEM", sourceType: "ENGINE", sourceId: proposal.id, reliability: "VERIFIED", impact: "CONTROLLED" },
      ],
      skipDuplicates: true,
    });
    await tx.documentPackage.update({ where: { id: packageId }, data: { status: blockingIssues.length ? "DRAFT" : "READY_FOR_REVIEW" } });
    await tx.productAuditEvent.create({
      data: { organizationId, ...auditActorFromContext(context, actorRole), action: "DOCUMENT_PACKAGE_UPDATED", entityType: "DOCUMENT_PACKAGE", entityId: packageId, outcome: "SUCCESS", metadata: { reasonCode: "share-proposal-prepared", proposalId: proposal.id, revisionId: revision.id, blockingIssues: blockingIssues.length } },
    });
    return proposal.id;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

  const proposal = await findProposal(organizationId, packageId, proposalId);
  await recordSupportAccess({ userId: context.userId, action: "SENSITIVE", resourceType: "share-proposal", resourceId: proposal.id });
  return toProposalDto(proposal, true);
}

export async function confirmDocumentPackageShareProposal(packageId: string, proposalId: string, input: ConfirmDocumentPackageShareProposalInput): Promise<ConfirmDocumentPackageShareProposalResponse> {
  const { context, organizationId, actorRole } = await requireOrganizationDomainAccess("documentPackages:share", SHARE_ROLES);
  if (input?.confirmation !== "APPROVE_AND_CREATE" || typeof input.fingerprint !== "string" || !/^[a-f0-9]{64}$/.test(input.fingerprint)) {
    throw new AccessError("Conferma della condivisione non valida.", 400);
  }
  const token = createShareToken();
  const tokenHash = hashShareToken(token);

  const shareLink = await db.$transaction(async (tx) => {
    const proposal = await tx.documentPackageShareProposal.findFirst({
      where: { id: proposalId, organizationId, documentPackageId: packageId },
      select: { id: true, status: true, revisionId: true, processId: true, decisionId: true, recipientLabel: true, purpose: true, expiresAt: true, allowDownload: true, revision: { select: { fingerprint: true, manifest: true } } },
    });
    if (!proposal) throw new AccessError("Proposta di condivisione non trovata.", 404);
    if (proposal.status !== "READY_FOR_REVIEW") throw new AccessError("La proposta non e disponibile per la conferma.", 409);
    if (proposal.revision.fingerprint !== input.fingerprint) throw new AccessError("Il contenuto e cambiato: prepara una nuova revisione.", 409);
    const manifest = readManifest(proposal.revision.manifest);
    if (manifest.issues.some((entry) => entry.severity === "BLOCKING")) throw new AccessError("Il pacchetto contiene elementi da correggere.", 409);
    if (proposal.expiresAt.getTime() <= Date.now()) throw new AccessError("La scadenza del link deve essere aggiornata.", 409);

    const updated = await tx.documentPackageShareProposal.updateMany({
      where: { id: proposal.id, organizationId, status: "READY_FOR_REVIEW" },
      data: { status: "PUBLISHED", approvedAt: new Date(), publishedAt: new Date(), approvedById: context.userId },
    });
    if (updated.count !== 1) throw new AccessError("La proposta e gia stata gestita.", 409);

    await tx.documentPackageRevision.update({ where: { id: proposal.revisionId }, data: { status: "APPROVED", approvedById: context.userId, approvedAt: new Date() } });
    if (proposal.decisionId) {
      await tx.operationalDecision.updateMany({
        where: { id: proposal.decisionId, organizationId, status: "OPEN" },
        data: { status: "RESOLVED", activeDedupeKey: null, selectedOptionKey: "approve-and-create", decidedById: context.userId, decidedAt: new Date(), reason: "Contenuto, destinazione, durata e permessi confermati." },
      });
    }

    const created = await tx.shareLink.create({
      data: {
        organizationId,
        documentPackageId: packageId,
        revisionId: proposal.revisionId,
        proposalId: proposal.id,
        tokenHash,
        purpose: proposal.purpose,
        recipientLabel: proposal.recipientLabel,
        allowDownload: proposal.allowDownload,
        expiresAt: proposal.expiresAt,
        createdById: context.userId,
      },
      select: { id: true, organizationId: true, documentPackageId: true, revisionId: true, proposalId: true, purpose: true, recipientLabel: true, allowDownload: true, expiresAt: true, expiredAt: true, revokedAt: true, createdById: true, createdAt: true, lastAccessedAt: true },
    });
    await tx.operationalArtifactReference.createMany({ data: [{ organizationId, processId: proposal.processId, artifactType: "SHARE_LINK", artifactId: created.id, label: "Link condiviso" }], skipDuplicates: true });
    await tx.operationalStep.updateMany({ where: { processId: proposal.processId, key: "wait-for-approval" }, data: { status: "COMPLETED", completedAt: new Date(), resultSummary: { summary: "Conferma autorizzata registrata." } } });
    await tx.operationalStep.updateMany({ where: { processId: proposal.processId, key: "activate-share" }, data: { status: "COMPLETED", startedAt: new Date(), completedAt: new Date(), resultSummary: { summary: "Link creato dalla revisione approvata." } } });
    await tx.operationalProcess.update({ where: { id: proposal.processId }, data: { status: "COMPLETED", blockedAt: null, completedAt: new Date(), resultSummary: { summary: "Condivisione approvata e link creato.", shareLinkId: created.id } } });
    await tx.documentPackage.update({ where: { id: packageId }, data: { status: "SHARED" } });
    await tx.operationalEvent.createMany({
      data: [
        { organizationId, processId: proposal.processId, eventKey: `share-approved:${proposal.id}`, kind: "DECISION", eventType: "SHARE_APPROVED", title: "Condivisione approvata", summary: "Contenuto, destinazione, durata e permessi sono stati confermati.", actorUserId: context.userId, actorType: context.support ? "SUPPORT" : "USER", actorRole, sourceType: "USER_ACTION", sourceId: proposal.id, reliability: "VERIFIED", impact: "CONTROLLED" },
        { organizationId, processId: proposal.processId, eventKey: `share-link-created:${created.id}`, kind: "DOMAIN", eventType: "SHARE_LINK_CREATED", title: "Link creato", summary: "Il token e stato mostrato una sola volta e non e memorizzato in chiaro.", actorUserId: context.userId, actorType: context.support ? "SUPPORT" : "USER", actorRole, sourceType: "USER_ACTION", sourceId: created.id, reliability: "VERIFIED", impact: "CONTROLLED" },
        { organizationId, processId: proposal.processId, eventKey: `process:${proposal.processId}:result`, kind: "COMPLETION", eventType: "PROCESS_COMPLETED", title: "Preparazione completata", summary: "La condivisione usa una revisione immutabile del pacchetto.", actorType: "SYSTEM", sourceType: "ENGINE", sourceId: created.id, reliability: "VERIFIED", impact: "LOW" },
      ],
      skipDuplicates: true,
    });
    await tx.productAuditEvent.create({ data: { organizationId, ...auditActorFromContext(context, actorRole), action: "SHARE_LINK_CREATED", entityType: "SHARE_LINK", entityId: created.id, outcome: "SUCCESS", metadata: { expiresAt: created.expiresAt?.toISOString() ?? null, revisionId: proposal.revisionId, allowDownload: created.allowDownload } } });
    return created;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

  const proposal = await findProposal(organizationId, packageId, proposalId);
  await recordSupportAccess({ userId: context.userId, action: "SENSITIVE", resourceType: "share-link", resourceId: shareLink.id });
  return {
    shareLink: { ...shareLink, expiresAt: shareLink.expiresAt?.toISOString() ?? null, expiredAt: shareLink.expiredAt?.toISOString() ?? null, revokedAt: shareLink.revokedAt?.toISOString() ?? null, createdAt: shareLink.createdAt.toISOString(), lastAccessedAt: shareLink.lastAccessedAt?.toISOString() ?? null },
    token,
    proposal: toProposalDto(proposal, false),
  };
}

export async function ensureShareLinkOperationalProcess(client: OperationalDb, input: { id: string; organizationId: string; documentPackageId: string; proposal?: { processId: string } | null }) {
  if (input.proposal?.processId) return input.proposal.processId;
  const existing = await client.operationalArtifactReference.findFirst({
    where: { organizationId: input.organizationId, artifactType: "SHARE_LINK", artifactId: input.id },
    select: { processId: true },
  });
  if (existing) return existing.processId;
  const process = await enqueueOperationalProcess({
    organizationId: input.organizationId,
    type: "DOCUMENT_PACKAGE_SHARING",
    triggerKind: "LEGACY_SHARE_OBSERVED",
    idempotencyKey: `legacy-share:${input.id}`,
    context: { legacy: true },
    artifacts: [
      { type: "DOCUMENT_PACKAGE", id: input.documentPackageId, label: "Pacchetto condiviso" },
      { type: "SHARE_LINK", id: input.id, label: "Link condiviso" },
    ],
    reliability: "VERIFIED",
    impact: "LOW",
  }, client);
  await client.operationalStep.updateMany({ where: { processId: process.id }, data: { status: "SKIPPED", completedAt: new Date(), resultSummary: { summary: "Link precedente acquisito senza riscriverne la storia." } } });
  await client.operationalProcess.update({ where: { id: process.id }, data: { status: "COMPLETED", completedAt: new Date(), resultSummary: { summary: "Link precedente collegato alla timeline operativa." } } });
  return process.id;
}
