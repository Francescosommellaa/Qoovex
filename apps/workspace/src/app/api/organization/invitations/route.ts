import type { OrganizationAccessPreset, OrganizationPermission, OrganizationRole, OrganizationScopeMode } from "@qoovex/types";
import { asAccessResponse } from "@shared/server/access-errors";
import { createInvitation, listInvitations, revokeInvitation } from "@shared/server/organization-invitation-service";

export async function GET() {
  try { return Response.json(await listInvitations()); }
  catch (error) { return asAccessResponse(error); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: string; role?: OrganizationRole; preset?: OrganizationAccessPreset | null; permissions?: OrganizationPermission[]; scopeMode?: OrganizationScopeMode; accessExpiresAt?: string | null; workerId?: string | null };
    return Response.json(await createInvitation({ email: body.email ?? "", role: body.role ?? "MEMBER", preset: body.preset, permissions: body.permissions, scopeMode: body.scopeMode, accessExpiresAt: body.accessExpiresAt, workerId: body.workerId }), { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json() as { invitationId?: string };
    return Response.json(await revokeInvitation(body.invitationId ?? ""));
  } catch (error) { return asAccessResponse(error); }
}
