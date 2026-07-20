import "server-only";

import { AccessError } from "@shared/server/access-errors";
import { listDeadlines } from "./deadline-service";
import { importCalendarEvents, listCalendarEvents } from "./calendar-event-service";

const MAX_ICAL_BYTES = 512 * 1024;

function unescapeIcal(value: string) {
  return value.replace(/\\n/gi, "\n").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\");
}

function escapeIcal(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function parseIcalDate(value: string) {
  if (/^\d{8}$/.test(value)) {
    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(4, 6)) - 1;
    const day = Number(value.slice(6, 8));
    return { date: new Date(Date.UTC(year, month, day)), allDay: true };
  }
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);
  if (!match) throw new AccessError("Data iCalendar non supportata.", 409);
  const [, year, month, day, hour, minute, second, zulu] = match;
  const date = zulu
    ? new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)))
    : new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
  return { date, allDay: false };
}

function formatIcalDate(value: Date, allDay: boolean) {
  const iso = value.toISOString();
  if (allDay) return iso.slice(0, 10).replace(/-/g, "");
  return iso.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function unfoldLines(content: string) {
  return content.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "").split("\n");
}

export async function importIcalendar(content: unknown) {
  if (typeof content !== "string" || !content.trim()) throw new AccessError("File iCalendar vuoto.", 409);
  if (Buffer.byteLength(content, "utf8") > MAX_ICAL_BYTES) throw new AccessError("Il file iCalendar supera 512 KB.", 409);
  const lines = unfoldLines(content);
  const events: Array<Record<string, unknown>> = [];
  let current: Record<string, string> | null = null;
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      current = {};
      continue;
    }
    if (line === "END:VEVENT") {
      if (current) {
        const startRaw = current.DTSTART;
        if (!current.SUMMARY || !startRaw) throw new AccessError("Evento iCalendar senza titolo o inizio.", 409);
        const start = parseIcalDate(startRaw);
        const parsedEnd = current.DTEND ? parseIcalDate(current.DTEND) : null;
        const endAt = parsedEnd?.date ?? new Date(start.date.getTime() + (start.allDay ? 86400000 : 3600000));
        events.push({
          title: unescapeIcal(current.SUMMARY),
          description: current.DESCRIPTION ? unescapeIcal(current.DESCRIPTION) : null,
          startAt: start.date.toISOString(),
          endAt: endAt.toISOString(),
          allDay: start.allDay,
          kind: "EVENT",
          priority: "MEDIUM",
          status: "PLANNED",
          externalUid: current.UID || undefined,
        });
      }
      current = null;
      continue;
    }
    if (!current) continue;
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    const rawKey = line.slice(0, separator).split(";", 1)[0];
    if (["UID", "SUMMARY", "DESCRIPTION", "DTSTART", "DTEND"].includes(rawKey)) current[rawKey] = line.slice(separator + 1);
  }
  if (!events.length) throw new AccessError("Nessun evento iCalendar importabile.", 409);
  return importCalendarEvents(events);
}

export async function exportIcalendar() {
  const now = new Date();
  const start = new Date(now.getTime() - 365 * 86400000);
  const end = new Date(now.getTime() + 365 * 86400000);
  const [events, deadlines] = await Promise.all([
    listCalendarEvents({ start: start.toISOString(), end: end.toISOString() }),
    listDeadlines(),
  ]);
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Qoovex//Calendario operativo//IT", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
  for (const event of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${escapeIcal(event.externalUid || `calendar-${event.id}@qoovex`)}`,
      `DTSTAMP:${formatIcalDate(event.updatedAt, false)}`,
      `${event.allDay ? "DTSTART;VALUE=DATE" : "DTSTART"}:${formatIcalDate(event.startAt, event.allDay)}`,
      `${event.allDay ? "DTEND;VALUE=DATE" : "DTEND"}:${formatIcalDate(event.endAt, event.allDay)}`,
      `SUMMARY:${escapeIcal(event.title)}`,
      ...(event.description ? [`DESCRIPTION:${escapeIcal(event.description)}`] : []),
      "END:VEVENT",
    );
  }
  for (const deadline of deadlines) {
    const dueDate = new Date(deadline.dueDate);
    lines.push(
      "BEGIN:VEVENT",
      `UID:deadline-${deadline.id}@qoovex`,
      `DTSTAMP:${formatIcalDate(deadline.updatedAt, false)}`,
      `DTSTART;VALUE=DATE:${formatIcalDate(dueDate, true)}`,
      `DTEND;VALUE=DATE:${formatIcalDate(new Date(dueDate.getTime() + 86400000), true)}`,
      `SUMMARY:${escapeIcal(`[Scadenza] ${deadline.title}`)}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}
