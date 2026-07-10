import { asAccessResponse } from "@shared/server/access-errors";
import { createMetadataExportJob, listDataControlJobs } from "@shared/server/data-control-job-service";

export async function GET() {
  try {
    return Response.json(await listDataControlJobs());
  } catch (error) { return asAccessResponse(error); }
}

export async function POST() {
  try {
    return Response.json(await createMetadataExportJob(), { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}
