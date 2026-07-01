import { asAccessResponse } from "@shared/server/access-errors";
import { removeDocumentPackageItem, updateDocumentPackageItem } from "@shared/server/document-package-service";

interface RouteContext {
  params: Promise<{ packageId: string; itemId: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { packageId, itemId } = await context.params;
    return Response.json(await updateDocumentPackageItem(packageId, itemId, await request.json()));
  } catch (error) { return asAccessResponse(error); }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { packageId, itemId } = await context.params;
    const item = await removeDocumentPackageItem(packageId, itemId);
    return Response.json({ item, removed: true });
  } catch (error) { return asAccessResponse(error); }
}
