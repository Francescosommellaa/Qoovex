import { invitePrimaryClientIdempotent, revokePrimaryClientInvitation } from "@shared/server/job-site-lifecycle-service";
import { resolveOrganizationJobSiteActor } from "@shared/server/job-site-authorization-service";
import { asJobSiteApiError, requireIdempotencyKey } from "@shared/server/job-site-api-response";

export async function POST(request: Request, { params }: { params: Promise<{ organizationId: string; jobSiteId: string }> }) {
  try { const value = await params; const actor = await resolveOrganizationJobSiteActor({ ...value, permission: "jobSite:participants:manage" }); return Response.json(await invitePrimaryClientIdempotent({ actor, idempotencyKey: requireIdempotencyKey(request), rawInput: await request.json() }), { status: 201 }); } catch (error) { return asJobSiteApiError(error); }
}
export async function DELETE(request: Request, { params }: { params: Promise<{ organizationId: string; jobSiteId: string }> }) {
  try { const value = await params; const actor = await resolveOrganizationJobSiteActor({ ...value, permission: "jobSite:participants:manage" }); return Response.json(await revokePrimaryClientInvitation({ actor, idempotencyKey: requireIdempotencyKey(request), rawInput: await request.json() })); } catch (error) { return asJobSiteApiError(error); }
}
