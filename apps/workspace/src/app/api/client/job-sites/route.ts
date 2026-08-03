import { listClientHome } from "@shared/server/vnext-job-site-service";
import { asVNextApiError } from "@shared/server/vnext-api-response";
export async function GET() { try { return Response.json(await listClientHome()); } catch (error) { return asVNextApiError(error); } }
