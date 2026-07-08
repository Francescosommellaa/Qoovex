import { asAccessResponse } from "@shared/server/access-errors";
import { getDataRetentionOverview } from "@shared/server/data-retention-service";

export async function GET() {
  try {
    return Response.json(await getDataRetentionOverview(), { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return asAccessResponse(error);
  }
}
