import { asAccessResponse } from "@shared/server/access-errors";
import { sendNotificationEmailDigestToMe } from "@shared/server/notification-email-service";

export async function POST() {
  try {
    return Response.json(await sendNotificationEmailDigestToMe());
  } catch (error) {
    return asAccessResponse(error);
  }
}
