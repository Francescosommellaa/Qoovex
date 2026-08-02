import { expect, test } from "@playwright/test";

const removedPages = ["/calendar", "/deadlines", "/checklists", "/document-packages", "/operations/removed", "/shared/document-packages/removed"] as const;
const removedApis = ["/api/calendar/events", "/api/deadlines", "/api/checklists", "/api/document-packages", "/api/document-sources", "/api/requests", "/api/context-messages", "/api/context-timeline", "/api/search", "/api/operations/processes"] as const;

test("authentication surface remains available", async ({ page }) => {
  await page.goto("/sign-in");
  await expect(page.getByRole("heading", { name: /accedi/i })).toBeVisible();
});

test("removed legacy pages return 404 without redirects", async ({ request }) => {
  for (const path of removedPages) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(404);
  }
});

test("removed legacy APIs return 404", async ({ request }) => {
  for (const path of removedApis) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(404);
  }
});
