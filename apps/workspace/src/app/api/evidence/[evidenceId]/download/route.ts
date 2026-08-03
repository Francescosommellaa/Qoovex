import { asAccessResponse } from "@shared/server/access-errors";
import { getEvidenceDownload } from "@shared/server/evidence-service";

interface RouteContext {
  params: Promise<{ evidenceId: string }>;
}

function safeAttachmentFileName(fileName: string) {
  return (fileName || "prova").replace(/[\r\n"]/g, "_");
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { evidenceId } = await context.params;
    const file = await getEvidenceDownload(evidenceId);
    return new Response(file.stream, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="${safeAttachmentFileName(file.originalFileName)}"`,
        "Content-Length": String(file.size),
        "Content-Type": file.mimeType,
      },
    });
  } catch (error) { return asAccessResponse(error); }
}
