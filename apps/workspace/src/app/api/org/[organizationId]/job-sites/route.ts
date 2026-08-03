import { createVNextJobSite, listOrganizationJobSites } from "@shared/server/vnext-job-site-service";
import { asVNextApiError } from "@shared/server/vnext-api-response";

export async function GET(_: Request, { params }: { params: Promise<{ organizationId: string }> }) {
  try { return Response.json({ items: await listOrganizationJobSites((await params).organizationId), nextCursor: null }); } catch (error) { return asVNextApiError(error); }
}
export async function POST(request: Request, { params }: { params: Promise<{ organizationId: string }> }) {
  try { return Response.json(await createVNextJobSite((await params).organizationId, request.headers.get("Idempotency-Key") ?? "", await request.json()), { status: 201 }); } catch (error) { return asVNextApiError(error); }
}
