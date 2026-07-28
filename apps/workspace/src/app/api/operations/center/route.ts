import { getOperationalCenter } from "@features/operational-engine/server/operational-read-service";
import { asAccessResponse } from "@shared/server/access-errors";

export async function GET() {
  try { return Response.json(await getOperationalCenter()); }
  catch (error) { return asAccessResponse(error); }
}
