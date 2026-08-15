import { getOrganizationPeople, inviteOrganizationCollaborator, revokeOrganizationCollaborator } from "@shared/server/organization-member-service";
import { asJobSiteApiError } from "@shared/server/job-site-api-response";
import { requireCurrentOrganizationId } from "@shared/server/access-context-service";
export async function GET() { try { return Response.json(await getOrganizationPeople(await requireCurrentOrganizationId())); } catch (error) { return asJobSiteApiError(error); } }
export async function POST(request: Request) { try { return Response.json(await inviteOrganizationCollaborator(await requireCurrentOrganizationId(), await request.json()), { status: 201 }); } catch (error) { return asJobSiteApiError(error); } }
export async function DELETE(request: Request) { try { return Response.json(await revokeOrganizationCollaborator(await requireCurrentOrganizationId(), new URL(request.url).searchParams.get("membershipId") ?? "")); } catch (error) { return asJobSiteApiError(error); } }
