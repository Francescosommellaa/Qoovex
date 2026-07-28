import { getOperationalProcess } from "@features/operational-engine/server/operational-read-service";
import { asAccessResponse } from "@shared/server/access-errors";

interface RouteContext { params: Promise<{ processId: string }>; }

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { processId } = await context.params;
    return Response.json(await getOperationalProcess(processId));
  } catch (error) { return asAccessResponse(error); }
}
