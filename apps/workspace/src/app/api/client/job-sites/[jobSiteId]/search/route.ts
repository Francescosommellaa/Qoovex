import { searchSharedClientContent } from "@shared/server/vnext-collaboration-service";
import { resolveClientJobSiteActor } from "@shared/server/vnext-authorization-service";
import { asVNextApiError } from "@shared/server/vnext-api-response";
export async function GET(request: Request, { params }: { params: Promise<{ jobSiteId: string }> }) { try { const actor = await resolveClientJobSiteActor((await params).jobSiteId); return Response.json(await searchSharedClientContent(actor, new URL(request.url).searchParams.get("q") ?? "")); } catch (error) { return asVNextApiError(error); } }
