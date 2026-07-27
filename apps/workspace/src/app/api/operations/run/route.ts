import { runOperationalEngine } from "@features/operational-engine/server/operational-engine";
import { asAccessResponse } from "@shared/server/access-errors";
import { isAuthorizedCronRequest } from "@shared/server/cron-auth";

export async function GET(request: Request) {
  try {
    if (!isAuthorizedCronRequest(request)) return Response.json({ message: "Runner non disponibile." }, { status: 404 });
    return Response.json(await runOperationalEngine());
  } catch (error) { return asAccessResponse(error); }
}
