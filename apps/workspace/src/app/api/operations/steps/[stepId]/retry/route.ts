import { retryOperationalStep } from "@features/operational-engine/server/operational-read-service";
import { asAccessResponse } from "@shared/server/access-errors";

interface RouteContext { params: Promise<{ stepId: string }>; }

export async function POST(request: Request, context: RouteContext) {
  try {
    const { stepId } = await context.params;
    return Response.json(await retryOperationalStep(stepId, await request.json()));
  } catch (error) { return asAccessResponse(error); }
}
