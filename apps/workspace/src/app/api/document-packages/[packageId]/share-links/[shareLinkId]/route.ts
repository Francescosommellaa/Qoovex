import { asAccessResponse } from "@shared/server/access-errors";
import { revokeShareLink } from "@shared/server/share-link-service";

interface RouteContext {
  params: Promise<{ packageId: string; shareLinkId: string }>;
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { packageId, shareLinkId } = await context.params;
    const result = await revokeShareLink(packageId, shareLinkId);
    return Response.json({ ...result, revoked: true });
  } catch (error) { return asAccessResponse(error); }
}
