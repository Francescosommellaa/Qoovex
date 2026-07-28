import { asAccessResponse } from "@shared/server/access-errors";
import { createJobSiteUserAssignment, listJobSiteUserAssignments } from "@shared/server/resource-assignment-service";

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    return Response.json(await listJobSiteUserAssignments({ jobSiteId: searchParams.get("jobSiteId") ?? undefined, includeHistory: searchParams.get("includeHistory") ?? undefined }));
  } catch (error) { return asAccessResponse(error); }
}

export async function POST(request: Request) {
  try {
    return Response.json(await createJobSiteUserAssignment(await request.json()), { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}
