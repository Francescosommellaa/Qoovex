import { expect, test, type Page } from "@playwright/test";

import { createInputContext, mobileUrls } from "./support/context";
import { trackRuntimeErrors } from "./support/diagnostics";
import { expectNoDocumentOverflow } from "./support/geometry";

async function planeStyle(page: Page, role: string) {
  return page.locator(`[data-surface-role-card="${role}"]`).evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      backgroundColor: style.backgroundColor,
      borderColor: style.borderColor,
      borderWidth: style.borderTopWidth,
      boxShadow: style.boxShadow,
      position: style.position,
      zIndex: style.zIndex,
    };
  });
}

test("surface roles separate tone, border and elevation without owning stacking", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 390, height: 844, touch: true });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "surface role geometry and themes");
  await page.goto(`${mobileUrls.sirio}/foundations/surfaces`);

  await expect(page.locator("[data-surface-foundation]")).toBeVisible();
  await expectNoDocumentOverflow(page, "Surface foundation at 390px");

  const light = {
    base: await planeStyle(page, "base"),
    contained: await planeStyle(page, "contained"),
    raised: await planeStyle(page, "raised"),
    floating: await planeStyle(page, "floating"),
    modal: await planeStyle(page, "modal"),
  };

  expect(light.base.boxShadow).toBe("none");
  expect(light.contained.boxShadow).toBe("none");
  expect(light.raised.boxShadow).not.toBe("none");
  expect(light.floating.boxShadow).not.toBe("none");
  expect(light.modal.boxShadow).not.toBe("none");
  expect(light.contained.backgroundColor).not.toBe(light.base.backgroundColor);

  for (const role of Object.values(light)) {
    expect(role.borderWidth).toBe("1px");
    expect(role.position).toBe("static");
    expect(role.zIndex).toBe("auto");
  }

  await page.locator("html").evaluate((element) => element.classList.add("dark"));
  const darkBase = await planeStyle(page, "base");
  const darkContained = await planeStyle(page, "contained");
  const darkFloating = await planeStyle(page, "floating");
  expect(darkBase.backgroundColor).not.toBe(light.base.backgroundColor);
  expect(darkContained.backgroundColor).not.toBe(darkBase.backgroundColor);
  expect(darkFloating.backgroundColor).not.toBe(darkContained.backgroundColor);
  expect(darkFloating.borderColor).not.toBe("transparent");

  assertNoRuntimeErrors();
  await context.close();
});

test("forced colors removes shadow but preserves boundaries and backdrop", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 768, height: 900 },
    colorScheme: "dark",
    forcedColors: "active",
    locale: "it-IT",
  });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "surface forced-colors fallback");
  await page.goto(`${mobileUrls.sirio}/foundations/surfaces`);

  expect(await page.evaluate(() => matchMedia("(forced-colors: active)").matches)).toBe(true);
  for (const role of ["contained", "raised", "floating", "modal"]) {
    const style = await planeStyle(page, role);
    expect(style.boxShadow).toBe("none");
    expect(style.borderWidth).toBe("1px");
    expect(style.borderColor).not.toBe("transparent");
  }

  const backdrop = page.locator("[data-surface-backdrop]");
  await expect(backdrop).toBeVisible();
  expect(await backdrop.evaluate((element) => getComputedStyle(element).backdropFilter)).toBe("none");
  expect(await backdrop.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe("rgba(0, 0, 0, 0)");
  assertNoRuntimeErrors();
  await context.close();
});

test("surface Motion retargets rapid input and keeps reduced-motion hierarchy", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 768, height: 900, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "surface Motion lifecycle");
  await page.goto(`${mobileUrls.sirio}/foundations/surfaces`);

  const proof = page.locator("[data-surface-motion-proof]");
  const trigger = page.locator("[data-surface-motion-trigger]");
  const stage = page.locator("#surface-motion-stage");
  const initialStageSize = await stage.evaluate((element) => ({
    width: (element as HTMLElement).offsetWidth,
    height: (element as HTMLElement).offsetHeight,
  }));
  const initialTriggerSize = await trigger.evaluate((element) => ({
    width: (element as HTMLElement).offsetWidth,
    height: (element as HTMLElement).offsetHeight,
  }));

  await trigger.click();
  await trigger.click();
  await trigger.click();
  await expect(proof).toHaveAttribute("data-surface-motion-state", "open");
  await expect(proof).toHaveAttribute("data-surface-motion-phase", "settled");
  const layer = page.locator("[data-surface-motion-layer]");
  await expect(layer).toBeVisible();
  const stageBox = await stage.boundingBox();
  const layerBox = await layer.boundingBox();
  expect(Math.abs((stageBox!.y + stageBox!.height / 2) - (layerBox!.y + layerBox!.height / 2))).toBeLessThanOrEqual(1);
  expect(await stage.evaluate((element) => ({
    width: (element as HTMLElement).offsetWidth,
    height: (element as HTMLElement).offsetHeight,
  }))).toEqual(initialStageSize);
  expect(await trigger.evaluate((element) => ({
    width: (element as HTMLElement).offsetWidth,
    height: (element as HTMLElement).offsetHeight,
  }))).toEqual(initialTriggerSize);

  await trigger.click();
  await expect(proof).toHaveAttribute("data-surface-motion-state", "closed");
  await expect(proof).toHaveAttribute("data-surface-motion-phase", "rest");

  const box = await trigger.boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await expect(proof).toHaveAttribute("data-surface-motion-phase", "interaction");
  await page.mouse.move(box!.x + box!.width + 40, box!.y + box!.height + 40);
  await page.mouse.up();
  await expect(proof).toHaveAttribute("data-surface-motion-state", "closed");
  await expect(proof).toHaveAttribute("data-surface-motion-phase", "rest");

  await trigger.focus();
  await page.keyboard.press("Space");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(proof).toHaveAttribute("data-surface-motion-phase", "settled");
  assertNoRuntimeErrors();
  await context.close();

  const reducedContext = await createInputContext(browser, {
    width: 390,
    height: 844,
    touch: true,
    reducedMotion: "reduce",
  });
  const reducedPage = await reducedContext.newPage();
  const assertNoReducedRuntimeErrors = trackRuntimeErrors(reducedPage, "surface reduced-motion hydration");
  await reducedPage.goto(`${mobileUrls.sirio}/foundations/surfaces`);
  const reducedProof = reducedPage.locator("[data-surface-motion-proof]");
  await expect(reducedProof).toHaveAttribute("data-reduced-motion", "true");
  await reducedPage.locator("[data-surface-motion-trigger]").click();
  await expect(reducedProof).toHaveAttribute("data-surface-motion-state", "open");
  await expect(reducedProof).toHaveAttribute("data-surface-motion-phase", "settled");
  const reducedLayer = reducedPage.locator("[data-surface-motion-layer]");
  await expect(reducedLayer).toBeVisible();
  expect(await reducedLayer.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe("none");
  assertNoReducedRuntimeErrors();
  await reducedContext.close();
});
