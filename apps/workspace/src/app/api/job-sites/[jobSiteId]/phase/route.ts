import { asAccessResponse } from "@shared/server/access-errors";
import { transitionJobSiteOperationalPhase } from "@shared/server/job-site-service";

interface RouteContext { params: Promise<{ jobSiteId: string }>; }

export async function POST(request: Request, context: RouteContext) {
  try {
    const { jobSiteId } = await context.params;
    return Response.json(await transitionJobSiteOperationalPhase(jobSiteId, await request.json()));
  } catch (error) { return asAccessResponse(error); }
}
