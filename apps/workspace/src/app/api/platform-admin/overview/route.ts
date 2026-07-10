import { asAccessResponse } from "@shared/server/access-errors";
import { getPlatformAdminOverview } from "@shared/server/platform-admin-service";

export async function GET() {
  try { return Response.json(await getPlatformAdminOverview()); }
  catch (error) { return asAccessResponse(error); }
}
