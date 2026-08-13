import { resolveCurrentOrganizationRouteParams } from "@shared/server/access-context-service";
import { getOrganizationJobSiteDetail } from "@shared/server/job-site-lifecycle-service";
import { asJobSiteApiError } from "@shared/server/job-site-api-response";

export async function GET(_: Request, { params }: { params: Promise<{ jobSiteId: string }> }) {
  try { const value = await resolveCurrentOrganizationRouteParams(params); return Response.json(await getOrganizationJobSiteDetail(value.organizationId, value.jobSiteId)); } catch (error) { return asJobSiteApiError(error); }
}
