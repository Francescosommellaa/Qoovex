import { asAccessResponse } from "@shared/server/access-errors";
import { createChecklistItem, listChecklistItems } from "@shared/server/checklist-service";

interface RouteContext {
  params: Promise<{ checklistId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { checklistId } = await context.params;
    return Response.json(await listChecklistItems(checklistId));
  } catch (error) { return asAccessResponse(error); }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { checklistId } = await context.params;
    return Response.json(await createChecklistItem(checklistId, await request.json()), { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}
