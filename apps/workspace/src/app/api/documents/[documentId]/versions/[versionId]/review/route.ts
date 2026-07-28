import { asAccessResponse } from "@shared/server/access-errors";
import { reviewDocumentVersion } from "@shared/server/document-version-service";

interface RouteContext { params: Promise<{ documentId: string; versionId: string }>; }

export async function POST(request: Request, context: RouteContext) {
  try {
    const { documentId, versionId } = await context.params;
    return Response.json({ version: await reviewDocumentVersion(documentId, versionId, await request.json()) });
  } catch (error) { return asAccessResponse(error); }
}
