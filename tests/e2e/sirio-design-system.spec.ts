import { expect, test } from "@playwright/test";

const glassVariants = ["subtle", "soft", "medium", "strong", "deep"] as const;

const desktopGlassAlpha = [".96", ".92", ".88", ".8", ".72"];
const mobileGlassAlpha = [".98", ".96", ".94", ".92", ".9"];

function parseRgb(value: string) {
  const channels = value.match(/[\d.]+/g);

  if (!channels || channels.length < 3) {
    throw new Error(`Unable to parse RGB value: ${value}`);
  }

  return channels.slice(0, 3).map(Number);
}

function relativeLuminance([red, green, blue]: number[]) {
  const [r, g, b] = [red, green, blue].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(foreground: string, background: string) {
  const foregroundLuminance = relativeLuminance(parseRgb(foreground));
  const backgroundLuminance = relativeLuminance(parseRgb(background));
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3002/");
});

test("glass presets expose the approved responsive progression", async ({
  page,
}, testInfo) => {
  const expected =
    testInfo.project.name === "chromium-375"
      ? mobileGlassAlpha
      : desktopGlassAlpha;

  for (const [index, variant] of glassVariants.entries()) {
    const specimen = page.locator(`.glass-specimen.qv-glass-${variant}`);
    await expect(specimen).toHaveCSS("--qv-glass-alpha", expected[index]);
  }
});

test("warning badge is yellow and keeps AA text contrast", async ({ page }) => {
  const warning = page.getByText("Da verificare", { exact: true }).first();
  const colors = await warning.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      background: styles.backgroundColor,
      border: styles.borderColor,
      color: styles.color,
    };
  });

  expect(colors.background).toBe("rgb(255, 243, 176)");
  expect(colors.border).toBe("rgba(217, 154, 0, 0.42)");
  expect(contrastRatio(colors.color, colors.background)).toBeGreaterThanOrEqual(
    4.5,
  );
});

test("disabled primary button is visibly neutral", async ({ page }) => {
  const disabled = page.getByRole("button", { name: "Non disponibile" });

  await expect(disabled).toBeDisabled();
  await expect(disabled).toHaveCSS("background-color", "rgb(238, 238, 235)");
  await expect(disabled).toHaveCSS("color", "rgb(102, 102, 98)");
  await expect(disabled).toHaveCSS("box-shadow", "none");
  await expect(disabled).toHaveCSS("cursor", "not-allowed");
  await expect(disabled).toHaveCSS("transform", "none");
});

test("glass cards compose real blur over buried color", async ({
  page,
}, testInfo) => {
  const glassCard = page.locator(
    '#componenti .qv-card[data-variant="glass"]',
  );
  const strongCard = page.locator(
    '#componenti .qv-card[data-variant="glass-strong"]',
  );
  const expectedGlassBlur =
    testInfo.project.name === "chromium-375" ? "blur(16px)" : "blur(24px)";
  const expectedStrongBlur =
    testInfo.project.name === "chromium-375" ? "blur(24px)" : "blur(40px)";

  await expect(glassCard).toHaveCSS(
    "backdrop-filter",
    `${expectedGlassBlur} saturate(1.12)`,
  );
  await expect(strongCard).toHaveCSS(
    "backdrop-filter",
    `${expectedStrongBlur} saturate(1.18)`,
  );
  await expect(page.locator(".pilot-output")).toHaveAttribute(
    "data-variant",
    "glass",
  );
});

test("glass direction lab keeps five materially distinct options", async ({
  page,
}) => {
  const directions = page.locator(".glass-direction-card");
  await expect(directions).toHaveCount(5);

  const materials = await directions.evaluateAll((elements) =>
    elements.map((element) => {
      const center = element.querySelector<HTMLElement>(
        ".glass-direction-center",
      );
      const styles =
        element.closest('[data-direction="crystal"]') && center
          ? getComputedStyle(center)
          : getComputedStyle(element);
      return {
        alpha: styles.backgroundColor,
        blur: styles.backdropFilter,
        border: getComputedStyle(element).borderWidth,
      };
    }),
  );

  expect(new Set(materials.map(({ blur }) => blur)).size).toBe(5);
  expect(
    new Set(
      materials.map(
        ({ alpha, blur, border }) => `${alpha}|${blur}|${border}`,
      ),
    ).size,
  ).toBe(5);
  expect(materials.map(({ border }) => border)).toEqual([
    "0px",
    "2px",
    "1px",
    "5px",
    "3px",
  ]);

  const selectedFrame = page.locator(
    '[data-direction="crystal"] .glass-direction-card',
  );
  const frameMaterial = await selectedFrame.evaluate((element) => {
    const card = getComputedStyle(element);
    const center = getComputedStyle(
      element.querySelector<HTMLElement>(".glass-direction-center")!,
    );
    const stage = getComputedStyle(element.parentElement!);
    return {
      cardBackground: card.backgroundColor,
      cardBlur: card.backdropFilter,
      cardRadius: card.borderRadius,
      centerAlpha: center.backgroundColor,
      centerBorder: center.borderWidth,
      centerBlur: center.backdropFilter,
      centerRadius: center.borderRadius,
      stageRadius: stage.borderRadius,
    };
  });

  expect(frameMaterial.cardBackground).toBe("rgba(255, 255, 255, 0.1)");
  expect(frameMaterial.cardBlur).toBe(
    "blur(36px) saturate(2.8) contrast(1.28)",
  );
  expect(frameMaterial.cardRadius).toBe("28px");
  expect(frameMaterial.centerAlpha).toBe("rgba(255, 255, 255, 0.72)");
  expect(frameMaterial.centerBorder).toBe("0px");
  expect(frameMaterial.centerBlur).toBe("none");
  expect(frameMaterial.centerRadius).toBe("22px");
  expect(frameMaterial.stageRadius).toBe("28px");
});

test("magnetic CTA stays within six pixels and preserves focus", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-1440");

  const button = page.getByRole("button", { name: "Esplora la fondazione" });
  await expect(button).toHaveAttribute("data-magnetic-enabled", "true");

  const box = await button.boundingBox();
  expect(box).not.toBeNull();

  await page.mouse.move(box!.x + box!.width + 16, box!.y + box!.height / 2);
  await expect(button).toHaveAttribute("data-magnetic-active", "");

  const offset = await button.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      x: Number.parseFloat(styles.getPropertyValue("--qv-magnetic-x")),
      y: Number.parseFloat(styles.getPropertyValue("--qv-magnetic-y")),
    };
  });

  expect(offset.x).toBeGreaterThan(0);
  expect(Math.abs(offset.x)).toBeLessThanOrEqual(6);
  expect(Math.abs(offset.y)).toBeLessThanOrEqual(6);

  await button.focus();
  await expect(button).toBeFocused();
  await expect(button).toHaveCSS("outline-style", "solid");
  await expect(button).toHaveCSS("outline-color", "rgb(49, 95, 214)");

  await page.mouse.move(0, 0);
  await expect(button).not.toHaveAttribute("data-magnetic-active", "");
});

test("reduced motion disables magnetic movement", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-1440");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();

  const button = page.getByRole("button", { name: "Esplora la fondazione" });
  await expect(button).not.toHaveAttribute("data-magnetic-enabled", "true");

  const box = await button.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width + 16, box!.y + box!.height / 2);
  await expect(button).not.toHaveAttribute("data-magnetic-active", "");
  await expect(button).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
});

test("touch input does not enable magnetic movement", async ({
  browser,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-1440");

  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 375, height: 812 },
  });
  const touchPage = await context.newPage();
  await touchPage.goto("http://localhost:3002/");

  const button = touchPage.getByRole("button", {
    name: "Esplora la fondazione",
  });
  await expect(button).not.toHaveAttribute("data-magnetic-enabled", "true");

  await context.close();
});

test("keyboard focus remains visible on the magnetic CTA", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-1440");

  for (let index = 0; index < 8; index += 1) {
    await page.keyboard.press("Tab");
  }

  const button = page.getByRole("button", { name: "Esplora la fondazione" });
  await expect(button).toBeFocused();
  await expect(button).toHaveCSS("outline-style", "solid");
  await expect(button).toHaveCSS("outline-color", "rgb(49, 95, 214)");
});

test("forced colors preserves structural boundaries", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-1440");

  await page.emulateMedia({ forcedColors: "active" });
  await page.reload();

  const strongGlass = page.locator(".glass-specimen.qv-glass-strong");
  const disabled = page.getByRole("button", { name: "Non disponibile" });

  await expect(strongGlass).toHaveCSS("box-shadow", "none");
  await expect(strongGlass).toHaveCSS("border-top-style", "solid");
  await expect(disabled).toHaveCSS("box-shadow", "none");
  await expect(disabled).toHaveCSS("border-top-style", "solid");
});

test("layout reflows at the 200 percent equivalent width", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-1440");

  await page.setViewportSize({ width: 720, height: 900 });
  await page.reload();

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  await expect(
    page.getByRole("heading", {
      name: "Dal frammento all’output controllabile.",
    }),
  ).toBeVisible();
});
