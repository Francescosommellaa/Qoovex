import { describe, expect, it } from "vitest";
import {
  ATTENTION_DOCUMENT_STATUSES,
  parseChecklistQueueView,
  parseDocumentPackageQueueView,
  parseDocumentQueueView,
  parseEvidenceSort,
  parseWorkspaceListPage,
  WORKSPACE_LIST_PAGE_SIZE,
} from "./workspace-list-filters";

describe("workspace list filters", () => {
  it("accepts only the canonical filtered Favorite destinations", () => {
    expect(parseDocumentQueueView("attention")).toBe("attention");
    expect(parseChecklistQueueView("open")).toBe("open");
    expect(parseEvidenceSort("recent")).toBe("recent");
    expect(parseDocumentPackageQueueView("ready")).toBe("ready");
  });

  it("falls back to the complete view for invalid parameters", () => {
    expect(parseDocumentQueueView("all")).toBeUndefined();
    expect(parseChecklistQueueView(["open"])).toBeUndefined();
    expect(parseEvidenceSort("oldest")).toBeUndefined();
    expect(parseDocumentPackageQueueView("shared-only")).toBeUndefined();
  });

  it("keeps bounded pagination and the complete attention status set", () => {
    expect(parseWorkspaceListPage("2")).toBe(2);
    expect(parseWorkspaceListPage("0")).toBe(1);
    expect(parseWorkspaceListPage("10001")).toBe(1);
    expect(WORKSPACE_LIST_PAGE_SIZE).toBe(50);
    expect(ATTENTION_DOCUMENT_STATUSES).toEqual(["MISSING", "EXPIRED", "EXPIRING_SOON", "TO_REVIEW"]);
  });
});
