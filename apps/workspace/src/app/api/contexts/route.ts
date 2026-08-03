import { getContextHub } from "@shared/server/access-context-service";
import { asVNextApiError } from "@shared/server/vnext-api-response";

export async function GET() {
  try { return Response.json(await getContextHub()); } catch (error) { return asVNextApiError(error); }
}
