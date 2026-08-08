import { getOrganizationJobSiteDetail } from "@shared/server/job-site-lifecycle-service";
import { asJobSiteApiError } from "@shared/server/job-site-api-response";

export async function GET(_: Request, { params }: { params: Promise<{ organizationId: string; jobSiteId: string }> }) {
  try { const value = await params; return Response.json(await getOrganizationJobSiteDetail(value.organizationId, value.jobSiteId)); } catch (error) { return asJobSiteApiError(error); }
}
