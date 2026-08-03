import { transitionClientParticipation } from "@shared/server/vnext-job-site-service";
import { resolveOrganizationJobSiteActor } from "@shared/server/vnext-authorization-service";
import { asVNextApiError, requireIdempotencyKey } from "@shared/server/vnext-api-response";

export async function POST(request: Request, { params }: { params: Promise<{ organizationId: string; jobSiteId: string }> }) {
  try { const value = await params; const actor = await resolveOrganizationJobSiteActor({ ...value, permission: "jobSite:participants:manage" }); return Response.json(await transitionClientParticipation({ actor, idempotencyKey: requireIdempotencyKey(request), rawInput: await request.json() })); } catch (error) { return asVNextApiError(error); }
}
