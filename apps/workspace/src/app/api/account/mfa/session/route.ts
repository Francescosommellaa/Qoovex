import { asAccessResponse } from "@shared/server/access-errors";
import { requirePrimaryIdentity } from "@shared/server/access-context-service";
import { clearMfaSessionCookie } from "@shared/server/mfa-service";

export async function DELETE() {
  try {
    await requirePrimaryIdentity();
    await clearMfaSessionCookie();
    return Response.json({ cleared: true });
  } catch (error) { return asAccessResponse(error); }
}
