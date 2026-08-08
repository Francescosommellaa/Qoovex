import { createJobSite, listOrganizationJobSites } from "@shared/server/job-site-lifecycle-service";
import { asJobSiteApiError } from "@shared/server/job-site-api-response";

export async function GET(_: Request, { params }: { params: Promise<{ organizationId: string }> }) {
  try { return Response.json({ items: await listOrganizationJobSites((await params).organizationId), nextCursor: null }); } catch (error) { return asJobSiteApiError(error); }
}
export async function POST(request: Request, { params }: { params: Promise<{ organizationId: string }> }) {
  try { return Response.json(await createJobSite((await params).organizationId, request.headers.get("Idempotency-Key") ?? "", await request.json()), { status: 201 }); } catch (error) { return asJobSiteApiError(error); }
}
