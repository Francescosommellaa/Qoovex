import { getContextHub } from "@shared/server/access-context-service";
import { asJobSiteApiError } from "@shared/server/job-site-api-response";

export async function GET() {
  try { return Response.json(await getContextHub()); } catch (error) { return asJobSiteApiError(error); }
}
