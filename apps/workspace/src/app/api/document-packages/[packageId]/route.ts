import { asAccessResponse } from "@shared/server/access-errors";
import { archiveDocumentPackage, getDocumentPackage, updateDocumentPackage } from "@shared/server/document-package-service";

interface RouteContext {
  params: Promise<{ packageId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { packageId } = await context.params;
    return Response.json(await getDocumentPackage(packageId));
  } catch (error) { return asAccessResponse(error); }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { packageId } = await context.params;
    return Response.json(await updateDocumentPackage(packageId, await request.json()));
  } catch (error) { return asAccessResponse(error); }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { packageId } = await context.params;
    const documentPackage = await archiveDocumentPackage(packageId);
    return Response.json({ package: documentPackage, archived: true });
  } catch (error) { return asAccessResponse(error); }
}
