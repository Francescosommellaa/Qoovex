import { proposeClosure } from "@shared/server/vnext-collaboration-service";
import { resolveOrganizationJobSiteActor } from "@shared/server/vnext-authorization-service";
import { asVNextApiError, requireIdempotencyKey } from "@shared/server/vnext-api-response";

export async function POST(request: Request, { params }: { params: Promise<{ organizationId: string; jobSiteId: string }> }) {
  try { const value = await params; const body = await request.json(); const actor = await resolveOrganizationJobSiteActor({ ...value, permission: "jobSite:closure:propose" }); return Response.json(await proposeClosure({ actor, idempotencyKey: requireIdempotencyKey(request), expectedRevision: Number(body.expectedRevision) }), { status: 201 }); } catch (error) { return asVNextApiError(error); }
}
