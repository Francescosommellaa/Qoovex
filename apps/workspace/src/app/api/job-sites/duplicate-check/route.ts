import { asAccessResponse } from "@shared/server/access-errors";
import { findJobSiteDuplicates } from "@shared/server/job-site-service";

export async function POST(request: Request) {
  try {
    return Response.json({ matches: await findJobSiteDuplicates(await request.json()) });
  } catch (error) {
    return asAccessResponse(error);
  }
}
