import { expect, test } from "@playwright/test";

import { createInputContext, mobileUrls } from "./support/context";
import { trackRuntimeErrors } from "./support/diagnostics";

test("hexagon spinner keeps its track fixed while the progress segment travels", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 768, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "Spinner hexagon lifecycle");
  await page.goto(`${mobileUrls.sirio}/components/spinner`);

  const spinner = page.locator('[data-spinner-proof="hexagon"]');
  const track = spinner.locator("polygon").first();
  const segment = spinner.locator(".qv-spinner-hexagon-segment");
  await expect(spinner).toBeVisible();
  await expect(track).toHaveCSS("transform", "none");
  await expect(segment).toHaveCSS("animation-name", "qv-spinner-hexagon-progress");
  const before = await segment.evaluate((element) => getComputedStyle(element).strokeDashoffset);
  await page.waitForTimeout(120);
  const after = await segment.evaluate((element) => getComputedStyle(element).strokeDashoffset);
  expect(after).not.toBe(before);
  await expect(page.getByText(/Orbit|Dots|Bars/)).toHaveCount(0);

  const determinate = page.locator('[data-spinner-proof="hexagon-determinate"]');
  const determinateSvg = determinate.locator("svg");
  await expect(determinateSvg).toHaveCSS("transform", "none");
  await expect(determinateSvg.locator("polygon").last()).toHaveAttribute("points", /^12,2\.5 /);
  assertNoRuntimeErrors();
  await context.close();
});

test("hexagon spinner preserves the loading cue without continuous reduced-motion travel", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 320, height: 720, touch: true, reducedMotion: "reduce" });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "Spinner hexagon reduced motion");
  await page.goto(`${mobileUrls.sirio}/components/spinner`);

  const spinner = page.locator('[data-spinner-proof="hexagon"]');
  await expect(spinner).toHaveAttribute("role", "status");
  await expect(spinner).toHaveAccessibleName("Caricamento in corso...");
  await expect(spinner.locator(".qv-spinner-hexagon-segment")).toHaveCSS("animation-name", "none");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  assertNoRuntimeErrors();
  await context.close();
});
