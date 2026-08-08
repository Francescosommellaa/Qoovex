import { linkClientProperty } from "@shared/server/job-site-lifecycle-service";
import { asJobSiteApiError } from "@shared/server/job-site-api-response";
export async function POST(request: Request, { params }: { params: Promise<{ propertyId: string }> }) { try { const body = await request.json(); return Response.json(await linkClientProperty((await params).propertyId, String(body.jobSiteId)), { status: 201 }); } catch (error) { return asJobSiteApiError(error); } }
