import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@shared/server/access-errors", () => ({
  AccessError: class AccessError extends Error {
    constructor(message: string, public readonly status: number) {
      super(message);
    }
  },
}));

const calendarMocks = vi.hoisted(() => ({
  importCalendarEvents: vi.fn(),
  listCalendarEvents: vi.fn(),
}));
const deadlineMocks = vi.hoisted(() => ({ listDeadlines: vi.fn() }));

vi.mock("./calendar-event-service", () => calendarMocks);
vi.mock("./deadline-service", () => deadlineMocks);

import { exportIcalendar, importIcalendar } from "./calendar-ical-service";

describe("calendar-ical-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    calendarMocks.importCalendarEvents.mockResolvedValue({ imported: 1, skipped: 0 });
    calendarMocks.listCalendarEvents.mockResolvedValue([]);
    deadlineMocks.listDeadlines.mockResolvedValue([]);
  });

  it("imports timed and folded iCalendar fields", async () => {
    const result = await importIcalendar([
      "BEGIN:VCALENDAR",
      "BEGIN:VEVENT",
      "UID:external-1",
      "DTSTART:20260720T090000Z",
      "DTEND:20260720T103000Z",
      "SUMMARY:Verifica documenti",
      "DESCRIPTION:Riga uno\\n",
      " riga due",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n"));

    expect(result).toEqual({ imported: 1, skipped: 0 });
    expect(calendarMocks.importCalendarEvents).toHaveBeenCalledWith([expect.objectContaining({
      title: "Verifica documenti",
      description: "Riga uno\nriga due",
      externalUid: "external-1",
      startAt: "2026-07-20T09:00:00.000Z",
      endAt: "2026-07-20T10:30:00.000Z",
      allDay: false,
    })]);
  });

  it("uses an exclusive next-day end for all-day events without DTEND", async () => {
    await importIcalendar("BEGIN:VCALENDAR\nBEGIN:VEVENT\nDTSTART;VALUE=DATE:20260720\nSUMMARY:Scadenza\nEND:VEVENT\nEND:VCALENDAR");

    expect(calendarMocks.importCalendarEvents).toHaveBeenCalledWith([expect.objectContaining({
      startAt: "2026-07-20T00:00:00.000Z",
      endAt: "2026-07-21T00:00:00.000Z",
      allDay: true,
    })]);
  });

  it("rejects payloads without importable events", async () => {
    await expect(importIcalendar("https://calendar.example.test/feed.ics")).rejects.toThrow("Nessun evento iCalendar importabile");
  });

  it("exports Qoovex events and deadlines as an iCalendar feed", async () => {
    calendarMocks.listCalendarEvents.mockResolvedValue([{
      id: "event-1",
      externalUid: null,
      title: "Riunione, sicurezza",
      description: "Prima riga\nSeconda riga",
      startAt: new Date("2026-07-20T09:00:00.000Z"),
      endAt: new Date("2026-07-20T10:00:00.000Z"),
      updatedAt: new Date("2026-07-19T12:00:00.000Z"),
      allDay: false,
    }]);
    deadlineMocks.listDeadlines.mockResolvedValue([{
      id: "deadline-1",
      title: "Attestazione",
      dueDate: new Date("2026-07-22T00:00:00.000Z"),
      updatedAt: new Date("2026-07-19T12:00:00.000Z"),
    }]);

    const content = await exportIcalendar();

    expect(content).toContain("UID:calendar-event-1@qoovex");
    expect(content).toContain("SUMMARY:Riunione\\, sicurezza");
    expect(content).toContain("DESCRIPTION:Prima riga\\nSeconda riga");
    expect(content).toContain("UID:deadline-deadline-1@qoovex");
    expect(content).toContain("SUMMARY:[Scadenza] Attestazione");
    expect(content).toMatch(/END:VCALENDAR\r\n$/);
  });
});
