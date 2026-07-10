import { asAccessResponse } from "@shared/server/access-errors";
import { runDataControlJobs } from "@shared/server/data-control-job-service";

export async function POST(request: Request) {
  try {
    const configuredSecret = process.env.QOOVEX_CRON_SECRET;
    const providedSecret = request.headers.get("x-qoovex-cron-secret") ?? new URL(request.url).searchParams.get("secret");
    if (!configuredSecret || providedSecret !== configuredSecret) {
      return Response.json({ message: "Runner non disponibile." }, { status: 404 });
    }
    return Response.json(await runDataControlJobs());
  } catch (error) { return asAccessResponse(error); }
}
