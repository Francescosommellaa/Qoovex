import { createPostClosureRequest } from "@shared/server/vnext-collaboration-service";
import { resolveOrganizationJobSiteActor } from "@shared/server/vnext-authorization-service";
import { asVNextApiError, requireIdempotencyKey } from "@shared/server/vnext-api-response";
export async function POST(request: Request, { params }: { params: Promise<{ organizationId: string; jobSiteId: string }> }) { try { const value = await params; const actor = await resolveOrganizationJobSiteActor({ ...value, permission: "jobSite:requests:create" }); return Response.json(await createPostClosureRequest({ actor, idempotencyKey: requireIdempotencyKey(request), body: await request.json() }), { status: 201 }); } catch (error) { return asVNextApiError(error); } }
