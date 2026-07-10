import { asAccessResponse } from "@shared/server/access-errors";
import { createBlobOrphanCleanupJob } from "@shared/server/data-control-job-service";

export async function POST() {
  try {
    return Response.json(await createBlobOrphanCleanupJob(), { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}
