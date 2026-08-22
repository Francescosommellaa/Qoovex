import { expect, test, type Page } from "@playwright/test";

import { createInputContext, mobileUrls } from "./support/context";
import { trackRuntimeErrors } from "./support/diagnostics";
import { expectNoDocumentOverflow } from "./support/geometry";

async function iconBox(page: Page, role: string) {
  return page.locator(`[data-icon-scale="${role}"] [data-icon-glyph]`).boundingBox();
}

test("icon proof keeps semantic boxes, optical alignment and icon-only ownership", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 390, height: 844, touch: true });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "icon foundation geometry and semantics");
  await page.goto(`${mobileUrls.sirio}/foundations/icons`);

  await expect(page.locator("[data-icon-foundation]")).toBeVisible();
  await expectNoDocumentOverflow(page, "Icon foundation at 390px");

  for (const [role, size] of [["compact", 14], ["default", 16], ["emphasized", 20], ["illustrative", 28]] as const) {
    const box = await iconBox(page, role);
    expect(box?.width).toBe(size);
    expect(box?.height).toBe(size);
  }

  for (const label of ["xs", "sm", "base"]) {
    const row = page.locator(`[data-icon-text-row="${label}"]`);
    const glyph = await row.locator("[data-icon-glyph]").boundingBox();
    const text = await row.locator("span").boundingBox();
    expect(Math.abs((glyph!.y + glyph!.height / 2) - (text!.y + text!.height / 2))).toBeLessThanOrEqual(1);
  }

  const leading = page.locator("[data-icon-leading-multiline]");
  const leadingIcon = await leading.locator("[data-icon-glyph]").boundingBox();
  const leadingCopy = await leading.locator("[data-icon-leading-copy]").boundingBox();
  expect(Math.abs((leadingIcon!.y - leadingCopy!.y) - 2)).toBeLessThanOrEqual(1);

  const iconButton = page.getByRole("button", { name: "Apri impostazioni icona" });
  const iconButtonBox = await iconButton.boundingBox();
  expect(iconButtonBox!.width).toBeGreaterThanOrEqual(44);
  expect(iconButtonBox!.height).toBeGreaterThanOrEqual(44);
  await iconButton.focus();
  await expect(iconButton).toBeFocused();
  expect(await iconButton.evaluate((element) => getComputedStyle(element).outlineWidth)).toBe("2px");
  expect(await iconButton.locator("svg").getAttribute("aria-hidden")).toBe("true");

  const informative = page.locator("[data-informative-icon]");
  await expect(informative).toHaveAttribute("role", "img");
  await expect(informative).toHaveAttribute("aria-label", "Integrità verificata");

  const lightBackground = await page.locator("body").evaluate((element) => getComputedStyle(element).backgroundColor);
  const defaultIconBeforeDark = await iconBox(page, "default");
  await page.locator("html").evaluate((element) => element.classList.add("dark"));
  expect(await page.locator("body").evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(lightBackground);
  expect(await iconBox(page, "default")).toEqual(defaultIconBeforeDark);
  assertNoRuntimeErrors();
  await context.close();
});

test("Tabler stroke, currentColor, dark theme and forced colors stay owner-driven", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 768, height: 900 },
    colorScheme: "light",
    forcedColors: "active",
    locale: "it-IT",
  });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "icon foundation colors");
  await page.goto(`${mobileUrls.sirio}/foundations/icons`);

  const glyph = page.locator('[data-icon-scale="default"] [data-icon-glyph]');
  await expect(glyph).toHaveAttribute("stroke", "currentColor");
  await expect(glyph).toHaveAttribute("stroke-width", "2");

  const status = page.locator("[data-current-color-icon]");
  const colorContract = await status.evaluate((element) => {
    const style = getComputedStyle(element);
    return { color: style.color, stroke: style.stroke };
  });
  expect(colorContract.stroke).toBe(colorContract.color);

  const before = await glyph.boundingBox();
  await page.locator("html").evaluate((element) => element.classList.add("dark"));
  expect(await glyph.boundingBox()).toEqual(before);
  expect(await page.evaluate(() => matchMedia("(forced-colors: active)").matches)).toBe(true);
  assertNoRuntimeErrors();
  await context.close();
});

test("Motion icon retargets rapid input, cancels press and becomes equivalent in reduced motion", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 768, height: 900, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "icon Motion lifecycle");
  await page.goto(`${mobileUrls.sirio}/foundations/icons`);

  const proof = page.locator("[data-icon-motion-proof]");
  const trigger = page.locator("[data-icon-motion-trigger]");
  const initialLayoutSize = await trigger.evaluate((element) => ({
    width: (element as HTMLElement).offsetWidth,
    height: (element as HTMLElement).offsetHeight,
  }));
  await trigger.click();
  await trigger.click();
  await trigger.click();
  await expect(proof).toHaveAttribute("data-icon-motion-state", "open");
  await expect(proof).toHaveAttribute("data-icon-motion-phase", "settled");
  expect(await trigger.evaluate((element) => ({
    width: (element as HTMLElement).offsetWidth,
    height: (element as HTMLElement).offsetHeight,
  }))).toEqual(initialLayoutSize);

  const box = await trigger.boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await expect(proof).toHaveAttribute("data-icon-motion-phase", "interaction");
  await page.mouse.move(box!.x + box!.width + 40, box!.y + box!.height + 40);
  await page.mouse.up();
  await expect(proof).toHaveAttribute("data-icon-motion-state", "open");
  await expect(proof).toHaveAttribute("data-icon-motion-phase", "settled");

  await trigger.focus();
  await page.keyboard.press("Space");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(proof).toHaveAttribute("data-icon-motion-state", "closed");
  await expect(proof).toHaveAttribute("data-icon-motion-phase", "settled");
  assertNoRuntimeErrors();
  await context.close();

  const reducedContext = await createInputContext(browser, {
    width: 390,
    height: 844,
    touch: true,
    reducedMotion: "reduce",
  });
  const reducedPage = await reducedContext.newPage();
  const assertNoReducedRuntimeErrors = trackRuntimeErrors(reducedPage, "icon reduced-motion hydration");
  await reducedPage.goto(`${mobileUrls.sirio}/foundations/icons`);
  const reducedProof = reducedPage.locator("[data-icon-motion-proof]");
  await expect(reducedProof).toHaveAttribute("data-reduced-motion", "true");
  await reducedPage.locator("[data-icon-motion-trigger]").click();
  await expect(reducedProof).toHaveAttribute("data-icon-motion-state", "open");
  await expect(reducedProof).toHaveAttribute("data-icon-motion-phase", "settled");
  await expect(reducedPage.locator("[data-loader-icon]")).toHaveCSS("animation-name", "none");
  await expect(reducedPage.getByText("Caricamento in corso", { exact: true })).toBeVisible();
  assertNoReducedRuntimeErrors();
  await reducedContext.close();
});
