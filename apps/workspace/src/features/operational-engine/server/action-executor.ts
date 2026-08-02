import { getOperationalAction } from "./action-registry";
import { getOperationalExecutionMode } from "./execution-policy";
import type { OperationalActionAuthorizationContext, OperationalActionDryRunResultV1, OperationalActionProposalV1, OperationalIntelligenceRuntimeConfig } from "./operational-intelligence-contracts";
import { parseOperationalActionProposalV1, reliabilityFromProposal } from "./operational-intelligence-contracts";

export interface OperationalActionDryRunDependencies {
  resolveArtifactOrganization(input: { artifactType: string; artifactId: string }): Promise<string | null>;
}

export function readOperationalIntelligenceRuntimeConfig(environment: Record<string, string | undefined> = process.env): OperationalIntelligenceRuntimeConfig {
  const requested = environment.QOOVEX_OPERATIONAL_INTELLIGENCE_MODE;
  const mode = requested === "SHADOW" || requested === "SUGGEST_ONLY" || requested === "AUTO_LOW_RISK" ? requested : "OFF";
  const minimumScore = Number(environment.QOOVEX_OPERATIONAL_INTELLIGENCE_EVALUATION_MINIMUM_SCORE);
  const evaluation = environment.QOOVEX_OPERATIONAL_INTELLIGENCE_EVALUATION_APPROVED === "1" && Number.isFinite(minimumScore)
    ? { approved: true, thresholdVersion: environment.QOOVEX_OPERATIONAL_INTELLIGENCE_EVALUATION_THRESHOLD_VERSION ?? "", minimumScore }
    : undefined;
  return { mode, evaluation };
}

function assertAutoModeApproved(config: OperationalIntelligenceRuntimeConfig) {
  if (config.mode !== "AUTO_LOW_RISK") return;
  if (!config.evaluation?.approved || !config.evaluation.thresholdVersion || config.evaluation.minimumScore < 0 || config.evaluation.minimumScore > 1) {
    throw new Error("OPERATIONAL_AUTO_LOW_RISK_EVALUATION_NOT_APPROVED");
  }
}

export async function dryRunOperationalAction(input: {
  proposal: unknown;
  authorization: OperationalActionAuthorizationContext;
  config: OperationalIntelligenceRuntimeConfig;
  dependencies: OperationalActionDryRunDependencies;
}): Promise<OperationalActionDryRunResultV1> {
  assertAutoModeApproved(input.config);
  if (input.config.mode === "OFF") return { schemaVersion: 1, mode: "OFF", state: "OFF", explanation: "Operational Intelligence è disattivata lato server." };

  const proposal = parseOperationalActionProposalV1(input.proposal);
  if (proposal.disposition === "ABSTAIN") return { schemaVersion: 1, mode: input.config.mode, state: "ABSTAINED", explanation: proposal.explanation };
  if (proposal.disposition === "CONFLICT") return { schemaVersion: 1, mode: input.config.mode, state: "CONFLICT", explanation: proposal.explanation };

  const typedProposal = proposal as OperationalActionProposalV1 & { actionKey: string; idempotencyKey: string; input: Record<string, unknown> };
  const action = getOperationalAction(typedProposal.actionKey);
  const actionInput = action.inputSchema.parse(typedProposal.input);
  if (!action.resourceScope.includes(actionInput.artifactType)) throw new Error("OPERATIONAL_ACTION_RESOURCE_TYPE_OUT_OF_SCOPE");
  if (!input.authorization.permissions.includes(action.permission)) throw new Error(`OPERATIONAL_ACTION_PERMISSION_MISSING:${action.permission}`);
  const resourceOrganizationId = await input.dependencies.resolveArtifactOrganization({ artifactType: actionInput.artifactType, artifactId: actionInput.artifactId });
  if (!resourceOrganizationId || resourceOrganizationId !== input.authorization.organizationId) throw new Error("OPERATIONAL_ACTION_CROSS_TENANT");
  if (input.authorization.scope.mode !== "FULL" && !input.authorization.scope.artifacts?.[actionInput.artifactType]?.includes(actionInput.artifactId)) throw new Error("OPERATIONAL_ACTION_RESOURCE_SCOPE_DENIED");

  const executionPolicy = getOperationalExecutionMode({ reliability: reliabilityFromProposal(proposal), impact: action.impact, deterministic: action.deterministic, reversible: action.reversible, authorized: true });
  if (executionPolicy === "FORBIDDEN") throw new Error("OPERATIONAL_ACTION_FORBIDDEN_BY_POLICY");
  if (input.config.mode === "AUTO_LOW_RISK") {
    if (executionPolicy !== "AUTOMATIC" || action.impact !== "LOW" || proposal.confidence.score < input.config.evaluation!.minimumScore || proposal.confidence.thresholdVersion !== input.config.evaluation!.thresholdVersion) {
      throw new Error("OPERATIONAL_ACTION_AUTO_THRESHOLD_NOT_MET");
    }
  }

  const output = action.outputSchema.parse({ schemaVersion: 1, status: "PLANNED", actionKey: action.key, summary: `Dry-run: ${action.domainService}`, effects: [{ artifactType: actionInput.artifactType, artifactId: actionInput.artifactId, change: actionInput.reason }] });
  const state = input.config.mode === "SHADOW" ? "SHADOWED" : input.config.mode === "SUGGEST_ONLY" ? "SUGGESTED" : "AUTO_DRY_RUN";
  return { schemaVersion: 1, mode: input.config.mode, state, actionKey: action.key, executionPolicy, output, receiptPreview: { type: action.receiptType, effectKey: typedProposal.idempotencyKey }, eventPreview: { type: action.operationalEventType }, explanation: proposal.explanation };
}
