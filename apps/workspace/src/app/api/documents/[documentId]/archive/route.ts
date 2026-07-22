import { asAccessResponse } from "@shared/server/access-errors";
import { permanentlyDeleteArchivedDocument, restoreDocument } from "@shared/server/document-service";

interface RouteContext {
  params: Promise<{ documentId: string }>;
}

export async function PATCH(_request: Request, context: RouteContext) {
  try {
    const { documentId } = await context.params;
    return Response.json(await restoreDocument(documentId));
  } catch (error) {
    return asAccessResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { documentId } = await context.params;
    return Response.json(await permanentlyDeleteArchivedDocument(documentId));
  } catch (error) {
    return asAccessResponse(error);
  }
}
