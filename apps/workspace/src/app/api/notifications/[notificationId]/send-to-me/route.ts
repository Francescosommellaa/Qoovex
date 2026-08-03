import { asAccessResponse } from "@shared/server/access-errors";
import { sendSingleNotificationEmailToMe } from "@shared/server/notification-email-service";

interface RouteContext {
  params: Promise<{ notificationId: string }>;
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { notificationId } = await context.params;
    return Response.json(await sendSingleNotificationEmailToMe(notificationId));
  } catch (error) {
    return asAccessResponse(error);
  }
}
