import { resolveCurrentOrganizationRouteParams } from "@shared/server/access-context-service";
import { publishInitialAgreementIdempotent } from "@shared/server/job-site-lifecycle-service";
import { resolveOrganizationJobSiteActor } from "@shared/server/job-site-authorization-service";
import { asJobSiteApiError, requireIdempotencyKey } from "@shared/server/job-site-api-response";

export async function POST(request: Request, { params }: { params: Promise<{ jobSiteId: string }> }) {
  try { const value = await resolveCurrentOrganizationRouteParams(params); const actor = await resolveOrganizationJobSiteActor({ ...value, permission: "jobSite:update" }); return Response.json(await publishInitialAgreementIdempotent({ actor, idempotencyKey: requireIdempotencyKey(request), rawInput: await request.json() }), { status: 201 }); } catch (error) { return asJobSiteApiError(error); }
}
