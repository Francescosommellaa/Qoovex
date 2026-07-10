import { asAccessResponse } from "@shared/server/access-errors";
import { listPlatformOrganizations } from "@shared/server/platform-admin-service";

export async function GET(request: Request) {
  try {
    const search = new URL(request.url).searchParams;
    return Response.json(await listPlatformOrganizations({ q: search.get("q"), cursor: search.get("cursor"), limit: search.get("limit") }));
  } catch (error) { return asAccessResponse(error); }
}
