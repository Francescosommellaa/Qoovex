import { asAccessResponse } from "@shared/server/access-errors";
import { listNotificationEmailDeliveries } from "@shared/server/notification-preference-service";

export async function GET() {
  try {
    return Response.json(await listNotificationEmailDeliveries());
  } catch (error) {
    return asAccessResponse(error);
  }
}
