import { asAccessResponse } from "@shared/server/access-errors";
import { getResourceAssignmentOptions } from "@shared/server/resource-assignment-service";

export async function GET() {
  try {
    return Response.json(await getResourceAssignmentOptions());
  } catch (error) {
    return asAccessResponse(error);
  }
}
