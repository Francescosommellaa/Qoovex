import { describe, expect, it } from "vitest";
import { buildJobSiteNotificationHref, jobSiteNotificationTargetId, notificationSourceIdFromResult, presentNotificationActionLabel } from "./job-site-notification-destination";

describe("job-site notification destinations", () => {
  it.each([
    ["JOB_SITE_REQUEST_CREATE@1", { requestId: "request-1" }, `/job-sites/site-1#${jobSiteNotificationTargetId("request", "request-1")}`],
    ["CHANGE_PROPOSAL_COUNTER@1", { proposalId: "proposal-1" }, `/job-sites/site-1#${jobSiteNotificationTargetId("proposal", "proposal-1")}`],
    ["PAYMENT_TRANSFER_DECLARE@1", { paymentRequestId: "payment-1" }, `/job-sites/site-1#${jobSiteNotificationTargetId("payment", "payment-1")}`],
    ["DISPUTE_RESPOND@1", { disputeId: "dispute-1" }, `/job-sites/site-1#${jobSiteNotificationTargetId("disagreement", "dispute-1")}`],
    ["STEP_STATUS_TRANSITION@1", { stepId: "step-1" }, "/job-sites/site-1#step"],
    ["TIMELINE_APPEND@1", { eventId: "event-1" }, `/job-sites/site-1#${jobSiteNotificationTargetId("timeline-event", "event-1")}`],
    ["ATTACHMENT_UPLOAD@1", { attachmentId: "attachment-1" }, `/job-sites/site-1#${jobSiteNotificationTargetId("attachment", "attachment-1")}`],
    ["INITIAL_AGREEMENT_CONFIRM@1", { agreementVersionId: "agreement-1" }, "/job-sites/site-1#riepilogo"],
    ["CLOSURE_PROPOSE@1", { closureId: "closure-1" }, "/job-sites/site-1#chiusura"],
    ["JOB_SITE_CLOSE@1", { closureId: "closure-1", status: "FINALIZED" }, "/job-sites/site-1#archivio"],
    ["JOB_SITE_CLOSE@1", { closureId: "closure-1", status: "REJECTED" }, "/job-sites/site-1#riepilogo"],
    ["POST_CLOSURE_REQUEST_CREATE@1", { postClosureRequestId: "post-1" }, "/job-sites/site-1#archivio"],
    ["REOPENING_PROPOSE@1", { reopeningProposalId: "reopening-1" }, "/job-sites/site-1#archivio"],
    ["JOB_SITE_REOPEN@1", { reopeningProposalId: "reopening-1", status: "FINALIZED" }, "/job-sites/site-1#riepilogo"],
    ["AUTHORITY_GRANT@1", { grantIds: ["grant-1"] }, "/job-sites/site-1#impostazioni"],
    ["JOB_SITE_RESPONSIBLE_CHANGE@1", { participantId: "participant-1" }, "/job-sites/site-1#persone"],
  ])("maps %s to its real context", (action, result, expected) => {
    expect(buildJobSiteNotificationHref({ action, jobSiteId: "site-1", recipientKind: "ORGANIZATION_MEMBER", result })).toBe(expected);
  });

  it("uses the client route and the client document section", () => {
    expect(buildJobSiteNotificationHref({ action: "ATTACHMENT_UPLOAD@1", jobSiteId: "site-1", recipientKind: "CLIENT", result: {} })).toBe("/client/job-sites/site-1#documenti");
  });

  it("takes the client to the exact initial agreement review", () => {
    expect(buildJobSiteNotificationHref({ action: "INITIAL_AGREEMENT_PUBLISH@1", jobSiteId: "site-1", recipientKind: "CLIENT", result: { agreementVersionId: "agreement-1" } })).toBe("/client/job-sites/site-1#initial-agreement-review");
  });

  it("keeps an aggregated digest at the relevant section rather than an arbitrary item", () => {
    expect(buildJobSiteNotificationHref({ action: "PAYMENT_TRANSFER_DECLARE@1", digest: true, jobSiteId: "site-1", recipientKind: "CLIENT", result: { paymentRequestId: "payment-1" } })).toBe("/client/job-sites/site-1#pagamenti");
  });

  it("extracts named domain identifiers without exposing result property names", () => {
    expect(notificationSourceIdFromResult("CHANGE_PROPOSAL_CREATE@1", { proposalId: "proposal-1" })).toBe("proposal-1");
    expect(notificationSourceIdFromResult("PAYMENT_REQUEST_CREATE@1", { paymentRequestId: "payment-1" })).toBe("payment-1");
  });

  it("uses contextual, human action labels", () => {
    expect(presentNotificationActionLabel("CHANGE_PROPOSAL")).toBe("Apri proposta");
    expect(presentNotificationActionLabel("PAYMENT_REQUEST")).toBe("Apri pagamento");
    expect(presentNotificationActionLabel("JOB_SITE")).toBe("Apri aggiornamento");
    expect(presentNotificationActionLabel("JOB_SITE", "/client/job-sites/site-1#initial-agreement-review")).toBe("Apri riepilogo");
    expect(presentNotificationActionLabel("JOB_SITE", `/job-sites/site-1#${jobSiteNotificationTargetId("request", "request-1")}`)).toBe("Apri richiesta");
  });
});
