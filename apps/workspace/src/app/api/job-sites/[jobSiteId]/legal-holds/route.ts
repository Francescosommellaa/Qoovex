import { resolveCurrentOrganizationRouteParams } from "@shared/server/access-context-service";
import { placeLegalHold, releaseLegalHold } from "@shared/server/job-site-legal-hold-service";
import { asJobSiteApiError } from "@shared/server/job-site-api-response";

type Params = { params: Promise<{ jobSiteId: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { organizationId, jobSiteId } = await resolveCurrentOrganizationRouteParams(params);
    return Response.json(await placeLegalHold(organizationId, jobSiteId, await request.json()), { status: 201 });
  } catch (error) { return asJobSiteApiError(error); }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { organizationId, jobSiteId } = await resolveCurrentOrganizationRouteParams(params);
    return Response.json(await releaseLegalHold(organizationId, jobSiteId, await request.json()));
  } catch (error) { return asJobSiteApiError(error); }
}
