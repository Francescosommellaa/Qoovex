import { expect, test, type Page } from "@playwright/test";

import { createInputContext, mobileUrls } from "./support/context";
import { trackRuntimeErrors } from "./support/diagnostics";
import { expectNoDocumentOverflow } from "./support/geometry";

async function roleMetrics(page: Page, role: string) {
  return page.locator(`[data-type-role="${role}"]`).evaluate((element) => {
    const sample = element.querySelector<HTMLElement>("[data-type-sample]")!;
    const style = getComputedStyle(sample);
    return {
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      lineHeight: style.lineHeight,
      letterSpacing: style.letterSpacing,
      synthesisWeight: style.getPropertyValue("font-synthesis-weight"),
    };
  });
}

test("typography proof keeps its hierarchy and hostile strings inside every canonical viewport", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 320, height: 720, touch: true });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "typography canonical viewports");
  await page.goto(`${mobileUrls.sirio}/foundations/typography`);

  await expect(page.locator("[data-typography-foundation]")).toBeVisible();
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
    await expectNoDocumentOverflow(page, `Typography foundation at ${width}px`);
  }

  expect(await roleMetrics(page, "display")).toMatchObject({ fontSize: "36px", fontWeight: "600", lineHeight: "40px" });
  expect(await roleMetrics(page, "headline")).toMatchObject({ fontSize: "30px", fontWeight: "600", lineHeight: "36px" });
  expect(await roleMetrics(page, "title")).toMatchObject({ fontSize: "20px", fontWeight: "600", lineHeight: "28px" });
  expect(await roleMetrics(page, "body")).toMatchObject({ fontSize: "16px", fontWeight: "400", lineHeight: "28px" });
  expect(await roleMetrics(page, "compact-control")).toMatchObject({ fontSize: "14px", fontWeight: "500", lineHeight: "20px" });
  expect(await roleMetrics(page, "label-metadata")).toMatchObject({ fontSize: "12px", fontWeight: "600", lineHeight: "16px", synthesisWeight: "none" });

  const compact = page.locator('[data-typography-proof="intentional-truncation"] p.truncate');
  await expect(compact).toHaveCSS("text-overflow", "ellipsis");
  await page.getByText("Mostra il valore completo", { exact: true }).click();
  await expect(page.getByText("verbale_sopralluogo_impianti_termici_versione_definitiva_firmata_22-08-2026.pdf", { exact: true }).last()).toBeVisible();
  assertNoRuntimeErrors();
  await context.close();
});

test("200 percent text scaling, dark theme, and reduced motion preserve hierarchy without clipping", async ({ browser }) => {
  const context = await createInputContext(browser, {
    width: 720,
    height: 900,
    touch: false,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "typography zoom theme reduced motion");
  await page.goto(`${mobileUrls.sirio}/foundations/typography`);

  const bodyBefore = await roleMetrics(page, "body");
  const displayBoxBefore = await page.locator('[data-type-role="display"]').boundingBox();
  await page.locator("html").evaluate((element) => element.classList.add("dark"));
  expect(await page.locator('[data-type-role="display"]').boundingBox()).toEqual(displayBoxBefore);
  expect(await roleMetrics(page, "body")).toEqual(bodyBefore);

  await page.locator("html").evaluate((element) => {
    element.style.fontSize = "200%";
  });
  await expectNoDocumentOverflow(page, "Typography foundation at 200% text scaling");
  const clipping = await page.locator("[data-type-role]").evaluateAll((roles) =>
    roles.flatMap((role) => [...role.querySelectorAll<HTMLElement>("p, h3, dd")])
      .filter((node) => {
        const overflow = getComputedStyle(node).overflowY;
        return ["hidden", "clip"].includes(overflow) && node.scrollHeight > node.clientHeight + 1;
      })
      .map((node) => node.textContent?.trim().slice(0, 60)),
  );
  expect(clipping).toEqual([]);
  expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
  assertNoRuntimeErrors();
  await context.close();
});

test("font failure falls back cleanly and mobile input text remains at least 16px", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 320, height: 720, touch: true });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "typography fallback and input sizing");
  await page.route(/(?:api|cdn)\.fontshare\.com/, (route) =>
    route.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );
  await page.goto(`${mobileUrls.sirio}/foundations/typography`);

  await expect(page.locator('[data-font-proof="fallback"]')).toBeVisible();
  const fallbackFamily = await page.locator('[data-font-proof="fallback"]').evaluate((element) => getComputedStyle(element).fontFamily);
  expect(fallbackFamily).not.toContain("General Sans");
  expect(fallbackFamily).not.toContain("Array");
  await expectNoDocumentOverflow(page, "Typography foundation without Fontshare");

  await page.goto(`${mobileUrls.sirio}/components/controls`);
  const input = page.locator('[data-slot="input"]').first();
  await expect(input).toBeVisible();
  expect(Number.parseFloat(await input.evaluate((element) => getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(16);
  assertNoRuntimeErrors();
  await context.close();
});
