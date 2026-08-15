import { resolveCurrentOrganizationRouteParams } from "@shared/server/access-context-service";
import { proposeClosure } from "@shared/server/job-site-collaboration-service";
import { resolveOrganizationJobSiteActor } from "@shared/server/job-site-authorization-service";
import { asJobSiteApiError, requireIdempotencyKey } from "@shared/server/job-site-api-response";

export async function POST(request: Request, { params }: { params: Promise<{ jobSiteId: string }> }) {
  try { const value = await resolveCurrentOrganizationRouteParams(params); const body = await request.json(); const actor = await resolveOrganizationJobSiteActor({ ...value, permission: "jobSite:closure:propose" }); return Response.json(await proposeClosure({ actor, idempotencyKey: requireIdempotencyKey(request), expectedRevision: Number(body.expectedRevision) }), { status: 201 }); } catch (error) { return asJobSiteApiError(error); }
}
