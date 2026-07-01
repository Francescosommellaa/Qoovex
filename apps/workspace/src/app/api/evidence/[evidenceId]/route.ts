import { asAccessResponse } from "@shared/server/access-errors";
import { archiveEvidence, getEvidence, updateEvidence } from "@shared/server/evidence-service";

interface RouteContext {
  params: Promise<{ evidenceId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { evidenceId } = await context.params;
    return Response.json(await getEvidence(evidenceId));
  } catch (error) { return asAccessResponse(error); }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { evidenceId } = await context.params;
    return Response.json(await updateEvidence(evidenceId, await request.json()));
  } catch (error) { return asAccessResponse(error); }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { evidenceId } = await context.params;
    const evidence = await archiveEvidence(evidenceId);
    return Response.json({ evidence, archived: true });
  } catch (error) { return asAccessResponse(error); }
}
