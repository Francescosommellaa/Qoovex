import { asAccessResponse } from "@shared/server/access-errors";
import { createCalendarEvent, listCalendarEvents } from "@shared/server/calendar-event-service";

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    return Response.json(await listCalendarEvents({
      start: searchParams.get("start") ?? undefined,
      end: searchParams.get("end") ?? undefined,
      assignedToId: searchParams.get("assignedToId") ?? undefined,
    }));
  } catch (error) {
    return asAccessResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    return Response.json(await createCalendarEvent(await request.json()), { status: 201 });
  } catch (error) {
    return asAccessResponse(error);
  }
}
