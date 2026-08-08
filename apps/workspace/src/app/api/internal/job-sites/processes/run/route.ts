import { isAuthorizedCronRequest } from "@shared/server/cron-auth";
import { AccessError } from "@shared/server/access-errors";
import { runJobSiteProcesses } from "@shared/server/job-site-process-service";
import { asJobSiteApiError } from "@shared/server/job-site-api-response";
export async function POST(request: Request) { try { if (!isAuthorizedCronRequest(request)) throw new AccessError("Risorsa non disponibile.", 404); return Response.json(await runJobSiteProcesses()); } catch (error) { return asJobSiteApiError(error); } }
