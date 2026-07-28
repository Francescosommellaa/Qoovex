import { listOperationalEvents } from "@features/operational-engine/server/operational-read-service";
import { asAccessResponse } from "@shared/server/access-errors";

interface RouteContext { params: Promise<{ processId: string }>; }

export async function GET(request: Request, context: RouteContext) {
  try {
    const { processId } = await context.params;
    const params = new URL(request.url).searchParams;
    return Response.json(await listOperationalEvents(processId, { cursor: params.get("cursor") ?? undefined, take: params.get("take") ?? undefined }));
  } catch (error) { return asAccessResponse(error); }
}
