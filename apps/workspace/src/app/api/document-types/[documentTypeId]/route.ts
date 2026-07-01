import { asAccessResponse } from "@shared/server/access-errors";
import { archiveDocumentType, updateDocumentType } from "@shared/server/document-type-service";

interface RouteContext {
  params: Promise<{ documentTypeId: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { documentTypeId } = await context.params;
    return Response.json(await updateDocumentType(documentTypeId, await request.json()));
  } catch (error) { return asAccessResponse(error); }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { documentTypeId } = await context.params;
    return Response.json(await archiveDocumentType(documentTypeId));
  } catch (error) { return asAccessResponse(error); }
}
