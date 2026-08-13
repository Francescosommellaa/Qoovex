import { resolveCurrentOrganizationRouteParams } from "@shared/server/access-context-service";
import { searchOrganizationContent } from "@shared/server/job-site-collaboration-service";
import { resolveOrganizationJobSiteActor } from "@shared/server/job-site-authorization-service";
import { asJobSiteApiError } from "@shared/server/job-site-api-response";

export async function GET(request: Request, { params }: { params: Promise<{ jobSiteId: string }> }) {
  try { const value = await resolveCurrentOrganizationRouteParams(params); const actor = await resolveOrganizationJobSiteActor({ ...value, permission: "jobSite:view" }); return Response.json(await searchOrganizationContent(actor, new URL(request.url).searchParams.get("q") ?? "")); } catch (error) { return asJobSiteApiError(error); }
}
