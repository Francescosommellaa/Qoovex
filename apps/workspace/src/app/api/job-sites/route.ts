import { asAccessResponse } from "@shared/server/access-errors";
import { createJobSite } from "@shared/server/job-site-service";
import { listOperationalJobSites } from "@shared/server/job-site-read-model-service";

export async function GET(request: Request) {
  try {
    const query = new URL(request.url).searchParams;
    return Response.json(await listOperationalJobSites({ search: query.get("search"), phase: query.get("phase"), attention: query.get("attention"), page: query.get("page"), pageSize: query.get("pageSize") }));
  } catch (error) { return asAccessResponse(error); }
}

export async function POST(request: Request) {
  try {
    return Response.json(await createJobSite(await request.json()), { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}
