import { asAccessResponse, AccessError } from "@shared/server/access-errors";
import { runScheduledEmailDigest } from "@shared/server/scheduled-email-digest-service";

const CRON_SECRET_HEADER = "x-qoovex-cron-secret";

export async function POST(request: Request) {
  try {
    const configuredSecret = process.env.QOOVEX_CRON_SECRET?.trim();
    const providedSecret = request.headers.get(CRON_SECRET_HEADER)?.trim();
    if (!configuredSecret || !providedSecret || providedSecret !== configuredSecret) {
      throw new AccessError("Job non disponibile.", 403);
    }
    return Response.json(await runScheduledEmailDigest());
  } catch (error) {
    return asAccessResponse(error);
  }
}
