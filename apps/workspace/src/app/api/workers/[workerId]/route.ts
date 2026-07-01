import { asAccessResponse } from "@shared/server/access-errors";
import { archiveWorker, getWorker, updateWorker } from "@shared/server/worker-service";

interface RouteContext {
  params: Promise<{ workerId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { workerId } = await context.params;
    return Response.json(await getWorker(workerId));
  } catch (error) { return asAccessResponse(error); }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { workerId } = await context.params;
    return Response.json(await updateWorker(workerId, await request.json()));
  } catch (error) { return asAccessResponse(error); }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { workerId } = await context.params;
    const worker = await archiveWorker(workerId);
    return Response.json({ worker, archived: true });
  } catch (error) { return asAccessResponse(error); }
}
