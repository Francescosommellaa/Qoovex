import type { OperationalImpact, OperationalReliability } from "@qoovex/types";

export type OperationalExecutionMode = "AUTOMATIC" | "DECISION_REQUIRED" | "FORBIDDEN";

export function getOperationalExecutionMode(input: {
  reliability: OperationalReliability;
  impact: OperationalImpact;
  deterministic: boolean;
  reversible: boolean;
  authorized: boolean;
}): OperationalExecutionMode {
  if (!input.authorized || input.impact === "IRREVERSIBLE") return "FORBIDDEN";
  if (input.impact === "SENSITIVE") return "DECISION_REQUIRED";
  if (!input.deterministic || !input.reversible || input.impact === "CONTROLLED") return "DECISION_REQUIRED";
  if (input.reliability === "VERIFIED" || input.reliability === "HIGH") return "AUTOMATIC";
  return "DECISION_REQUIRED";
}
