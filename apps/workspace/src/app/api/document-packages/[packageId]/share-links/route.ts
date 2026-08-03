import { asAccessResponse } from "@shared/server/access-errors";
import { createShareLink, listShareLinks } from "@shared/server/share-link-service";

interface RouteContext {
  params: Promise<{ packageId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { packageId } = await context.params;
    return Response.json(await listShareLinks(packageId));
  } catch (error) { return asAccessResponse(error); }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { packageId } = await context.params;
    return Response.json(await createShareLink(packageId, await request.json()), { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}
