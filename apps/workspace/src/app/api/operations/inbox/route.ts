import { getOperationalInbox } from "@features/operational-engine/server/operational-read-service";
import { asAccessResponse } from "@shared/server/access-errors";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    return Response.json(await getOperationalInbox({
      cursor: url.searchParams.get("cursor"),
      take: url.searchParams.get("take"),
      filters: {
        view: (url.searchParams.get("view") || undefined) as never,
        artifactType: (url.searchParams.get("artifactType") || undefined) as never,
        workerId: url.searchParams.get("workerId") || undefined,
        jobSiteId: url.searchParams.get("jobSiteId") || undefined,
        status: url.searchParams.get("status") || undefined,
        from: url.searchParams.get("from") || undefined,
        to: url.searchParams.get("to") || undefined,
      },
    }));
  }
  catch (error) { return asAccessResponse(error); }
}
