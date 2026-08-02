import { asAccessResponse } from "@shared/server/access-errors";
import { createJobSite, listJobSites } from "@shared/server/job-site-service";

export async function GET(request: Request) {
  try {
    const query = new URL(request.url).searchParams;
    return Response.json(await listJobSites({ search: query.get("search"), archived: query.get("archived") === "true" }));
  } catch (error) { return asAccessResponse(error); }
}

export async function POST(request: Request) {
  try {
    return Response.json(await createJobSite(await request.json()), { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}
