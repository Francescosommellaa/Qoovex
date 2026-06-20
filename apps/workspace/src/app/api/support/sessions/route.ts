import { asAccessResponse } from "@shared/server/access-errors";
import { requireIdentity } from "@shared/server/access-context-service";
import { closeSupportSession, getActiveSupportSession, openSupportSession } from "@shared/server/support-access-service";

export async function GET() {
  try {
    const user = await requireIdentity();
    return Response.json(await getActiveSupportSession(user.id));
  } catch (error) { return asAccessResponse(error); }
}

export async function POST(request: Request) {
  try {
    const [user, body] = await Promise.all([requireIdentity(), request.json() as Promise<{ structureCode?: string; reason?: string }>]);
    return Response.json(await openSupportSession(user.id, { structureCode: body.structureCode ?? "", reason: body.reason ?? "" }), { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}

export async function DELETE() {
  try {
    const user = await requireIdentity();
    return Response.json(await closeSupportSession(user.id));
  } catch (error) { return asAccessResponse(error); }
}
