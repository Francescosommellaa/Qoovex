import { resolveCurrentOrganizationRouteParams } from "@shared/server/access-context-service";
import { grantEconomicAuthority, revokeEconomicAuthority } from "@shared/server/job-site-collaboration-service";
import { resolveOrganizationJobSiteActor } from "@shared/server/job-site-authorization-service";
import { asJobSiteApiError, requireIdempotencyKey } from "@shared/server/job-site-api-response";

export async function POST(request: Request, { params }: { params: Promise<{ jobSiteId: string }> }) {
  try { const value = await resolveCurrentOrganizationRouteParams(params); const actor = await resolveOrganizationJobSiteActor({ ...value, permission: "jobSite:commercial:grant" }); return Response.json(await grantEconomicAuthority({ actor, idempotencyKey: requireIdempotencyKey(request), rawInput: await request.json() }), { status: 201 }); } catch (error) { return asJobSiteApiError(error); }
}
export async function DELETE(request: Request, { params }: { params: Promise<{ jobSiteId: string }> }) {
  try { const value = await resolveCurrentOrganizationRouteParams(params); const actor = await resolveOrganizationJobSiteActor({ ...value, permission: "jobSite:commercial:grant" }); return Response.json(await revokeEconomicAuthority({ actor, idempotencyKey: requireIdempotencyKey(request), rawInput: await request.json() })); } catch (error) { return asJobSiteApiError(error); }
}
