import "server-only";

import { db, Prisma } from "@qoovex/db";
import type { OperationalArtifactType, OperationalImpact, OperationalProcessType, OperationalReliability, OrganizationRole } from "@qoovex/types";
import { getOperationalDefinition } from "./operational-definitions";

type OperationalDb = Prisma.TransactionClient;

export interface OperationalArtifactInput { type: OperationalArtifactType; id: string; label?: string | null; }
export interface EnqueueOperationalProcessInput {
  organizationId: string;
  type: OperationalProcessType;
  triggerKind: string;
  idempotencyKey: string;
  context?: Record<string, string | number | boolean | null>;
  artifacts: readonly OperationalArtifactInput[];
  actorUserId?: string | null;
  actorRole?: OrganizationRole | null;
  reliability?: OperationalReliability;
  impact?: OperationalImpact;
}

const forbiddenPayloadKey = /(blob|token|secret|password|content|stack|signed.?url)/i;

export function assertMinimizedOperationalPayload(value: unknown, path = "payload"): void {
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") return;
  if (Array.isArray(value)) {
    for (const [index, item] of value.entries()) assertMinimizedOperationalPayload(item, `${path}[${index}]`);
    return;
  }
  if (typeof value !== "object") throw new Error(`OPERATIONAL_PAYLOAD_NOT_SERIALIZABLE:${path}`);
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (forbiddenPayloadKey.test(key)) throw new Error(`OPERATIONAL_PAYLOAD_FORBIDDEN_KEY:${path}.${key}`);
    assertMinimizedOperationalPayload(item, `${path}.${key}`);
  }
}

async function artifactExists(client: OperationalDb, organizationId: string, artifact: OperationalArtifactInput) {
  if (artifact.type === "ORGANIZATION") return artifact.id === organizationId && Boolean(await client.organization.findFirst({ where: { id: artifact.id }, select: { id: true } }));
  if (artifact.type === "DOCUMENT") return Boolean(await client.document.findFirst({ where: { id: artifact.id, organizationId }, select: { id: true } }));
  if (artifact.type === "DOCUMENT_VERSION") return Boolean(await client.documentVersion.findFirst({ where: { id: artifact.id, organizationId }, select: { id: true } }));
  if (artifact.type === "DOCUMENT_REQUIREMENT") return Boolean(await client.documentRequirement.findFirst({ where: { id: artifact.id, organizationId }, select: { id: true } }));
  if (artifact.type === "WORKER") return Boolean(await client.worker.findFirst({ where: { id: artifact.id, organizationId }, select: { id: true } }));
  if (artifact.type === "JOB_SITE") return Boolean(await client.jobSite.findFirst({ where: { id: artifact.id, organizationId }, select: { id: true } }));
  if (artifact.type === "DEADLINE") return Boolean(await client.deadline.findFirst({ where: { id: artifact.id, organizationId }, select: { id: true } }));
  if (artifact.type === "CHECKLIST") return Boolean(await client.checklist.findFirst({ where: { id: artifact.id, organizationId }, select: { id: true } }));
  if (artifact.type === "EVIDENCE") return Boolean(await client.evidence.findFirst({ where: { id: artifact.id, organizationId }, select: { id: true } }));
  if (artifact.type === "DOCUMENT_PACKAGE") return Boolean(await client.documentPackage.findFirst({ where: { id: artifact.id, organizationId }, select: { id: true } }));
  return false;
}

export async function assertOperationalArtifacts(client: OperationalDb, organizationId: string, artifacts: readonly OperationalArtifactInput[]) {
  for (const artifact of artifacts) {
    if (!artifact.id || !(await artifactExists(client, organizationId, artifact))) throw new Error(`INVALID_OPERATIONAL_ARTIFACT:${artifact.type}`);
  }
}

export async function enqueueOperationalProcess(input: EnqueueOperationalProcessInput, client: OperationalDb = db) {
  const definition = getOperationalDefinition(input.type);
  assertMinimizedOperationalPayload(input.context ?? {});
  await assertOperationalArtifacts(client, input.organizationId, input.artifacts);
  return client.operationalProcess.upsert({
    where: { organizationId_idempotencyKey: { organizationId: input.organizationId, idempotencyKey: input.idempotencyKey } },
    update: {},
    create: {
      organizationId: input.organizationId,
      type: definition.type,
      definitionVersion: definition.version,
      status: "READY",
      triggerKind: input.triggerKind,
      idempotencyKey: input.idempotencyKey,
      context: input.context as Prisma.InputJsonValue | undefined,
      reliability: input.reliability ?? "VERIFIED",
      impact: input.impact ?? "LOW",
      steps: { create: definition.steps.map((step, position) => ({ organizationId: input.organizationId, key: step.key, position, status: position === 0 ? "READY" : "WAITING" })) },
      events: { create: { organizationId: input.organizationId, eventKey: "input", kind: "INPUT", title: definition.title, summary: "Ingresso operativo acquisito. Qoovex verifichera i dati registrati.", actorUserId: input.actorUserId ?? null, reliability: input.reliability ?? "VERIFIED", impact: input.impact ?? "LOW" } },
      artifactRefs: { create: input.artifacts.map((artifact) => ({ organizationId: input.organizationId, artifactType: artifact.type, artifactId: artifact.id, label: artifact.label ?? null })) },
    },
    select: { id: true, organizationId: true, type: true, definitionVersion: true, status: true, createdAt: true },
  });
}

export async function captureRequirementSnapshots(input: { client: OperationalDb; processId: string; organizationId: string; targetType: "WORKER" | "JOB_SITE" | "ORGANIZATION"; jobSiteId?: string | null; }) {
  const requirements = await input.client.documentRequirement.findMany({
    where: {
      organizationId: input.organizationId,
      targetType: input.targetType,
      archivedAt: null,
      isRequired: true,
      ...(input.targetType === "JOB_SITE" ? { OR: [{ jobSiteId: null }, { jobSiteId: input.jobSiteId ?? null }] } : {}),
    },
    select: { id: true, name: true, targetType: true, documentTypeId: true, jobSiteId: true, isRequired: true, updatedAt: true },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
  if (requirements.length) {
    await input.client.operationalRuleSnapshot.createMany({
      data: requirements.map((requirement) => ({
        organizationId: input.organizationId,
        processId: input.processId,
        sourceType: "DOCUMENT_REQUIREMENT",
        sourceId: requirement.id,
        sourceVersion: requirement.updatedAt.toISOString(),
        snapshot: { name: requirement.name, targetType: requirement.targetType, documentTypeId: requirement.documentTypeId, jobSiteId: requirement.jobSiteId, isRequired: requirement.isRequired },
      })),
      skipDuplicates: true,
    });
  }
  return requirements;
}
