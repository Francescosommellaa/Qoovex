import { getOrganizationJobSiteDetail } from "@shared/server/vnext-job-site-service";
import { asVNextApiError } from "@shared/server/vnext-api-response";

export async function GET(_: Request, { params }: { params: Promise<{ organizationId: string; jobSiteId: string }> }) {
  try { const value = await params; return Response.json(await getOrganizationJobSiteDetail(value.organizationId, value.jobSiteId)); } catch (error) { return asVNextApiError(error); }
}
