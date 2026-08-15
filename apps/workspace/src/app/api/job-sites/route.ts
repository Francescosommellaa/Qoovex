import { createJobSite, listOrganizationJobSites } from "@shared/server/job-site-lifecycle-service";
import { asJobSiteApiError } from "@shared/server/job-site-api-response";
import { requireCurrentOrganizationId } from "@shared/server/access-context-service";

export async function GET() {
  try { return Response.json({ items: await listOrganizationJobSites(await requireCurrentOrganizationId()), nextCursor: null }); } catch (error) { return asJobSiteApiError(error); }
}
export async function POST(request: Request) {
  try { return Response.json(await createJobSite(await requireCurrentOrganizationId(), request.headers.get("Idempotency-Key") ?? "", await request.json()), { status: 201 }); } catch (error) { return asJobSiteApiError(error); }
}
