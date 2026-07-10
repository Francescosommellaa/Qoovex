import { asAccessResponse } from "@shared/server/access-errors";
import { getBlobOrphanDryRun } from "@shared/server/data-control-job-service";

export async function GET() {
  try {
    return Response.json(await getBlobOrphanDryRun());
  } catch (error) { return asAccessResponse(error); }
}
