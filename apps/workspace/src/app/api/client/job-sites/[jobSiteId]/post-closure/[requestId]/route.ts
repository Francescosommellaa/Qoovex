import { transitionPostClosureRequest } from "@shared/server/job-site-collaboration-service";
import { resolveClientJobSiteActor } from "@shared/server/job-site-authorization-service";
import { asJobSiteApiError, requireIdempotencyKey } from "@shared/server/job-site-api-response";
export async function POST(request: Request, { params }: { params: Promise<{ jobSiteId: string; requestId: string }> }) { try { const value = await params; const actor = await resolveClientJobSiteActor(value.jobSiteId); return Response.json(await transitionPostClosureRequest({ actor, postClosureRequestId: value.requestId, idempotencyKey: requireIdempotencyKey(request), body: await request.json() })); } catch (error) { return asJobSiteApiError(error); } }
