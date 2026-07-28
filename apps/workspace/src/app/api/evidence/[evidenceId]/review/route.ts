import { asAccessResponse } from "@shared/server/access-errors";
import { reviewEvidence } from "@shared/server/evidence-service";

interface RouteContext { params: Promise<{ evidenceId: string }>; }

export async function POST(request: Request, context: RouteContext) {
  try {
    const { evidenceId } = await context.params;
    return Response.json({ evidence: await reviewEvidence(evidenceId, await request.json()) });
  } catch (error) { return asAccessResponse(error); }
}
