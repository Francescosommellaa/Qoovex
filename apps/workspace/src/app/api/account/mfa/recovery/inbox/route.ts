import { asAccessResponse } from "@shared/server/access-errors";
import { requireIdentity } from "@shared/server/access-context-service";
import { listMfaRecoveryInbox } from "@shared/server/mfa-recovery-service";

export async function GET() {
  try { const user = await requireIdentity(); return Response.json({ requests: await listMfaRecoveryInbox(user.id) }); }
  catch (error) { return asAccessResponse(error); }
}
