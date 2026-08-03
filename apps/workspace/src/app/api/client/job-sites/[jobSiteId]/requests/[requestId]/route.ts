import { transitionStructuredRequest } from "@shared/server/vnext-collaboration-service";
import { resolveClientJobSiteActor } from "@shared/server/vnext-authorization-service";
import { asVNextApiError, requireIdempotencyKey } from "@shared/server/vnext-api-response";
export async function POST(request: Request, { params }: { params: Promise<{ jobSiteId: string; requestId: string }> }) { try { const value = await params; const actor = await resolveClientJobSiteActor(value.jobSiteId); return Response.json(await transitionStructuredRequest({ actor, requestId: value.requestId, idempotencyKey: requireIdempotencyKey(request), body: await request.json() })); } catch (error) { return asVNextApiError(error); } }
