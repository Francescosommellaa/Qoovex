import { asAccessResponse } from "@shared/server/access-errors";
import { archiveDocumentRequirement, updateDocumentRequirement } from "@shared/server/document-requirement-service";

interface RequirementRouteContext {
  params: Promise<{ requirementId: string }>;
}

export async function PATCH(request: Request, context: RequirementRouteContext) {
  try {
    const { requirementId } = await context.params;
    return Response.json(await updateDocumentRequirement(requirementId, await request.json()));
  } catch (error) { return asAccessResponse(error); }
}

export async function DELETE(_request: Request, context: RequirementRouteContext) {
  try {
    const { requirementId } = await context.params;
    return Response.json(await archiveDocumentRequirement(requirementId));
  } catch (error) { return asAccessResponse(error); }
}
