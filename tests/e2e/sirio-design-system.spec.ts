import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const isMobile = (projectName: string) => projectName.endsWith("-375");
const isDesktop = (projectName: string) => projectName.endsWith("-1440");

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
  return (
    (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
  );
}

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3002/");
});

test("publishes Stable v0.5 with local typography and Sirio identity", async ({
  page,
}) => {
  await expect(page.getByText("Stable v0.5", { exact: true })).toBeVisible();
  await expect(page.locator(".sirio-brand-mark")).toHaveAttribute(
    "src",
    "/logo-icon/sirio-icon.svg",
  );

  const details = await page.evaluate(() => ({
    display: getComputedStyle(document.querySelector("h1")!).fontFamily,
    externalFonts: performance
      .getEntriesByType("resource")
      .map(({ name }) => name)
      .filter(
        (name) =>
          /\.(woff2?|ttf)(\?|$)/.test(name) &&
          !name.startsWith(window.location.origin),
      ),
    ui: getComputedStyle(document.body).fontFamily,
  }));

  expect(details.display).toContain("Cabinet Grotesk");
  expect(details.ui).toContain("Synonym");
  expect(details.externalFonts).toEqual([]);
});

test("Crystal profiles expose the stable responsive contract", async ({
  page,
}, testInfo) => {
  const expected = isMobile(testInfo.project.name)
    ? {
        feature: [".72", "14px", ".1", "24px"],
        focus: [".88", "12px", ".08", "20px"],
        navigation: [".96", "8px", ".06", "12px"],
        overlay: [".98", "16px", ".08", "24px"],
      }
    : {
        feature: [".48", "20px", ".1", "32px"],
        focus: [".68", "18px", ".08", "28px"],
        navigation: [".82", "12px", ".06", "20px"],
        overlay: [".92", "24px", ".08", "32px"],
      };

  for (const [purpose, values] of Object.entries(expected)) {
    const surface = page
      .locator(
        `.qv-surface[data-material="crystal"][data-purpose="${purpose}"]`,
      )
      .first();
    const tokens = await surface.evaluate((element) => {
      const styles = getComputedStyle(element);
      return [
        styles.getPropertyValue("--qv-crystal-center-alpha-local").trim(),
        styles.getPropertyValue("--qv-crystal-center-blur-local").trim(),
        styles.getPropertyValue("--qv-crystal-frame-alpha-local").trim(),
        styles.getPropertyValue("--qv-crystal-frame-blur-local").trim(),
      ];
    });
    expect(tokens).toEqual(values);
  }
});

test("Crystal keeps blur outside the host and all descendants", async ({
  page,
}) => {
  const surfaces = page.locator('.qv-surface[data-material="crystal"]');
  const count = await surfaces.count();

  for (let index = 0; index < count; index += 1) {
    const material = await surfaces.nth(index).evaluate((element) => {
      const host = getComputedStyle(element);
      const center = getComputedStyle(element, "::after");
      const frame = getComputedStyle(element, "::before");
      const blurredDescendants = [...element.querySelectorAll("*")].filter(
        (child) => {
          const styles = getComputedStyle(child);
          return styles.filter !== "none" || styles.backdropFilter !== "none";
        },
      ).length;
      return {
        blurredDescendants,
        centerBlur: center.backdropFilter,
        frameBlur: frame.backdropFilter,
        hostBlur: host.backdropFilter,
        radius: host.borderRadius,
        width: host.borderWidth,
      };
    });

    expect(material.hostBlur).toBe("none");
    expect(material.blurredDescendants).toBe(0);
    expect(material.centerBlur).not.toBe("none");
    expect(material.frameBlur).not.toBe("none");
    expect(material.radius).toBe("28px");
    expect(material.width).toBe("6px");
  }
});

test("warning and disabled states remain explicit and accessible", async ({
  page,
}) => {
  const warning = page.getByText("Da verificare", { exact: true }).first();
  const colors = await warning.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      background: styles.backgroundColor,
      color: styles.color,
    };
  });
  expect(contrastRatio(colors.color, colors.background)).toBeGreaterThanOrEqual(
    4.5,
  );

  const disabled = page.getByRole("button", { name: "Non disponibile" });
  await expect(disabled).toBeDisabled();
  await expect(disabled).toHaveCSS("background-color", "rgb(238, 238, 235)");
  await expect(disabled).toHaveCSS("box-shadow", "none");
  await expect(disabled).toHaveCSS("cursor", "not-allowed");
});

test("dialog traps focus, closes with Escape and restores the trigger", async ({
  page,
}) => {
  const trigger = page.getByRole("button", { name: "Apri dialog" });
  await trigger.click();

  const dialog = page.getByRole("dialog", { name: "Pubblica menu" });
  await expect(dialog).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Chiudi finestra" }),
  ).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("select and tabs support keyboard operation", async ({ page }) => {
  const select = page.getByRole("combobox", { name: "Portata" });
  await select.focus();
  await page.keyboard.press("Enter");
  const secondo = page.getByRole("option", { name: "Secondo" });
  await expect(secondo).toBeVisible();
  await secondo.focus();
  await page.keyboard.press("Enter");
  await expect(select).toHaveText("Secondo");

  const ingredienti = page.getByRole("tab", { name: "Ingredienti" });
  const metodo = page.getByRole("tab", { name: "Metodo" });
  await ingredienti.focus();
  await ingredienti.press("ArrowRight");
  await expect(metodo).toBeFocused();
  await expect(metodo).toHaveAttribute("aria-selected", "true");
});

test("magnetic interaction is bounded and disabled by reduced motion", async ({
  page,
}, testInfo) => {
  test.skip(!isDesktop(testInfo.project.name));
  test.skip(testInfo.project.name.startsWith("webkit"));

  const button = page.getByRole("button", { name: "Esplora il materiale" });
  const box = await button.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width + 16, box!.y + box!.height / 2);

  const offsets = await button.evaluate((element) => {
    const styles = getComputedStyle(element);
    return [
      Number.parseFloat(styles.getPropertyValue("--qv-magnetic-x")),
      Number.parseFloat(styles.getPropertyValue("--qv-magnetic-y")),
    ];
  });
  expect(Math.abs(offsets[0])).toBeLessThanOrEqual(6);
  expect(Math.abs(offsets[1])).toBeLessThanOrEqual(6);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(button).not.toHaveAttribute("data-magnetic-enabled");
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

test("forced colors preserves boundaries", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-1440");
  await page.emulateMedia({ forcedColors: "active" });
  await page.reload();

  const surface = page
    .locator('.qv-surface[data-material="crystal"]')
    .first();
  await expect(surface).toHaveCSS("border-top-style", "solid");
  await expect(surface).toHaveCSS("box-shadow", "none");
});

test("visual contract snapshots remain stable", async ({ page }, testInfo) => {
  test.skip(
    !["chromium-375", "chromium-1440"].includes(testInfo.project.name),
  );
  await page.addStyleTag({
    content: "nextjs-portal { display: none !important; }",
  });
  await expect(page.locator(".sirio-hero")).toHaveScreenshot(
    `sirio-hero-${testInfo.project.name}.png`,
    { animations: "disabled" },
  );
  await page.locator(".sirio-nav").evaluate((element) => {
    element.setAttribute("hidden", "");
  });
  await expect(page.locator(".sirio-material-grid")).toHaveScreenshot(
    `sirio-materials-${testInfo.project.name}.png`,
    { animations: "disabled" },
  );
});
