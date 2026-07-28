import { asAccessResponse } from "@shared/server/access-errors";
import { listShareLinks } from "@shared/server/share-link-service";

interface RouteContext {
  params: Promise<{ packageId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { packageId } = await context.params;
    return Response.json(await listShareLinks(packageId));
  } catch (error) { return asAccessResponse(error); }
}
