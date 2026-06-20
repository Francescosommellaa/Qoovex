import { AccessError, asAccessResponse } from "@shared/server/access-errors";
import { requireIdentity } from "@shared/server/access-context-service";
import { verifyMfaChallengeForUser } from "@shared/server/mfa-service";

export async function POST(request: Request) {
  try {
    const [user, body] = await Promise.all([requireIdentity(), request.json() as Promise<{ code?: string }>]);
    if (!(await verifyMfaChallengeForUser({ userId: user.id, code: body.code ?? "" }))) throw new AccessError("Codice MFA non valido.", 403);
    return Response.json({ verified: true });
  } catch (error) { return asAccessResponse(error); }
}
