import { asAccessResponse } from "@shared/server/access-errors";
import { createDeadline, listDeadlines } from "@shared/server/deadline-service";

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    return Response.json(await listDeadlines({
      documentId: searchParams.get("documentId") ?? undefined,
      workerId: searchParams.get("workerId") ?? undefined,
      jobSiteId: searchParams.get("jobSiteId") ?? undefined,
      status: searchParams.get("status") ?? undefined,
    }));
  } catch (error) { return asAccessResponse(error); }
}

export async function POST(request: Request) {
  try {
    return Response.json(await createDeadline(await request.json()), { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}
