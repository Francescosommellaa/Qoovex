import { getClientJobSiteDetail } from "@shared/server/job-site-lifecycle-service";
import { asJobSiteApiError } from "@shared/server/job-site-api-response";
export async function GET(_: Request, { params }: { params: Promise<{ jobSiteId: string }> }) { try { return Response.json(await getClientJobSiteDetail((await params).jobSiteId)); } catch (error) { return asJobSiteApiError(error); } }
