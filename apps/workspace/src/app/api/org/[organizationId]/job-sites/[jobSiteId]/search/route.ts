import { searchOrganizationContent } from "@shared/server/vnext-collaboration-service";
import { resolveOrganizationJobSiteActor } from "@shared/server/vnext-authorization-service";
import { asVNextApiError } from "@shared/server/vnext-api-response";

export async function GET(request: Request, { params }: { params: Promise<{ organizationId: string; jobSiteId: string }> }) {
  try { const value = await params; const actor = await resolveOrganizationJobSiteActor({ ...value, permission: "jobSite:view" }); return Response.json(await searchOrganizationContent(actor, new URL(request.url).searchParams.get("q") ?? "")); } catch (error) { return asVNextApiError(error); }
}
