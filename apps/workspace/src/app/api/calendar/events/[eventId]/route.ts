import { asAccessResponse } from "@shared/server/access-errors";
import { archiveCalendarEvent, updateCalendarEvent } from "@shared/server/calendar-event-service";

interface RouteContext {
  params: Promise<{ eventId: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { eventId } = await context.params;
    return Response.json(await updateCalendarEvent(eventId, await request.json()));
  } catch (error) {
    return asAccessResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { eventId } = await context.params;
    return Response.json(await archiveCalendarEvent(eventId));
  } catch (error) {
    return asAccessResponse(error);
  }
}
