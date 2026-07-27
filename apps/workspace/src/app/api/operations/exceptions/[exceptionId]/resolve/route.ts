import { resolveOperationalException } from "@features/operational-engine/server/operational-read-service";
import { asAccessResponse } from "@shared/server/access-errors";

interface RouteContext { params: Promise<{ exceptionId: string }>; }

export async function POST(request: Request, context: RouteContext) {
  try {
    const { exceptionId } = await context.params;
    return Response.json(await resolveOperationalException(exceptionId, await request.json()));
  } catch (error) { return asAccessResponse(error); }
}
