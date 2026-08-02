import { dryRunOperationalAction, type OperationalActionDryRunDependencies } from "./action-executor";
import type { OperationalActionAuthorizationContext, OperationalActionProposalV1, OperationalIntelligenceRuntimeConfig } from "./operational-intelligence-contracts";

export interface SyntheticOperationalEvaluationFixture {
  id: string;
  synthetic: true;
  proposal: OperationalActionProposalV1;
  expected: "SUGGESTED" | "ABSTAINED" | "CONFLICT" | "REJECTED";
}

export const syntheticOperationalEvaluationFixtures: readonly SyntheticOperationalEvaluationFixture[] = [
  {
    id: "synthetic-document-status-confirmed",
    synthetic: true,
    expected: "SUGGESTED",
    proposal: { schemaVersion: 1, disposition: "ACTION", actionKey: "DOCUMENT_STATUS_RECONCILE@1", idempotencyKey: "synthetic:document-1:status", input: { schemaVersion: 1, artifactType: "DOCUMENT", artifactId: "synthetic-document-1", reason: "Stato temporale derivato da una data sintetica." }, confidence: { schemaVersion: 1, task: "DOCUMENT_STATUS_RECONCILIATION", score: 1, thresholdVersion: "synthetic-v1", outcome: "ACCEPTED", reasons: ["fixture deterministica"] }, evidence: [{ schemaVersion: 1, field: "expiryDate", provenance: "SYSTEM_CONFIRMED", sourceArtifactType: "DOCUMENT", sourceArtifactId: "synthetic-document-1" }], explanation: "Fixture sintetica positiva." },
  },
  {
    id: "synthetic-ambiguous",
    synthetic: true,
    expected: "ABSTAINED",
    proposal: { schemaVersion: 1, disposition: "ABSTAIN", confidence: { schemaVersion: 1, task: "DOCUMENT_CLASSIFICATION", score: 0.2, thresholdVersion: "synthetic-v1", outcome: "ABSTAINED", reasons: ["dati insufficienti"] }, evidence: [{ schemaVersion: 1, field: "documentType", provenance: "UNKNOWN" }], explanation: "Informazioni sintetiche insufficienti." },
  },
  {
    id: "synthetic-conflict",
    synthetic: true,
    expected: "CONFLICT",
    proposal: { schemaVersion: 1, disposition: "CONFLICT", confidence: { schemaVersion: 1, task: "DOCUMENT_EXPIRY_EXTRACTION", score: 0.5, thresholdVersion: "synthetic-v1", outcome: "CONFLICT", reasons: ["due date discordanti"] }, evidence: [{ schemaVersion: 1, field: "expiryDate", provenance: "CONFLICTING" }], explanation: "Le sole fonti sintetiche sono discordanti." },
  },
] as const;

export async function evaluateSyntheticOperationalFixtures(input: {
  fixtures?: readonly SyntheticOperationalEvaluationFixture[];
  authorization: OperationalActionAuthorizationContext;
  config?: OperationalIntelligenceRuntimeConfig;
  dependencies: OperationalActionDryRunDependencies;
}) {
  const fixtures = input.fixtures ?? syntheticOperationalEvaluationFixtures;
  const config = input.config ?? { mode: "SUGGEST_ONLY" as const };
  const results = [];
  for (const fixture of fixtures) {
    if (!fixture.synthetic) throw new Error("OPERATIONAL_EVALUATION_REQUIRES_SYNTHETIC_FIXTURES");
    try {
      const result = await dryRunOperationalAction({ proposal: fixture.proposal, authorization: input.authorization, config, dependencies: input.dependencies });
      const actual = result.state === "SUGGESTED" ? "SUGGESTED" : result.state === "ABSTAINED" ? "ABSTAINED" : result.state === "CONFLICT" ? "CONFLICT" : "REJECTED";
      results.push({ id: fixture.id, expected: fixture.expected, actual, passed: actual === fixture.expected });
    } catch {
      results.push({ id: fixture.id, expected: fixture.expected, actual: "REJECTED" as const, passed: fixture.expected === "REJECTED" });
    }
  }
  return { schemaVersion: 1 as const, syntheticOnly: true as const, fixtureCount: results.length, passed: results.filter((item) => item.passed).length, failed: results.filter((item) => !item.passed).length, results };
}
