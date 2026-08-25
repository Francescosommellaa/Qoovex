import { expect, test } from "@playwright/test";

import { createInputContext, mobileUrls } from "./support/context";
import { trackRuntimeErrors } from "./support/diagnostics";

test("Sirio Button keeps a disabled component group and its own current breadcrumb", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 768, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "Sirio Button breadcrumb");
  await page.goto(`${mobileUrls.sirio}/components/button`);

  const breadcrumb = page.getByRole("navigation", { name: "Percorso di navigazione" });
  await expect(breadcrumb.getByRole("link", { name: "Sirio" })).toBeVisible();
  await expect(breadcrumb.getByText("Componenti UI", { exact: true })).toHaveAttribute("aria-disabled", "true");
  await expect(breadcrumb.getByRole("link", { name: "Componenti UI" })).toHaveCount(0);
  await expect(
    breadcrumb.locator('[data-slot="breadcrumb-item"]').filter({ hasText: "Componenti UI" }),
  ).toHaveCSS("opacity", "0.5");
  await expect(breadcrumb.locator("[aria-current=page]")).toHaveText("Button");
  assertNoRuntimeErrors();
  await context.close();
});
