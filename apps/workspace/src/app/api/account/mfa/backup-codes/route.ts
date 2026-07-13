import { asAccessResponse } from "@shared/server/access-errors";
import { requirePrimaryIdentity } from "@shared/server/access-context-service";
import { regenerateBackupCodesForUser } from "@shared/server/mfa-service";
import { getRequestIpHash } from "@shared/server/security-audit-service";

export async function POST(request: Request) {
  try {
    const [user, body] = await Promise.all([requirePrimaryIdentity(), request.json() as Promise<{ currentCode?: string }>]);
    return Response.json(await regenerateBackupCodesForUser({ userId: user.id, currentCode: body.currentCode ?? "", ipHash: getRequestIpHash(request.headers) }));
  } catch (error) { return asAccessResponse(error); }
}
