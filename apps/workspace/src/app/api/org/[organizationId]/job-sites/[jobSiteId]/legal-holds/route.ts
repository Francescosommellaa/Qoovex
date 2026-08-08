import { placeLegalHold, releaseLegalHold } from "@shared/server/job-site-legal-hold-service";
import { asJobSiteApiError } from "@shared/server/job-site-api-response";

type Params = { params: Promise<{ organizationId: string; jobSiteId: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { organizationId, jobSiteId } = await params;
    return Response.json(await placeLegalHold(organizationId, jobSiteId, await request.json()), { status: 201 });
  } catch (error) { return asJobSiteApiError(error); }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { organizationId, jobSiteId } = await params;
    return Response.json(await releaseLegalHold(organizationId, jobSiteId, await request.json()));
  } catch (error) { return asJobSiteApiError(error); }
}
