import { asAccessResponse } from "@shared/server/access-errors";
import { createOrganizationDeletionJob } from "@shared/server/data-control-job-service";

export async function POST(request: Request) {
  try {
    return Response.json(await createOrganizationDeletionJob(await request.json()), { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}
