import { resolveCurrentOrganizationRouteParams } from "@shared/server/access-context-service";
import { inviteOrganizationCollaborator } from "@shared/server/organization-member-service";
import { asJobSiteApiError } from "@shared/server/job-site-api-response";
export async function POST(request: Request, { params }: { params: Promise<{ jobSiteId: string }> }) { try { const value = await resolveCurrentOrganizationRouteParams(params); const body = await request.json() as Record<string, unknown>; return Response.json(await inviteOrganizationCollaborator(value.organizationId, { ...body, jobSiteId: value.jobSiteId }), { status: 201 }); } catch (error) { return asJobSiteApiError(error); } }
