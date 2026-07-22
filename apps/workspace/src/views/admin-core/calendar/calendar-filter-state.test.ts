import { describe, expect, it } from "vitest";
import { hasActiveCalendarFilters } from "./calendar-filter-state";

describe("calendar filter state", () => {
  it("keeps the default calendar state unfiltered", () => {
    expect(hasActiveCalendarFilters("all", "all")).toBe(false);
  });

  it("detects category and participant filters", () => {
    expect(hasActiveCalendarFilters("deadlines", "all")).toBe(true);
    expect(hasActiveCalendarFilters("all", "participant-1")).toBe(true);
  });
});
