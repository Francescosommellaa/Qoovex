import { executeJobSiteAction } from "@shared/server/job-site-action-service";
import { resolveOrganizationJobSiteActor } from "@shared/server/job-site-authorization-service";
import { asJobSiteApiError, requireIdempotencyKey } from "@shared/server/job-site-api-response";

export async function POST(request: Request, { params }: { params: Promise<{ organizationId: string; jobSiteId: string }> }) {
  try {
    const value = await params;
    const action = await request.json() as { action?: string };
    const permission = action.action === "JOB_SITE_CLOSE@1" ? "jobSite:closure:confirm"
      : action.action === "JOB_SITE_ARCHIVE@1" ? "jobSite:archive"
      : action.action === "JOB_SITE_EXPORT_CREATE@1" ? "jobSite:export"
      : action.action === "PAYMENT_REQUEST_CREATE@1" || action.action === "PAYMENT_RECEIPT_CONFIRM@1" ? "jobSite:payments:request"
      : action.action === "CHANGE_PROPOSAL_APPLY@1" ? "jobSite:commercial:accept"
      : action.action === "STEP_STATUS_TRANSITION@1" ? "jobSite:steps:updateStatus"
      : "jobSite:update";
    const actor = await resolveOrganizationJobSiteActor({ organizationId: value.organizationId, jobSiteId: value.jobSiteId, permission });
    return Response.json(await executeJobSiteAction({ actor, idempotencyKey: requireIdempotencyKey(request), action }));
  } catch (error) { return asJobSiteApiError(error); }
}
