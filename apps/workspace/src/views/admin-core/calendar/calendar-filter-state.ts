export type CalendarFilter = "all" | "deadlines" | "tasks" | "priority";

export function hasActiveCalendarFilters(filter: CalendarFilter, participant: string) {
  return filter !== "all" || participant !== "all";
}
