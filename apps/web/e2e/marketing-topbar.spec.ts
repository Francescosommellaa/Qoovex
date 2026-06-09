import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000/home", {
    waitUntil: "domcontentloaded",
  });
  await page.getByTestId("site-topbar").waitFor();
});

test("marketing topbar switches from expanded to compact without hiding", async ({
  page,
}) => {
  const width = page.viewportSize()?.width ?? 1440;
  const topbar = page.getByTestId("site-topbar");
  const bar = topbar.locator("div").first();

  await expect(topbar).toHaveAttribute("data-state", "expanded");
  await expect(topbar).toBeVisible();

  const initialBox = await bar.boundingBox();
  expect(initialBox).not.toBeNull();
  expect(initialBox?.height).toBeGreaterThanOrEqual(width >= 1024 ? 41 : 52);

  await page.evaluate(() => window.scrollTo(0, 160));
  await expect(topbar).toHaveAttribute("data-state", "compact");
  await page.waitForTimeout(300);
  await expect(topbar).toBeVisible();

  const compactBox = await bar.boundingBox();
  expect(compactBox).not.toBeNull();
  if (width >= 1024) {
    expect(compactBox?.width).toBeLessThanOrEqual(881);
    expect(compactBox?.height).toBeGreaterThanOrEqual(51);
    expect(compactBox?.height).toBeLessThanOrEqual(53);
  } else {
    expect(compactBox?.x).toBeGreaterThanOrEqual(11);
    expect(compactBox?.height).toBeGreaterThanOrEqual(49);
    expect(compactBox?.height).toBeLessThanOrEqual(52);
  }
});

test("desktop mega menus are exclusive and restore focus on Escape", async ({
  page,
}) => {
  test.skip((page.viewportSize()?.width ?? 0) < 1024);

  const productTrigger = page.getByRole("button", { name: "Prodotto" });
  const solutionsTrigger = page.getByRole("button", { name: "Soluzioni" });
  const resourcesTrigger = page.getByRole("button", { name: "Risorse" });
  const productMenu = page.getByTestId("site-menu-product");
  const solutionsMenu = page.getByTestId("site-menu-solutions");
  const resourcesMenu = page.getByTestId("site-menu-resources");

  await productTrigger.click();
  await expect(productMenu).toHaveAttribute("data-open", "true");
  await expect(productTrigger).toHaveAttribute("aria-expanded", "true");

  await solutionsTrigger.click();
  await expect(solutionsMenu).toHaveAttribute("data-open", "true");
  await expect(productMenu).not.toHaveAttribute("data-open", "true");

  await resourcesTrigger.click();
  await expect(resourcesMenu).toHaveAttribute("data-open", "true");
  await expect(solutionsMenu).not.toHaveAttribute("data-open", "true");

  await page.keyboard.press("Escape");
  await expect(resourcesMenu).not.toHaveAttribute("data-open", "true");
  await expect(resourcesTrigger).toBeFocused();

  await productTrigger.focus();
  await page.keyboard.press("ArrowDown");
  await expect(productMenu.getByRole("link").first()).toBeFocused();

  await page.mouse.click(8, 300);
  await expect(productMenu).not.toHaveAttribute("data-open", "true");
});

test("topbar adopts the dark contextual tone", async ({ page }) => {
  await page.evaluate(() => {
    document.body.setAttribute("data-nav-tone", "dark");
    window.dispatchEvent(new Event("scroll"));
  });

  await expect(page.getByTestId("site-topbar")).toHaveAttribute(
    "data-tone",
    "dark",
  );
});

test("mobile menu locks scroll, exposes accordions and returns focus", async ({
  page,
}) => {
  test.skip((page.viewportSize()?.width ?? 0) >= 1024);

  const openButton = page.getByRole("button", { name: "Apri menu" });
  await openButton.click();

  const panel = page.getByTestId("site-mobile-menu");
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("button", { name: "Chiudi menu" })).toBeFocused();
  await expect
    .poll(() => page.evaluate(() => document.body.style.overflow))
    .toBe("hidden");

  const productAccordion = panel.getByRole("button", { name: "Prodotto" });
  const resourcesAccordion = panel.getByRole("button", { name: "Risorse" });
  await expect(productAccordion).toHaveAttribute("aria-expanded", "true");

  await resourcesAccordion.click();
  await expect(resourcesAccordion).toHaveAttribute("aria-expanded", "true");
  await expect(productAccordion).toHaveAttribute("aria-expanded", "false");
  await expect(panel.getByText("Guide operative")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(openButton).toBeFocused();
  await expect
    .poll(() => page.evaluate(() => document.body.style.overflow))
    .toBe("");
});

test("topbar transitions respect reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload({ waitUntil: "domcontentloaded" });

  const duration = await page
    .getByTestId("site-topbar")
    .locator("div")
    .first()
    .evaluate((element) => getComputedStyle(element).transitionDuration);

  expect(["1e-05s", "0.00001s"]).toContain(duration);
});
