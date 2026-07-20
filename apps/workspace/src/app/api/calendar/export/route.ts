import { asAccessResponse } from "@shared/server/access-errors";
import { exportIcalendar } from "@shared/server/calendar-ical-service";

export async function GET() {
  try {
    return new Response(await exportIcalendar(), {
      headers: {
        "Content-Disposition": 'attachment; filename="qoovex-calendario.ics"',
        "Content-Type": "text/calendar; charset=utf-8",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return asAccessResponse(error);
  }
}
