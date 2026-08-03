import { placeLegalHold, releaseLegalHold } from "@shared/server/vnext-legal-hold-service";
import { asVNextApiError } from "@shared/server/vnext-api-response";

type Params = { params: Promise<{ organizationId: string; jobSiteId: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { organizationId, jobSiteId } = await params;
    return Response.json(await placeLegalHold(organizationId, jobSiteId, await request.json()), { status: 201 });
  } catch (error) { return asVNextApiError(error); }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { organizationId, jobSiteId } = await params;
    return Response.json(await releaseLegalHold(organizationId, jobSiteId, await request.json()));
  } catch (error) { return asVNextApiError(error); }
}
