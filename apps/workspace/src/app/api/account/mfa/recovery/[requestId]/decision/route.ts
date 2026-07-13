import { asAccessResponse } from "@shared/server/access-errors";
import { requireIdentity } from "@shared/server/access-context-service";
import { decideMfaRecoveryRequest } from "@shared/server/mfa-recovery-service";
import { getRequestIpHash } from "@shared/server/security-audit-service";

export async function POST(request: Request, context: { params: Promise<{ requestId: string }> }) {
  try {
    const [user, body, params] = await Promise.all([
      requireIdentity(),
      request.json() as Promise<{ decision?: "approve" | "deny"; currentCode?: string }>,
      context.params,
    ]);
    if (body.decision !== "approve" && body.decision !== "deny") return Response.json({ message: "Decisione non valida." }, { status: 400 });
    return Response.json(await decideMfaRecoveryRequest({
      ownerUserId: user.id,
      requestId: params.requestId,
      decision: body.decision,
      currentCode: body.currentCode ?? "",
      ipHash: getRequestIpHash(request.headers),
    }));
  } catch (error) { return asAccessResponse(error); }
}
