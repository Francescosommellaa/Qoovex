import { asAccessResponse } from "@shared/server/access-errors";
import { getSharedPackageItemDownload } from "@shared/server/shared-package-access-service";

interface RouteContext {
  params: Promise<{ token: string; itemId: string }>;
}

function safeAttachmentFileName(fileName: string) {
  return (fileName || "pacchetto").replace(/[\r\n"]/g, "_");
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { token, itemId } = await context.params;
    const file = await getSharedPackageItemDownload(token, itemId);
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
