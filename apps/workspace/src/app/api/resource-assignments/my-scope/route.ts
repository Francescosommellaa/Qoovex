import { asAccessResponse } from "@shared/server/access-errors";
import { getMyResourceScope } from "@shared/server/resource-assignment-service";

export async function GET() {
  try {
    return Response.json(await getMyResourceScope());
  } catch (error) { return asAccessResponse(error); }
}
