import { listNotificationPreferences, updateNotificationPreference } from "@shared/server/job-site-notification-preference-service";
import { asJobSiteApiError } from "@shared/server/job-site-api-response";

export async function GET() {
  try { return Response.json(await listNotificationPreferences()); } catch (error) { return asJobSiteApiError(error); }
}

export async function PUT(request: Request) {
  try { return Response.json(await updateNotificationPreference(await request.json())); } catch (error) { return asJobSiteApiError(error); }
}
