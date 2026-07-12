import { asAccessResponse } from "@shared/server/access-errors";
import { isAuthorizedCronRequest } from "@shared/server/cron-auth";
import { runDataControlJobs } from "@shared/server/data-control-job-service";

export async function GET(request: Request) {
  try {
    if (!isAuthorizedCronRequest(request)) {
      return Response.json({ message: "Runner non disponibile." }, { status: 404 });
    }
    return Response.json(await runDataControlJobs());
  } catch (error) { return asAccessResponse(error); }
}
