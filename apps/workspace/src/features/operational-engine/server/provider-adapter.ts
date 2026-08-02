import type { OperationalActionProposalV1 } from "./operational-intelligence-contracts";

export interface OperationalIntelligenceAdapter {
  readonly id: string;
  readonly enabled: false;
  propose(input: { task: string; minimizedContext: Record<string, unknown> }): Promise<OperationalActionProposalV1>;
}

export const disabledProviderNeutralAdapter: OperationalIntelligenceAdapter = {
  id: "provider-neutral-disabled@1",
  enabled: false,
  async propose() {
    throw new Error("OPERATIONAL_INTELLIGENCE_PROVIDER_DISABLED");
  },
};

// Deliberately no execute/write method: adapters can only propose structured data.
export function assertAdapterCannotWrite(adapter: OperationalIntelligenceAdapter) {
  if ("execute" in adapter || "write" in adapter || "mutate" in adapter) throw new Error("OPERATIONAL_ADAPTER_WRITE_CAPABILITY_FORBIDDEN");
}
