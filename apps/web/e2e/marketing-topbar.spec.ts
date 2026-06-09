import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

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
  const bar = page.getByTestId("site-topbar-bar");

  await expect(topbar).toHaveAttribute("data-state", "expanded");
  await expect(topbar).toBeVisible();

  const initialBox = await bar.boundingBox();
  expect(initialBox).not.toBeNull();
  expect(initialBox?.height).toBeGreaterThanOrEqual(41);

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
    expect(compactBox?.height).toBeGreaterThanOrEqual(53);
    expect(compactBox?.height).toBeLessThanOrEqual(55);
  }
});

test("mobile expanded topbar is borderless and compact glass is opaque", async ({
  page,
}) => {
  test.skip((page.viewportSize()?.width ?? 0) >= 1024);

  const bar = page.getByTestId("site-topbar-bar");
  const expanded = await bar.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      background: style.backgroundColor,
      border: style.borderTopColor,
      radius: style.borderRadius,
    };
  });

  expect(expanded.background).toBe("rgba(0, 0, 0, 0)");
  expect(expanded.border).toBe("rgba(0, 0, 0, 0)");
  expect(expanded.radius).toBe("0px");

  await page.evaluate(() => window.scrollTo(0, 160));
  await expect(page.getByTestId("site-topbar")).toHaveAttribute(
    "data-state",
    "compact",
  );
  await page.waitForTimeout(300);

  const compact = await bar.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      background: style.backgroundColor,
      backdropFilter:
        style.backdropFilter ||
        style.getPropertyValue("-webkit-backdrop-filter"),
    };
  });

  expect(compact.background).toContain("0.92");
  expect(compact.backdropFilter).toContain("blur(15px)");
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

test("desktop compact bar and mega menu render real backdrop blur", async ({
  page,
}) => {
  test.skip((page.viewportSize()?.width ?? 0) < 1024);

  await page.evaluate(() => window.scrollTo(0, 160));
  const bar = page.getByTestId("site-topbar-bar");
  const veil = page.getByTestId("site-topbar-veil");
  await expect(page.getByTestId("site-topbar")).toHaveAttribute(
    "data-state",
    "compact",
  );
  await page.waitForTimeout(300);

  await expect
    .poll(() =>
      bar.evaluate((element) => getComputedStyle(element).backdropFilter),
    )
    .toContain("blur(15px)");
  await expect
    .poll(() =>
      veil.evaluate((element) => ({
        blur: getComputedStyle(element).backdropFilter,
        opacity: getComputedStyle(element).opacity,
      })),
    )
    .toEqual({ blur: "blur(3px)", opacity: "1" });

  await page.getByRole("button", { name: "Prodotto" }).click();
  const menu = page.getByTestId("site-menu-product");
  await expect(menu).toHaveAttribute("data-open", "true");
  await expect
    .poll(() =>
      menu.evaluate((element) => getComputedStyle(element).backdropFilter),
    )
    .toContain("blur(15px)");
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

test("topbar detects an unannotated dark rendered surface", async ({ page }) => {
  await page.evaluate(() => {
    const surface = document.createElement("div");
    surface.id = "topbar-tone-fixture";
    Object.assign(surface.style, {
      position: "fixed",
      inset: "0",
      zIndex: "199",
      background: "#111111",
    });
    document.body.append(surface);
    window.dispatchEvent(new Event("scroll"));
  });

  const topbar = page.getByTestId("site-topbar");
  await expect(topbar).toHaveAttribute("data-tone", "dark");

  const bar = page.getByTestId("site-topbar-bar");
  const menuButton = page.getByRole("button", { name: "Apri menu" });
  await expect
    .poll(() =>
      bar.evaluate((element) => {
        const channels = getComputedStyle(element).color.match(/\d+/g);
        return channels
          ? channels.slice(0, 3).every((channel) => Number(channel) >= 245)
          : false;
      }),
    )
    .toBe(true);

  if ((page.viewportSize()?.width ?? 0) < 1024) {
    await expect(menuButton).toBeVisible();
    await expect
      .poll(() =>
        menuButton.evaluate((element) => {
          const channels = getComputedStyle(element).color.match(/\d+/g);
          return channels
            ? channels.slice(0, 3).every((channel) => Number(channel) >= 245)
            : false;
        }),
      )
      .toBe(true);
  }
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
    .getByTestId("site-topbar-bar")
    .evaluate((element) => getComputedStyle(element).transitionDuration);

  expect(["1e-05s", "0.00001s"]).toContain(duration);
});

test("topbar and navigation have no serious accessibility violations", async ({
  page,
}) => {
  const width = page.viewportSize()?.width ?? 1440;

  if (width < 1024) {
    await page.getByRole("button", { name: "Apri menu" }).click();
    await expect(page.getByTestId("site-mobile-menu")).toBeVisible();
  } else {
    await page.getByRole("button", { name: "Prodotto" }).click();
    await expect(page.getByTestId("site-menu-product")).toHaveAttribute(
      "data-open",
      "true",
    );
  }

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  expect(results.violations).toEqual([]);
});
