import { asAccessResponse } from "@shared/server/access-errors";
import { listNotifications } from "@shared/server/notification-service";

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    return Response.json(await listNotifications({ filter: searchParams.get("filter") ?? undefined }));
  } catch (error) {
    return asAccessResponse(error);
  }
}
