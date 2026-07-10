import { asAccessResponse } from "@shared/server/access-errors";
import { listPlatformUsers } from "@shared/server/platform-admin-service";

export async function GET(request: Request) {
  try {
    const search = new URL(request.url).searchParams;
    return Response.json(await listPlatformUsers({ q: search.get("q"), status: search.get("status"), cursor: search.get("cursor"), limit: search.get("limit") }));
  } catch (error) { return asAccessResponse(error); }
}
