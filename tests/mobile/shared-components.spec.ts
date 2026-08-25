import { expect, test, type Locator, type Page } from "@playwright/test";

import { createInputContext, mobileUrls } from "./support/context";
import { trackRuntimeErrors } from "./support/diagnostics";
import { expectNoDocumentOverflow, expectTouchTarget, expectWithinVisualViewport } from "./support/geometry";

async function tabTo(page: Page, target: Locator, maximumTabs = 80) {
  for (let index = 0; index < maximumTabs; index += 1) {
    await page.keyboard.press("Tab");
    if (await target.evaluate((element) => element === document.activeElement)) return;
  }

  await expect(target).toBeFocused();
}

async function installClipboardMock(page: Page) {
  await page.addInitScript(() => {
    type ClipboardMode = "success" | "slow" | "rejected" | "unavailable";
    type CopyTestWindow = Window & {
      __copyTest: { calls: string[]; mode: ClipboardMode };
    };
    const scope = window as CopyTestWindow;
    scope.__copyTest = { calls: [], mode: "success" };
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      get() {
        if (scope.__copyTest.mode === "unavailable") return undefined;
        return {
          async writeText(value: string) {
            scope.__copyTest.calls.push(value);
            if (scope.__copyTest.mode === "slow") await new Promise((resolve) => setTimeout(resolve, 120));
            if (scope.__copyTest.mode === "rejected") throw new DOMException("Permission denied", "NotAllowedError");
          },
        };
      },
    });
  });
}

test("ToggleButton coordinates stateful copy, physical press, parent updates, and stable geometry", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 768, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "ToggleButton interaction lifecycle");
  await page.goto(`${mobileUrls.sirio}/components/toggle-button`);

  const toggle = page.locator('[data-toggle-button-proof="stateful-copy"]');
  const physical = toggle.locator('[data-slot="toggle-button-interaction-surface"]');
  const visual = toggle.locator('[data-slot="toggle-button-visual-surface"]');
  const hover = toggle.locator('[data-slot="toggle-button-hover-surface"]');
  const persistent = toggle.locator('[data-slot="toggle-button-state-surface"]');
  for (const target of [toggle, physical, visual, hover, persistent]) {
    await expect(target).toHaveCSS("border-radius", "10px");
  }
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(toggle).toHaveAccessibleName("Fissa elemento");
  const geometryBefore = await page.locator('[data-toggle-button-geometry-row]').evaluate((row) => {
    const button = row.querySelector<HTMLElement>('[data-slot="toggle-button"]')!;
    const before = row.querySelector<HTMLElement>('[data-toggle-button-sibling="before"]')!;
    const after = row.querySelector<HTMLElement>('[data-toggle-button-sibling="after"]')!;
    return [button, before, after].map((element) => ({
      height: element.offsetHeight,
      left: element.offsetLeft,
      top: element.offsetTop,
      width: element.offsetWidth,
    }));
  });
  await toggle.hover();
  const box = await toggle.boundingBox();
  expect(box).not.toBeNull();
  const hoveredPhysicalBox = await physical.boundingBox();
  expect(hoveredPhysicalBox).not.toBeNull();
  expect(Math.abs(
    (box!.x - hoveredPhysicalBox!.x) -
    (hoveredPhysicalBox!.x + hoveredPhysicalBox!.width - (box!.x + box!.width)),
  )).toBeLessThan(0.1);
  expect(Math.abs(
    (box!.y - hoveredPhysicalBox!.y) -
    (hoveredPhysicalBox!.y + hoveredPhysicalBox!.height - (box!.y + box!.height)),
  )).toBeLessThan(0.1);
  await page.mouse.down();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect.poll(() => physical.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).d)).toBeLessThan(0.97);
  const pressedPhysicalBox = await physical.boundingBox();
  expect(pressedPhysicalBox).not.toBeNull();
  expect(Math.abs(
    (box!.x - pressedPhysicalBox!.x) -
    (pressedPhysicalBox!.x + pressedPhysicalBox!.width - (box!.x + box!.width)),
  )).toBeLessThan(0.1);
  expect(Math.abs(
    (box!.y - pressedPhysicalBox!.y) -
    (pressedPhysicalBox!.y + pressedPhysicalBox!.height - (box!.y + box!.height)),
  )).toBeLessThan(0.1);
  await page.mouse.up();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(toggle).toHaveAccessibleName("Elemento fissato");
  await expect.poll(() => persistent.evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity))).toBeGreaterThan(0.95);
  await expect.poll(() => physical.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).d)).toBeGreaterThan(0.99);
  const geometryAfter = await page.locator('[data-toggle-button-geometry-row]').evaluate((row) => {
    const button = row.querySelector<HTMLElement>('[data-slot="toggle-button"]')!;
    const before = row.querySelector<HTMLElement>('[data-toggle-button-sibling="before"]')!;
    const after = row.querySelector<HTMLElement>('[data-toggle-button-sibling="after"]')!;
    return [button, before, after].map((element) => ({
      height: element.offsetHeight,
      left: element.offsetLeft,
      top: element.offsetTop,
      width: element.offsetWidth,
    }));
  });
  expect(geometryAfter).toEqual(geometryBefore);

  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width + 24, box!.y + box!.height + 24);
  await page.mouse.up();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => physical.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).a)).toBeCloseTo(1, 2);

  const controlled = page.locator('[data-toggle-button-proof="controlled"]');
  const controlledPhysical = controlled.locator('[data-slot="toggle-button-interaction-surface"]');
  await expect(controlled).toHaveAccessibleName("Fissa elemento");
  await controlled.focus();
  await page.locator('[data-toggle-button-parent-control]').click();
  await expect(page.locator('[data-toggle-button-render-blur-count]')).toHaveText("1");
  await expect(controlled).toHaveAttribute("aria-pressed", "true");
  await expect(controlled).toHaveAccessibleName("Elemento fissato");
  await expect.poll(() => controlledPhysical.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).a)).toBeCloseTo(1, 2);

  await page.mouse.click(8, 8);
  await tabTo(page, toggle);
  await expect.poll(() => toggle.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(toggle).toHaveCSS("outline-width", "2px");
  assertNoRuntimeErrors();
  await context.close();
});

test("ToggleButton keeps coarse targets and reduced-motion state feedback", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 320, height: 720, touch: true, reducedMotion: "reduce" });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "ToggleButton coarse and reduced motion");
  await page.goto(`${mobileUrls.sirio}/components/toggle-button`);
  const toggle = page.locator('[data-toggle-button-proof="stateful-copy"]');
  await expectTouchTarget(toggle, "ToggleButton stateful copy");
  await expect(toggle).toHaveAttribute("data-reduced-motion", "true");
  await toggle.tap();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(toggle).toHaveAccessibleName("Elemento fissato");
  await expect(toggle.locator('[data-slot="toggle-button-interaction-surface"]')).toHaveCSS("transform", "none");
  await page.locator("html").evaluate((element) => element.classList.add("dark"));
  await expect.poll(() => toggle.locator('[data-slot="toggle-button-state-surface"]').evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity))).toBeGreaterThan(0.95);
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await expect(toggle.locator('[data-slot="toggle-button-state-surface"]')).toHaveCSS("border-top-width", "1px");
  assertNoRuntimeErrors();
  await context.close();
});

test("IconButton keeps root geometry stable through hover, squash, cancel, and rapid activation", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 768, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "IconButton interaction lifecycle");
  await page.goto(`${mobileUrls.sirio}/components/icon-button`);

  const button = page.locator('[data-icon-button-proof="rapid"]');
  const surface = button.locator('[data-slot="icon-button-motion-surface"]');
  await button.scrollIntoViewIfNeeded();
  const rootBox = await button.boundingBox();
  expect(rootBox).not.toBeNull();

  await button.hover();
  await expect.poll(() => surface.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).a)).toBeGreaterThan(1.02);
  await expect.poll(() => button.locator('[data-slot="icon-button-semantic-icon"]').evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).e)).toBeGreaterThan(1);
  const hoveredRootBox = await button.boundingBox();
  expect(hoveredRootBox).not.toBeNull();
  const hoverBox = await surface.boundingBox();
  expect(hoverBox).not.toBeNull();
  expect(Math.abs((hoveredRootBox!.x - hoverBox!.x) - (hoverBox!.x + hoverBox!.width - (hoveredRootBox!.x + hoveredRootBox!.width)))).toBeLessThan(0.1);
  expect(Math.abs((hoveredRootBox!.y - hoverBox!.y) - (hoverBox!.y + hoverBox!.height - (hoveredRootBox!.y + hoveredRootBox!.height)))).toBeLessThan(0.1);

  await page.mouse.down();
  await expect.poll(() => surface.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).d)).toBeLessThan(0.96);
  await page.mouse.move(rootBox!.x + rootBox!.width + 24, rootBox!.y + rootBox!.height + 24);
  await page.mouse.up();
  await expect.poll(() => surface.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).a)).toBeCloseTo(1, 2);

  await button.click({ clickCount: 5, delay: 20 });
  await expect(page.locator("[data-icon-button-activation-count]")).toHaveText("5");
  const finalBox = await button.boundingBox();
  expect({ width: finalBox!.width, height: finalBox!.height }).toEqual({ width: rootBox!.width, height: rootBox!.height });

  await page.mouse.click(8, 8);
  await tabTo(page, button);
  await expect.poll(() => button.evaluate((element) => element.matches(":focus-visible"))).toBe(true);

  const semanticRegion = page.locator('[data-specimen-region="motion-lifecycle"]');
  const disclosure = semanticRegion.getByRole("button", { name: "Mostra dettagli" });
  await disclosure.click();
  await expect(disclosure).toHaveAttribute("aria-expanded", "true");
  await expect.poll(() => disclosure.locator('[data-slot="icon-button-semantic-icon"]').evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).a)).toBeLessThan(-0.9);
  const neutral = semanticRegion.getByRole("button", { name: "Impostazioni" });
  await neutral.hover();
  await expect(neutral.locator('[data-slot="icon-button-semantic-icon"]')).toHaveCSS("transform", "none");
  assertNoRuntimeErrors();
  await context.close();
});

test("IconButton loading preserves focus and blocks repeated activation", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 390, height: 844, touch: true });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "IconButton loading and coarse target");
  await page.goto(`${mobileUrls.sirio}/components/icon-button`);

  const loading = page.locator('[data-icon-button-proof="loading"]');
  const before = await loading.boundingBox();
  expect(before).not.toBeNull();
  await expectTouchTarget(loading, "IconButton loading");
  await loading.focus();
  await page.keyboard.press("Enter");
  await expect(loading).toHaveAttribute("aria-busy", "true");
  await expect(loading).toHaveAttribute("aria-disabled", "true");
  await expect(loading).toBeFocused();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Space");
  await expect(loading.locator('[data-slot="icon-button-loader"]')).toBeVisible();
  const during = await loading.boundingBox();
  expect({ width: during!.width, height: during!.height }).toEqual({ width: before!.width, height: before!.height });
  await expect(loading).not.toHaveAttribute("aria-busy", "true", { timeout: 2500 });
  await expect(loading).toBeFocused();

  const targets = page.locator("[data-icon-button-target-grid] [data-slot=icon-button]");
  await expect(targets).toHaveCount(4);
  for (let index = 0; index < 4; index += 1) await expectTouchTarget(targets.nth(index), `IconButton target ${index + 1}`);
  const boxes = await targets.evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().toJSON()));
  for (let index = 1; index < boxes.length; index += 1) expect(boxes[index]!.left).toBeGreaterThanOrEqual(boxes[index - 1]!.right);
  assertNoRuntimeErrors();
  await context.close();
});

test("IconButton reduced motion removes spatial feedback without hiding state", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 320, height: 720, touch: false, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(`${mobileUrls.sirio}/components/icon-button`);
  const ghost = page.locator('[data-specimen-region="motion-lifecycle"]').getByRole("button", { name: "Impostazioni" });
  const surface = ghost.locator('[data-slot="icon-button-motion-surface"]');
  await expect(ghost).toHaveAttribute("data-reduced-motion", "true");
  await ghost.hover();
  await expect.poll(() => surface.evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity))).toBeGreaterThan(0.95);
  await expect.poll(() => surface.evaluate((element) => getComputedStyle(element).transform)).toBe("none");
  await ghost.focus();
  await expect.poll(() => ghost.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  const outline = page.locator('[data-visual-specimen="sirio-icon-button-variants"]').getByRole("button", { name: "Scarica allegato" });
  await outline.focus();
  await expect(outline).toHaveCSS("outline-width", "2px");
  await expect(outline.locator('[data-slot="icon-button-motion-surface"]')).toHaveCSS("border-top-width", "1px");
  await context.close();
});

test("CloseButton keeps centered Action motion and restores Dialog focus", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 768, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "CloseButton interaction and Dialog composition");
  await page.goto(`${mobileUrls.sirio}/components/close-button`);

  const close = page.locator('[data-close-button-proof="core"]');
  const surface = close.locator('[data-slot="icon-button-motion-surface"]');
  await expect(close).toHaveCSS("width", "28px");
  await expect(close).toHaveCSS("height", "28px");
  await expect(close).toHaveCSS("border-radius", "8px");
  await expect(surface).toHaveCSS("width", "28px");
  await expect(surface).toHaveCSS("height", "28px");
  await expect(surface).toHaveCSS("border-radius", "8px");

  const rootBox = await close.boundingBox();
  expect(rootBox).not.toBeNull();
  await close.hover();
  await expect.poll(() => surface.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).a)).toBeGreaterThan(1.02);
  await expect.poll(() => close.locator('[data-slot="icon-button-semantic-icon"]').evaluate((element) => Math.abs(new DOMMatrix(getComputedStyle(element).transform).b))).toBeGreaterThan(0.02);
  const hoverBox = await surface.boundingBox();
  expect(hoverBox).not.toBeNull();
  expect(Math.abs((rootBox!.x - hoverBox!.x) - (hoverBox!.x + hoverBox!.width - (rootBox!.x + rootBox!.width)))).toBeLessThan(0.1);
  expect(Math.abs((rootBox!.y - hoverBox!.y) - (hoverBox!.y + hoverBox!.height - (rootBox!.y + rootBox!.height)))).toBeLessThan(0.1);

  await page.mouse.down();
  await expect.poll(() => surface.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).d)).toBeLessThan(0.96);
  await page.mouse.move(rootBox!.x + rootBox!.width + 24, rootBox!.y + rootBox!.height + 24);
  await page.mouse.up();
  await expect.poll(() => surface.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).a)).toBeCloseTo(0.78, 2);
  expect(await close.boundingBox()).toEqual(rootBox);

  await page.mouse.click(8, 8);
  await tabTo(page, close);
  await expect.poll(() => close.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
  await expect(close).toHaveCSS("outline-width", "2px");

  const trigger = page.locator("[data-close-button-dialog-trigger]");
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Conferma composizione CloseButton" });
  await expect(dialog).toBeVisible();
  const dialogClose = dialog.getByRole("button", { name: "Chiudi finestra di prova" });
  await dialogClose.focus();
  await expect(dialogClose).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();

  for (let index = 0; index < 3; index += 1) {
    await trigger.click();
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Chiudi finestra di prova" }).click();
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  }

  const liveClose = page.locator('[data-close-button-proof="motion"]');
  await liveClose.click();
  await expect(page.locator("[data-close-button-close-count]")).toContainText("1");
  await page.getByRole("button", { name: "Riapri surface" }).click();
  await page.locator('[data-close-button-proof="motion"]').focus();
  await page.keyboard.press("Space");
  await expect(page.locator("[data-close-button-close-count]")).toContainText("2");

  assertNoRuntimeErrors();
  await context.close();
});

test("CloseButton preserves compact surface, coarse targets, and reduced-motion feedback", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 320, height: 720, touch: true, reducedMotion: "reduce" });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "CloseButton coarse and accessibility modes");
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.goto(`${mobileUrls.sirio}/components/close-button`);

  expect(await page.evaluate(() => ({
    fineHover: matchMedia("(hover: hover) and (pointer: fine)").matches,
    forcedColors: matchMedia("(forced-colors: active)").matches,
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
  }))).toEqual({ fineHover: false, forcedColors: true, reducedMotion: true });

  const targets = page.locator('[data-close-button-target-grid] [data-slot="close-button"]');
  await expect(targets).toHaveCount(3);
  for (let index = 0; index < 3; index += 1) {
    const target = targets.nth(index);
    await expectTouchTarget(target, `CloseButton target ${index + 1}`);
    const targetSurface = target.locator('[data-slot="icon-button-motion-surface"]');
    await expect(targetSurface).toHaveCSS("width", "28px");
    await expect(targetSurface).toHaveCSS("height", "28px");
    await expect(targetSurface).toHaveCSS("border-radius", "8px");
    await expect(targetSurface).toHaveCSS("transform", "none");
  }
  const boxes = await targets.evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().toJSON()));
  for (let index = 1; index < boxes.length; index += 1) expect(boxes[index]!.left).toBeGreaterThanOrEqual(boxes[index - 1]!.right);

  const focusTarget = targets.first();
  await focusTarget.focus();
  await expect(focusTarget).toHaveCSS("outline-width", "2px");
  await expect(focusTarget.locator('[data-slot="icon-button-motion-surface"]')).toHaveCSS("border-top-width", "1px");

  const dialogTrigger = page.locator("[data-close-button-dialog-trigger]");
  await dialogTrigger.tap();
  const dialog = page.getByRole("dialog", { name: "Conferma composizione CloseButton" });
  const dialogClose = dialog.getByRole("button", { name: "Chiudi finestra di prova" });
  const dialogTitle = dialog.getByRole("heading", { name: "Conferma composizione CloseButton" });
  await expectTouchTarget(dialogClose, "Dialog CloseButton coarse target");
  const [titleBox, closeBox] = await Promise.all([dialogTitle.boundingBox(), dialogClose.boundingBox()]);
  expect(titleBox).not.toBeNull();
  expect(closeBox).not.toBeNull();
  expect(titleBox!.x + titleBox!.width).toBeLessThanOrEqual(closeBox!.x);
  await dialogClose.tap();
  await expect(dialog).toBeHidden();
  await expectNoDocumentOverflow(page, "CloseButton 320px proof");
  assertNoRuntimeErrors();
  await context.close();
});

test("CopyButton keeps truthful success, failure, retry, timer, keyboard, and focus lifecycles", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 768, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "CopyButton lifecycle");
  await installClipboardMock(page);
  await page.goto(`${mobileUrls.sirio}/components/copy-button`);

  const copy = page.locator('[data-copy-button-proof="core"]');
  await expect(copy).toHaveAttribute("aria-label", "Copia identificativo");
  await expect(copy).not.toHaveAttribute("aria-pressed");
  const copyBox = await copy.boundingBox();
  expect(copyBox).not.toBeNull();
  await copy.hover();
  await page.mouse.down();
  await page.mouse.move(copyBox!.x + copyBox!.width + 24, copyBox!.y + copyBox!.height + 24);
  await page.mouse.up();
  await expect(copy).toHaveAttribute("data-copy-state", "idle");
  expect(await page.evaluate(() => (window as Window & { __copyTest: { calls: string[] } }).__copyTest.calls)).toHaveLength(0);
  await tabTo(page, copy);
  await page.evaluate(() => { (window as Window & { __copyTest: { mode: string } }).__copyTest.mode = "slow"; });
  await page.keyboard.press("Enter");
  await expect(copy).toHaveAttribute("data-copy-state", "copying");
  await expect(copy).toHaveAttribute("aria-busy", "true");
  await expect(copy).toHaveAttribute("aria-disabled", "true");
  await expect(copy).toBeFocused();
  await expect(copy).toHaveAttribute("data-copy-state", "success");
  await expect(copy).not.toHaveAttribute("aria-busy");
  await expect(copy.locator('[data-slot="copy-button-icon-success"]')).toBeVisible();
  await expect(copy.locator("xpath=following-sibling::*[@data-slot='copy-button-status']")).toHaveText("Copiato negli appunti");
  await expect(copy).toHaveAttribute("aria-label", "Copia identificativo");
  await expect(copy).toBeFocused();

  await page.waitForTimeout(900);
  await page.evaluate(() => { (window as Window & { __copyTest: { mode: string } }).__copyTest.mode = "success"; });
  await page.keyboard.press("Space");
  await page.waitForTimeout(900);
  await expect(copy).toHaveAttribute("data-copy-state", "success");
  await expect(copy).toHaveAttribute("data-copy-state", "idle", { timeout: 1100 });

  const rapid = page.locator('[data-copy-button-proof="rapid"]');
  await rapid.click({ clickCount: 5, delay: 20 });
  await expect(rapid).toHaveAttribute("data-copy-state", "success");
  expect(await page.evaluate(() => (window as Window & { __copyTest: { calls: string[] } }).__copyTest.calls.filter((value) => value === "RAPID-P014").length)).toBe(5);

  const failure = page.locator('[data-copy-button-proof="failure"]');
  await page.evaluate(() => { (window as Window & { __copyTest: { mode: string } }).__copyTest.mode = "unavailable"; });
  await failure.click();
  await expect(failure).toHaveAttribute("data-copy-state", "error");
  await expect(failure.locator('[data-slot="copy-button-icon-error"]')).toBeVisible();
  await expect.poll(() => failure.locator('[data-slot="copy-button-icon-success"]').evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity))).toBeLessThan(0.05);
  await expect(failure.locator("xpath=following-sibling::*[@data-slot='copy-button-status']")).toHaveText("Copia non riuscita. Riprova.");

  await page.evaluate(() => { (window as Window & { __copyTest: { mode: string } }).__copyTest.mode = "rejected"; });
  await failure.click();
  await expect(failure).toHaveAttribute("data-copy-state", "error");
  await page.evaluate(() => { (window as Window & { __copyTest: { mode: string } }).__copyTest.mode = "success"; });
  await failure.click();
  await expect(failure).toHaveAttribute("data-copy-state", "success");

  const disabled = page.locator('[data-copy-button-proof="disabled"]');
  const callsBeforeDisabled = await page.evaluate(() => (window as Window & { __copyTest: { calls: string[] } }).__copyTest.calls.length);
  await expect(disabled).toBeDisabled();
  await disabled.click({ force: true });
  expect(await page.evaluate(() => (window as Window & { __copyTest: { calls: string[] } }).__copyTest.calls.length)).toBe(callsBeforeDisabled);

  await page.goto(`${mobileUrls.sirio}/components/icon-button`);
  await page.waitForTimeout(1700);
  assertNoRuntimeErrors();
  await context.close();
});

test("CopyButton preserves compact geometry, coarse targets, reduced motion, and forced colors", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 320, height: 720, touch: true, reducedMotion: "reduce" });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "CopyButton coarse and accessibility modes");
  await installClipboardMock(page);
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.goto(`${mobileUrls.sirio}/components/copy-button`);

  const target = page.locator('[data-copy-button-proof="core"]');
  await expectTouchTarget(target, "CopyButton core target");
  const targetSurface = target.locator('[data-slot="icon-button-motion-surface"]');
  await expect(targetSurface).toHaveCSS("width", "28px");
  await expect(targetSurface).toHaveCSS("height", "28px");
  await expect(targetSurface).toHaveCSS("border-radius", "8px");
  await expect(targetSurface).toHaveCSS("transform", "none");

  const rapid = page.locator('[data-copy-button-proof="rapid"]');
  await rapid.tap();
  await expect(rapid).toHaveAttribute("data-copy-state", "success");
  await expect(rapid.locator('[data-slot="copy-button-icon-success"]')).toHaveCSS("transform", "none");
  await rapid.focus();
  await expect.poll(() => rapid.evaluate((element) => Number.parseFloat(getComputedStyle(element).outlineWidth))).toBeGreaterThanOrEqual(2);
  await expect(rapid.locator('[data-slot="icon-button-motion-surface"]')).toHaveCSS("border-top-width", "1px");
  await expectNoDocumentOverflow(page, "CopyButton 320px proof");
  assertNoRuntimeErrors();
  await context.close();
});

test("Button keeps stable geometry while browser input drives hover, press, cancel, and rapid activation", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 768, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "Sirio specimen standard");
  await page.goto(`${mobileUrls.sirio}/components/button`);

  await expect(page.locator('[data-slot="marketing-cursor"]')).toHaveAttribute("data-magnetic", "false");

  const variants = page.locator('[data-specimen-region="variants"]');
  await expect(variants).toHaveAccessibleName("Core variants");

  await expect(page.locator('[data-visual-specimen="button-default"]')).toBeVisible();
  const defaultRow = variants.locator('[data-button-variant-row="default"]');
  const button = defaultRow.getByRole("button", { name: "Crea cantiere" });
  const motionSurface = button.locator('[data-slot="button-motion-surface"]');
  await button.scrollIntoViewIfNeeded();

  const initialGeometry = await button.evaluate((element) => ({
    height: (element as HTMLElement).offsetHeight,
    width: (element as HTMLElement).offsetWidth,
  }));
  await button.hover();
  await expect.poll(() => button.evaluate((element) => element.matches(":hover"))).toBe(true);
  await expect.poll(async () => motionSurface.evaluate((element) => {
    const transform = getComputedStyle(element).transform;
    return transform === "none" ? 1 : new DOMMatrix(transform).a;
  })).toBeGreaterThan(1.003);
  await expect.poll(() => motionSurface.evaluate((element) => getComputedStyle(element).boxShadow))
    .not.toBe("none");
  const box = await button.boundingBox();
  expect(box).not.toBeNull();
  const hoverSurfaceBox = await motionSurface.boundingBox();
  expect(hoverSurfaceBox).not.toBeNull();
  expect(Math.abs(
    (box!.x - hoverSurfaceBox!.x) -
    (hoverSurfaceBox!.x + hoverSurfaceBox!.width - (box!.x + box!.width)),
  )).toBeLessThan(0.1);
  expect(Math.abs(
    (box!.y - hoverSurfaceBox!.y) -
    (hoverSurfaceBox!.y + hoverSurfaceBox!.height - (box!.y + box!.height)),
  )).toBeLessThan(0.1);
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await expect.poll(() => button.evaluate((element) => element.matches(":active"))).toBe(true);
  await expect.poll(async () => motionSurface.evaluate((element) => {
    const transform = getComputedStyle(element).transform;
    return transform === "none" ? 1 : new DOMMatrix(transform).a;
  })).toBeGreaterThan(1.01);
  await expect.poll(async () => motionSurface.evaluate((element) => {
    const transform = getComputedStyle(element).transform;
    return transform === "none" ? 1 : new DOMMatrix(transform).d;
  })).toBeLessThan(0.97);
  await expect.poll(async () => motionSurface.evaluate((element) => {
    const transform = getComputedStyle(element).transform;
    return transform === "none" ? 0 : new DOMMatrix(transform).f;
  })).toBeCloseTo(0, 3);
  const pressedSurfaceBox = await motionSurface.boundingBox();
  expect(pressedSurfaceBox).not.toBeNull();
  expect(Math.abs(
    (box!.x - pressedSurfaceBox!.x) -
    (pressedSurfaceBox!.x + pressedSurfaceBox!.width - (box!.x + box!.width)),
  )).toBeLessThan(0.1);
  expect(Math.abs(
    (box!.y - pressedSurfaceBox!.y) -
    (pressedSurfaceBox!.y + pressedSurfaceBox!.height - (box!.y + box!.height)),
  )).toBeLessThan(0.1);
  await expect.poll(() => motionSurface.evaluate((element) => {
    const shadow = getComputedStyle(element).boxShadow;
    return shadow === "none" || !shadow.includes("0.18");
  })).toBe(true);
  await expect(button).toHaveCSS("transform", "none");
  await page.mouse.move(box!.x + box!.width + 24, box!.y + box!.height + 24);
  await expect.poll(async () => motionSurface.evaluate((element) => {
    const transform = getComputedStyle(element).transform;
    return transform === "none" ? 1 : new DOMMatrix(transform).a;
  })).toBeCloseTo(1, 2);
  await page.mouse.up();
  await expect.poll(() => button.evaluate((element) => element.matches(":active"))).toBe(false);

  await button.hover();
  await page.mouse.down();
  await page.mouse.up();

  await button.click({ clickCount: 3, delay: 20 });
  await expect(page.locator('[data-button-activation-count]')).toHaveText("4");
  expect(await button.evaluate((element) => ({
    height: (element as HTMLElement).offsetHeight,
    width: (element as HTMLElement).offsetWidth,
  }))).toEqual({ height: initialGeometry.height, width: initialGeometry.width });

  const normalPrimary = page.getByRole("button", { name: "Primary normale" });
  const magneticPrimary = page.locator('[data-magnetic-cta-proof]');
  const cursor = page.locator('[data-slot="marketing-cursor"]');
  await normalPrimary.hover();
  await expect(cursor).toHaveAttribute("data-magnetic", "false");
  await magneticPrimary.scrollIntoViewIfNeeded();
  await page.waitForTimeout(550);
  const magneticBox = await magneticPrimary.boundingBox();
  expect(magneticBox).not.toBeNull();
  const pointer = { x: magneticBox!.x + 4, y: magneticBox!.y + magneticBox!.height / 2 };
  await page.mouse.move(pointer.x, pointer.y);
  await expect(cursor).toHaveAttribute("data-magnetic", "true");
  const magneticPosition = await cursor.locator('.marketing-cursor__core').evaluate((element) => {
    const match = (element as HTMLElement).style.transform.match(/translate3d\(([-\d.]+)px,\s*([-\d.]+)px/);
    return match ? { x: Number(match[1]), y: Number(match[2]) } : null;
  });
  expect(magneticPosition).not.toBeNull();
  expect(Math.hypot(magneticPosition!.x - pointer.x, magneticPosition!.y - pointer.y)).toBeLessThanOrEqual(3.05);
  await page.mouse.move(magneticBox!.x + magneticBox!.width + 30, magneticBox!.y + magneticBox!.height + 30);
  await expect(cursor).toHaveAttribute("data-magnetic", "false");

  await page.mouse.click(8, 8);
  await tabTo(page, button);
  await expect.poll(() => button.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
  const keyboardFocusNames = ["Primaria", "Secondaria", "Outline", "Ghost", "Distruttiva"];
  const firstKeyboardFocus = page.getByRole("button", { name: keyboardFocusNames[0], exact: true });
  await tabTo(page, firstKeyboardFocus);
  for (const [index, name] of keyboardFocusNames.entries()) {
    if (index > 0) await page.keyboard.press("Tab");
    const focusedVariant = page.getByRole("button", { name, exact: true });
    await expect(focusedVariant).toBeFocused();
    await expect.poll(() => focusedVariant.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
    await expect(focusedVariant).toHaveCSS("outline-width", "2px");
  }
  for (const name of ["Crea cantiere", "Salva bozza", "Esporta riepilogo", "Altre azioni", "Elimina bozza"]) {
    const variant = page.getByRole("button", { name });
    await variant.focus();
    await expect.poll(() => variant.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
    await expect(variant).toHaveCSS("outline-width", "2px");
  }
  assertNoRuntimeErrors();
  await context.close();
});

test("Button variants use opaque surfaces and Ghost owns a Motion interaction surface", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 768, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "Button variant motion profiles");
  await page.goto(`${mobileUrls.sirio}/components/button`);

  const ghost = page.getByRole("button", { name: "Altre azioni" });
  const ghostSurface = ghost.locator('[data-slot="button-motion-surface"]');
  await expect.poll(() => ghostSurface.evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity)))
    .toBeLessThan(0.05);
  await ghost.hover();
  await expect.poll(() => ghostSurface.evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity)))
    .toBeGreaterThan(0.95);
  await page.mouse.down();
  await expect(ghostSurface).toHaveCSS("box-shadow", "none");
  await expect.poll(() => ghostSurface.evaluate((element) => {
    const transform = getComputedStyle(element).transform;
    return transform === "none" ? 1 : new DOMMatrix(transform).d;
  })).toBeLessThan(0.97);
  await page.mouse.up();

  for (const name of ["Crea cantiere", "Salva bozza", "Esporta riepilogo", "Elimina bozza"]) {
    const surface = page.getByRole("button", { name }).locator('[data-slot="button-motion-surface"]');
    const alpha = await surface.evaluate((element) => getComputedStyle(element).backgroundColor.match(/[\d.]+(?=\))$/)?.[0] ?? "1");
    expect(Number(alpha)).toBe(1);
  }
  await expect(page.locator('[data-button-variant-row="link"]')).toHaveCount(0);

  const continueButton = page.getByRole("button", { name: "Continua" });
  await continueButton.hover();
  await expect.poll(() => continueButton.locator('[data-icon-motion="directional-right"]').evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).e)).toBeGreaterThan(1);

  assertNoRuntimeErrors();
  await context.close();
});

test("Button loading preserves focus and geometry while preventing repeated activation", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 768, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "Button loading lifecycle");
  await page.goto(`${mobileUrls.sirio}/components/button`);

  const button = page.locator('[data-button-proof="loading-lifecycle"]');
  const loadingRow = page.locator('[data-button-loading-row]');
  const readLoadingGeometry = () => loadingRow.evaluate((row) => {
    const button = row.querySelector<HTMLElement>('[data-slot="button"]')!;
    const before = row.querySelector<HTMLElement>('[data-button-loading-sibling="before"]')!;
    const after = row.querySelector<HTMLElement>('[data-button-loading-sibling="after"]')!;
    return [before, button, after].map((element) => ({
      height: element.offsetHeight,
      left: element.offsetLeft,
      top: element.offsetTop,
      width: element.offsetWidth,
    }));
  });
  const initialLayoutGeometry = await readLoadingGeometry();
  const initialBox = await button.boundingBox();
  expect(initialBox).not.toBeNull();
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(button).toHaveAttribute("aria-busy", "true");
  await expect(button).toHaveAttribute("aria-disabled", "true");
  await expect(button).toBeFocused();
  await expect.poll(() => button.evaluate((element) => {
    const label = element.querySelector('[data-slot="button-label"]');
    const loader = element.querySelector('[data-slot="button-loader"]');
    if (!label || !loader) return false;
    const labelOpacity = Number.parseFloat(
      getComputedStyle(label).opacity,
    );
    const loaderOpacity = Number.parseFloat(
      getComputedStyle(loader).opacity,
    );
    return labelOpacity > 0.05 && labelOpacity < 0.95 && loaderOpacity > 0.05 && loaderOpacity < 0.95;
  })).toBe(true);
  await page.keyboard.press("Enter");
  await page.keyboard.press("Space");
  await expect(page.locator('[data-button-submit-count]')).toHaveText("1");
  const loadingBox = await button.boundingBox();
  expect(loadingBox).not.toBeNull();
  expect({ width: loadingBox!.width, height: loadingBox!.height }).toEqual({
    width: initialBox!.width,
    height: initialBox!.height,
  });
  await expect(button.locator('[data-slot="button-loader"]')).toBeVisible();
  expect(await readLoadingGeometry()).toEqual(initialLayoutGeometry);
  await expect(button.locator('[data-slot="button-motion-content"]')).toHaveCount(1);
  await expect(button.locator('[data-slot="button-loader"]')).toHaveCount(1);
  await expect(button).not.toHaveAttribute("aria-busy", "true", { timeout: 2500 });
  await expect(button).toBeFocused();
  expect(await readLoadingGeometry()).toEqual(initialLayoutGeometry);
  assertNoRuntimeErrors();
  await context.close();
});

test("coarse-pointer text Buttons expose a 44px target without sticky hover", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 390, height: 844, touch: true });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "shared touch targets");
  await page.goto(`${mobileUrls.sirio}/components/button`);
  assertNoRuntimeErrors();
  for (const name of ["Compatto XS", "Compatto SM", "Misura standard", "Azione ampia"]) {
    await expectTouchTarget(page.getByRole("button", { name }), name);
  }
  const compact = page.getByRole("button", { name: "Compatto XS" });
  const initialVisual = await compact.evaluate((element) => ({
    backgroundColor: getComputedStyle(element).backgroundColor,
    transform: getComputedStyle(element.querySelector('[data-slot="button-motion-content"]')!).transform,
  }));
  await compact.tap();
  await expect.poll(() => compact.evaluate((element) => ({
    backgroundColor: getComputedStyle(element).backgroundColor,
    transform: getComputedStyle(element.querySelector('[data-slot="button-motion-content"]')!).transform,
  }))).toEqual(initialVisual);
  await context.close();
});

test("Button keyboard and reduced-motion feedback preserve native activation and immediate focus", async ({ browser }) => {
  const context = await createInputContext(browser, {
    width: 320,
    height: 720,
    touch: false,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "Button keyboard reduced motion");
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.goto(`${mobileUrls.sirio}/components/button`);

  const button = page.locator('[data-button-proof="keyboard"]');
  await tabTo(page, button);
  await expect.poll(() => button.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
  await page.keyboard.press("Enter");
  await page.keyboard.press("Space");
  await expect(page.locator('[data-button-keyboard-count]')).toHaveText("2");
  await button.hover();
  const box = await button.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await expect(button.locator('[data-slot="button-motion-content"]')).toHaveCSS("transform", "none");
  await page.mouse.up();
  await expectNoDocumentOverflow(page, "Button 320px reduced-motion proof");
  assertNoRuntimeErrors();
  await context.close();
});

test("Button keyboard press lifecycle is native and physically consistent for Enter and Space", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 768, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "Button keyboard press lifecycle");
  await page.goto(`${mobileUrls.sirio}/components/button`);

  const button = page.locator('[data-button-proof="keyboard"]');
  await button.focus();

  for (const key of ["Enter", "Space"]) {
    await page.keyboard.down(key);
    await page.keyboard.up(key);
  }

  await expect(page.locator('[data-button-keyboard-count]')).toHaveText("2");
  await expect(button).toBeFocused();
  assertNoRuntimeErrors();
  await context.close();
});

test("shortcut hints follow input capability instead of viewport or user agent", async ({ browser }) => {
  const touchContext = await createInputContext(browser, { width: 1024, height: 768, touch: true });
  const touchPage = await touchContext.newPage();
  const assertNoTouchRuntimeErrors = trackRuntimeErrors(touchPage, "touch shortcut capability");
  await touchPage.goto(`${mobileUrls.sirio}/components/topbar`);
  await expect(touchPage.locator('[data-slot="kbd-shortcut"]')).toHaveCount(0);
  assertNoTouchRuntimeErrors();
  await touchContext.close();

  const pointerContext = await createInputContext(browser, { width: 1024, height: 768, touch: false });
  const pointerPage = await pointerContext.newPage();
  const assertNoPointerRuntimeErrors = trackRuntimeErrors(pointerPage, "fine-pointer shortcut capability");
  await pointerPage.goto(`${mobileUrls.sirio}/components/topbar`);
  await expect(pointerPage.locator('[data-slot="kbd-shortcut"]').first()).toBeVisible();
  assertNoPointerRuntimeErrors();
  await pointerContext.close();
});

test("mobile dialog respects dynamic height, synthetic safe areas, and interrupted close", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 390, height: 720, touch: true, reducedMotion: "reduce" });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "mobile dialog");
  await page.goto(`${mobileUrls.sirio}/components/dialog`);
  await page.addStyleTag({
    content: `:root { --safe-area-top: 24px !important; --safe-area-right: 12px !important; --safe-area-bottom: 28px !important; --safe-area-left: 12px !important; }`,
  });
  const trigger = page.getByRole("button", { name: "Nuovo Cantiere" });
  await trigger.tap();
  const dialog = page.getByRole("dialog", { name: "Crea Nuovo Cantiere" });
  await expectWithinVisualViewport(dialog, "Sirio mobile dialog");
  await expectNoDocumentOverflow(page, "Sirio dialog with safe area");
  await page.getByRole("button", { name: "Chiudi creazione cantiere" }).tap();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  assertNoRuntimeErrors();
  await context.close();
});

test("motion foundation exposes every canonical role, phase, easing, and control", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 768, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "motion foundation coverage");
  await page.goto(`${mobileUrls.sirio}/foundations/motion`);

  await expect(page.getByRole("link", { name: "Motion", exact: true })).toBeVisible();
  await expect(page.locator('[data-visual-specimen="motion-roles"]')).toHaveCount(4);
  for (const role of ["instant", "feedback", "state", "surface"]) {
    await expect(page.locator(`[data-motion-demo="${role}"]`)).toHaveCount(1);
  }
  await expect(page.locator('[data-motion-phase-step]')).toHaveCount(4);
  await expect(page.locator('[data-motion-easing="standard"]')).toHaveCSS(
    "transition-timing-function",
    "cubic-bezier(0.2, 0, 0, 1), cubic-bezier(0.2, 0, 0, 1)",
  );
  await expect(page.locator('[data-motion-easing="emphasized"]')).toHaveCSS(
    "transition-timing-function",
    "cubic-bezier(0.16, 1, 0.3, 1), cubic-bezier(0.2, 0, 0, 1)",
  );

  const lab = page.locator('[data-motion-lab]');
  await expect(lab).toHaveAttribute("data-motion-mode", "system");
  await expect(lab).toHaveAttribute("data-motion-phase", "rest");
  await page.getByRole("button", { name: "Normale", exact: true }).click();
  await expect(lab).toHaveAttribute("data-motion-mode", "normal");
  await page.getByRole("button", { name: "Avvia", exact: true }).click();
  await expect(lab).toHaveAttribute("data-active", "true");
  await expect(lab).toHaveAttribute("data-motion-phase", "settled");
  await expect(page.locator('[data-motion-demo="surface"]')).toHaveAttribute(
    "data-surface-mounted",
    "true",
  );
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(lab).toHaveAttribute("data-active", "false");
  await expect(lab).toHaveAttribute("data-motion-phase", "rest");
  assertNoRuntimeErrors();
  await context.close();
});

test("motion foundation retargets rapid repeated input without layout shift", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 390, height: 844, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "motion foundation rapid input");
  await page.goto(`${mobileUrls.sirio}/foundations/motion`);

  const proof = page.locator('[data-motion-lab]');
  const trigger = page.getByRole("button", { name: "Inverti", exact: true });
  const track = proof.locator('[data-motion-track]');
  const indicator = proof.locator('[data-motion-indicator]');
  await proof.scrollIntoViewIfNeeded();
  await trigger.focus();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Space");
  await page.keyboard.press("Space");
  await expect(trigger).toHaveAttribute("aria-pressed", "false");
  await expect(indicator).toHaveCSS("transition-property", "transform, background-color, color");
  expect(
    await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches)
  ).toBe(true);
  const beforeProof = await proof.boundingBox();
  const beforeTrack = await track.boundingBox();

  await page.getByRole("button", { name: "Input rapido ×3", exact: true }).click();

  await expect(proof).toHaveAttribute("data-active", "true");
  await expect(proof.getByText(/Stato:\s*attivo/)).toBeVisible();
  await expect.poll(async () => track.getAttribute("data-settled")).toBe("true");
  const afterProof = await proof.boundingBox();
  const afterTrack = await track.boundingBox();
  expect(beforeProof).not.toBeNull();
  expect(beforeTrack).not.toBeNull();
  expect(afterProof).not.toBeNull();
  expect(afterTrack).not.toBeNull();
  expect({
    x: afterTrack!.x - afterProof!.x,
    y: afterTrack!.y - afterProof!.y,
    width: afterTrack!.width,
    height: afterTrack!.height,
  }).toEqual({
    x: beforeTrack!.x - beforeProof!.x,
    y: beforeTrack!.y - beforeProof!.y,
    width: beforeTrack!.width,
    height: beforeTrack!.height,
  });
  assertNoRuntimeErrors();
  await context.close();
});

test("reduced motion removes spatial travel but preserves clear color feedback", async ({ browser }) => {
  const context = await createInputContext(browser, {
    width: 390,
    height: 844,
    touch: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "motion foundation reduced motion");
  await page.goto(`${mobileUrls.sirio}/foundations/motion`);

  const trigger = page.getByRole("button", { name: "Avvia", exact: true });
  const track = page.locator('[data-motion-track]');
  const indicator = page.locator('[data-motion-indicator]');
  await trigger.tap();

  await expect(page.locator('[data-motion-lab]')).toHaveAttribute("data-active", "true");
  await expect(page.getByText(/Stato:\s*attivo/)).toBeVisible();
  await expect(track).toHaveAttribute("data-settled", "true");
  await expect(indicator).toHaveCSS("transition-property", "background-color, color");
  expect(
    await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches)
  ).toBe(false);
  assertNoRuntimeErrors();
  await context.close();
});

test("motion foundation preserves state clarity in light and dark themes", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 768, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "motion foundation theme parity");
  await page.goto(`${mobileUrls.sirio}/foundations/motion`);

  const proof = page.locator('[data-motion-lab]');
  const themeTrigger = page.getByRole("button", { name: /Cambia tema/ });

  await themeTrigger.click();
  await page.getByRole("menuitem", { name: "Chiaro" }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  const lightBackground = await proof.evaluate((element) => getComputedStyle(element).backgroundColor);

  await themeTrigger.click();
  await page.getByRole("menuitem", { name: "Scuro" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  const darkBackground = await proof.evaluate((element) => getComputedStyle(element).backgroundColor);

  expect(darkBackground).not.toBe(lightBackground);
  await expect(proof.getByText(/Stato:\s*inattivo/)).toBeVisible();
  assertNoRuntimeErrors();
  await context.close();
});

test("interaction state foundation composes real primitive states without semantic loss", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 768, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "interaction state foundation");
  await page.goto(`${mobileUrls.sirio}/foundations/interaction-states`);

  const foundation = page.locator("[data-interaction-state-foundation]");
  await expect(foundation).toBeVisible();
  await expect(page.getByRole("link", { name: "Interaction states", exact: true })).toBeVisible();

  const aliases = [
    ["selected-tab", "selected"],
    ["selected-toggle", "selected"],
    ["checked", "checked"],
    ["indeterminate", "indeterminate"],
    ["open", "open"],
    ["invalid", "invalid"],
    ["readonly-input", "readonly"],
    ["readonly-textarea", "readonly"],
    ["disabled", "disabled"],
    ["loading", "loading"],
  ] as const;

  for (const [proof, value] of aliases) {
    await expect(page.locator(`[data-state-proof="${proof}"]`)).toHaveCSS(
      "--qv-state-proof",
      value,
    );
  }

  const transient = page.getByRole("button", { name: "Punta, premi e rilascia" });
  const transientSize = await transient.evaluate((element) => ({
    height: (element as HTMLElement).offsetHeight,
    width: (element as HTMLElement).offsetWidth,
  }));
  await transient.hover();
  await expect.poll(() => transient.evaluate((element) => element.matches(":hover"))).toBe(true);
  const transientBox = await transient.boundingBox();
  expect(transientBox).not.toBeNull();
  await page.mouse.move(
    transientBox!.x + transientBox!.width / 2,
    transientBox!.y + transientBox!.height / 2,
  );
  await page.mouse.down();
  await expect.poll(() => transient.evaluate((element) => element.matches(":active"))).toBe(true);
  await page.mouse.up();
  await expect.poll(() => transient.evaluate((element) => element.matches(":active"))).toBe(false);
  await expect(transient).not.toHaveAttribute("aria-selected", "true");
  await expect(transient).not.toHaveAttribute("data-checked", "");
  expect(
    await transient.evaluate((element) => ({
      height: (element as HTMLElement).offsetHeight,
      width: (element as HTMLElement).offsetWidth,
    })),
  ).toEqual(transientSize);

  const selectedTab = page.locator('[data-state-proof="selected-tab"]');
  await selectedTab.hover();
  await expect(selectedTab).toHaveAttribute("aria-selected", "true");

  const additiveFocusCases = [
    [selectedTab, "aria-selected", "true"],
    [page.locator('[data-state-proof="checked"]'), "data-checked", ""],
    [page.locator('[data-state-proof="invalid"]'), "aria-invalid", "true"],
    [page.locator('[data-state-proof="readonly-input"]'), "readonly", ""],
  ] as const;

  await page.keyboard.press("Tab");
  for (const [target, attribute, value] of additiveFocusCases) {
    await target.focus();
    await expect.poll(() => target.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
    await expect(target).toHaveAttribute(attribute, value);
  }

  const readonlyInput = page.locator('[data-state-proof="readonly-input"]');
  await expect(readonlyInput).not.toBeDisabled();
  await readonlyInput.selectText();
  expect(await readonlyInput.evaluate((element) => (element as HTMLInputElement).selectionStart)).toBe(0);

  const disabled = page.locator('[data-state-proof="disabled"]');
  await expect(disabled).toBeDisabled();
  const disabledBefore = await disabled.evaluate((element) => {
    const style = getComputedStyle(element);
    return { backgroundColor: style.backgroundColor, transform: style.transform };
  });
  const disabledBox = await disabled.boundingBox();
  expect(disabledBox).not.toBeNull();
  await page.mouse.move(disabledBox!.x + disabledBox!.width / 2, disabledBox!.y + disabledBox!.height / 2);
  expect(
    await disabled.evaluate((element) => {
      const style = getComputedStyle(element);
      return { backgroundColor: style.backgroundColor, transform: style.transform };
    }),
  ).toEqual(disabledBefore);

  const loading = page.locator('[data-state-proof="loading"]');
  await expect(loading).toBeDisabled();
  await expect(loading).toHaveAttribute("aria-busy", "true");
  await expect(loading).toHaveAttribute("aria-disabled", "true");
  await loading.focus();
  await expect(loading).toBeFocused();

  const disclosure = page.locator('[data-state-proof="open"]');
  await disclosure.evaluate((element: HTMLElement) => {
    element.click();
    element.click();
    element.click();
  });
  await expect(disclosure).toHaveAttribute("aria-expanded", "false");
  await disclosure.evaluate((element: HTMLElement) => {
    element.click();
    element.click();
    element.click();
  });
  await expect(disclosure).toHaveAttribute("aria-expanded", "true");
  await expect(disclosure).toHaveCSS("--qv-state-proof", "open");

  assertNoRuntimeErrors();
  await context.close();
});

test("interaction state foundation remains clear for touch, reduced motion, and forced colors", async ({ browser }) => {
  const context = await createInputContext(browser, {
    width: 390,
    height: 844,
    touch: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "interaction state accessibility modes");
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.goto(`${mobileUrls.sirio}/foundations/interaction-states`);

  expect(
    await page.evaluate(() => ({
      fineHover: matchMedia("(hover: hover) and (pointer: fine)").matches,
      forcedColors: matchMedia("(forced-colors: active)").matches,
      reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    })),
  ).toEqual({ fineHover: false, forcedColors: true, reducedMotion: true });

  const invalid = page.locator('[data-state-proof="invalid"]');
  await invalid.focus();
  await expect.poll(() => invalid.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
  await expect(invalid).toHaveAttribute("aria-invalid", "true");
  expect(
    await invalid.evaluate((element) => {
      const style = getComputedStyle(element);
      return style.outlineStyle !== "none" || style.boxShadow !== "none";
    }),
  ).toBe(true);

  const readonly = page.locator('[data-state-proof="readonly-input"]');
  await readonly.focus();
  await expect(readonly).toBeFocused();
  await expect(readonly).not.toBeDisabled();
  await expect(readonly).toHaveCSS("--qv-state-proof", "readonly");

  const transient = page.getByRole("button", { name: "Punta, premi e rilascia" });
  await transient.tap();
  await expect(transient).not.toHaveAttribute("aria-selected", "true");
  await expect(transient).not.toHaveAttribute("aria-pressed", "true");
  assertNoRuntimeErrors();
  await context.close();
});

test("interaction state foundation preserves semantic state in light and dark themes", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 768, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "interaction state theme parity");
  await page.goto(`${mobileUrls.sirio}/foundations/interaction-states`);

  const foundation = page.locator("[data-interaction-state-foundation]");
  const selected = page.locator('[data-state-proof="selected-tab"]');
  const themeTrigger = page.getByRole("button", { name: /Cambia tema/ });

  await themeTrigger.click();
  await page.getByRole("menuitem", { name: "Chiaro" }).click();
  const lightBackground = await foundation.evaluate((element) => getComputedStyle(element).backgroundColor);
  await expect(selected).toHaveAttribute("aria-selected", "true");

  await themeTrigger.click();
  await page.getByRole("menuitem", { name: "Scuro" }).click();
  const darkBackground = await foundation.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(darkBackground).not.toBe(lightBackground);
  await expect(selected).toHaveAttribute("aria-selected", "true");
  assertNoRuntimeErrors();
  await context.close();
});

test("focus foundation exposes one immediate keyboard indicator without geometry shift", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 768, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "focus foundation keyboard path");
  await page.goto(`${mobileUrls.sirio}/foundations/focus`);

  await expect(page.getByRole("link", { name: "Focus", exact: true })).toBeVisible();
  const foundation = page.locator("[data-focus-foundation]");
  await expect(foundation).toBeVisible();

  for (const proof of ["button", "link", "input", "checkbox", "radio", "switch"]) {
    await expect(page.locator(`[data-focus-proof="${proof}"]`)).toBeVisible();
  }

  const button = page.locator('[data-focus-proof="button"]');
  const initialGeometry = await button.evaluate((element) => ({
    height: (element as HTMLElement).offsetHeight,
    width: (element as HTMLElement).offsetWidth,
  }));
  await tabTo(page, button);
  await expect.poll(() => button.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
  expect(await button.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      offset: style.outlineOffset,
      ringShadow: style.getPropertyValue("--tw-ring-shadow").trim(),
      style: style.outlineStyle,
      transitionProperty: style.transitionProperty,
      width: style.outlineWidth,
    };
  })).toMatchObject({
    offset: "2px",
    style: "solid",
    width: "2px",
  });
  expect(
    await button.evaluate((element) => getComputedStyle(element).transitionProperty),
  ).not.toContain("outline");
  expect(await button.evaluate((element) => ({
    height: (element as HTMLElement).offsetHeight,
    width: (element as HTMLElement).offsetWidth,
  }))).toEqual(initialGeometry);

  const selected = page.locator('[data-focus-proof="selected"]');
  await tabTo(page, selected);
  await expect(selected).toHaveAttribute("data-pressed", "");
  await expect.poll(() => selected.evaluate((element) => element.matches(":focus-visible"))).toBe(true);

  const checked = page.locator('[data-focus-proof="checkbox"]');
  await tabTo(page, checked);
  await expect(checked).toHaveAttribute("data-checked", "");
  await expect.poll(() => checked.evaluate((element) => element.matches(":focus-visible"))).toBe(true);

  const invalid = page.locator('[data-focus-proof="invalid"]');
  await tabTo(page, invalid);
  await expect(invalid).toHaveAttribute("aria-invalid", "true");
  await expect.poll(() => invalid.evaluate((element) => element.matches(":focus-visible"))).toBe(true);

  const readonly = page.locator('[data-focus-proof="readonly"]');
  await tabTo(page, readonly);
  await expect(readonly).toHaveAttribute("readonly", "");
  await expect(readonly).not.toBeDisabled();
  await expect.poll(() => readonly.evaluate((element) => element.matches(":focus-visible"))).toBe(true);

  const composite = page.locator('[data-focus-proof="composite"]');
  const compositeTarget = page.locator('[data-focus-proof="composite-input"]');
  await tabTo(page, compositeTarget);
  await expect(compositeTarget).toBeFocused();
  await expect(composite).toHaveCSS("outline-width", "2px");
  await expect(composite).toHaveCSS("outline-offset", "2px");
  await expect(compositeTarget).toHaveCSS("outline-style", "none");

  await page.mouse.click(8, 8);
  await button.click();
  await expect.poll(() => button.evaluate((element) => element.matches(":focus-visible"))).toBe(false);
  assertNoRuntimeErrors();
  await context.close();
});

test("focus foundation transfers into an overlay and restores the real trigger", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 768, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "focus foundation overlay restoration");
  await page.goto(`${mobileUrls.sirio}/foundations/focus`);

  const trigger = page.locator('[data-focus-proof="dialog-trigger"]');
  await tabTo(page, trigger);
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Enter");

  const dialog = page.getByRole("dialog", { name: "Trasferimento del focus" });
  const initialFocus = page.locator('[data-focus-proof="dialog-initial"]');
  await expect(dialog).toBeVisible();
  await expect(initialFocus).toBeFocused();
  await expect.poll(() => initialFocus.evaluate((element) => element.matches(":focus-visible"))).toBe(true);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect.poll(() => trigger.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
  assertNoRuntimeErrors();
  await context.close();
});

test("focus foundation preserves its geometry and contrast in light and dark themes", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 768, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "focus foundation theme parity");
  await page.goto(`${mobileUrls.sirio}/foundations/focus`);

  const target = page.locator('[data-focus-proof="button"]');
  const themeTrigger = page.getByRole("button", { name: /Cambia tema/ });

  await themeTrigger.click();
  await page.getByRole("menuitem", { name: "Chiaro" }).click();
  await tabTo(page, target);
  const light = await target.evaluate((element) => {
    const style = getComputedStyle(element);
    return { color: style.outlineColor, offset: style.outlineOffset, width: style.outlineWidth };
  });

  await themeTrigger.click();
  await page.getByRole("menuitem", { name: "Scuro" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await tabTo(page, target);
  const dark = await target.evaluate((element) => {
    const style = getComputedStyle(element);
    return { color: style.outlineColor, offset: style.outlineOffset, width: style.outlineWidth };
  });

  expect(light).toMatchObject({ offset: "2px", width: "2px" });
  expect(dark).toMatchObject({ offset: "2px", width: "2px" });
  expect(dark.color).not.toBe(light.color);
  expect(dark.color).not.toBe("rgba(0, 0, 0, 0)");
  assertNoRuntimeErrors();
  await context.close();
});

test("focus foundation stays visible with forced colors, coarse input, and sticky surfaces", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 390, height: 720, touch: true });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "focus foundation contrast and obscuration");
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.goto(`${mobileUrls.sirio}/foundations/focus`);

  expect(await page.evaluate(() => ({
    fineHover: matchMedia("(hover: hover) and (pointer: fine)").matches,
    forcedColors: matchMedia("(forced-colors: active)").matches,
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
  }))).toEqual({ fineHover: false, forcedColors: true, reducedMotion: true });

  const destructive = page.locator('[data-focus-proof="destructive"]');
  await tabTo(page, destructive);
  expect(await destructive.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      color: style.outlineColor,
      offset: style.outlineOffset,
      style: style.outlineStyle,
      width: style.outlineWidth,
    };
  })).toMatchObject({ offset: "2px", style: "solid", width: "2px" });
  expect(await destructive.evaluate((element) => getComputedStyle(element).outlineColor)).not.toBe("rgba(0, 0, 0, 0)");

  const scrollport = page.locator("[data-focus-scrollport]");
  const sticky = page.locator("[data-focus-sticky]");
  const target = page.locator('[data-focus-proof="not-obscured"]');
  await tabTo(page, target);
  await expect(target).toBeFocused();
  const geometry = await Promise.all([scrollport.boundingBox(), sticky.boundingBox(), target.boundingBox()]);
  expect(geometry.every(Boolean)).toBe(true);
  expect(geometry[2]!.y).toBeGreaterThanOrEqual(geometry[1]!.y + geometry[1]!.height);
  expect(geometry[2]!.y + geometry[2]!.height).toBeLessThanOrEqual(
    geometry[0]!.y + geometry[0]!.height,
  );

  assertNoRuntimeErrors();
  await context.close();
});
