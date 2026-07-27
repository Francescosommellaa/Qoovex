import "server-only";

import crypto from "node:crypto";
import { db, Prisma } from "@qoovex/db";
import type { OperationalEventType, OperationalExceptionSeverity, OperationalExceptionType } from "@qoovex/types";
import { syncOrganizationReminderRecords } from "@shared/server/reminder-service";
import { captureRequirementSnapshots, enqueueOperationalProcess } from "./operational-process-service";

const LEASE_MS = 5 * 60 * 1000;
const MAX_BATCH = 20;
const RETRY_DELAYS_MS = [60_000, 5 * 60_000, 15 * 60_000, 60 * 60_000] as const;
const EXPIRING_SOON_MS = 30 * 24 * 60 * 60 * 1000;

type ClaimedStep = Awaited<ReturnType<typeof claimNextOperationalStep>> extends infer T ? Exclude<T, null> : never;

function jsonObject(value: Prisma.JsonValue | null): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function artifactId(step: ClaimedStep, type: string) {
  return step.process.artifactRefs.find((artifact) => artifact.artifactType === type)?.artifactId ?? null;
}

async function ensureExpirationProcess(tx: Prisma.TransactionClient, shareLink: { id: string; organizationId: string; documentPackageId: string; proposal?: { processId: string } | null }) {
  if (shareLink.proposal?.processId) return shareLink.proposal.processId;
  const existing = await tx.operationalProcess.findFirst({
    where: { organizationId: shareLink.organizationId, type: "DOCUMENT_PACKAGE_SHARING", artifactRefs: { some: { artifactType: "SHARE_LINK", artifactId: shareLink.id } } },
    select: { id: true },
  });
  if (existing) return existing.id;
  const process = await enqueueOperationalProcess({
    organizationId: shareLink.organizationId,
    type: "DOCUMENT_PACKAGE_SHARING",
    triggerKind: "LEGACY_SHARE_LINK_CONTROL",
    idempotencyKey: `legacy-share-link:${shareLink.id}`,
    context: {},
    artifacts: [{ type: "DOCUMENT_PACKAGE", id: shareLink.documentPackageId }, { type: "SHARE_LINK", id: shareLink.id }],
    reliability: "VERIFIED",
    impact: "LOW",
  }, tx);
  await tx.operationalStep.updateMany({ where: { processId: process.id }, data: { status: "COMPLETED", completedAt: new Date() } });
  await tx.operationalProcess.update({ where: { id: process.id }, data: { status: "COMPLETED", completedAt: new Date(), resultSummary: { summary: "Link legacy acquisito nel controllo operativo." } } });
  return process.id;
}

async function appendEvent(tx: Prisma.TransactionClient, input: {
  organizationId: string;
  processId: string;
  stepId?: string | null;
  eventKey: string;
  kind: "INPUT" | "DOMAIN" | "TEMPORAL" | "DECISION" | "TECHNICAL" | "RETRY" | "COMPLETION" | "BLOCKED" | "RECONCILIATION";
  title: string;
  summary?: string | null;
  userVisible?: boolean;
  eventType?: OperationalEventType;
  metadata?: Prisma.InputJsonValue;
}) {
  const eventType: OperationalEventType = input.eventType
    ?? (input.kind === "DECISION" ? "DECISION_REQUESTED"
      : input.kind === "RETRY" ? "RETRY_SCHEDULED"
        : input.kind === "TECHNICAL" ? "PROCESS_TECHNICAL_FAILURE"
          : input.kind === "BLOCKED" ? "EXCEPTION_OPENED"
            : input.kind === "RECONCILIATION" ? "EXCEPTION_RESOLVED"
              : input.kind === "COMPLETION" ? "AUTOMATION_COMPLETED"
                : "LEGACY_EVENT");
  await tx.operationalEvent.createMany({
    data: [{
      organizationId: input.organizationId,
      processId: input.processId,
      stepId: input.stepId ?? null,
      eventKey: input.eventKey,
      kind: input.kind,
      eventType,
      title: input.title,
      summary: input.summary ?? null,
      userVisible: input.userVisible ?? true,
      metadata: input.metadata,
      actorType: "SYSTEM",
      sourceType: "ENGINE",
    }],
    skipDuplicates: true,
  });
}

async function openException(tx: Prisma.TransactionClient, input: {
  organizationId: string;
  processId: string;
  stepId?: string | null;
  type: OperationalExceptionType;
  severity: OperationalExceptionSeverity;
  title: string;
  explanation: string;
  nextStep: string;
  dedupeKey: string;
  dueAt?: Date | null;
  decisionId?: string | null;
}) {
  const existing = await tx.operationalException.findFirst({
    where: { organizationId: input.organizationId, activeDedupeKey: input.dedupeKey, status: "OPEN" },
    select: { id: true },
  });
  if (existing) return existing;
  const created = await tx.operationalException.create({
    data: {
      organizationId: input.organizationId,
      processId: input.processId,
      stepId: input.stepId ?? null,
      decisionId: input.decisionId ?? null,
      type: input.type,
      severity: input.severity,
      title: input.title,
      explanation: input.explanation,
      nextStep: input.nextStep,
      activeDedupeKey: input.dedupeKey,
      dueAt: input.dueAt ?? null,
    },
    select: { id: true },
  });
  await appendEvent(tx, {
    organizationId: input.organizationId,
    processId: input.processId,
    stepId: input.stepId,
    eventKey: `exception-opened:${created.id}`,
    kind: "BLOCKED",
    title: input.title,
    summary: input.nextStep,
  });
  return created;
}

async function resolveExceptionByKey(tx: Prisma.TransactionClient, organizationId: string, dedupeKey: string, processId: string, stepId: string) {
  const open = await tx.operationalException.findFirst({
    where: { organizationId, activeDedupeKey: dedupeKey, status: "OPEN" },
    select: { id: true, processId: true },
  });
  if (!open) return false;
  await tx.operationalException.update({
    where: { id: open.id },
    data: { status: "RESOLVED", activeDedupeKey: null, resolvedAt: new Date(), resolutionReason: "Condizione oggettiva soddisfatta dal processo." },
  });
  const remaining = await tx.operationalException.count({ where: { processId: open.processId, status: "OPEN" } });
  const openDecisions = await tx.operationalDecision.count({ where: { processId: open.processId, status: "OPEN" } });
  if (!remaining && !openDecisions) {
    await tx.operationalProcess.updateMany({ where: { id: open.processId, status: "COMPLETED_WITH_EXCEPTIONS" }, data: { status: "COMPLETED", completedAt: new Date(), resultSummary: { openDecisions: 0, openExceptions: 0, summary: "Le eccezioni oggettive risultano risolte." } } });
  }
  await appendEvent(tx, {
    organizationId,
    processId,
    stepId,
    eventKey: `exception-resolved:${open.id}`,
    kind: "RECONCILIATION",
    title: "Eccezione risolta",
    summary: "La condizione registrata non richiede più attenzione.",
  });
  return true;
}

async function openDecision(tx: Prisma.TransactionClient, input: {
  organizationId: string;
  processId: string;
  stepId: string;
  type: "CONFIRM_DOCUMENT_TYPE" | "CONFIRM_DOCUMENT_OWNER" | "CONFIRM_EXPIRY_DATE" | "RESOLVE_CONFLICT";
  question: string;
  explanation: string;
  options: Array<{ key: string; label: string; description?: string }>;
  dedupeKey: string;
}) {
  const existing = await tx.operationalDecision.findFirst({
    where: { organizationId: input.organizationId, activeDedupeKey: input.dedupeKey, status: "OPEN" },
    select: { id: true },
  });
  if (existing) return existing;
  const decision = await tx.operationalDecision.create({
    data: {
      organizationId: input.organizationId,
      processId: input.processId,
      stepId: input.stepId,
      type: input.type,
      question: input.question,
      explanation: input.explanation,
      options: input.options,
      activeDedupeKey: input.dedupeKey,
    },
    select: { id: true },
  });
  await appendEvent(tx, {
    organizationId: input.organizationId,
    processId: input.processId,
    stepId: input.stepId,
    eventKey: `decision-opened:${decision.id}`,
    kind: "DECISION",
    title: "Decisione richiesta",
    summary: input.question,
  });
  return decision;
}

async function applyResolvedDocumentDecisions(tx: Prisma.TransactionClient, step: ClaimedStep, documentId: string) {
  const decisions = await tx.operationalDecision.findMany({
    where: { processId: step.processId, stepId: step.id, status: "RESOLVED" },
    select: { id: true, type: true, selectedOptionKey: true, selectedValue: true },
    orderBy: { decidedAt: "asc" },
  });
  for (const decision of decisions) {
    if (decision.type === "CONFIRM_DOCUMENT_TYPE" && decision.selectedOptionKey?.startsWith("document-type:")) {
      const documentTypeId = decision.selectedOptionKey.slice("document-type:".length);
      const documentType = await tx.documentType.findFirst({ where: { id: documentTypeId, organizationId: step.organizationId, archivedAt: null }, select: { id: true } });
      if (documentType) await tx.document.update({ where: { id: documentId }, data: { documentTypeId: documentType.id } });
    }
    if (decision.type === "CONFIRM_DOCUMENT_OWNER" && decision.selectedOptionKey) {
      const [kind, id] = decision.selectedOptionKey.split(":");
      if (kind === "worker") {
        const owner = await tx.worker.findFirst({ where: { id, organizationId: step.organizationId, archivedAt: null }, select: { id: true } });
        if (owner) await tx.document.update({ where: { id: documentId }, data: { ownerType: "WORKER", workerId: owner.id, jobSiteId: null } });
      }
      if (kind === "job-site") {
        const owner = await tx.jobSite.findFirst({ where: { id, organizationId: step.organizationId, archivedAt: null }, select: { id: true } });
        if (owner) await tx.document.update({ where: { id: documentId }, data: { ownerType: "JOB_SITE", jobSiteId: owner.id, workerId: null } });
      }
    }
    if (decision.type === "CONFIRM_EXPIRY_DATE" && decision.selectedValue) {
      const expiryDate = new Date(decision.selectedValue);
      if (!Number.isNaN(expiryDate.getTime())) await tx.document.update({ where: { id: documentId }, data: { expiryDate } });
    }
  }
}

async function captureContext(tx: Prisma.TransactionClient, step: ClaimedStep) {
  if (step.process.type === "WORKER_CREATED") {
    await captureRequirementSnapshots({ client: tx, processId: step.processId, organizationId: step.organizationId, targetType: "WORKER" });
  }
  if (step.process.type === "JOB_SITE_CREATED") {
    await captureRequirementSnapshots({ client: tx, processId: step.processId, organizationId: step.organizationId, targetType: "JOB_SITE", jobSiteId: artifactId(step, "JOB_SITE") });
  }
  if (step.process.type === "DOCUMENT_RECEIVED") {
    const documentId = artifactId(step, "DOCUMENT");
    if (!documentId) throw new Error("DOCUMENT_ARTIFACT_MISSING");
    const document = await tx.document.findFirst({ where: { id: documentId, organizationId: step.organizationId }, select: { ownerType: true, jobSiteId: true } });
    if (!document) throw new Error("DOCUMENT_NOT_FOUND");
    const targetType = document.ownerType === "WORKER" ? "WORKER" : document.ownerType === "JOB_SITE" ? "JOB_SITE" : "ORGANIZATION";
    await captureRequirementSnapshots({ client: tx, processId: step.processId, organizationId: step.organizationId, targetType, jobSiteId: document.jobSiteId });
  }
  return { summary: "Contesto e regole configurate acquisiti." };
}

async function evaluateDocument(tx: Prisma.TransactionClient, step: ClaimedStep) {
  const documentId = artifactId(step, "DOCUMENT");
  if (!documentId) throw new Error("DOCUMENT_ARTIFACT_MISSING");
  await applyResolvedDocumentDecisions(tx, step, documentId);
  const document = await tx.document.findFirst({
    where: { id: documentId, organizationId: step.organizationId, archivedAt: null },
    select: { id: true, title: true, ownerType: true, workerId: true, jobSiteId: true, documentTypeId: true, expiryDate: true, documentType: { select: { requiresExpiryDate: true, appliesTo: true } } },
  });
  if (!document) throw new Error("DOCUMENT_NOT_FOUND");

  if (!document.documentTypeId) {
    const types = await tx.documentType.findMany({ where: { organizationId: step.organizationId, archivedAt: null }, select: { id: true, name: true }, orderBy: { name: "asc" }, take: 50 });
    await openDecision(tx, {
      organizationId: step.organizationId,
      processId: step.processId,
      stepId: step.id,
      type: "CONFIRM_DOCUMENT_TYPE",
      question: "Quale tipo descrive questo documento?",
      explanation: "Qoovex non deduce la classificazione dal contenuto del file.",
      options: types.map((type) => ({ key: `document-type:${type.id}`, label: type.name })),
      dedupeKey: `document-type:${document.id}`,
    });
    return { blocked: true, summary: "Manca la classificazione del documento." };
  }

  if ((document.ownerType === "WORKER" && !document.workerId) || (document.ownerType === "JOB_SITE" && !document.jobSiteId)) {
    const options = document.ownerType === "WORKER"
      ? (await tx.worker.findMany({ where: { organizationId: step.organizationId, archivedAt: null }, select: { id: true, displayName: true }, orderBy: { displayName: "asc" }, take: 50 })).map((item) => ({ key: `worker:${item.id}`, label: item.displayName }))
      : (await tx.jobSite.findMany({ where: { organizationId: step.organizationId, archivedAt: null }, select: { id: true, name: true }, orderBy: { name: "asc" }, take: 50 })).map((item) => ({ key: `job-site:${item.id}`, label: item.name }));
    await openDecision(tx, {
      organizationId: step.organizationId,
      processId: step.processId,
      stepId: step.id,
      type: "CONFIRM_DOCUMENT_OWNER",
      question: "A quale elemento appartiene il documento?",
      explanation: "Scegli un elemento già visibile e autorizzato nella stessa Azienda.",
      options,
      dedupeKey: `document-owner:${document.id}`,
    });
    return { blocked: true, summary: "Manca il collegamento del documento." };
  }

  if (document.documentType?.requiresExpiryDate && !document.expiryDate) {
    await openDecision(tx, {
      organizationId: step.organizationId,
      processId: step.processId,
      stepId: step.id,
      type: "CONFIRM_EXPIRY_DATE",
      question: "Qual è la data di scadenza registrata?",
      explanation: "Inserisci una data confermata. Qoovex non calcola periodi di validità.",
      options: [{ key: "enter-date", label: "Inserisci la data" }],
      dedupeKey: `document-expiry:${document.id}`,
    });
    return { blocked: true, summary: "Manca la data di scadenza registrata." };
  }

  return { summary: "I dati necessari risultano registrati." };
}

async function evaluateRequirementOwner(tx: Prisma.TransactionClient, step: ClaimedStep, owner: { type: "WORKER" | "JOB_SITE"; id: string; label: string }) {
  const snapshots = await tx.operationalRuleSnapshot.findMany({ where: { processId: step.processId, sourceType: "DOCUMENT_REQUIREMENT" }, select: { sourceId: true, snapshot: true } });
  const typed = snapshots.flatMap((item) => {
    const snapshot = jsonObject(item.snapshot);
    return snapshot.targetType === owner.type && typeof snapshot.documentTypeId === "string"
      ? [{ requirementId: item.sourceId, name: String(snapshot.name ?? "Documento richiesto"), documentTypeId: snapshot.documentTypeId }]
      : [];
  });
  const documents = typed.length ? await tx.document.findMany({
    where: {
      organizationId: step.organizationId,
      archivedAt: null,
      documentTypeId: { in: [...new Set(typed.map((item) => item.documentTypeId))] },
      ...(owner.type === "WORKER" ? { ownerType: "WORKER", workerId: owner.id } : { ownerType: "JOB_SITE", jobSiteId: owner.id }),
    },
    select: { documentTypeId: true },
  }) : [];
  const presentTypes = new Set(documents.flatMap((document) => document.documentTypeId ? [document.documentTypeId] : []));
  let opened = 0;
  let resolved = 0;
  for (const requirement of typed) {
    const key = `missing:${owner.type.toLowerCase()}:${owner.id}:requirement:${requirement.requirementId}`;
    if (presentTypes.has(requirement.documentTypeId)) {
      if (await resolveExceptionByKey(tx, step.organizationId, key, step.processId, step.id)) resolved += 1;
    } else {
      await openException(tx, {
        organizationId: step.organizationId,
        processId: step.processId,
        stepId: step.id,
        type: "DOCUMENT_MISSING",
        severity: "ATTENTION",
        title: `${requirement.name} mancante`,
        explanation: `Il documento non risulta collegato a ${owner.label}.`,
        nextStep: "Aggiungi o collega il documento richiesto dalla configurazione aziendale.",
        dedupeKey: key,
      });
      opened += 1;
    }
  }
  return { summary: `${typed.length} requisiti verificati, ${opened} mancanti, ${resolved} risolti.` };
}

async function evaluateRequirements(tx: Prisma.TransactionClient, step: ClaimedStep) {
  if (step.process.type === "WORKER_CREATED") {
    const workerId = artifactId(step, "WORKER");
    const worker = workerId ? await tx.worker.findFirst({ where: { id: workerId, organizationId: step.organizationId, archivedAt: null }, select: { id: true, displayName: true } }) : null;
    if (!worker) throw new Error("WORKER_NOT_FOUND");
    return evaluateRequirementOwner(tx, step, { type: "WORKER", id: worker.id, label: worker.displayName });
  }
  if (step.process.type === "JOB_SITE_CREATED") {
    const jobSiteId = artifactId(step, "JOB_SITE");
    const jobSite = jobSiteId ? await tx.jobSite.findFirst({ where: { id: jobSiteId, organizationId: step.organizationId, archivedAt: null }, select: { id: true, name: true } }) : null;
    if (!jobSite) throw new Error("JOB_SITE_NOT_FOUND");
    return evaluateRequirementOwner(tx, step, { type: "JOB_SITE", id: jobSite.id, label: jobSite.name });
  }
  if (step.process.type === "DOCUMENT_RECEIVED") {
    const documentId = artifactId(step, "DOCUMENT");
    const document = documentId ? await tx.document.findFirst({ where: { id: documentId, organizationId: step.organizationId }, select: { documentTypeId: true, ownerType: true, workerId: true, jobSiteId: true } }) : null;
    if (!document?.documentTypeId) return { summary: "Nessun requisito riconciliabile senza tipo documento." };
    const requirements = await tx.documentRequirement.findMany({ where: { organizationId: step.organizationId, archivedAt: null, isRequired: true, documentTypeId: document.documentTypeId }, select: { id: true } });
    let resolved = 0;
    for (const requirement of requirements) {
      const owner = document.ownerType === "WORKER" && document.workerId ? `worker:${document.workerId}` : document.ownerType === "JOB_SITE" && document.jobSiteId ? `job_site:${document.jobSiteId}` : null;
      if (owner && await resolveExceptionByKey(tx, step.organizationId, `missing:${owner}:requirement:${requirement.id}`, step.processId, step.id)) resolved += 1;
    }
    return { summary: `${resolved} eccezioni documentali risolte.` };
  }
  return { summary: "Nessun requisito da riconciliare." };
}

function temporalDocumentStatus(expiryDate: Date, now: Date) {
  if (expiryDate.getTime() < now.getTime()) return "EXPIRED" as const;
  if (expiryDate.getTime() <= now.getTime() + EXPIRING_SOON_MS) return "EXPIRING_SOON" as const;
  return "PRESENT" as const;
}

async function reconcileDocumentDeadline(tx: Prisma.TransactionClient, step: ClaimedStep) {
  const documentId = artifactId(step, "DOCUMENT");
  if (!documentId) return { summary: "Nessun documento collegato." };
  const document = await tx.document.findFirst({ where: { id: documentId, organizationId: step.organizationId, archivedAt: null }, select: { id: true, title: true, expiryDate: true, workerId: true, jobSiteId: true, reviewedAt: true, status: true } });
  if (!document?.expiryDate) return { summary: "Nessuna scadenza confermata da registrare." };
  const now = new Date();
  const nextStatus = temporalDocumentStatus(document.expiryDate, now);
  if (document.reviewedAt && document.status !== nextStatus) await tx.document.update({ where: { id: document.id }, data: { status: nextStatus } });
  const deadlines = await tx.deadline.findMany({ where: { organizationId: step.organizationId, documentId: document.id, archivedAt: null }, select: { id: true }, take: 2 });
  if (deadlines.length > 1) {
    await openException(tx, { organizationId: step.organizationId, processId: step.processId, stepId: step.id, type: "CONFLICT", severity: "WARNING", title: "Scadenze duplicate da verificare", explanation: "Più scadenze registrate fanno riferimento allo stesso documento.", nextStep: "Verifica le scadenze e conserva quella corretta.", dedupeKey: `deadline-conflict:${document.id}` });
    return { summary: "Rilevato un conflitto tra scadenze registrate." };
  }
  const deadlineStatus = nextStatus === "PRESENT" ? "SCHEDULED" : nextStatus;
  const deadline = deadlines[0]
    ? await tx.deadline.update({ where: { id: deadlines[0].id }, data: { dueDate: document.expiryDate, status: deadlineStatus, title: document.title }, select: { id: true } })
    : await tx.deadline.create({ data: { organizationId: step.organizationId, title: document.title, dueDate: document.expiryDate, sourceType: "DOCUMENT", documentId: document.id, workerId: document.workerId, jobSiteId: document.jobSiteId, status: deadlineStatus }, select: { id: true } });
  await tx.operationalEffectReceipt.upsert({
    where: { organizationId_effectKey: { organizationId: step.organizationId, effectKey: `deadline:document:${document.id}:${document.expiryDate.toISOString()}` } },
    update: {},
    create: { organizationId: step.organizationId, processId: step.processId, stepId: step.id, effectKey: `deadline:document:${document.id}:${document.expiryDate.toISOString()}`, type: "DEADLINE_RECONCILED", artifactType: "DEADLINE", artifactId: deadline.id },
  });
  return { summary: "Scadenza e stato temporale riconciliati dai dati confermati." };
}

async function reconcilePackages(tx: Prisma.TransactionClient, step: ClaimedStep) {
  const documentId = artifactId(step, "DOCUMENT");
  if (!documentId) return { summary: "Nessun documento collegato." };
  const versionIds = await tx.documentVersion.findMany({ where: { organizationId: step.organizationId, documentId }, select: { id: true } });
  const packages = await tx.documentPackage.findMany({
    where: { organizationId: step.organizationId, archivedAt: null, status: { in: ["DRAFT", "READY_FOR_REVIEW"] }, items: { some: { OR: [{ documentId }, { documentVersionId: { in: versionIds.map((version) => version.id) } }] } } },
    select: { id: true, status: true },
  });
  const ready = packages.filter((item) => item.status === "READY_FOR_REVIEW").map((item) => item.id);
  if (ready.length) await tx.documentPackage.updateMany({ where: { organizationId: step.organizationId, id: { in: ready }, status: "READY_FOR_REVIEW" }, data: { status: "DRAFT" } });
  for (const packageId of ready) {
    await tx.operationalEffectReceipt.upsert({
      where: { organizationId_effectKey: { organizationId: step.organizationId, effectKey: `package-review-reset:${packageId}:${documentId}` } },
      update: {},
      create: { organizationId: step.organizationId, processId: step.processId, stepId: step.id, effectKey: `package-review-reset:${packageId}:${documentId}`, type: "PACKAGE_REVIEW_RESET", artifactType: "DOCUMENT_PACKAGE", artifactId: packageId },
    });
  }
  return { summary: ready.length ? `${ready.length} pacchetti interni richiedono una nuova revisione.` : "Nessun pacchetto interno da aggiornare." };
}

async function reconcileTemporalStatuses(tx: Prisma.TransactionClient, step: ClaimedStep) {
  const now = new Date();
  const upcoming = new Date(now.getTime() + EXPIRING_SOON_MS);
  const documents = await tx.document.findMany({
    where: { organizationId: step.organizationId, archivedAt: null, reviewedAt: { not: null }, expiryDate: { not: null }, OR: [
      { expiryDate: { lt: now }, status: { not: "EXPIRED" } },
      { expiryDate: { gte: now, lte: upcoming }, status: { not: "EXPIRING_SOON" } },
      { expiryDate: { gt: upcoming }, status: { in: ["EXPIRED", "EXPIRING_SOON"] } },
    ] },
    select: { id: true, title: true, expiryDate: true },
    orderBy: { id: "asc" },
    take: 100,
  });
  for (const document of documents) {
    if (!document.expiryDate) continue;
    const status = temporalDocumentStatus(document.expiryDate, now);
    await tx.document.update({ where: { id: document.id }, data: { status } });
    const key = `temporal:${document.id}`;
    if (status === "PRESENT") await resolveExceptionByKey(tx, step.organizationId, key, step.processId, step.id);
    else await openException(tx, {
      organizationId: step.organizationId,
      processId: step.processId,
      stepId: step.id,
      type: status === "EXPIRED" ? "DOCUMENT_EXPIRED" : "DOCUMENT_EXPIRING",
      severity: status === "EXPIRED" ? "WARNING" : "ATTENTION",
      title: status === "EXPIRED" ? "Documento scaduto" : "Documento in scadenza",
      explanation: `${document.title} ha una data registrata ${status === "EXPIRED" ? "superata" : "in arrivo"}.`,
      nextStep: "Apri il documento e verifica le informazioni registrate.",
      dedupeKey: key,
      dueAt: document.expiryDate,
    });
  }
  const expiredLinks = await tx.shareLink.findMany({
    where: { organizationId: step.organizationId, revokedAt: null, expiredAt: null, expiresAt: { lte: now } },
    select: { id: true, organizationId: true, documentPackageId: true, expiresAt: true, proposal: { select: { processId: true } } },
    orderBy: [{ expiresAt: "asc" }, { id: "asc" }],
    take: 100,
  });
  let expiredLinkCount = 0;
  for (const shareLink of expiredLinks) {
    const processId = await ensureExpirationProcess(tx, shareLink);
    const updated = await tx.shareLink.updateMany({ where: { id: shareLink.id, expiredAt: null }, data: { expiredAt: now } });
    if (!updated.count) continue;
    expiredLinkCount += 1;
    await appendEvent(tx, {
      organizationId: step.organizationId,
      processId,
      eventKey: `share-link-expired:${shareLink.id}`,
      kind: "TEMPORAL",
      eventType: "SHARE_LINK_EXPIRED",
      title: "Link condiviso scaduto",
      summary: "La scadenza registrata impedisce ulteriori accessi e download.",
      metadata: { nextState: "EXPIRED" },
    });
  }
  return { summary: `${documents.length} stati documentali e ${expiredLinkCount} link condivisi aggiornati.` };
}

async function reconcileContinuousRequirements(tx: Prisma.TransactionClient, step: ClaimedStep) {
  const [workers, sites] = await Promise.all([
    tx.worker.findMany({ where: { organizationId: step.organizationId, archivedAt: null }, select: { id: true, displayName: true }, orderBy: { id: "asc" }, take: 100 }),
    tx.jobSite.findMany({ where: { organizationId: step.organizationId, archivedAt: null }, select: { id: true, name: true }, orderBy: { id: "asc" }, take: 100 }),
  ]);
  let checked = 0;
  for (const worker of workers) {
    await captureRequirementSnapshots({ client: tx, processId: step.processId, organizationId: step.organizationId, targetType: "WORKER" });
    await evaluateRequirementOwner(tx, step, { type: "WORKER", id: worker.id, label: worker.displayName });
    checked += 1;
  }
  for (const site of sites) {
    await captureRequirementSnapshots({ client: tx, processId: step.processId, organizationId: step.organizationId, targetType: "JOB_SITE", jobSiteId: site.id });
    await evaluateRequirementOwner(tx, step, { type: "JOB_SITE", id: site.id, label: site.name });
    checked += 1;
  }
  return { summary: `${checked} contesti verificati rispetto ai requisiti configurati.` };
}

async function reconcileContinuousExceptions(tx: Prisma.TransactionClient, step: ClaimedStep) {
  const stale = await tx.operationalProcess.count({ where: { organizationId: step.organizationId, status: { in: ["BLOCKED", "TECHNICAL_FAILURE"] } } });
  return { summary: `${stale} processi bloccati o falliti restano visibili nel Centro operativo.` };
}

async function validateArtifactReferences(tx: Prisma.TransactionClient, step: ClaimedStep) {
  const refs = await tx.operationalArtifactReference.findMany({ where: { organizationId: step.organizationId }, select: { id: true, processId: true, artifactType: true, artifactId: true }, orderBy: { id: "asc" }, take: 100 });
  const ids = (type: (typeof refs)[number]["artifactType"]) => [...new Set(refs.filter((ref) => ref.artifactType === type).map((ref) => ref.artifactId))];
  const [organizations, documents, versions, requirements, workers, sites, deadlines, checklists, evidence, packages, shareLinks] = await Promise.all([
    tx.organization.findMany({ where: { id: { in: ids("ORGANIZATION") } }, select: { id: true } }),
    tx.document.findMany({ where: { organizationId: step.organizationId, id: { in: ids("DOCUMENT") } }, select: { id: true } }),
    tx.documentVersion.findMany({ where: { organizationId: step.organizationId, id: { in: ids("DOCUMENT_VERSION") } }, select: { id: true } }),
    tx.documentRequirement.findMany({ where: { organizationId: step.organizationId, id: { in: ids("DOCUMENT_REQUIREMENT") } }, select: { id: true } }),
    tx.worker.findMany({ where: { organizationId: step.organizationId, id: { in: ids("WORKER") } }, select: { id: true } }),
    tx.jobSite.findMany({ where: { organizationId: step.organizationId, id: { in: ids("JOB_SITE") } }, select: { id: true } }),
    tx.deadline.findMany({ where: { organizationId: step.organizationId, id: { in: ids("DEADLINE") } }, select: { id: true } }),
    tx.checklist.findMany({ where: { organizationId: step.organizationId, id: { in: ids("CHECKLIST") } }, select: { id: true } }),
    tx.evidence.findMany({ where: { organizationId: step.organizationId, id: { in: ids("EVIDENCE") } }, select: { id: true } }),
    tx.documentPackage.findMany({ where: { organizationId: step.organizationId, id: { in: ids("DOCUMENT_PACKAGE") } }, select: { id: true } }),
    tx.shareLink.findMany({ where: { organizationId: step.organizationId, id: { in: ids("SHARE_LINK") } }, select: { id: true } }),
  ]);
  const available = new Map<(typeof refs)[number]["artifactType"], Set<string>>([
    ["ORGANIZATION", new Set(organizations.filter((item) => item.id === step.organizationId).map((item) => item.id))],
    ["DOCUMENT", new Set(documents.map((item) => item.id))],
    ["DOCUMENT_VERSION", new Set(versions.map((item) => item.id))],
    ["DOCUMENT_REQUIREMENT", new Set(requirements.map((item) => item.id))],
    ["WORKER", new Set(workers.map((item) => item.id))],
    ["JOB_SITE", new Set(sites.map((item) => item.id))],
    ["DEADLINE", new Set(deadlines.map((item) => item.id))],
    ["CHECKLIST", new Set(checklists.map((item) => item.id))],
    ["EVIDENCE", new Set(evidence.map((item) => item.id))],
    ["DOCUMENT_PACKAGE", new Set(packages.map((item) => item.id))],
    ["SHARE_LINK", new Set(shareLinks.map((item) => item.id))],
  ]);
  let invalid = 0;
  for (const ref of refs) {
    const exists = available.get(ref.artifactType)?.has(ref.artifactId) ?? false;
    if (!exists) {
      await openException(tx, { organizationId: step.organizationId, processId: ref.processId, stepId: step.id, type: "INVALID_ARTIFACT_REFERENCE", severity: "WARNING", title: "Riferimento operativo da verificare", explanation: "L'elemento collegato non è più disponibile nel dominio corrente.", nextStep: "Verifica il processo e il relativo elemento di dominio.", dedupeKey: `invalid-artifact:${ref.id}` });
      invalid += 1;
    }
  }
  return { summary: `${refs.length} riferimenti verificati, ${invalid} da controllare.` };
}

async function executeClaimedStep(step: ClaimedStep) {
  if (step.key === "reconcile-reminders" || step.key === "reconcile-deadlines") {
    const result = await syncOrganizationReminderRecords(step.organizationId);
    return { summary: `${result.created} promemoria creati, ${result.updated} aggiornati, ${result.skipped} invariati.` };
  }
  return db.$transaction(async (tx) => {
    if (step.key === "capture-context") return captureContext(tx, step);
    if (step.key === "evaluate-document") return evaluateDocument(tx, step);
    if (step.key === "evaluate-requirements" || step.key === "reconcile-requirements") {
      return step.process.type === "CONTINUOUS_CONTROL" ? reconcileContinuousRequirements(tx, step) : evaluateRequirements(tx, step);
    }
    if (step.key === "reconcile-deadline") return reconcileDocumentDeadline(tx, step);
    if (step.key === "reconcile-packages") return reconcilePackages(tx, step);
    if (step.key === "reconcile-temporal-statuses") return reconcileTemporalStatuses(tx, step);
    if (step.key === "reconcile-exceptions") return reconcileContinuousExceptions(tx, step);
    if (step.key === "validate-artifacts") return validateArtifactReferences(tx, step);
    return { summary: "Step completato senza effetti aggiuntivi." };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function claimNextOperationalStep(now = new Date()) {
  const candidates = await db.operationalStep.findMany({
    where: { OR: [
      { status: { in: ["READY", "RETRY_SCHEDULED"] }, nextAttemptAt: { lte: now } },
      { status: "RUNNING", leaseExpiresAt: { lte: now } },
    ] },
    select: { id: true },
    orderBy: [{ nextAttemptAt: "asc" }, { createdAt: "asc" }],
    take: 10,
  });
  for (const candidate of candidates) {
    const claimToken = crypto.randomUUID();
    const leaseExpiresAt = new Date(now.getTime() + LEASE_MS);
    const claimed = await db.operationalStep.updateMany({
      where: { id: candidate.id, OR: [
        { status: { in: ["READY", "RETRY_SCHEDULED"] }, nextAttemptAt: { lte: now } },
        { status: "RUNNING", leaseExpiresAt: { lte: now } },
      ] },
      data: { status: "RUNNING", claimToken, claimedAt: now, leaseExpiresAt, startedAt: now, completedAt: null, lastErrorCode: null, attemptCount: { increment: 1 } },
    });
    if (claimed.count !== 1) continue;
    const step = await db.operationalStep.findUnique({
      where: { id: candidate.id },
      include: { process: { include: { artifactRefs: true } } },
    });
    if (!step) continue;
    await db.operationalProcess.updateMany({ where: { id: step.processId, status: { in: ["READY", "RETRY_SCHEDULED", "BLOCKED"] } }, data: { status: "RUNNING", startedAt: step.process.startedAt ?? now, blockedAt: null } });
    return step;
  }
  return null;
}

export async function finalizeClaimedOperationalStep(step: ClaimedStep, outcome: { summary: string; blocked?: boolean }) {
  return db.$transaction(async (tx) => {
    const nextStatus = outcome.blocked ? "BLOCKED" as const : "COMPLETED" as const;
    const completed = await tx.operationalStep.updateMany({
      where: { id: step.id, status: "RUNNING", claimToken: step.claimToken },
      data: { status: nextStatus, resultSummary: { summary: outcome.summary }, completedAt: outcome.blocked ? null : new Date(), claimToken: null, claimedAt: null, leaseExpiresAt: null },
    });
    if (completed.count !== 1) return "FENCED" as const;
    await appendEvent(tx, { organizationId: step.organizationId, processId: step.processId, stepId: step.id, eventKey: `step:${step.id}:attempt:${step.attemptCount}:completed`, kind: outcome.blocked ? "BLOCKED" : "COMPLETION", title: outcome.blocked ? "Step in attesa" : "Step completato", summary: outcome.summary });
    if (outcome.blocked) {
      await tx.operationalProcess.update({ where: { id: step.processId }, data: { status: "WAITING_FOR_DECISION", blockedAt: new Date() } });
      return "BLOCKED" as const;
    }
    const next = await tx.operationalStep.findFirst({ where: { processId: step.processId, status: "WAITING" }, orderBy: { position: "asc" }, select: { id: true } });
    if (next) {
      await tx.operationalStep.update({ where: { id: next.id }, data: { status: "READY", nextAttemptAt: new Date() } });
      await tx.operationalProcess.update({ where: { id: step.processId }, data: { status: "READY" } });
      return "READY" as const;
    }
    const [openDecisions, openExceptions] = await Promise.all([
      tx.operationalDecision.count({ where: { processId: step.processId, status: "OPEN" } }),
      tx.operationalException.count({ where: { processId: step.processId, status: "OPEN" } }),
    ]);
    const status = openDecisions ? "WAITING_FOR_DECISION" : openExceptions ? "COMPLETED_WITH_EXCEPTIONS" : "COMPLETED";
    await tx.operationalProcess.update({ where: { id: step.processId }, data: { status, completedAt: openDecisions ? null : new Date(), resultSummary: { openDecisions, openExceptions } } });
    await appendEvent(tx, { organizationId: step.organizationId, processId: step.processId, eventKey: `process:${step.processId}:result`, kind: "COMPLETION", title: status === "COMPLETED" ? "Processo completato" : status === "COMPLETED_WITH_EXCEPTIONS" ? "Processo completato con elementi da gestire" : "Processo in attesa di decisione", summary: openExceptions ? `${openExceptions} elementi richiedono attenzione.` : "Le verifiche automatiche sono terminate." });
    return status;
  });
}

export async function retryOrFailClaimedOperationalStep(step: ClaimedStep, error: unknown) {
  const code = error instanceof Error ? error.message.slice(0, 120) : "OPERATIONAL_STEP_FAILED";
  const terminal = step.attemptCount >= step.maxAttempts;
  const delay = RETRY_DELAYS_MS[Math.min(Math.max(step.attemptCount - 1, 0), RETRY_DELAYS_MS.length - 1)];
  return db.$transaction(async (tx) => {
    const updated = await tx.operationalStep.updateMany({
      where: { id: step.id, status: "RUNNING", claimToken: step.claimToken },
      data: terminal
        ? { status: "TECHNICAL_FAILURE", lastErrorCode: code, claimToken: null, claimedAt: null, leaseExpiresAt: null }
        : { status: "RETRY_SCHEDULED", nextAttemptAt: new Date(Date.now() + delay), lastErrorCode: code, claimToken: null, claimedAt: null, leaseExpiresAt: null },
    });
    if (updated.count !== 1) return "FENCED" as const;
    await tx.operationalProcess.update({ where: { id: step.processId }, data: { status: terminal ? "TECHNICAL_FAILURE" : "RETRY_SCHEDULED", blockedAt: terminal ? new Date() : null } });
    await appendEvent(tx, { organizationId: step.organizationId, processId: step.processId, stepId: step.id, eventKey: `step:${step.id}:attempt:${step.attemptCount}:failed`, kind: terminal ? "BLOCKED" : "RETRY", title: terminal ? "Errore tecnico persistente" : "Qoovex riproverà automaticamente", summary: terminal ? "Il processo richiede una verifica tecnica." : `Nuovo tentativo pianificato dopo il backoff tecnico.`, userVisible: true });
    if (terminal) await openException(tx, { organizationId: step.organizationId, processId: step.processId, stepId: step.id, type: "PERSISTENT_TECHNICAL_ERROR", severity: "BLOCKING", title: "Processo bloccato da un errore tecnico", explanation: "I tentativi automatici disponibili sono terminati.", nextStep: "Un utente autorizzato può richiedere un nuovo tentativo.", dedupeKey: `technical:${step.id}` });
    return terminal ? "FAILED" as const : "RETRY" as const;
  });
}

function hourlyWindow(now: Date) {
  return now.toISOString().slice(0, 13);
}

export async function enqueueContinuousControlProcesses(now = new Date(), limit = 25) {
  const window = hourlyWindow(now);
  const organizations = await db.organization.findMany({
    where: { operationalProcesses: { none: { type: "CONTINUOUS_CONTROL", idempotencyKey: { endsWith: `:${window}` } } } },
    select: { id: true, name: true },
    orderBy: { id: "asc" },
    take: limit,
  });
  for (const organization of organizations) {
    await db.$transaction((tx) => enqueueOperationalProcess({ organizationId: organization.id, type: "CONTINUOUS_CONTROL", triggerKind: "SCHEDULED_HOURLY", idempotencyKey: `continuous:${organization.id}:${window}`, context: { window }, artifacts: [{ type: "ORGANIZATION", id: organization.id, label: organization.name }] }, tx));
  }
  return organizations.length;
}

export async function runOperationalEngine(now = new Date(), maxSteps = MAX_BATCH) {
  const scheduled = await enqueueContinuousControlProcesses(now);
  const result = { scheduled, claimed: 0, completed: 0, blocked: 0, retried: 0, failed: 0, fenced: 0 };
  for (let index = 0; index < maxSteps; index += 1) {
    const step = await claimNextOperationalStep(now);
    if (!step) break;
    result.claimed += 1;
    try {
      const outcome = await executeClaimedStep(step);
      const state = await finalizeClaimedOperationalStep(step, outcome);
      if (state === "FENCED") result.fenced += 1;
      else if (state === "BLOCKED") result.blocked += 1;
      else result.completed += 1;
    } catch (error) {
      const state = await retryOrFailClaimedOperationalStep(step, error);
      if (state === "FENCED") result.fenced += 1;
      else if (state === "FAILED") result.failed += 1;
      else result.retried += 1;
    }
  }
  return { ...result, generatedAt: new Date().toISOString() };
}
