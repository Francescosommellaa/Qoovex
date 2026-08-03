import { asAccessResponse } from "@shared/server/access-errors";
import { createJobSiteWorkerAssignment, listJobSiteWorkerAssignments } from "@shared/server/resource-assignment-service";

export async function GET() {
  try {
    return Response.json(await listJobSiteWorkerAssignments());
  } catch (error) { return asAccessResponse(error); }
}

export async function POST(request: Request) {
  try {
    return Response.json(await createJobSiteWorkerAssignment(await request.json()), { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}
