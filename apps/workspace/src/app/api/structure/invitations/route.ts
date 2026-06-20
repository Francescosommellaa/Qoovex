import type { StructureRole } from "@qoovex/types";
import { asAccessResponse } from "@shared/server/access-errors";
import { createInvitation, listInvitations, revokeInvitation } from "@shared/server/structure-invitation-service";

export async function GET() {
  try { return Response.json(await listInvitations()); }
  catch (error) { return asAccessResponse(error); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: string; role?: StructureRole };
    return Response.json(await createInvitation({ email: body.email ?? "", role: body.role ?? "KITCHEN_CREW" }), { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json() as { invitationId?: string };
    return Response.json(await revokeInvitation(body.invitationId ?? ""));
  } catch (error) { return asAccessResponse(error); }
}
