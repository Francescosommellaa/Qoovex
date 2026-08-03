import { asAccessResponse } from "@shared/server/access-errors";
import { archiveDocumentVersion } from "@shared/server/document-version-service";

interface RouteContext {
  params: Promise<{ documentId: string; versionId: string }>;
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { documentId, versionId } = await context.params;
    const version = await archiveDocumentVersion(documentId, versionId);
    return Response.json({ version, archived: true });
  } catch (error) { return asAccessResponse(error); }
}
