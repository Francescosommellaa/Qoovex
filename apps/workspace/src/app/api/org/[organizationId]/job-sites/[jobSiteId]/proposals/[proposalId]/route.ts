import { counterChangeProposal, withdrawChangeProposal } from "@shared/server/vnext-collaboration-service";
import { resolveOrganizationJobSiteActor } from "@shared/server/vnext-authorization-service";
import { asVNextApiError, requireIdempotencyKey } from "@shared/server/vnext-api-response";

type Params = { params: Promise<{ organizationId: string; jobSiteId: string; proposalId: string }> };
export async function POST(request: Request, { params }: Params) { try { const value = await params; const actor = await resolveOrganizationJobSiteActor({ ...value, permission: "jobSite:changes:propose" }); return Response.json(await counterChangeProposal({ actor, proposalId: value.proposalId, idempotencyKey: requireIdempotencyKey(request), body: await request.json() })); } catch (error) { return asVNextApiError(error); } }
export async function DELETE(request: Request, { params }: Params) { try { const value = await params; const actor = await resolveOrganizationJobSiteActor({ ...value, permission: "jobSite:changes:propose" }); return Response.json(await withdrawChangeProposal({ actor, proposalId: value.proposalId, idempotencyKey: requireIdempotencyKey(request), body: await request.json() })); } catch (error) { return asVNextApiError(error); } }
