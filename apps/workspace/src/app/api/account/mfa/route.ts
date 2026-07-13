import { asAccessResponse } from "@shared/server/access-errors";
import { requirePrimaryIdentity } from "@shared/server/access-context-service";
import { disableMfaForUser, getMfaStatusByUserId, isMfaSatisfiedForUser, startTotpSetupForUser } from "@shared/server/mfa-service";
import { getRequestIpHash } from "@shared/server/security-audit-service";

export async function GET() {
  try {
    const user = await requirePrimaryIdentity();
    const status = await getMfaStatusByUserId(user.id);
    const satisfied = user.isDev || !user.mfaEnabled || await isMfaSatisfiedForUser({ userId: user.id, authVersion: user.authVersion, authSessionId: user.authSessionId });
    return Response.json({ ...status, satisfied });
  }
  catch (error) { return asAccessResponse(error); }
}
export async function POST(request: Request) {
  try {
    const [user, body] = await Promise.all([
      requirePrimaryIdentity(),
      request.json() as Promise<{ authorizationType?: "email" | "current-factor" | "recovery"; code?: string; recoveryRequestId?: string }>,
    ]);
    return Response.json(await startTotpSetupForUser({
      userId: user.id,
      authorizationType: body.authorizationType ?? "current-factor",
      code: body.code,
      recoveryRequestId: body.recoveryRequestId,
      ipHash: getRequestIpHash(request.headers),
    }));
  }
  catch (error) { return asAccessResponse(error); }
}
export async function DELETE(request: Request) {
  try {
    const [user, body] = await Promise.all([requirePrimaryIdentity(), request.json() as Promise<{ currentCode?: string }>]);
    return Response.json(await disableMfaForUser({ userId: user.id, currentCode: body.currentCode ?? "", ipHash: getRequestIpHash(request.headers) }));
  }
  catch (error) { return asAccessResponse(error); }
}
