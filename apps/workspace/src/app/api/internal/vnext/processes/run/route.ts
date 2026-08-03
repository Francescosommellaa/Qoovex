import { isAuthorizedCronRequest } from "@shared/server/cron-auth";
import { AccessError } from "@shared/server/access-errors";
import { runVNextProcesses } from "@shared/server/vnext-process-service";
import { asVNextApiError } from "@shared/server/vnext-api-response";
export async function POST(request: Request) { try { if (!isAuthorizedCronRequest(request)) throw new AccessError("Risorsa non disponibile.", 404); return Response.json(await runVNextProcesses()); } catch (error) { return asVNextApiError(error); } }
