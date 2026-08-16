import type { NotificationSourceType } from "@qoovex/types";

export type JobSiteNotificationRecipientKind = "CLIENT" | "ORGANIZATION_MEMBER";

export type JobSiteNotificationTargetKind =
  | "attachment"
  | "disagreement"
  | "payment"
  | "proposal"
  | "request"
  | "step"
  | "timeline-event";

type MutationResult = Record<string, unknown>;

const resultIdKeys = {
  ATTACHMENT: "attachmentId",
  CHANGE_PROPOSAL: "proposalId",
  DISPUTE: "disputeId",
  JOB_SITE_REQUEST: "requestId",
  PAYMENT: "paymentRequestId",
  STEP: "stepId",
  TIMELINE: "eventId",
} as const;

export function jobSiteNotificationTargetId(kind: JobSiteNotificationTargetKind, sourceId: string) {
  let forward = 2_166_136_261;
  let reverse = 2_166_136_261;
  for (let index = 0; index < sourceId.length; index += 1) {
    forward = Math.imul(forward ^ sourceId.charCodeAt(index), 16_777_619);
    reverse = Math.imul(reverse ^ sourceId.charCodeAt(sourceId.length - index - 1), 16_777_619);
  }
  return `${kind}-${(forward >>> 0).toString(36)}${(reverse >>> 0).toString(36)}`;
}

export function notificationSourceIdFromResult(action: string, result: MutationResult): string | null {
  const directId = result.id;
  if (typeof directId === "string") return directId;

  const key = Object.entries(resultIdKeys).find(([actionPart]) => action.includes(actionPart))?.[1];
  const value = key ? result[key] : null;
  return typeof value === "string" ? value : null;
}

function notificationTarget(action: string, recipientKind: JobSiteNotificationRecipientKind, result?: MutationResult): { fragment: string; kind?: JobSiteNotificationTargetKind } {
  const sourceId = result ? notificationSourceIdFromResult(action, result) : null;

  if (action.includes("INITIAL_AGREEMENT")) return { fragment: recipientKind === "CLIENT" ? "initial-agreement-review" : "riepilogo" };
  if (action.includes("JOB_SITE_REQUEST")) return sourceId ? { fragment: jobSiteNotificationTargetId("request", sourceId), kind: "request" } : { fragment: "richieste" };
  if (action.includes("CHANGE_PROPOSAL") || action.includes("PROPOSAL")) return sourceId ? { fragment: jobSiteNotificationTargetId("proposal", sourceId), kind: "proposal" } : { fragment: "modifiche" };
  if (action.includes("PAYMENT")) return sourceId ? { fragment: jobSiteNotificationTargetId("payment", sourceId), kind: "payment" } : { fragment: "pagamenti" };
  if (action.includes("DISPUTE")) return sourceId ? { fragment: jobSiteNotificationTargetId("disagreement", sourceId), kind: "disagreement" } : { fragment: "disaccordi" };
  if (action.includes("ATTACHMENT")) return sourceId ? { fragment: jobSiteNotificationTargetId("attachment", sourceId), kind: "attachment" } : { fragment: "file" };
  if (action.includes("STEP")) return { fragment: "step" };
  if (action.includes("TIMELINE")) return sourceId ? { fragment: jobSiteNotificationTargetId("timeline-event", sourceId), kind: "timeline-event" } : { fragment: "timeline" };
  if (action.includes("POST_CLOSURE") || action.includes("REOPENING") || action.includes("ARCHIVE")) return { fragment: "archivio" };
  if (action.includes("JOB_SITE_REOPEN")) return result?.status === "FINALIZED" ? { fragment: "riepilogo" } : { fragment: "archivio" };
  if (action.includes("JOB_SITE_CLOSE") && result?.status === "REJECTED") return { fragment: "riepilogo" };
  if (action.includes("CLOSURE") || action.includes("JOB_SITE_CLOSE")) return result?.status === "FINALIZED" ? { fragment: "archivio" } : { fragment: "chiusura" };
  if (action.includes("EXPORT")) return { fragment: "archivio" };
  if (action.includes("AUTHORITY")) return { fragment: recipientKind === "CLIENT" ? "riepilogo" : "impostazioni" };
  if (action.includes("RESPONSIBLE") || action.includes("PARTICIPATION")) return { fragment: "persone" };
  return { fragment: "timeline" };
}

export function buildJobSiteNotificationHref(input: {
  action: string;
  jobSiteId: string;
  recipientKind: JobSiteNotificationRecipientKind;
  result?: MutationResult;
  digest?: boolean;
}) {
  const base = input.recipientKind === "CLIENT" ? `/client/job-sites/${input.jobSiteId}` : `/job-sites/${input.jobSiteId}`;
  const target = notificationTarget(input.action, input.recipientKind, input.digest ? undefined : input.result);
  const clientFragment = input.recipientKind === "CLIENT" && target.fragment === "file" ? "documenti" : target.fragment;
  return `${base}#${clientFragment}`;
}

export const jobSiteNotificationTargetFallbacks: Readonly<Record<JobSiteNotificationTargetKind, string>> = {
  attachment: "file",
  disagreement: "disaccordi",
  payment: "pagamenti",
  proposal: "modifiche",
  request: "richieste",
  step: "step",
  "timeline-event": "timeline",
};

export function presentNotificationActionLabel(sourceType: NotificationSourceType, actionHref?: string | null) {
  const fragment = actionHref?.split("#", 2)[1];
  if (fragment === "initial-agreement-review" || fragment === "riepilogo") return "Apri riepilogo";
  if (fragment === "chiusura") return "Apri chiusura";
  if (fragment === "archivio") return "Apri archivio";
  if (fragment === "step") return "Apri step";
  if (fragment === "file" || fragment === "documenti" || fragment?.startsWith("attachment-")) return "Apri file";
  if (fragment === "richieste" || fragment?.startsWith("request-")) return "Apri richiesta";
  switch (sourceType) {
    case "CHANGE_PROPOSAL": return "Apri proposta";
    case "PAYMENT_REQUEST": return "Apri pagamento";
    case "DISPUTE": return "Apri disaccordo";
    case "EXPORT": return "Apri esportazione";
    case "SYSTEM": return "Apri impostazioni";
    case "JOB_SITE": return "Apri aggiornamento";
  }
}
