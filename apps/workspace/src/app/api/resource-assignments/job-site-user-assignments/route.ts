import { asAccessResponse } from "@shared/server/access-errors";
import { createJobSiteUserAssignment, listJobSiteUserAssignments } from "@shared/server/resource-assignment-service";

export async function GET() {
  try {
    return Response.json(await listJobSiteUserAssignments());
  } catch (error) { return asAccessResponse(error); }
}

export async function POST(request: Request) {
  try {
    return Response.json(await createJobSiteUserAssignment(await request.json()), { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}
