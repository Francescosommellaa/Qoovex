import { expect, test } from "@playwright/test";

const authenticatedPages = ["/", "/client", "/account/notifications"] as const;
const authenticatedApis = ["/api/account/notification-preferences", "/api/client/job-sites", "/api/job-sites"] as const;

test("authentication surface remains available", async ({ page }) => {
  await page.goto("/sign-in");
  await expect(page.getByRole("heading", { name: "Bentornato", level: 1 })).toBeVisible();
});

test("canonical authenticated pages redirect to sign-in", async ({ request }) => {
  for (const path of authenticatedPages) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(307);
    expect(response.headers()["location"], path).toContain("/sign-in?callbackUrl=");
  }
});

test("canonical authenticated APIs reject anonymous access", async ({ request }) => {
  for (const path of authenticatedApis) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(401);
  }
});
