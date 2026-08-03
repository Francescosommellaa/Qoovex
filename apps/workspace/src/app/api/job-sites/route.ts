import { asAccessResponse } from "@shared/server/access-errors";
import { createJobSite, listJobSites } from "@shared/server/job-site-service";

export async function GET() {
  try {
    return Response.json(await listJobSites());
  } catch (error) { return asAccessResponse(error); }
}

export async function POST(request: Request) {
  try {
    return Response.json(await createJobSite(await request.json()), { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}
