import { asAccessResponse } from "@shared/server/access-errors";
import { updateRuntimeErrorStatus } from "@shared/server/platform-admin-service";

export async function PATCH(request: Request, { params }: { params: Promise<{ errorId: string }> }) {
  try {
    const [body, { errorId }] = await Promise.all([request.json() as Promise<{ status?: string; reason?: string }>, params]);
    return Response.json(await updateRuntimeErrorStatus(errorId, body));
  } catch (error) { return asAccessResponse(error); }
}
