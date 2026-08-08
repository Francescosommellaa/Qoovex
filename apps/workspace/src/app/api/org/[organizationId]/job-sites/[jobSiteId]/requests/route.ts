import { createStructuredRequest } from "@shared/server/job-site-collaboration-service";
import { resolveOrganizationJobSiteActor } from "@shared/server/job-site-authorization-service";
import { asJobSiteApiError, requireIdempotencyKey } from "@shared/server/job-site-api-response";
export async function POST(request: Request, { params }: { params: Promise<{ organizationId: string; jobSiteId: string }> }) { try { const value = await params; const actor = await resolveOrganizationJobSiteActor({ ...value, permission: "jobSite:requests:create" }); return Response.json(await createStructuredRequest({ actor, idempotencyKey: requireIdempotencyKey(request), body: await request.json() }), { status: 201 }); } catch (error) { return asJobSiteApiError(error); } }
