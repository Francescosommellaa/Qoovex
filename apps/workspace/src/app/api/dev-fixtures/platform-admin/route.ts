import { db } from "@qoovex/db";
import { AccessError, asAccessResponse } from "@shared/server/access-errors";
import { requireIdentity } from "@shared/server/access-context-service";
import { isCurrentDevAuthIdentity } from "@shared/server/dev-auth";

async function requireDevFixtureAccess() {
  const identity = await requireIdentity();
  if (!(await isCurrentDevAuthIdentity(identity.id))) throw new AccessError("Risorsa non disponibile.", 404);
  return identity;
}

export async function POST(request: Request) {
  try {
    await requireDevFixtureAccess();
    const body = await request.json() as { runId?: string };
    const runId = body.runId?.trim() ?? "";
    if (!/^\d{8,20}$/.test(runId)) throw new AccessError("Fixture non valida.", 409);
    const [user, runtimeError] = await db.$transaction([
      db.user.create({
        data: { email: `platform-e2e-${runId}@example.test`, username: `platform_e2e_${runId}`, firstName: "Cliente", lastName: "E2E", emailVerified: new Date() },
        select: { id: true, email: true },
      }),
      db.runtimeErrorEvent.create({
        data: { fingerprint: `e2e-${runId}`, source: "e2e", routePath: "/api/e2e-fixture", requestMethod: "GET", errorName: "E2EFixtureError", message: `Errore fixture sanitizzato ${runId}` },
        select: { id: true },
      }),
    ]);
    return Response.json({ user, runtimeError }, { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}

export async function DELETE(request: Request) {
  try {
    await requireDevFixtureAccess();
    const body = await request.json() as { userId?: string; runtimeErrorId?: string };
    await db.$transaction([
      db.runtimeErrorEvent.deleteMany({ where: { id: body.runtimeErrorId ?? "", source: "e2e", fingerprint: { startsWith: "e2e-" } } }),
      db.user.deleteMany({ where: { id: body.userId ?? "", email: { startsWith: "platform-e2e-", endsWith: "@example.test" }, username: { startsWith: "platform_e2e_" } } }),
    ]);
    return Response.json({ deleted: true });
  } catch (error) { return asAccessResponse(error); }
}
