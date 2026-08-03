import { inviteOrganizationCollaborator } from "@shared/server/vnext-organization-member-service";
import { asVNextApiError } from "@shared/server/vnext-api-response";
export async function POST(request: Request, { params }: { params: Promise<{ organizationId: string; jobSiteId: string }> }) { try { const value = await params; const body = await request.json() as Record<string, unknown>; return Response.json(await inviteOrganizationCollaborator(value.organizationId, { ...body, jobSiteId: value.jobSiteId }), { status: 201 }); } catch (error) { return asVNextApiError(error); } }
