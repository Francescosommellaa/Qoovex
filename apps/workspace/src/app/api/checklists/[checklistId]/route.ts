import { asAccessResponse } from "@shared/server/access-errors";
import { archiveChecklist, getChecklist, updateChecklist } from "@shared/server/checklist-service";

interface RouteContext {
  params: Promise<{ checklistId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { checklistId } = await context.params;
    return Response.json(await getChecklist(checklistId));
  } catch (error) { return asAccessResponse(error); }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { checklistId } = await context.params;
    return Response.json(await updateChecklist(checklistId, await request.json()));
  } catch (error) { return asAccessResponse(error); }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { checklistId } = await context.params;
    const checklist = await archiveChecklist(checklistId);
    return Response.json({ checklist, archived: true });
  } catch (error) { return asAccessResponse(error); }
}
