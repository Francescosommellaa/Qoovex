import { asAccessResponse } from "@shared/server/access-errors";
import { archiveDeadline, updateDeadline } from "@shared/server/deadline-service";

interface RouteContext {
  params: Promise<{ deadlineId: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { deadlineId } = await context.params;
    return Response.json(await updateDeadline(deadlineId, await request.json()));
  } catch (error) { return asAccessResponse(error); }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { deadlineId } = await context.params;
    return Response.json(await archiveDeadline(deadlineId));
  } catch (error) { return asAccessResponse(error); }
}
