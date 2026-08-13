import { resolveCurrentOrganizationRouteParams } from "@shared/server/access-context-service";
import { counterChangeProposal, withdrawChangeProposal } from "@shared/server/job-site-collaboration-service";
import { resolveOrganizationJobSiteActor } from "@shared/server/job-site-authorization-service";
import { asJobSiteApiError, requireIdempotencyKey } from "@shared/server/job-site-api-response";

type Params = { params: Promise<{ jobSiteId: string; proposalId: string }> };
export async function POST(request: Request, { params }: Params) { try { const value = await resolveCurrentOrganizationRouteParams(params); const actor = await resolveOrganizationJobSiteActor({ ...value, permission: "jobSite:changes:propose" }); return Response.json(await counterChangeProposal({ actor, proposalId: value.proposalId, idempotencyKey: requireIdempotencyKey(request), body: await request.json() })); } catch (error) { return asJobSiteApiError(error); } }
export async function DELETE(request: Request, { params }: Params) { try { const value = await resolveCurrentOrganizationRouteParams(params); const actor = await resolveOrganizationJobSiteActor({ ...value, permission: "jobSite:changes:propose" }); return Response.json(await withdrawChangeProposal({ actor, proposalId: value.proposalId, idempotencyKey: requireIdempotencyKey(request), body: await request.json() })); } catch (error) { return asJobSiteApiError(error); } }
