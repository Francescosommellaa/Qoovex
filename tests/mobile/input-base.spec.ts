import { expect, test, type Locator, type Page } from "@playwright/test";

import { createInputContext, mobileUrls } from "./support/context";
import { trackRuntimeErrors } from "./support/diagnostics";

async function tabTo(page: Page, target: Locator) {
  for (let step = 0; step < 80; step += 1) {
    await page.keyboard.press("Tab");
    if (await target.evaluate((element) => element === document.activeElement)) return;
  }
  throw new Error("Input target was not reached with keyboard navigation.");
}

async function box(locator: Locator) {
  return locator.evaluate((element) => {
    let x = 0;
    let y = 0;
    let current: HTMLElement | null = element as HTMLElement;
    while (current) {
      x += current.offsetLeft;
      y += current.offsetTop;
      current = current.offsetParent as HTMLElement | null;
    }
    return {
      height: (element as HTMLElement).offsetHeight,
      width: (element as HTMLElement).offsetWidth,
      x,
      y,
    };
  });
}

test("base Input supports real focus, typing, selection, replacement, deletion and paste without geometry shift", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 900, touch: false });
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: mobileUrls.sirio });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "base Input interaction");
  await page.goto(`${mobileUrls.sirio}/components/input`);

  const first = page.locator('[data-input-proof="focus-first"]');
  const second = page.locator('[data-input-proof="focus-second"]');
  const initial = await box(first);
  await first.hover();
  expect(await box(first)).toEqual(initial);
  await page.locator("body").click({ position: { x: 4, y: 4 } });
  await tabTo(page, first);
  await expect(first).toBeFocused();
  await expect.poll(() => first.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
  expect(await box(first)).toEqual(initial);
  await page.keyboard.type("QV-2026-rapid", { delay: 0 });
  await expect(first).toHaveValue("QV-2026-rapid");
  expect(await box(first)).toEqual(initial);

  await tabTo(page, second);
  await expect(second).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(first).toBeFocused();

  const typing = page.locator('[data-input-proof="typing"]');
  await typing.click();
  await page.keyboard.type("prima versione", { delay: 0 });
  await page.keyboard.press("Control+A");
  expect(await typing.evaluate((element) => ({
    end: (element as HTMLInputElement).selectionEnd,
    start: (element as HTMLInputElement).selectionStart,
  }))).toEqual({ start: 0, end: 14 });
  await page.keyboard.type("sostituita", { delay: 0 });
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
  await expect(typing).toHaveValue("");
  const pasted = "QV-2026-una-stringa-incollata-molto-lunga-senza-latenza";
  await page.evaluate((value) => navigator.clipboard.writeText(value), pasted);
  await page.keyboard.press("Control+V");
  await expect(typing).toHaveValue(pasted);

  const style = await typing.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      outlineStyle: computed.outlineStyle,
      outlineWidth: computed.outlineWidth,
      transitionDuration: computed.transitionDuration,
      transitionProperty: computed.transitionProperty,
    };
  });
  expect(style).toMatchObject({ outlineStyle: "solid", outlineWidth: "1px" });
  expect(style.transitionDuration).toContain("0.16s");
  expect(style.transitionProperty).toContain("border-color");
  expect(style.transitionProperty).toContain("background-color");
  expect(style.transitionProperty).toContain("color");
  expect(style.transitionProperty).toContain("outline-color");
  expect(style.transitionProperty).toContain("box-shadow");
  expect(style.transitionProperty).not.toContain("all");
  expect(style.transitionProperty).not.toContain("transform");
  await expect(typing).toHaveCSS("outline-offset", "0px");
  await expect.poll(() => typing.evaluate((element) => getComputedStyle(element).boxShadow)).toContain("3px");
  assertNoRuntimeErrors();
  await context.close();
});

test("base Input keeps editable, readonly, disabled and invalid states semantically and perceptually distinct", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 900, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "base Input states");
  await page.goto(`${mobileUrls.sirio}/components/input`);

  const editable = page.locator('[data-input-proof="editable"]');
  const readonly = page.locator('[data-input-proof="readonly"]');
  const disabled = page.locator('[data-input-proof="disabled"]');
  const invalid = page.locator('[data-input-proof="invalid-focus"]');
  await expect(readonly).toHaveAttribute("readonly", "");
  await expect(readonly).not.toBeDisabled();
  await expect(disabled).toBeDisabled();
  await expect(invalid).toHaveAttribute("aria-invalid", "true");

  const backgrounds = await Promise.all([editable, readonly, disabled].map((locator) =>
    locator.evaluate((element) => getComputedStyle(element).backgroundColor),
  ));
  expect(new Set(backgrounds).size).toBe(3);
  for (const background of backgrounds) expect(background).not.toBe("rgba(0, 0, 0, 0)");

  await readonly.focus();
  await readonly.selectText();
  expect(await readonly.evaluate((element) => ({
    end: (element as HTMLInputElement).selectionEnd,
    start: (element as HTMLInputElement).selectionStart,
  }))).toEqual({ start: 0, end: 32 });

  const disabledBorder = await disabled.evaluate((element) => getComputedStyle(element).borderColor);
  await disabled.hover();
  expect(await disabled.evaluate((element) => getComputedStyle(element).borderColor)).toBe(disabledBorder);

  const invalidGeometry = await box(invalid);
  await invalid.focus();
  await expect(invalid).toBeFocused();
  expect(await invalid.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      border: computed.borderColor,
      outline: computed.outlineColor,
      outlineStyle: computed.outlineStyle,
      outlineWidth: computed.outlineWidth,
    };
  })).toMatchObject({ outlineStyle: "solid", outlineWidth: "1px" });
  expect(await invalid.evaluate((element) => getComputedStyle(element).borderColor)).not.toBe(
    await editable.evaluate((element) => getComputedStyle(element).borderColor),
  );
  expect(await box(invalid)).toEqual(invalidGeometry);
  assertNoRuntimeErrors();
  await context.close();
});

test("base Input remains usable at 320px with coarse pointer, reduced motion and forced colors", async ({ browser }) => {
  const context = await createInputContext(browser, {
    width: 320,
    height: 720,
    touch: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "base Input accessibility environments");
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.goto(`${mobileUrls.sirio}/components/input`);

  expect(await page.evaluate(() => ({
    coarse: matchMedia("(pointer: coarse)").matches,
    forcedColors: matchMedia("(forced-colors: active)").matches,
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
  }))).toEqual({ coarse: true, forcedColors: true, reducedMotion: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  const target = page.locator('[data-input-proof="typing"]');
  await target.tap();
  await expect(target).toBeFocused();
  await target.fill("Input touch reale");
  await expect(target).toHaveValue("Input touch reale");
  const geometry = await box(target);
  expect(geometry.height).toBeGreaterThanOrEqual(44);
  expect(await target.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      boundaryVisible: computed.borderStyle !== "none" && computed.borderWidth !== "0px",
      transitionDuration: computed.transitionDuration,
    };
  })).toEqual({ boundaryVisible: true, transitionDuration: "0.001s" });

  const disabled = page.locator('[data-input-proof="disabled"]');
  await expect(disabled).toBeDisabled();
  expect(await disabled.evaluate((element) => getComputedStyle(element).borderColor)).not.toBe("rgba(0, 0, 0, 0)");
  assertNoRuntimeErrors();
  await context.close();
});
