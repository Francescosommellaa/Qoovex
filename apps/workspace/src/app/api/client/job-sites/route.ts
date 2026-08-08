import { listClientHome } from "@shared/server/job-site-lifecycle-service";
import { asJobSiteApiError } from "@shared/server/job-site-api-response";
export async function GET() { try { return Response.json(await listClientHome()); } catch (error) { return asJobSiteApiError(error); } }
