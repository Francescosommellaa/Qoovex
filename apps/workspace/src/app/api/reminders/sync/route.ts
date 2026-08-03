import { asAccessResponse } from "@shared/server/access-errors";
import { syncOrganizationReminders } from "@shared/server/reminder-service";

export async function POST() {
  try {
    return Response.json(await syncOrganizationReminders());
  } catch (error) {
    return asAccessResponse(error);
  }
}
