import { resolveOperationalDecision } from "@features/operational-engine/server/operational-read-service";
import { asAccessResponse } from "@shared/server/access-errors";

interface RouteContext { params: Promise<{ decisionId: string }>; }

export async function POST(request: Request, context: RouteContext) {
  try {
    const { decisionId } = await context.params;
    return Response.json(await resolveOperationalDecision(decisionId, await request.json()));
  } catch (error) { return asAccessResponse(error); }
}
