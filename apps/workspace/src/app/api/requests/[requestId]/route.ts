import { asAccessResponse } from "@shared/server/access-errors";
import { updateOperationalRequest } from "@shared/server/operational-request-service";

interface RouteContext { params: Promise<{ requestId: string }>; }

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { requestId } = await context.params;
    return Response.json({ request: await updateOperationalRequest(requestId, await request.json()) });
  } catch (error) { return asAccessResponse(error); }
}
