import { asAccessResponse } from "@shared/server/access-errors";
import { listProductAuditEvents } from "@shared/server/product-audit-service";

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    return Response.json(await listProductAuditEvents({
      action: searchParams.get("action") ?? undefined,
      entityType: searchParams.get("entityType") ?? undefined,
      outcome: searchParams.get("outcome") ?? undefined,
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
    }));
  } catch (error) {
    return asAccessResponse(error);
  }
}
