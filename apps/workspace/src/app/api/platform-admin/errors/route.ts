import { asAccessResponse } from "@shared/server/access-errors";
import { listRuntimeErrors } from "@shared/server/platform-admin-service";

export async function GET(request: Request) {
  try {
    const search = new URL(request.url).searchParams;
    return Response.json(await listRuntimeErrors({ status: search.get("status"), source: search.get("source"), cursor: search.get("cursor"), limit: search.get("limit") }));
  } catch (error) { return asAccessResponse(error); }
}
