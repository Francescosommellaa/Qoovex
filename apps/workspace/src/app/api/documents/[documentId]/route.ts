import { asAccessResponse } from "@shared/server/access-errors";
import { archiveDocument, getDocument, updateDocument } from "@shared/server/document-service";

interface RouteContext {
  params: Promise<{ documentId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { documentId } = await context.params;
    return Response.json(await getDocument(documentId));
  } catch (error) { return asAccessResponse(error); }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { documentId } = await context.params;
    return Response.json(await updateDocument(documentId, await request.json()));
  } catch (error) { return asAccessResponse(error); }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { documentId } = await context.params;
    return Response.json(await archiveDocument(documentId));
  } catch (error) { return asAccessResponse(error); }
}
