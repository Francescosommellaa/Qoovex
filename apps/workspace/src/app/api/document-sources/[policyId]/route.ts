import { asAccessResponse } from "@shared/server/access-errors";
import { updateDocumentSourcePolicy } from "@shared/server/document-source-service";

interface RouteContext { params: Promise<{ policyId: string }>; }

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { policyId } = await context.params;
    return Response.json({ policy: await updateDocumentSourcePolicy(policyId, await request.json()) });
  } catch (error) { return asAccessResponse(error); }
}
