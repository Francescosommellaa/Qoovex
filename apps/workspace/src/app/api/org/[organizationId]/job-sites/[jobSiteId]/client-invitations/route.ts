import { invitePrimaryClientIdempotent, revokePrimaryClientInvitation } from "@shared/server/vnext-job-site-service";
import { resolveOrganizationJobSiteActor } from "@shared/server/vnext-authorization-service";
import { asVNextApiError, requireIdempotencyKey } from "@shared/server/vnext-api-response";

export async function POST(request: Request, { params }: { params: Promise<{ organizationId: string; jobSiteId: string }> }) {
  try { const value = await params; const actor = await resolveOrganizationJobSiteActor({ ...value, permission: "jobSite:participants:manage" }); return Response.json(await invitePrimaryClientIdempotent({ actor, idempotencyKey: requireIdempotencyKey(request), rawInput: await request.json() }), { status: 201 }); } catch (error) { return asVNextApiError(error); }
}
export async function DELETE(request: Request, { params }: { params: Promise<{ organizationId: string; jobSiteId: string }> }) {
  try { const value = await params; const actor = await resolveOrganizationJobSiteActor({ ...value, permission: "jobSite:participants:manage" }); return Response.json(await revokePrimaryClientInvitation({ actor, idempotencyKey: requireIdempotencyKey(request), rawInput: await request.json() })); } catch (error) { return asVNextApiError(error); }
}
