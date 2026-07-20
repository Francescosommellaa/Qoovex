import { asAccessResponse } from "@shared/server/access-errors";
import { importIcalendar } from "@shared/server/calendar-ical-service";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("text/calendar") && !contentType.includes("text/plain")) {
      return Response.json({ error: "Formato iCalendar richiesto." }, { status: 415 });
    }
    return Response.json(await importIcalendar(await request.text()));
  } catch (error) {
    return asAccessResponse(error);
  }
}
