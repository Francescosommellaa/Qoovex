import { asAccessResponse } from "@shared/server/access-errors";
import { archiveChecklistItem, updateChecklistItem } from "@shared/server/checklist-service";

interface RouteContext {
  params: Promise<{ checklistId: string; itemId: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { checklistId, itemId } = await context.params;
    return Response.json(await updateChecklistItem(checklistId, itemId, await request.json()));
  } catch (error) { return asAccessResponse(error); }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { checklistId, itemId } = await context.params;
    const item = await archiveChecklistItem(checklistId, itemId);
    return Response.json({ item, archived: true });
  } catch (error) { return asAccessResponse(error); }
}
