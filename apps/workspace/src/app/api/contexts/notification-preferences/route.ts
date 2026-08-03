import { listNotificationPreferences, updateNotificationPreference } from "@shared/server/vnext-notification-preference-service";
import { asVNextApiError } from "@shared/server/vnext-api-response";

export async function GET() {
  try { return Response.json(await listNotificationPreferences()); } catch (error) { return asVNextApiError(error); }
}

export async function PUT(request: Request) {
  try { return Response.json(await updateNotificationPreference(await request.json())); } catch (error) { return asVNextApiError(error); }
}
