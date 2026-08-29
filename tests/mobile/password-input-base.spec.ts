import { expect, test, type Locator } from "@playwright/test";

import { createInputContext, mobileUrls } from "./support/context";
import { trackRuntimeErrors } from "./support/diagnostics";

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

test("base PasswordInput preserves value, caret and selection through pointer reveal", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 900, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "base PasswordInput pointer continuity");
  await page.goto(`${mobileUrls.sirio}/components/password-input`);

  const input = page.locator('[data-password-proof="interaction"]');
  const root = input.locator("..");
  const reveal = root.getByRole("button", { name: "Mostra password" });
  await expect(input).toHaveAttribute("type", "password");
  await expect(reveal).not.toHaveAttribute("aria-pressed");
  await expect(reveal).not.toHaveAttribute("title");

  await input.click();
  await input.press("End");
  await page.keyboard.type("-A", { delay: 0 });
  await input.evaluate((element) => (element as HTMLInputElement).setSelectionRange(3, 8, "forward"));
  const beforeReveal = await input.inputValue();
  await reveal.click();
  await expect(input).toHaveAttribute("type", "text");
  await expect(input).toHaveValue(beforeReveal);
  await expect(input).toBeFocused();
  expect(await input.evaluate((element) => ({
    direction: (element as HTMLInputElement).selectionDirection,
    end: (element as HTMLInputElement).selectionEnd,
    start: (element as HTMLInputElement).selectionStart,
  }))).toEqual({ direction: "forward", end: 8, start: 3 });
  await page.keyboard.type("MID", { delay: 0 });
  await expect(input).toHaveValue("QooMIDemo-2026-A");

  await input.evaluate((element) => (element as HTMLInputElement).setSelectionRange(1, 4, "backward"));
  const beforeHide = await input.inputValue();
  const conceal = root.getByRole("button", { name: "Nascondi password" });
  await conceal.click();
  await expect(input).toHaveAttribute("type", "password");
  await expect(input).toHaveValue(beforeHide);
  await expect(input).toBeFocused();
  expect(await input.evaluate((element) => ({
    direction: (element as HTMLInputElement).selectionDirection,
    end: (element as HTMLInputElement).selectionEnd,
    start: (element as HTMLInputElement).selectionStart,
  }))).toEqual({ direction: "backward", end: 4, start: 1 });
  assertNoRuntimeErrors();
  await context.close();
});

test("base PasswordInput keeps keyboard focus intentional and rapid reversal geometry stable", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 900, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "base PasswordInput keyboard and reversal");
  await page.goto(`${mobileUrls.sirio}/components/password-input`);

  const input = page.locator('[data-password-proof="interaction"]');
  const root = input.locator("..");
  const button = root.getByRole("button");
  await input.focus();
  await page.keyboard.press("Tab");
  await expect(button).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(input).toHaveAttribute("type", "text");
  await expect(button).toHaveAccessibleName("Nascondi password");
  await expect(button).toBeFocused();
  await page.keyboard.press("Space");
  await expect(input).toHaveAttribute("type", "password");
  await expect(button).toHaveAccessibleName("Mostra password");
  await expect(button).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(input).toBeFocused();

  const geometryInput = page.locator('[data-password-proof="interaction"]');
  const geometryRoot = geometryInput.locator("..");
  const initial = {
    input: await box(geometryInput),
    root: await box(geometryRoot),
  };
  const geometryButton = geometryRoot.getByRole("button");
  await geometryButton.hover();
  const rootBox = await geometryRoot.boundingBox();
  const surfaceBox = await geometryButton.locator('[data-slot="icon-button-motion-surface"]').boundingBox();
  expect(rootBox).not.toBeNull();
  expect(surfaceBox).not.toBeNull();
  expect(rootBox!.x + rootBox!.width - (surfaceBox!.x + surfaceBox!.width)).toBeGreaterThanOrEqual(5);
  expect(await geometryInput.evaluate((element) => Number.parseFloat(getComputedStyle(element).paddingRight))).toBeGreaterThanOrEqual(56);
  for (let index = 0; index < 5; index += 1) await geometryButton.click();
  await expect(geometryInput).toHaveAttribute("type", "text");
  expect({
    input: await box(geometryInput),
    root: await box(geometryRoot),
  }).toEqual(initial);
  await expect(geometryRoot.locator('[data-icon-action-intent="visibility"]')).toHaveCount(1);
  await expect(geometryRoot.locator('[data-icon-action-layer]')).toHaveCount(2);
  assertNoRuntimeErrors();
  await context.close();
});

test("base PasswordInput preserves readonly reveal and disables reveal at 320px", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 320, height: 720, touch: true, reducedMotion: "reduce" });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "base PasswordInput states and environments");
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.goto(`${mobileUrls.sirio}/components/password-input`);

  const readonly = page.locator('[data-password-proof="readonly"]');
  const readonlyButton = readonly.locator("..").getByRole("button", { name: "Mostra password" });
  await expect(readonly).toHaveAttribute("readonly", "");
  await readonly.selectText();
  const readonlySelection = await readonly.evaluate((element) => [
    (element as HTMLInputElement).selectionStart,
    (element as HTMLInputElement).selectionEnd,
  ]);
  await readonlyButton.tap();
  await expect(readonly).toHaveAttribute("type", "text");
  await expect(readonly).toBeFocused();
  expect(await readonly.evaluate((element) => [
    (element as HTMLInputElement).selectionStart,
    (element as HTMLInputElement).selectionEnd,
  ])).toEqual(readonlySelection);

  const disabled = page.locator('[data-password-proof="disabled"]');
  const disabledButton = disabled.locator("..").getByRole("button", { name: "Mostra password" });
  await expect(disabled).toBeDisabled();
  await expect(disabled).toHaveAttribute("type", "password");
  await expect(disabledButton).toBeDisabled();
  await disabledButton.dispatchEvent("click");
  await expect(disabled).toHaveAttribute("type", "password");

  const invalid = page.locator('[data-password-proof="invalid"]');
  await expect(invalid).toHaveAttribute("aria-invalid", "true");
  await invalid.tap();
  await expect(invalid).toBeFocused();
  expect(await invalid.evaluate((element) => getComputedStyle(element).outlineWidth)).toBe("2px");

  const populated = page.locator('[data-password-proof="populated"]');
  await expect(populated).toHaveAttribute("autocomplete", "current-password");
  expect(await populated.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(16);
  const target = await box(populated.locator("..").getByRole("button"));
  expect(target.height).toBeGreaterThanOrEqual(44);
  expect(target.width).toBeGreaterThanOrEqual(44);
  await expect(populated.locator("..").getByRole("button")).toHaveAttribute("data-reduced-motion", "true");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  assertNoRuntimeErrors();
  await context.close();
});

test("new PasswordInput strength guidance progresses without moving the field", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 390, height: 844, touch: true });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "PasswordInput strength guidance");
  await page.goto(`${mobileUrls.sirio}/components/password-input`);

  const input = page.locator('[data-password-proof="empty"]');
  const component = input.locator("../..");
  const meter = component.getByRole("meter", { name: /Efficacia password/ });
  const track = meter.locator(".qv-password-strength-track");
  const inputGeometry = await box(input);
  const componentGeometry = await box(component);
  const emptyTrackWidth = await track.evaluate((element) => (element as HTMLElement).offsetWidth);

  await expect(meter).toHaveAttribute("aria-valuenow", "0");
  await expect(meter).toHaveAttribute("aria-valuetext", "Non valutata");
  await expect(meter.locator(".qv-password-strength-label")).toHaveCSS("opacity", "0");
  await input.fill("breve");
  await expect(meter).toHaveAttribute("aria-valuenow", "1");
  await expect(meter).toHaveAttribute("aria-valuetext", "Debole");
  await expect(meter.locator(".qv-password-strength-label")).toHaveCSS("opacity", "1");
  await expect.poll(() => track.evaluate((element) => (element as HTMLElement).offsetWidth)).toBeLessThan(emptyTrackWidth);
  await input.fill("Qoovex-demo-2026");
  await expect(meter).toHaveAttribute("aria-valuenow", "3");
  await expect(meter).toHaveAttribute("aria-valuetext", "Forte");
  expect(await box(input)).toEqual(inputGeometry);
  expect(await box(component)).toEqual(componentGeometry);
  assertNoRuntimeErrors();
  await context.close();
});
