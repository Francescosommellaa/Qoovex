import { asAccessResponse } from "@shared/server/access-errors";
import { requireIdentity } from "@shared/server/access-context-service";
import { confirmTotpSetupForUser } from "@shared/server/mfa-service";

export async function POST(request: Request) {
  try { const [user, body] = await Promise.all([requireIdentity(), request.json() as Promise<{ code?: string }>]); return Response.json(await confirmTotpSetupForUser({ userId: user.id, code: body.code ?? "" })); }
  catch (error) { return asAccessResponse(error); }
}
