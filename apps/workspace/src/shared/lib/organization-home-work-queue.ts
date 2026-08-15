export type OrganizationHomeWorkItemKind =
  | "BLOCKING_REQUEST"
  | "CHANGE_PROPOSAL_REVIEW"
  | "CLIENT_INVITATION_PENDING"
  | "CLOSURE_CLIENT_CONFIRMATION"
  | "CLOSURE_CONFIRMATION"
  | "INITIAL_AGREEMENT_PENDING"
  | "INVITE_PRIMARY_CLIENT"
  | "PAYMENT_DECLARATION_REVIEW"
  | "PREPARE_INITIAL_AGREEMENT"
  | "REQUEST_NEEDS_RESPONSE"
  | "STEP_CHANGES_REQUESTED"
  | "STEP_CLIENT_REVIEW";

export type OrganizationHomeWorkQueueGroup = "ACTION_REQUIRED" | "AWAITING_CLIENT" | "REVIEW";

export const organizationHomeWorkQueueGroups = ["ACTION_REQUIRED", "AWAITING_CLIENT", "REVIEW"] as const satisfies readonly OrganizationHomeWorkQueueGroup[];

const workQueueGroupByKind = {
  BLOCKING_REQUEST: "ACTION_REQUIRED",
  CHANGE_PROPOSAL_REVIEW: "ACTION_REQUIRED",
  CLIENT_INVITATION_PENDING: "AWAITING_CLIENT",
  CLOSURE_CLIENT_CONFIRMATION: "AWAITING_CLIENT",
  CLOSURE_CONFIRMATION: "ACTION_REQUIRED",
  INITIAL_AGREEMENT_PENDING: "AWAITING_CLIENT",
  INVITE_PRIMARY_CLIENT: "ACTION_REQUIRED",
  PAYMENT_DECLARATION_REVIEW: "REVIEW",
  PREPARE_INITIAL_AGREEMENT: "ACTION_REQUIRED",
  REQUEST_NEEDS_RESPONSE: "ACTION_REQUIRED",
  STEP_CHANGES_REQUESTED: "ACTION_REQUIRED",
  STEP_CLIENT_REVIEW: "AWAITING_CLIENT",
} satisfies Record<OrganizationHomeWorkItemKind, OrganizationHomeWorkQueueGroup>;

export function getOrganizationHomeWorkQueueGroup(kind: OrganizationHomeWorkItemKind): OrganizationHomeWorkQueueGroup {
  return workQueueGroupByKind[kind];
}

export type OrganizationHomeWorkItem = {
  detail: string;
  href: string;
  id: string;
  jobSiteName: string;
  kind: OrganizationHomeWorkItemKind;
  priority: "attention" | "blocking" | "default";
};
