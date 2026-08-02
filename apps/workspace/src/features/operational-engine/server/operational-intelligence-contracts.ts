import type { OperationalArtifactType, OperationalImpact, OperationalReliability, OrganizationPermission } from "@qoovex/types";

export const operationalIntelligenceModes = ["OFF", "SHADOW", "SUGGEST_ONLY", "AUTO_LOW_RISK"] as const;
export type OperationalIntelligenceMode = (typeof operationalIntelligenceModes)[number];

export const operationalProvenanceStates = [
  "OBSERVED",
  "EXTRACTED",
  "INFERRED",
  "USER_CONFIRMED",
  "SYSTEM_CONFIRMED",
  "CONFLICTING",
  "UNKNOWN",
] as const;
export type OperationalProvenanceState = (typeof operationalProvenanceStates)[number];

export type OperationalIntelligenceDisposition = "ACTION" | "ABSTAIN" | "CONFLICT";

export interface TaskConfidenceV1 {
  schemaVersion: 1;
  task: string;
  score: number;
  thresholdVersion: string;
  outcome: "ACCEPTED" | "ABSTAINED" | "CONFLICT";
  reasons: string[];
}

export interface OperationalEvidenceV1 {
  schemaVersion: 1;
  field: string;
  provenance: OperationalProvenanceState;
  sourceArtifactType?: OperationalArtifactType;
  sourceArtifactId?: string;
}

export interface OperationalActionProposalV1 {
  schemaVersion: 1;
  disposition: OperationalIntelligenceDisposition;
  actionKey?: string;
  idempotencyKey?: string;
  input?: Record<string, unknown>;
  confidence: TaskConfidenceV1;
  evidence: OperationalEvidenceV1[];
  explanation: string;
}

export interface RuntimeSchema<T> {
  readonly version: 1;
  readonly name: string;
  parse(value: unknown): T;
}

export interface OperationalActionInputV1 {
  schemaVersion: 1;
  artifactType: OperationalArtifactType;
  artifactId: string;
  reason: string;
}

export interface OperationalActionOutputV1 {
  schemaVersion: 1;
  status: "PLANNED";
  actionKey: string;
  summary: string;
  effects: Array<{ artifactType: OperationalArtifactType; artifactId: string; change: string }>;
}

export interface OperationalActionDefinitionV1 {
  readonly key: string;
  readonly version: 1;
  readonly inputSchema: RuntimeSchema<OperationalActionInputV1>;
  readonly outputSchema: RuntimeSchema<OperationalActionOutputV1>;
  readonly permission: OrganizationPermission;
  readonly resourceScope: readonly OperationalArtifactType[];
  readonly impact: OperationalImpact;
  readonly reversible: boolean;
  readonly deterministic: boolean;
  readonly idempotencyStrategy: string;
  readonly domainService: string;
  readonly receiptType: string;
  readonly operationalEventType: string;
}

export interface OperationalActionAuthorizationContext {
  organizationId: string;
  permissions: readonly OrganizationPermission[];
  scope: {
    mode: "FULL" | "ASSIGNED";
    artifacts?: Partial<Record<OperationalArtifactType, readonly string[]>>;
  };
}

export interface OperationalIntelligenceRuntimeConfig {
  mode: OperationalIntelligenceMode;
  evaluation?: {
    approved: boolean;
    thresholdVersion: string;
    minimumScore: number;
  };
}

export interface OperationalActionDryRunResultV1 {
  schemaVersion: 1;
  mode: OperationalIntelligenceMode;
  state: "OFF" | "SHADOWED" | "SUGGESTED" | "AUTO_DRY_RUN" | "ABSTAINED" | "CONFLICT";
  actionKey?: string;
  executionPolicy?: "AUTOMATIC" | "DECISION_REQUIRED" | "FORBIDDEN";
  output?: OperationalActionOutputV1;
  receiptPreview?: { type: string; effectKey: string };
  eventPreview?: { type: string };
  explanation: string;
}

const artifactTypes = new Set<OperationalArtifactType>([
  "ORGANIZATION", "DOCUMENT", "DOCUMENT_VERSION", "DOCUMENT_REQUIREMENT", "WORKER", "JOB_SITE", "DEADLINE",
  "CHECKLIST", "EVIDENCE", "DOCUMENT_PACKAGE", "SHARE_LINK", "OPERATIONAL_REQUEST", "CONTEXT_MESSAGE", "DOCUMENT_SOURCE",
]);
const provenanceStates = new Set<string>(operationalProvenanceStates);

function object(value: unknown, code: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(code);
  return value as Record<string, unknown>;
}

function exactKeys(value: Record<string, unknown>, allowed: readonly string[], code: string) {
  if (Object.keys(value).some((key) => !allowed.includes(key))) throw new Error(code);
}

function nonEmptyString(value: unknown, code: string) {
  if (typeof value !== "string" || !value.trim()) throw new Error(code);
  return value;
}

export const operationalActionInputSchemaV1: RuntimeSchema<OperationalActionInputV1> = {
  version: 1,
  name: "OperationalActionInput@1",
  parse(value) {
    const input = object(value, "OPERATIONAL_ACTION_INPUT_INVALID");
    exactKeys(input, ["schemaVersion", "artifactType", "artifactId", "reason"], "OPERATIONAL_ACTION_INPUT_INVALID");
    if (input.schemaVersion !== 1 || !artifactTypes.has(input.artifactType as OperationalArtifactType)) throw new Error("OPERATIONAL_ACTION_INPUT_INVALID");
    return { schemaVersion: 1, artifactType: input.artifactType as OperationalArtifactType, artifactId: nonEmptyString(input.artifactId, "OPERATIONAL_ACTION_INPUT_INVALID"), reason: nonEmptyString(input.reason, "OPERATIONAL_ACTION_INPUT_INVALID") };
  },
};

export const operationalActionOutputSchemaV1: RuntimeSchema<OperationalActionOutputV1> = {
  version: 1,
  name: "OperationalActionOutput@1",
  parse(value) {
    const output = object(value, "OPERATIONAL_ACTION_OUTPUT_INVALID");
    exactKeys(output, ["schemaVersion", "status", "actionKey", "summary", "effects"], "OPERATIONAL_ACTION_OUTPUT_INVALID");
    if (output.schemaVersion !== 1 || output.status !== "PLANNED" || !Array.isArray(output.effects)) throw new Error("OPERATIONAL_ACTION_OUTPUT_INVALID");
    const effects = output.effects.map((effect) => {
      const item = object(effect, "OPERATIONAL_ACTION_OUTPUT_INVALID");
      exactKeys(item, ["artifactType", "artifactId", "change"], "OPERATIONAL_ACTION_OUTPUT_INVALID");
      if (!artifactTypes.has(item.artifactType as OperationalArtifactType)) throw new Error("OPERATIONAL_ACTION_OUTPUT_INVALID");
      return { artifactType: item.artifactType as OperationalArtifactType, artifactId: nonEmptyString(item.artifactId, "OPERATIONAL_ACTION_OUTPUT_INVALID"), change: nonEmptyString(item.change, "OPERATIONAL_ACTION_OUTPUT_INVALID") };
    });
    return { schemaVersion: 1, status: "PLANNED", actionKey: nonEmptyString(output.actionKey, "OPERATIONAL_ACTION_OUTPUT_INVALID"), summary: nonEmptyString(output.summary, "OPERATIONAL_ACTION_OUTPUT_INVALID"), effects };
  },
};

export function parseOperationalActionProposalV1(value: unknown): OperationalActionProposalV1 {
  const proposal = object(value, "OPERATIONAL_PROPOSAL_INVALID");
  exactKeys(proposal, ["schemaVersion", "disposition", "actionKey", "idempotencyKey", "input", "confidence", "evidence", "explanation"], "OPERATIONAL_PROPOSAL_INVALID");
  if (proposal.schemaVersion !== 1 || !["ACTION", "ABSTAIN", "CONFLICT"].includes(String(proposal.disposition))) throw new Error("OPERATIONAL_PROPOSAL_INVALID");
  const confidence = object(proposal.confidence, "OPERATIONAL_CONFIDENCE_INVALID");
  exactKeys(confidence, ["schemaVersion", "task", "score", "thresholdVersion", "outcome", "reasons"], "OPERATIONAL_CONFIDENCE_INVALID");
  if (confidence.schemaVersion !== 1 || typeof confidence.score !== "number" || confidence.score < 0 || confidence.score > 1 || !Array.isArray(confidence.reasons)) throw new Error("OPERATIONAL_CONFIDENCE_INVALID");
  if (!["ACCEPTED", "ABSTAINED", "CONFLICT"].includes(String(confidence.outcome))) throw new Error("OPERATIONAL_CONFIDENCE_INVALID");
  const parsedConfidence: TaskConfidenceV1 = { schemaVersion: 1, task: nonEmptyString(confidence.task, "OPERATIONAL_CONFIDENCE_INVALID"), score: confidence.score, thresholdVersion: nonEmptyString(confidence.thresholdVersion, "OPERATIONAL_CONFIDENCE_INVALID"), outcome: confidence.outcome as TaskConfidenceV1["outcome"], reasons: confidence.reasons.map((reason) => nonEmptyString(reason, "OPERATIONAL_CONFIDENCE_INVALID")) };
  if (!Array.isArray(proposal.evidence)) throw new Error("OPERATIONAL_EVIDENCE_INVALID");
  const evidence = proposal.evidence.map((entry): OperationalEvidenceV1 => {
    const item = object(entry, "OPERATIONAL_EVIDENCE_INVALID");
    exactKeys(item, ["schemaVersion", "field", "provenance", "sourceArtifactType", "sourceArtifactId"], "OPERATIONAL_EVIDENCE_INVALID");
    if (item.schemaVersion !== 1 || !provenanceStates.has(String(item.provenance))) throw new Error("OPERATIONAL_EVIDENCE_INVALID");
    if (item.sourceArtifactType !== undefined && !artifactTypes.has(item.sourceArtifactType as OperationalArtifactType)) throw new Error("OPERATIONAL_EVIDENCE_INVALID");
    return { schemaVersion: 1, field: nonEmptyString(item.field, "OPERATIONAL_EVIDENCE_INVALID"), provenance: item.provenance as OperationalProvenanceState, sourceArtifactType: item.sourceArtifactType as OperationalArtifactType | undefined, sourceArtifactId: item.sourceArtifactId === undefined ? undefined : nonEmptyString(item.sourceArtifactId, "OPERATIONAL_EVIDENCE_INVALID") };
  });
  const disposition = proposal.disposition as OperationalIntelligenceDisposition;
  const expectedOutcome = disposition === "ACTION" ? "ACCEPTED" : disposition === "ABSTAIN" ? "ABSTAINED" : "CONFLICT";
  if (parsedConfidence.outcome !== expectedOutcome) throw new Error("OPERATIONAL_DISPOSITION_CONFIDENCE_MISMATCH");
  if (disposition === "ACTION" && (!proposal.actionKey || !proposal.idempotencyKey || !proposal.input)) throw new Error("OPERATIONAL_ACTION_PROPOSAL_INCOMPLETE");
  if (disposition !== "ACTION" && (proposal.actionKey !== undefined || proposal.idempotencyKey !== undefined || proposal.input !== undefined)) throw new Error("OPERATIONAL_NON_ACTION_HAS_COMMAND");
  const actionKey = disposition === "ACTION" ? nonEmptyString(proposal.actionKey, "OPERATIONAL_ACTION_PROPOSAL_INCOMPLETE") : undefined;
  const idempotencyKey = disposition === "ACTION" ? nonEmptyString(proposal.idempotencyKey, "OPERATIONAL_ACTION_PROPOSAL_INCOMPLETE") : undefined;
  const actionInput = disposition === "ACTION" ? object(proposal.input, "OPERATIONAL_ACTION_PROPOSAL_INCOMPLETE") : undefined;
  return { schemaVersion: 1, disposition, actionKey, idempotencyKey, input: actionInput, confidence: parsedConfidence, evidence, explanation: nonEmptyString(proposal.explanation, "OPERATIONAL_PROPOSAL_INVALID") };
}

export function reliabilityFromProposal(proposal: OperationalActionProposalV1): OperationalReliability {
  if (proposal.disposition === "CONFLICT" || proposal.evidence.some((item) => item.provenance === "CONFLICTING")) return "CONFLICT";
  if (proposal.evidence.length && proposal.evidence.every((item) => item.provenance === "SYSTEM_CONFIRMED" || item.provenance === "USER_CONFIRMED")) return "VERIFIED";
  if (proposal.confidence.score >= 0.9) return "HIGH";
  if (proposal.confidence.score >= 0.7) return "MEDIUM";
  return "LOW";
}
