import { asAccessResponse } from "@shared/server/access-errors";
import { requireIdentity } from "@shared/server/access-context-service";
import { disableMfaForUser, getMfaStatusByUserId, startTotpSetupForUser } from "@shared/server/mfa-service";

export async function GET() {
  try { const user = await requireIdentity(); return Response.json(await getMfaStatusByUserId(user.id)); }
  catch (error) { return asAccessResponse(error); }
}
export async function POST() {
  try { const user = await requireIdentity(); return Response.json(await startTotpSetupForUser(user.id)); }
  catch (error) { return asAccessResponse(error); }
}
export async function DELETE() {
  try { const user = await requireIdentity(); await disableMfaForUser(user.id); return Response.json({ disabled: true }); }
  catch (error) { return asAccessResponse(error); }
}
