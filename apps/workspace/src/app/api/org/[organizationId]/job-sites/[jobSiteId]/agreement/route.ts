import { publishInitialAgreementIdempotent } from "@shared/server/vnext-job-site-service";
import { resolveOrganizationJobSiteActor } from "@shared/server/vnext-authorization-service";
import { asVNextApiError, requireIdempotencyKey } from "@shared/server/vnext-api-response";

export async function POST(request: Request, { params }: { params: Promise<{ organizationId: string; jobSiteId: string }> }) {
  try { const value = await params; const actor = await resolveOrganizationJobSiteActor({ ...value, permission: "jobSite:update" }); return Response.json(await publishInitialAgreementIdempotent({ actor, idempotencyKey: requireIdempotencyKey(request), rawInput: await request.json() }), { status: 201 }); } catch (error) { return asVNextApiError(error); }
}
