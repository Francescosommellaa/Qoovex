import { asAccessResponse } from "@shared/server/access-errors";
import { getDataInventory } from "@shared/server/data-inventory-service";

export async function GET() {
  try {
    return Response.json(await getDataInventory(), { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return asAccessResponse(error);
  }
}
