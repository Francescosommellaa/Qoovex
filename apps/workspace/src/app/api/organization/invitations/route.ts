import type { OrganizationAccessPreset, OrganizationPermission, OrganizationResourceGrantInput, OrganizationRole, OrganizationScopeMode } from "@qoovex/types";
import { asAccessResponse } from "@shared/server/access-errors";
import { createInvitation, listInvitations, resendInvitation, revokeInvitation } from "@shared/server/organization-invitation-service";

export async function GET() {
  try { return Response.json(await listInvitations()); }
  catch (error) { return asAccessResponse(error); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { recipientName?: string | null; email?: string; message?: string | null; role?: OrganizationRole; preset?: OrganizationAccessPreset | null; permissions?: OrganizationPermission[]; scopeMode?: OrganizationScopeMode; accessExpiresAt?: string | null; workerId?: string | null; grants?: OrganizationResourceGrantInput[] };
    return Response.json(await createInvitation({ recipientName: body.recipientName, email: body.email ?? "", message: body.message, role: body.role ?? "COLLABORATOR", preset: body.preset, permissions: body.permissions, scopeMode: body.scopeMode, accessExpiresAt: body.accessExpiresAt, workerId: body.workerId, grants: body.grants }), { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json() as { invitationId?: string };
    return Response.json(await revokeInvitation(body.invitationId ?? ""));
  } catch (error) { return asAccessResponse(error); }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json() as { invitationId?: string };
    return Response.json(await resendInvitation(body.invitationId ?? ""));
  } catch (error) { return asAccessResponse(error); }
}
