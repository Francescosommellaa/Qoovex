import { getClientJobSiteDetail } from "@shared/server/vnext-job-site-service";
import { asVNextApiError } from "@shared/server/vnext-api-response";
export async function GET(_: Request, { params }: { params: Promise<{ jobSiteId: string }> }) { try { return Response.json(await getClientJobSiteDetail((await params).jobSiteId)); } catch (error) { return asVNextApiError(error); } }
