import { asAccessResponse } from "@shared/server/access-errors";
import { getSharedDocumentPackage } from "@shared/server/shared-package-access-service";

interface RouteContext {
  params: Promise<{ token: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { token } = await context.params;
    return Response.json(await getSharedDocumentPackage(token), { headers: {
      "Cache-Control": "private, no-store",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    } });
  } catch (error) { return asAccessResponse(error); }
}
