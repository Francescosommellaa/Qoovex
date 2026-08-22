import { expect, test, type Locator, type Page } from "@playwright/test";

import { createInputContext, mobileUrls } from "./support/context";
import { trackRuntimeErrors } from "./support/diagnostics";
import { expectNoDocumentOverflow } from "./support/geometry";

async function pseudoBox(locator: Locator) {
  return locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const pseudo = getComputedStyle(element, "::after");
    const width = Number.parseFloat(pseudo.width);
    const height = Number.parseFloat(pseudo.height);
    return {
      left: rect.left + rect.width / 2 - width / 2,
      right: rect.left + rect.width / 2 + width / 2,
      top: rect.top + rect.height / 2 - height / 2,
      bottom: rect.top + rect.height / 2 + height / 2,
      width,
      height,
    };
  });
}

async function tabTo(page: Page, target: Locator, maximumTabs = 80) {
  for (let index = 0; index < maximumTabs; index += 1) {
    await page.keyboard.press("Tab");
    if (await target.evaluate((element) => element === document.activeElement)) return;
  }
  await expect(target).toBeFocused();
}

test("coarse pointer exposes 44px targets while preserving compact visuals and inline links", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 320, height: 720, touch: true });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "pointer touch coarse target contract");
  await page.goto(`${mobileUrls.sirio}/foundations/pointer-touch`);

  const icon = page.locator('[data-pointer-proof="icon-control"]');
  const field = page.locator('[data-pointer-proof="field"]');
  const checkbox = page.locator('[data-pointer-proof="compact-checkbox"]');
  const inlineLink = page.locator('[data-pointer-proof="inline-link"]');

  await expect(page.locator("[data-pointer-touch-foundation]")).toBeVisible();
  await expectNoDocumentOverflow(page, "Pointer + Touch proof at 320px");
  expect(await page.evaluate(() => matchMedia("(pointer: coarse)").matches)).toBe(true);
  await expect(icon).toHaveCSS("min-width", "44px");
  await expect(icon).toHaveCSS("min-height", "44px");
  await expect(field).toHaveCSS("min-height", "44px");

  await checkbox.scrollIntoViewIfNeeded();
  const checkboxVisual = await checkbox.boundingBox();
  const checkboxHit = await pseudoBox(checkbox);
  const inlineBox = await inlineLink.boundingBox();
  expect(checkboxVisual).not.toBeNull();
  expect(checkboxVisual!.width).toBeLessThan(44);
  expect(checkboxVisual!.height).toBeLessThan(44);
  expect(checkboxHit.width).toBe(44);
  expect(checkboxHit.height).toBe(44);
  expect(inlineBox).not.toBeNull();
  expect(inlineBox!.height).toBeLessThan(44);

  await checkbox.tap();
  await expect(checkbox).toHaveAttribute("data-checked", "");
  const checkboxHitAfterTap = await pseudoBox(checkbox);
  await page.mouse.click(
    checkboxHitAfterTap.right - 2,
    checkboxHitAfterTap.top + checkboxHitAfterTap.height / 2,
  );
  await expect(checkbox).toHaveAttribute("data-unchecked", "");

  const adjacentA = page.locator('[data-pointer-proof="adjacent-a"]');
  const adjacentB = page.locator('[data-pointer-proof="adjacent-b"]');
  await adjacentA.scrollIntoViewIfNeeded();
  const [hitA, hitB] = await Promise.all([pseudoBox(adjacentA), pseudoBox(adjacentB)]);
  expect(hitA.right).toBeLessThanOrEqual(hitB.left + 0.01);

  await adjacentA.tap();
  await expect(adjacentA).toHaveAttribute("data-checked", "");
  await expect(adjacentB).toHaveAttribute("data-unchecked", "");
  await page.mouse.click(hitB.right - 2, hitB.top + hitB.height / 2);
  await expect(adjacentB).toHaveAttribute("data-checked", "");

  const pressLab = page.locator('[data-pointer-proof="press-lab"]');
  const visual = pressLab.locator("[data-pointer-visual]");
  await pressLab.scrollIntoViewIfNeeded();
  const restingColor = await visual.evaluate((element) => getComputedStyle(element).backgroundColor);
  await pressLab.hover();
  await expect(visual).toHaveCSS("background-color", restingColor);
  assertNoRuntimeErrors();
  await context.close();
});

test("fine pointer hover, cancel, repeated input, and keyboard activation settle without geometry drift", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 768, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "pointer touch fine lifecycle");
  await page.goto(`${mobileUrls.sirio}/foundations/pointer-touch`);

  expect(
    await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches),
  ).toBe(true);
  const foundation = page.locator("[data-pointer-touch-foundation]");
  const pressLab = page.locator('[data-pointer-proof="press-lab"]');
  const visual = pressLab.locator("[data-pointer-visual]");
  await pressLab.scrollIntoViewIfNeeded();

  const restingColor = await visual.evaluate((element) => getComputedStyle(element).backgroundColor);
  await pressLab.hover();
  await expect.poll(() => visual.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(restingColor);

  const before = await pressLab.boundingBox();
  expect(before).not.toBeNull();
  await page.mouse.move(before!.x + before!.width / 2, before!.y + before!.height / 2);
  await page.mouse.down();
  await expect(foundation).toHaveAttribute("data-pointer-phase", "pressed");
  await page.mouse.move(before!.x + before!.width + 80, before!.y + before!.height + 80);
  await expect(foundation).toHaveAttribute("data-pointer-phase", "cancelled");
  await page.mouse.up();
  await expect(foundation).toHaveAttribute("data-activations", "0");
  expect(await pressLab.boundingBox()).toEqual(before);

  for (let index = 0; index < 3; index += 1) await pressLab.click();
  await expect(foundation).toHaveAttribute("data-activations", "3");
  await expect(foundation).toHaveAttribute("data-pointer-phase", "settled");
  expect(await pressLab.boundingBox()).toEqual(before);

  await page.locator("body").click({ position: { x: 1, y: 1 } });
  await tabTo(page, pressLab);
  const focused = await pressLab.boundingBox();
  await page.keyboard.press("Enter");
  await expect(foundation).toHaveAttribute("data-activations", "4");
  await expect(pressLab).toBeFocused();
  expect(await pressLab.boundingBox()).toEqual(focused);

  const switchRoot = page.locator('[data-pointer-proof="motion-switch"]');
  const switchThumb = switchRoot.locator('[data-slot="switch-thumb"]');
  await switchRoot.scrollIntoViewIfNeeded();
  const switchBox = await switchRoot.boundingBox();
  const restingTransform = await switchThumb.evaluate((element) => getComputedStyle(element).transform);
  expect(switchBox).not.toBeNull();
  await page.mouse.move(switchBox!.x + switchBox!.width / 2, switchBox!.y + switchBox!.height / 2);
  await page.mouse.down();
  await expect.poll(() => switchThumb.evaluate((element) => getComputedStyle(element).transform)).not.toBe(restingTransform);
  expect(await switchRoot.boundingBox()).toEqual(switchBox);
  await page.mouse.move(switchBox!.x + switchBox!.width + 60, switchBox!.y + switchBox!.height + 60);
  await page.mouse.up();
  await expect(switchRoot).toHaveAttribute("data-unchecked", "");
  expect(await switchRoot.boundingBox()).toEqual(switchBox);
  assertNoRuntimeErrors();
  await context.close();
});

test("pen remains event-specific without being collapsed into touch modality", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 768, touch: false });
  const page = await context.newPage();
  const session = await context.newCDPSession(page);
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "pointer touch pen event");
  await page.goto(`${mobileUrls.sirio}/foundations/pointer-touch`);

  expect(
    await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches),
  ).toBe(true);
  const pressLab = page.locator('[data-pointer-proof="press-lab"]');
  await pressLab.scrollIntoViewIfNeeded();
  const box = await pressLab.boundingBox();
  expect(box).not.toBeNull();
  const x = box!.x + box!.width / 2;
  const y = box!.y + box!.height / 2;
  await session.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1, pointerType: "pen" });
  await session.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1, pointerType: "pen" });
  await expect(page.locator("[data-pointer-touch-foundation]")).toHaveAttribute("data-last-pointer", "pen");
  await expect(page.locator("[data-pointer-touch-foundation]")).toHaveAttribute("data-activations", "1");
  assertNoRuntimeErrors();
  await context.close();
});

test("Motion tap and reduced motion preserve root hit geometry and activation", async ({ browser }) => {
  const context = await createInputContext(browser, {
    width: 390,
    height: 844,
    touch: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "pointer touch reduced motion");
  await page.goto(`${mobileUrls.sirio}/foundations/pointer-touch`);

  const switchRoot = page.locator('[data-pointer-proof="motion-switch"]');
  const pressLab = page.locator('[data-pointer-proof="press-lab"]');
  await switchRoot.scrollIntoViewIfNeeded();
  const beforeSwitch = await switchRoot.boundingBox();
  await switchRoot.tap();
  await expect(switchRoot).toHaveAttribute("data-checked", "");
  expect(await switchRoot.boundingBox()).toEqual(beforeSwitch);

  await pressLab.scrollIntoViewIfNeeded();
  const visibleLab = await pressLab.boundingBox();
  expect(visibleLab).not.toBeNull();
  await page.touchscreen.tap(visibleLab!.x + visibleLab!.width / 2, visibleLab!.y + visibleLab!.height / 2);
  await expect(page.locator("[data-pointer-touch-foundation]")).toHaveAttribute("data-activations", "1");
  await expect(pressLab.locator("[data-pointer-visual]")).toHaveCSS("transform", "none");
  expect(await pressLab.boundingBox()).toEqual(visibleLab);
  assertNoRuntimeErrors();
  await context.close();
});
