import { proposeReopening } from "@shared/server/vnext-collaboration-service";
import { resolveClientJobSiteActor } from "@shared/server/vnext-authorization-service";
import { asVNextApiError, requireIdempotencyKey } from "@shared/server/vnext-api-response";
export async function POST(request: Request, { params }: { params: Promise<{ jobSiteId: string }> }) { try { const actor = await resolveClientJobSiteActor((await params).jobSiteId); return Response.json(await proposeReopening({ actor, idempotencyKey: requireIdempotencyKey(request), body: await request.json() }), { status: 201 }); } catch (error) { return asVNextApiError(error); } }
