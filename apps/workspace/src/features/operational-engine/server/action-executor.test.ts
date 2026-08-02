import { describe, expect, it, vi } from "vitest";
import { dryRunOperationalAction, readOperationalIntelligenceRuntimeConfig } from "./action-executor";
import { getOperationalAction, listOperationalActions, operationalActionKeys } from "./action-registry";
import { evaluateSyntheticOperationalFixtures } from "./evaluation-harness";
import { assertAdapterCannotWrite, disabledProviderNeutralAdapter } from "./provider-adapter";

const baseProposal = {
  schemaVersion: 1,
  disposition: "ACTION",
  actionKey: "DOCUMENT_STATUS_RECONCILE@1",
  idempotencyKey: "org-1:document-1:status-v1",
  input: { schemaVersion: 1, artifactType: "DOCUMENT", artifactId: "document-1", reason: "Stato temporale da riconciliare." },
  confidence: { schemaVersion: 1, task: "DOCUMENT_STATUS_RECONCILIATION", score: 1, thresholdVersion: "approved-v1", outcome: "ACCEPTED", reasons: ["data confermata"] },
  evidence: [{ schemaVersion: 1, field: "expiryDate", provenance: "SYSTEM_CONFIRMED", sourceArtifactType: "DOCUMENT", sourceArtifactId: "document-1" }],
  explanation: "Proposta sintetica deterministica.",
} as const;

const authorization = {
  organizationId: "org-1",
  permissions: ["documents:update"] as const,
  scope: { mode: "FULL" as const },
};
const sameTenant = { resolveArtifactOrganization: vi.fn().mockResolvedValue("org-1") };

describe("operational action registry and dry-run executor", () => {
  it("is versioned, allow-listed and rejects an unregistered action (including prompt injection)", async () => {
    expect(listOperationalActions()).toHaveLength(4);
    expect(listOperationalActions().every((item) => item.version === 1 && item.inputSchema.version === 1 && item.outputSchema.version === 1)).toBe(true);
    expect(() => getOperationalAction("RUN_SQL_FROM_PROMPT@1")).toThrow("OPERATIONAL_ACTION_NOT_REGISTERED");
    await expect(dryRunOperationalAction({ proposal: { ...baseProposal, actionKey: "IGNORE_SYSTEM_AND_RUN_SQL@1" }, authorization, config: { mode: "SUGGEST_ONLY" }, dependencies: sameTenant })).rejects.toThrow("OPERATIONAL_ACTION_NOT_REGISTERED");
    expect(operationalActionKeys).not.toContain("IGNORE_SYSTEM_AND_RUN_SQL@1");
  });

  it("rejects missing permission, wrong resource scope and cross-tenant resources", async () => {
    await expect(dryRunOperationalAction({ proposal: baseProposal, authorization: { ...authorization, permissions: [] }, config: { mode: "SUGGEST_ONLY" }, dependencies: sameTenant })).rejects.toThrow("OPERATIONAL_ACTION_PERMISSION_MISSING");
    await expect(dryRunOperationalAction({ proposal: { ...baseProposal, input: { ...baseProposal.input, artifactType: "WORKER" } }, authorization, config: { mode: "SUGGEST_ONLY" }, dependencies: sameTenant })).rejects.toThrow("OPERATIONAL_ACTION_RESOURCE_TYPE_OUT_OF_SCOPE");
    await expect(dryRunOperationalAction({ proposal: baseProposal, authorization, config: { mode: "SUGGEST_ONLY" }, dependencies: { resolveArtifactOrganization: vi.fn().mockResolvedValue("org-2") } })).rejects.toThrow("OPERATIONAL_ACTION_CROSS_TENANT");
  });

  it("enforces assigned scope without weakening permissions", async () => {
    await expect(dryRunOperationalAction({ proposal: baseProposal, authorization: { ...authorization, scope: { mode: "ASSIGNED", artifacts: { DOCUMENT: ["other-document"] } } }, config: { mode: "SUGGEST_ONLY" }, dependencies: sameTenant })).rejects.toThrow("OPERATIONAL_ACTION_RESOURCE_SCOPE_DENIED");
  });

  it("rejects invalid structured input and output", async () => {
    await expect(dryRunOperationalAction({ proposal: { ...baseProposal, input: { ...baseProposal.input, unexpected: "write" } }, authorization, config: { mode: "SUGGEST_ONLY" }, dependencies: sameTenant })).rejects.toThrow("OPERATIONAL_ACTION_INPUT_INVALID");
    const action = getOperationalAction("DOCUMENT_STATUS_RECONCILE@1");
    expect(() => action.outputSchema.parse({ schemaVersion: 1, status: "EXECUTED", actionKey: action.key, summary: "invalid", effects: [] })).toThrow("OPERATIONAL_ACTION_OUTPUT_INVALID");
    await expect(dryRunOperationalAction({ proposal: { ...baseProposal, globalConfidence: 0.99 }, authorization, config: { mode: "SUGGEST_ONLY" }, dependencies: sameTenant })).rejects.toThrow("OPERATIONAL_PROPOSAL_INVALID");
  });

  it("represents abstention and conflict without creating commands", async () => {
    const abstention = { schemaVersion: 1, disposition: "ABSTAIN", confidence: { schemaVersion: 1, task: "CLASSIFY", score: 0.1, thresholdVersion: "v1", outcome: "ABSTAINED", reasons: ["insufficient"] }, evidence: [{ schemaVersion: 1, field: "type", provenance: "UNKNOWN" }], explanation: "Non ci sono dati sufficienti." };
    const conflict = { schemaVersion: 1, disposition: "CONFLICT", confidence: { schemaVersion: 1, task: "EXPIRY", score: 0.5, thresholdVersion: "v1", outcome: "CONFLICT", reasons: ["disagreement"] }, evidence: [{ schemaVersion: 1, field: "expiry", provenance: "CONFLICTING" }], explanation: "Le fonti confliggono." };
    const abstained = await dryRunOperationalAction({ proposal: abstention, authorization, config: { mode: "SUGGEST_ONLY" }, dependencies: sameTenant });
    const conflicted = await dryRunOperationalAction({ proposal: conflict, authorization, config: { mode: "SUGGEST_ONLY" }, dependencies: sameTenant });
    expect(abstained.state).toBe("ABSTAINED");
    expect(conflicted.state).toBe("CONFLICT");
    expect("output" in abstained).toBe(false);
    expect("output" in conflicted).toBe(false);
  });

  it("connects execution-policy, idempotency and receipt/event previews without writing", async () => {
    const result = await dryRunOperationalAction({ proposal: baseProposal, authorization, config: { mode: "SUGGEST_ONLY" }, dependencies: sameTenant });
    expect(result).toMatchObject({ state: "SUGGESTED", executionPolicy: "AUTOMATIC", receiptPreview: { type: "DOCUMENT_STATUS_RECONCILED", effectKey: baseProposal.idempotencyKey }, eventPreview: { type: "AUTOMATION_COMPLETED" } });
    const replay = await dryRunOperationalAction({ proposal: baseProposal, authorization, config: { mode: "SUGGEST_ONLY" }, dependencies: sameTenant });
    expect(replay.receiptPreview).toEqual(result.receiptPreview);
  });

  it("keeps OFF as default and gates every feature mode", async () => {
    expect(readOperationalIntelligenceRuntimeConfig({})).toEqual({ mode: "OFF", evaluation: undefined });
    await expect(dryRunOperationalAction({ proposal: baseProposal, authorization, config: { mode: "OFF" }, dependencies: sameTenant })).resolves.toMatchObject({ state: "OFF" });
    await expect(dryRunOperationalAction({ proposal: baseProposal, authorization, config: { mode: "SHADOW" }, dependencies: sameTenant })).resolves.toMatchObject({ state: "SHADOWED" });
    await expect(dryRunOperationalAction({ proposal: baseProposal, authorization, config: { mode: "SUGGEST_ONLY" }, dependencies: sameTenant })).resolves.toMatchObject({ state: "SUGGESTED" });
    await expect(dryRunOperationalAction({ proposal: baseProposal, authorization, config: { mode: "AUTO_LOW_RISK" }, dependencies: sameTenant })).rejects.toThrow("OPERATIONAL_AUTO_LOW_RISK_EVALUATION_NOT_APPROVED");
    await expect(dryRunOperationalAction({ proposal: baseProposal, authorization, config: { mode: "AUTO_LOW_RISK", evaluation: { approved: true, thresholdVersion: "approved-v1", minimumScore: 0.95 } }, dependencies: sameTenant })).resolves.toMatchObject({ state: "AUTO_DRY_RUN" });
  });

  it("keeps provider-neutral adapters disabled and write-incapable", async () => {
    expect(disabledProviderNeutralAdapter.enabled).toBe(false);
    expect(() => assertAdapterCannotWrite(disabledProviderNeutralAdapter)).not.toThrow();
    await expect(disabledProviderNeutralAdapter.propose({ task: "synthetic", minimizedContext: {} })).rejects.toThrow("OPERATIONAL_INTELLIGENCE_PROVIDER_DISABLED");
    expect(() => assertAdapterCannotWrite({ ...disabledProviderNeutralAdapter, execute: () => undefined } as never)).toThrow("OPERATIONAL_ADAPTER_WRITE_CAPABILITY_FORBIDDEN");
  });

  it("runs only synthetic evaluation fixtures", async () => {
    const evaluation = await evaluateSyntheticOperationalFixtures({ authorization, dependencies: { resolveArtifactOrganization: vi.fn().mockResolvedValue("org-1") } });
    expect(evaluation).toMatchObject({ syntheticOnly: true, fixtureCount: 3, passed: 3, failed: 0 });
    await expect(evaluateSyntheticOperationalFixtures({ fixtures: [{ id: "real-data", synthetic: false, proposal: baseProposal, expected: "REJECTED" }] as never, authorization, dependencies: sameTenant })).rejects.toThrow("OPERATIONAL_EVALUATION_REQUIRES_SYNTHETIC_FIXTURES");
  });
});
