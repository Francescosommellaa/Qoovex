import { searchSharedClientContent } from "@shared/server/job-site-collaboration-service";
import { resolveClientJobSiteActor } from "@shared/server/job-site-authorization-service";
import { asJobSiteApiError } from "@shared/server/job-site-api-response";
export async function GET(request: Request, { params }: { params: Promise<{ jobSiteId: string }> }) { try { const actor = await resolveClientJobSiteActor((await params).jobSiteId); return Response.json(await searchSharedClientContent(actor, new URL(request.url).searchParams.get("q") ?? "")); } catch (error) { return asJobSiteApiError(error); } }
