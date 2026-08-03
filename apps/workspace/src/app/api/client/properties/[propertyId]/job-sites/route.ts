import { linkClientProperty } from "@shared/server/vnext-job-site-service";
import { asVNextApiError } from "@shared/server/vnext-api-response";
export async function POST(request: Request, { params }: { params: Promise<{ propertyId: string }> }) { try { const body = await request.json(); return Response.json(await linkClientProperty((await params).propertyId, String(body.jobSiteId)), { status: 201 }); } catch (error) { return asVNextApiError(error); } }
