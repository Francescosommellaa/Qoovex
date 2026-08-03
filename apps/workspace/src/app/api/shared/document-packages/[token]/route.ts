import { asAccessResponse } from "@shared/server/access-errors";
import { getSharedDocumentPackage } from "@shared/server/shared-package-access-service";

interface RouteContext {
  params: Promise<{ token: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { token } = await context.params;
    return Response.json(await getSharedDocumentPackage(token));
  } catch (error) { return asAccessResponse(error); }
}
