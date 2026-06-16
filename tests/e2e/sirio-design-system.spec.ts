import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const isDesktop = (projectName: string) => projectName.endsWith("-1440");

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3002/");
});

test("publishes Measured Heat foundations without legacy contract text", async ({
  page,
}) => {
  await expect(
    page.getByRole("heading", {
      name: "Finally, everything is in its place.",
    }),
  ).toBeVisible();
  await expect(page.getByText("Measured Heat Foundations v0")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Quiet Authority" }),
  ).toBeVisible();
  await expect(page.getByText("Kitchen-stress test")).toBeVisible();
  await expect(page.getByText("Stable v0.5")).toHaveCount(0);
  await expect(page.getByText("Crystal")).toHaveCount(0);
});

test("uses the Sirio identity and styles-only UI package tokens", async ({
  page,
}) => {
  await expect(page.locator(".sirio-brand img")).toHaveAttribute(
    "src",
    "/logo-icon/sirio-icon.svg",
  );

  const details = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    document.documentElement.setAttribute("data-qv-mode", "kitchen");
    const kitchenHeight = getComputedStyle(
      document.documentElement,
    ).getPropertyValue("--qv-control-height");
    document.documentElement.setAttribute("data-qv-mode", "review");
    const reviewPrimary = getComputedStyle(
      document.documentElement,
    ).getPropertyValue("--qv-action-primary-bg");
    document.documentElement.removeAttribute("data-qv-mode");

    return {
      action: styles.getPropertyValue("--qv-action-primary-bg").trim(),
      kitchenHeight: kitchenHeight.trim(),
      reviewPrimary: reviewPrimary.trim(),
    };
  });

  expect(details.action).toBe("#d96b2b");
  expect(details.kitchenHeight).toBe("56px");
  expect(details.reviewPrimary).toBe("#111");
});

test("documents semantic palette, operating modes and state language", async ({
  page,
}) => {
  for (const text of [
    "Porcelain",
    "Graphite",
    "Heat",
    "Planning",
    "Preparation",
    "Service",
    "Review",
    "Allergen critical",
    "Ready for service",
  ]) {
    await expect(page.getByText(text, { exact: true })).toBeVisible();
  }
});

test("page has no serious or critical Axe violations", async ({
  page,
}, testInfo) => {
  test.skip(!isDesktop(testInfo.project.name));

  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter(({ impact }) =>
    ["critical", "serious"].includes(impact ?? ""),
  );
  expect(blocking).toEqual([]);
});

test("layout has no horizontal overflow and survives 200 percent reflow", async ({
  page,
}, testInfo) => {
  const normal = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(normal.scroll).toBeLessThanOrEqual(normal.client);

  test.skip(!isDesktop(testInfo.project.name));
  await page.setViewportSize({ width: 720, height: 900 });
  await page.reload();
  const zoomed = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(zoomed.scroll).toBeLessThanOrEqual(zoomed.client);
});

test("forced colors preserves visible boundaries", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-1440");
  await page.emulateMedia({ forcedColors: "active" });
  await page.reload();

  await expect(page.locator(".sirio-instrument")).toHaveCSS(
    "border-top-style",
    "solid",
  );
  await expect(page.locator(".sirio-instrument")).toHaveCSS(
    "box-shadow",
    "none",
  );
});
