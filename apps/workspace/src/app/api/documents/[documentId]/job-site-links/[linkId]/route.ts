import { asAccessResponse } from "@shared/server/access-errors";
import { archiveDocumentJobSiteLink } from "@shared/server/document-job-site-link-service";

interface RouteContext { params: Promise<{ documentId: string; linkId: string }>; }

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { documentId, linkId } = await context.params;
    const input = request.headers.get("content-type")?.includes("application/json") ? await request.json() : {};
    return Response.json(await archiveDocumentJobSiteLink(documentId, linkId, input));
  } catch (error) { return asAccessResponse(error); }
}
