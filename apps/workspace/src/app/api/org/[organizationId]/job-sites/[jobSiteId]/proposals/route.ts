import { createChangeProposal } from "@shared/server/vnext-collaboration-service";
import { resolveOrganizationJobSiteActor } from "@shared/server/vnext-authorization-service";
import { asVNextApiError, requireIdempotencyKey } from "@shared/server/vnext-api-response";

export async function POST(request: Request, { params }: { params: Promise<{ organizationId: string; jobSiteId: string }> }) {
  try { const value = await params; const actor = await resolveOrganizationJobSiteActor({ ...value, permission: "jobSite:changes:propose" }); return Response.json(await createChangeProposal({ actor, idempotencyKey: requireIdempotencyKey(request), body: await request.json() }), { status: 201 }); } catch (error) { return asVNextApiError(error); }
}
