import { asAccessResponse } from "@shared/server/access-errors";
import { archiveJobSite, getJobSite, updateJobSite } from "@shared/server/job-site-service";

interface RouteContext {
  params: Promise<{ jobSiteId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { jobSiteId } = await context.params;
    return Response.json(await getJobSite(jobSiteId));
  } catch (error) { return asAccessResponse(error); }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { jobSiteId } = await context.params;
    return Response.json(await updateJobSite(jobSiteId, await request.json()));
  } catch (error) { return asAccessResponse(error); }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { jobSiteId } = await context.params;
    const jobSite = await archiveJobSite(jobSiteId);
    return Response.json({ jobSite, archived: true });
  } catch (error) { return asAccessResponse(error); }
}
