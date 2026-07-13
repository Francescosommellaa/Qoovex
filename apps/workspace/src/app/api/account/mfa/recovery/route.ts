import { asAccessResponse } from "@shared/server/access-errors";
import { requirePrimaryIdentity } from "@shared/server/access-context-service";
import { createMfaRecoveryRequest, getCurrentMfaRecovery } from "@shared/server/mfa-recovery-service";
import { getRequestIpHash } from "@shared/server/security-audit-service";

export async function GET() {
  try { const user = await requirePrimaryIdentity(); return Response.json({ recovery: await getCurrentMfaRecovery(user.id) }); }
  catch (error) { return asAccessResponse(error); }
}

export async function POST(request: Request) {
  try {
    const [user, body] = await Promise.all([requirePrimaryIdentity(), request.json() as Promise<{ emailCode?: string }>]);
    return Response.json(await createMfaRecoveryRequest({ userId: user.id, emailCode: body.emailCode ?? "", ipHash: getRequestIpHash(request.headers) }));
  } catch (error) { return asAccessResponse(error); }
}
