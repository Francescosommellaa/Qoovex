export type ClientHomeWorkItemKind =
  | "CHANGE_PROPOSAL_DECISION"
  | "CLOSURE_CONFIRMATION"
  | "DISAGREEMENT_RESPONSE"
  | "INITIAL_AGREEMENT_CONFIRMATION"
  | "PAYMENT_DECLARATION"
  | "POST_CLOSURE_REQUEST_RESPONSE"
  | "REOPENING_CONFIRMATION"
  | "REQUEST_RESPONSE"
  | "STEP_CONFIRMATION";

export type ClientHomeWorkItem = {
  detail: string;
  href: string;
  id: string;
  jobSiteName: string;
  kind: ClientHomeWorkItemKind;
};

export function prioritizeClientHomeJobSites<T extends { status: string }>(jobSites: readonly T[]): T[] {
  return [...jobSites].sort((left, right) => Number(left.status !== "ACTIVE") - Number(right.status !== "ACTIVE"));
}
