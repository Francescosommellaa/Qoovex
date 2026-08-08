import { appendTimeline, listTimeline } from "@shared/server/job-site-collaboration-service";
import { resolveOrganizationJobSiteActor } from "@shared/server/job-site-authorization-service";
import { asJobSiteApiError, requireIdempotencyKey } from "@shared/server/job-site-api-response";

export async function POST(request: Request, { params }: { params: Promise<{ organizationId: string; jobSiteId: string }> }) {
  try { const value = await params; const actor = await resolveOrganizationJobSiteActor({ ...value, permission: "jobSite:publish" }); return Response.json(await appendTimeline({ actor, idempotencyKey: requireIdempotencyKey(request), body: await request.json() }), { status: 201 }); } catch (error) { return asJobSiteApiError(error); }
}
export async function GET(request: Request, { params }: { params: Promise<{ organizationId: string; jobSiteId: string }> }) { try { const value = await params; const actor = await resolveOrganizationJobSiteActor({ ...value, permission: "jobSite:view" }); return Response.json(await listTimeline({ actor, cursor: new URL(request.url).searchParams.get("cursor") }), { headers: { "Cache-Control": "no-store" } }); } catch (error) { return asJobSiteApiError(error); } }
