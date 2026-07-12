import { asAccessResponse } from "@shared/server/access-errors";
import { isAuthorizedCronRequest } from "@shared/server/cron-auth";
import { runScheduledEmailDigest } from "@shared/server/scheduled-email-digest-service";

export async function GET(request: Request) {
  try {
    if (!isAuthorizedCronRequest(request)) {
      return Response.json({ message: "Job non disponibile." }, { status: 404 });
    }
    return Response.json(await runScheduledEmailDigest());
  } catch (error) {
    return asAccessResponse(error);
  }
}
