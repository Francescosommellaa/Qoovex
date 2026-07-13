import { asAccessResponse } from "@shared/server/access-errors";
import { requirePrimaryIdentity } from "@shared/server/access-context-service";
import { issueMfaEnrollmentCode } from "@shared/server/mfa-service";
import { getRequestIpHash } from "@shared/server/security-audit-service";

export async function POST(request: Request) {
  try {
    const user = await requirePrimaryIdentity();
    return Response.json(await issueMfaEnrollmentCode({ userId: user.id, ipHash: getRequestIpHash(request.headers) }));
  } catch (error) { return asAccessResponse(error); }
}
