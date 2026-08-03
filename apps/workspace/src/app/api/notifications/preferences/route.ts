import { asAccessResponse } from "@shared/server/access-errors";
import { getNotificationPreference, updateNotificationPreference } from "@shared/server/notification-preference-service";

export async function GET() {
  try {
    return Response.json(await getNotificationPreference());
  } catch (error) {
    return asAccessResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    return Response.json(await updateNotificationPreference(await request.json()));
  } catch (error) {
    return asAccessResponse(error);
  }
}
