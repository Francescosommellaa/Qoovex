import { asAccessResponse } from "@shared/server/access-errors";
import { previewNotificationEmailDigest } from "@shared/server/notification-email-service";

export async function GET() {
  try {
    return Response.json(await previewNotificationEmailDigest());
  } catch (error) {
    return asAccessResponse(error);
  }
}
