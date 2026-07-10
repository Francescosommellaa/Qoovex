import { asAccessResponse } from "@shared/server/access-errors";
import { getDataExportJobBlob } from "@shared/server/data-control-job-service";

interface ExportJobRouteContext {
  params: Promise<{ jobId: string }>;
}

export async function GET(_request: Request, context: ExportJobRouteContext) {
  try {
    const { jobId } = await context.params;
    const { blob, fileName } = await getDataExportJobBlob(jobId);
    return new Response(blob.stream, {
      headers: {
        "Content-Type": blob.contentType,
        "Content-Length": String(blob.size),
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) { return asAccessResponse(error); }
}
