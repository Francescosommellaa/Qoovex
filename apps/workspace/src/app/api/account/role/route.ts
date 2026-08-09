import { selectAccountRole } from "@shared/server/account-role-service";
import { asJobSiteApiError } from "@shared/server/job-site-api-response";
import type { AccountRole } from "@qoovex/types";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { role?: unknown };
    return Response.json(await selectAccountRole(body.role as AccountRole));
  } catch (error) {
    return asJobSiteApiError(error);
  }
}
