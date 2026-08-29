import { expect, test, type Locator } from "@playwright/test";

import { createInputContext, mobileUrls } from "./support/context";
import { trackRuntimeErrors } from "./support/diagnostics";

async function geometry(locator: Locator) {
  return locator.evaluate((element) => ({
    height: (element as HTMLElement).offsetHeight,
    width: (element as HTMLElement).offsetWidth,
    x: (element as HTMLElement).offsetLeft,
    y: (element as HTMLElement).offsetTop,
  }));
}

test("IconAction keeps semantics on the parent and directional motion inside a stable slot", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 900, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "IconAction direction and ownership");
  await page.goto(`${mobileUrls.sirio}/components/icon-button`);

  const parent = page.locator('[data-icon-action-proof="forward"]');
  const glyph = parent.locator('[data-slot="icon-action"]');
  const surface = parent.locator('[data-slot="icon-button-motion-surface"]');
  const initial = await geometry(parent);
  await expect(parent).toHaveAccessibleName("Vai avanti");
  await expect(glyph).toHaveAttribute("aria-hidden", "true");
  await expect(glyph).not.toHaveAttribute("tabindex");

  await parent.focus();
  await expect(parent).toBeFocused();
  await parent.hover();
  await expect.poll(() => glyph.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).e)).toBeGreaterThan(1);
  await expect.poll(() => surface.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).a)).toBeGreaterThan(1.07);
  await expect.poll(() => surface.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).e)).toBeGreaterThan(0.5);
  await expect(parent.locator('[data-slot="icon-action-directional-frame"]')).toHaveCount(0);

  const parentBox = await parent.boundingBox();
  expect(parentBox).not.toBeNull();
  await page.mouse.down();
  await page.mouse.move(parentBox!.x + parentBox!.width + 40, parentBox!.y + parentBox!.height + 40);
  await page.mouse.up();
  await expect.poll(() => glyph.evaluate((element) => Math.abs(new DOMMatrix(getComputedStyle(element).transform).e))).toBeLessThan(0.1);
  expect(await geometry(parent)).toEqual(initial);

  const download = page.locator('[data-icon-action-proof="download"]');
  const arrow = download.locator("path").first();
  const base = download.locator("path").last();
  await download.hover();
  await expect.poll(() => arrow.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).f)).toBeGreaterThan(1);
  await expect(base).not.toHaveAttribute("style");

  const neutral = page.locator('[data-icon-action-proof="neutral"]');
  const neutralGlyph = neutral.locator('[data-slot="icon-action"]');
  await neutral.hover();
  await expect.poll(() => neutralGlyph.evaluate((element) => getComputedStyle(element).transform)).toBe("none");
  assertNoRuntimeErrors();
  await context.close();
});

test("IconAction state switches and commands are truthful without geometry changes", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 900, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "IconAction state and command lifecycle");
  await page.goto(`${mobileUrls.sirio}/components/icon-button`);

  const disclosure = page.locator('[data-icon-action-proof="disclosure"]');
  const disclosureGlyph = disclosure.locator('[data-slot="icon-action"]');
  const disclosureGeometry = await geometry(disclosure);
  await disclosure.click();
  await expect(disclosure).toHaveAttribute("aria-expanded", "true");
  await expect(disclosureGlyph).toHaveAttribute("data-icon-action-state", "open");
  await expect.poll(async () => Math.abs(await disclosureGlyph.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).a))).toBeGreaterThan(0.99);
  for (let index = 0; index < 5; index += 1) await disclosure.click();
  await expect(disclosure).toHaveAttribute("aria-expanded", "false");
  expect(await geometry(disclosure)).toEqual(disclosureGeometry);

  const visibility = page.locator('[data-icon-action-proof="visibility"]');
  const visibilitySlot = visibility.locator('[data-slot="icon-action"]');
  const visibilityGeometry = await geometry(visibilitySlot);
  await visibility.click();
  await expect(visibility).toHaveAccessibleName("Nascondi valore");
  await expect(visibilitySlot).toHaveAttribute("data-icon-action-state", "visible");
  await expect.poll(() => visibilitySlot.locator('[data-icon-action-layer="visible"]').evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity))).toBeGreaterThan(0.99);
  expect(await geometry(visibilitySlot)).toEqual(visibilityGeometry);

  const menu = page.locator('[data-icon-action-proof="menu"]');
  const menuSlot = menu.locator('[data-slot="icon-action"]');
  const menuGeometry = await geometry(menu);
  await expect(menuSlot).toHaveAttribute("data-icon-action-state", "closed");
  await expect(menuSlot.locator('.tabler-icon-menu path')).toHaveCount(2);
  await menu.hover();
  await expect.poll(() => menuSlot.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).d)).toBeGreaterThan(1.15);
  expect(await geometry(menu)).toEqual(menuGeometry);
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(menuSlot).toHaveAttribute("data-icon-action-state", "open");
  await expect.poll(() => menuSlot.locator('[data-icon-action-layer="open"]').evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity))).toBeGreaterThan(0.99);
  await expect.poll(() => menuSlot.evaluate((element) => {
    const matrix = new DOMMatrix(getComputedStyle(element).transform);
    return Math.abs(Math.hypot(matrix.a, matrix.b) - Math.hypot(matrix.c, matrix.d));
  })).toBeLessThan(0.005);
  for (let index = 0; index < 6; index++) await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await page.mouse.move(5, 5);
  await expect.poll(() => menuSlot.evaluate((element) => getComputedStyle(element).transform)).toBe("none");
  expect(await geometry(menu)).toEqual(menuGeometry);

  const clear = page.locator('[data-icon-action-proof="clear"]');
  await clear.click();
  await expect(page.locator('[data-icon-action-output="clear"]')).toHaveText("Cancellato");
  await expect(clear).toHaveAccessibleName("Ripristina valore");
  await expect(clear).toBeFocused();
  await expect(clear.locator(".tabler-icon-reload")).toBeVisible();
  await clear.press("Enter");
  await expect(page.locator('[data-icon-action-output="clear"]')).toHaveText("QVX-204");
  await expect(clear).toHaveAccessibleName("Cancella valore");

  const increment = page.locator('[data-icon-action-proof="increment"]');
  const decrement = page.locator('[data-icon-action-proof="decrement"]');
  await increment.hover();
  await expect.poll(() => increment.locator('[data-slot="icon-action"]').evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).a)).toBeGreaterThan(1.05);
  await increment.click();
  await increment.click();
  await decrement.click();
  await expect(page.locator('[data-icon-action-output="count"]')).toHaveText("5");
  assertNoRuntimeErrors();
  await context.close();
});

test("increment and decrement glyphs stay centered throughout surface hover, press and release", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 900, touch: false });
  const page = await context.newPage();
  await page.goto(`${mobileUrls.sirio}/components/icon-button`);
  for (const intent of ["increment", "decrement"]) {
    const action = page.locator(`[data-icon-action-proof="${intent}"]`);
    const sampleCenter = () => action.evaluate(async (element) => {
      const offsets = [];
      for (let frame = 0; frame < 20; frame++) {
        await new Promise(requestAnimationFrame);
        const glyph = element.querySelector('[data-slot="icon-action"]')!.getBoundingClientRect();
        const surface = element.querySelector('[data-slot="icon-button-motion-surface"]')!.getBoundingClientRect();
        offsets.push(Math.abs(glyph.x + glyph.width / 2 - surface.x - surface.width / 2), Math.abs(glyph.y + glyph.height / 2 - surface.y - surface.height / 2));
      }
      return Math.max(...offsets);
    });
    await action.hover();
    expect(await sampleCenter()).toBeLessThan(0.05);
    await page.mouse.down();
    expect(await sampleCenter()).toBeLessThan(0.05);
    await page.mouse.up();
    expect(await sampleCenter()).toBeLessThan(0.05);
    await page.mouse.move(5, 5);
    expect(await sampleCenter()).toBeLessThan(0.05);
  }
  await context.close();
});

test("IconButton state labels and clear-restore never reposition sibling controls", async ({ browser }) => {
  for (const width of [1024, 320]) {
    const context = await createInputContext(browser, { width, height: 900, touch: width === 320 });
    const page = await context.newPage();
    await page.goto(`${mobileUrls.sirio}/components/icon-button`);
    const specimen = page.locator('[data-visual-specimen="sirio-toggle-button-icon-only"]');
    const positions = () => specimen.evaluate((element) => {
      const origin = element.getBoundingClientRect();
      return [element, ...element.querySelectorAll("button")].map((node) => {
        const rect = node.getBoundingClientRect();
        return { x: rect.x - origin.x, y: rect.y - origin.y, width: rect.width, height: rect.height };
      });
    });
    const initial = await positions();
    const save = specimen.locator('[data-icon-button-proof="loading"]');
    await expect(specimen.locator('[data-toggle-button-geometry-row]').getByRole('button')).toHaveCount(5);
    await expect(save).toHaveAccessibleName("Salva");
    if (width === 320) await save.tap();
    else await save.click();
    await expect(save).toHaveAttribute("aria-busy", "true");
    await expect(save).toHaveAccessibleName("Salvataggio in corso");
    await expect(specimen.locator('[data-icon-action-output="save"]')).toHaveText("Salvataggio in corso");
    await expect(save.locator('[data-slot="spinner"]')).toBeVisible();
    expect(await positions()).toEqual(initial);
    await expect(save).not.toHaveAttribute("aria-busy", "true");
    await expect(save).toHaveAccessibleName("Salva");
    await expect(save).toBeFocused();
    expect(await positions()).toEqual(initial);
    for (const selector of ['[data-icon-action-proof="menu"]', '[data-icon-action-proof="disclosure"]', '[data-icon-action-proof="visibility"]', '[data-toggle-button-proof="icon-only"]', '[data-icon-action-proof="clear"]']) {
      const action = specimen.locator(selector);
      for (let index = 0; index < 4; index++) {
        if (width === 320) await action.tap();
        else await action.click();
        expect(await positions()).toEqual(initial);
      }
    }
    const clear = specimen.locator('[data-icon-action-proof="clear"]');
    await clear.focus();
    await clear.press("Space");
    await expect(clear).toBeFocused();
    await expect(clear).toHaveAccessibleName("Ripristina valore");
    await clear.press("Enter");
    await expect(clear).toBeFocused();
    expect(await positions()).toEqual(initial);
    await context.close();
  }
});

test("menu reacts to live reduced-motion changes without retaining a hover deformation", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 900, touch: false });
  const page = await context.newPage();
  await page.goto(`${mobileUrls.sirio}/components/icon-button`);
  const menu = page.locator('[data-icon-action-proof="menu"]');
  const slot = menu.locator('[data-slot="icon-action"]');
  await menu.hover();
  await expect.poll(() => slot.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).d)).toBeGreaterThan(1.15);
  await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
  await expect(slot).toHaveAttribute("data-reduced-motion", "true");
  await expect(slot).toHaveCSS("transform", "none");
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(slot.locator('[data-icon-action-layer="open"]')).toHaveCSS("opacity", "1");
  await expect(slot).toHaveCSS("transform", "none");
  await page.emulateMedia({ reducedMotion: "no-preference", forcedColors: "none" });
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await menu.hover();
  await expect.poll(() => slot.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).d)).toBeGreaterThan(1.15);
  await context.close();
});

test("IconAction removes nonessential spatial motion while preserving semantic state at 320px", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 320, height: 720, touch: true, reducedMotion: "reduce" });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "IconAction reduced motion and coarse pointer");
  await page.goto(`${mobileUrls.sirio}/components/icon-button`);

  const forward = page.locator('[data-icon-action-proof="forward"]');
  const forwardGlyph = forward.locator('[data-slot="icon-action"]');
  const target = await geometry(forward);
  expect(target.width).toBeGreaterThanOrEqual(44);
  expect(target.height).toBeGreaterThanOrEqual(44);
  await expect(forwardGlyph).toHaveAttribute("data-reduced-motion", "true");
  await forward.tap();
  expect(await forwardGlyph.evaluate((element) => {
    const matrix = new DOMMatrix(getComputedStyle(element).transform);
    return { x: matrix.e, y: matrix.f };
  })).toEqual({ x: 0, y: 0 });
  await expect(forward.locator('[data-slot="icon-button-motion-surface"]')).toHaveCSS("transform", "none");

  const visibility = page.locator('[data-icon-action-proof="visibility"]');
  await visibility.tap();
  await expect(visibility.locator('[data-slot="icon-action"]')).toHaveAttribute("data-icon-action-state", "visible");
  await expect(visibility.locator('[data-icon-action-layer="visible"]')).toHaveCSS("opacity", "1");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  assertNoRuntimeErrors();
  await context.close();
});
