import { asAccessResponse } from "@shared/server/access-errors";
import { dismissNotification } from "@shared/server/notification-service";

interface RouteContext {
  params: Promise<{ notificationId: string }>;
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { notificationId } = await context.params;
    return Response.json(await dismissNotification(notificationId));
  } catch (error) {
    return asAccessResponse(error);
  }
}
