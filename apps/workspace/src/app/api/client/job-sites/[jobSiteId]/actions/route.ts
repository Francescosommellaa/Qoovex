import { executeJobSiteAction } from "@shared/server/job-site-action-service";
import { resolveClientInitialAgreementActor, resolveClientJobSiteActor } from "@shared/server/job-site-authorization-service";
import { asJobSiteApiError, requireIdempotencyKey } from "@shared/server/job-site-api-response";
export async function POST(request: Request, { params }: { params: Promise<{ jobSiteId: string }> }) {
  try {
    const jobSiteId = (await params).jobSiteId;
    const action = await request.json();
    const initialAgreementConfirmation = action && typeof action === "object" && !Array.isArray(action) && "action" in action && action.action === "INITIAL_AGREEMENT_CONFIRM@1";
    const actor = initialAgreementConfirmation
      ? await resolveClientInitialAgreementActor(jobSiteId)
      : await resolveClientJobSiteActor(jobSiteId);
    return Response.json(await executeJobSiteAction({ actor, idempotencyKey: requireIdempotencyKey(request), action }));
  } catch (error) {
    return asJobSiteApiError(error);
  }
}
