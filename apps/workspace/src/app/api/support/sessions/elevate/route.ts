import { asAccessResponse } from "@shared/server/access-errors";
import { requireIdentity } from "@shared/server/access-context-service";
import { elevateSupportSession } from "@shared/server/support-access-service";

export async function POST(request: Request) {
  try {
    const [user, body] = await Promise.all([requireIdentity(), request.json() as Promise<{ code?: string }>]);
    return Response.json(await elevateSupportSession(user.id, body.code ?? ""));
  } catch (error) { return asAccessResponse(error); }
}
