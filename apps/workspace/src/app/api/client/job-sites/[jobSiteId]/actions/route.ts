import { executeVNextAction } from "@shared/server/vnext-action-service";
import { resolveClientInitialAgreementActor, resolveClientJobSiteActor } from "@shared/server/vnext-authorization-service";
import { asVNextApiError, requireIdempotencyKey } from "@shared/server/vnext-api-response";
export async function POST(request: Request, { params }: { params: Promise<{ jobSiteId: string }> }) {
  try {
    const jobSiteId = (await params).jobSiteId;
    const action = await request.json();
    const initialAgreementConfirmation = action && typeof action === "object" && !Array.isArray(action) && "action" in action && action.action === "INITIAL_AGREEMENT_CONFIRM@1";
    const actor = initialAgreementConfirmation
      ? await resolveClientInitialAgreementActor(jobSiteId)
      : await resolveClientJobSiteActor(jobSiteId);
    return Response.json(await executeVNextAction({ actor, idempotencyKey: requireIdempotencyKey(request), action }));
  } catch (error) {
    return asVNextApiError(error);
  }
}
