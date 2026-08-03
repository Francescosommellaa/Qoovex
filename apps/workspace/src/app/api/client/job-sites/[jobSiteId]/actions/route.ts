import { executeVNextAction } from "@shared/server/vnext-action-service";
import { resolveClientJobSiteActor } from "@shared/server/vnext-authorization-service";
import { asVNextApiError, requireIdempotencyKey } from "@shared/server/vnext-api-response";
export async function POST(request: Request, { params }: { params: Promise<{ jobSiteId: string }> }) { try { const actor = await resolveClientJobSiteActor((await params).jobSiteId); return Response.json(await executeVNextAction({ actor, idempotencyKey: requireIdempotencyKey(request), action: await request.json() })); } catch (error) { return asVNextApiError(error); } }
