import { asAccessResponse } from "@shared/server/access-errors";
import type { OrganizationAccessPreset, OrganizationPermission, OrganizationResourceGrantInput, OrganizationScopeMode } from "@qoovex/types";
import { listMembers, revokeMember, updateMemberAccess } from "@shared/server/organization-access-service";

export async function GET() {
  try { return Response.json(await listMembers()); }
  catch (error) { return asAccessResponse(error); }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json() as { memberId?: string };
    return Response.json(await revokeMember(body.memberId ?? ""));
  } catch (error) { return asAccessResponse(error); }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json() as {
      memberId?: string;
      expectedVersion?: number;
      preset?: OrganizationAccessPreset | null;
      permissions?: OrganizationPermission[];
      scopeMode?: OrganizationScopeMode;
      expiresAt?: string | null;
      grants?: OrganizationResourceGrantInput[];
    };
    return Response.json(await updateMemberAccess(body.memberId ?? "", {
      expectedVersion: body.expectedVersion ?? 0,
      preset: body.preset ?? null,
      permissions: body.permissions ?? [],
      scopeMode: body.scopeMode ?? "ASSIGNED",
      expiresAt: body.expiresAt,
      grants: body.grants,
    }));
  } catch (error) { return asAccessResponse(error); }
}
