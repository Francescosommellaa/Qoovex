import { AccessError, asAccessResponse } from "@shared/server/access-errors";
import { requirePrimaryIdentity } from "@shared/server/access-context-service";
import { verifyMfaChallengeForUser } from "@shared/server/mfa-service";
import { getRequestIpHash } from "@shared/server/security-audit-service";

export async function POST(request: Request) {
  try {
    const [user, body] = await Promise.all([requirePrimaryIdentity(), request.json() as Promise<{ code?: string }>]);
    if (!(await verifyMfaChallengeForUser({ userId: user.id, authVersion: user.authVersion, authSessionId: user.authSessionId, code: body.code ?? "", ipHash: getRequestIpHash(request.headers) }))) throw new AccessError("Codice MFA non valido.", 403);
    return Response.json({ verified: true });
  } catch (error) { return asAccessResponse(error); }
}
