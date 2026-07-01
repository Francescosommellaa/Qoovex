import { asAccessResponse } from "@shared/server/access-errors";
import { getDocumentVersionDownload } from "@shared/server/document-version-service";

interface RouteContext {
  params: Promise<{ documentId: string; versionId: string }>;
}

function safeAttachmentFileName(fileName: string) {
  return (fileName || "documento").replace(/[\r\n"]/g, "_");
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { documentId, versionId } = await context.params;
    const file = await getDocumentVersionDownload(documentId, versionId);
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
