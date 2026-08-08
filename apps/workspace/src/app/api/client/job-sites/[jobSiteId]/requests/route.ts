import { createStructuredRequest } from "@shared/server/job-site-collaboration-service";
import { resolveClientJobSiteActor } from "@shared/server/job-site-authorization-service";
import { asJobSiteApiError, requireIdempotencyKey } from "@shared/server/job-site-api-response";
export async function POST(request: Request, { params }: { params: Promise<{ jobSiteId: string }> }) { try { const { jobSiteId } = await params; const actor = await resolveClientJobSiteActor(jobSiteId); return Response.json(await createStructuredRequest({ actor, idempotencyKey: requireIdempotencyKey(request), body: await request.json() }), { status: 201 }); } catch (error) { return asJobSiteApiError(error); } }
