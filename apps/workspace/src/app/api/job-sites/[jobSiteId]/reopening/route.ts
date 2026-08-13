import { resolveCurrentOrganizationRouteParams } from "@shared/server/access-context-service";
import { proposeReopening } from "@shared/server/job-site-collaboration-service";
import { resolveOrganizationJobSiteActor } from "@shared/server/job-site-authorization-service";
import { asJobSiteApiError, requireIdempotencyKey } from "@shared/server/job-site-api-response";
export async function POST(request: Request, { params }: { params: Promise<{ jobSiteId: string }> }) { try { const value = await resolveCurrentOrganizationRouteParams(params); const actor = await resolveOrganizationJobSiteActor({ ...value, permission: "jobSite:closure:propose" }); return Response.json(await proposeReopening({ actor, idempotencyKey: requireIdempotencyKey(request), body: await request.json() }), { status: 201 }); } catch (error) { return asJobSiteApiError(error); } }
