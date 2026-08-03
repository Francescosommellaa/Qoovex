import { asAccessResponse } from "@shared/server/access-errors";
import { getDashboardData } from "@shared/server/dashboard-service";

export async function GET() {
  try {
    return Response.json(await getDashboardData());
  } catch (error) {
    return asAccessResponse(error);
  }
}
