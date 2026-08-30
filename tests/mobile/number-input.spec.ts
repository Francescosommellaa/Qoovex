import { expect, test, type Locator } from "@playwright/test";
import { mobileUrls, createInputContext } from "./support/context";
import { trackRuntimeErrors } from "./support/diagnostics";

test.use({ locale: "it-IT", viewport: { width: 1280, height: 1000 } });

const minus = (input: Locator) => input.locator("..").getByRole("button", { name: "Riduci valore" });
const plus = (input: Locator) => input.locator("..").getByRole("button", { name: "Aumenta valore" });
const geometry = (input: Locator) => input.evaluate((element) => {
  const root = element.closest('[data-slot="number-input"]')!;
  return [...root.querySelectorAll(".qv-number-group, .qv-number-value, button")].map((node) => {
    const el = node as HTMLElement;
    return [el.offsetLeft, el.offsetTop, el.offsetWidth, el.offsetHeight];
  });
});

test("NumberInput: empty is not zero, typing selection paste and form semantics", async ({ page, context }) => {
  const noErrors = trackRuntimeErrors(page, "NumberInput entry");
  await page.goto(`${mobileUrls.sirio}/components/number-input`);
  const input = page.getByRole("textbox", { name: "Vuoto", exact: true });
  await expect(input).toHaveValue("");
  await expect(page.getByLabel("Zero", { exact: true })).toHaveValue("0");
  await expect(page.getByLabel("Negativo", { exact: true })).toHaveValue("-3");
  await input.click();
  await input.pressSequentially("12345");
  await input.evaluate((el) => (el as HTMLInputElement).setSelectionRange(1, 4));
  await page.keyboard.type("9");
  await expect(input).toHaveValue("195");
  expect(await input.evaluate((el) => (el as HTMLInputElement).selectionStart)).toBe(2);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.evaluate(() => navigator.clipboard.writeText("27"));
  await input.press("ControlOrMeta+A");
  await input.press("ControlOrMeta+V");
  await expect(input).toHaveValue("27");
  await input.press("ControlOrMeta+A");
  await input.press("Backspace");
  await input.press("Tab");
  await expect(input).toHaveValue("");
  const data = await page.locator("#number-proof-form").evaluate((el) => Object.fromEntries(new FormData(el as HTMLFormElement)));
  expect(data).toMatchObject({ empty: "", zero: "0", positive: "12", negative: "-3", controlled: "4" });
  expect(data).not.toHaveProperty("disabled");
  noErrors();
});

test("NumberInput: decimal stepping, limits and keyboard-owned focus", async ({ page }) => {
  await page.goto(`${mobileUrls.sirio}/components/number-input`);
  const decimal = page.locator("#number-decimal");
  await expect(minus(decimal)).toBeDisabled();
  for (let n = 0; n < 3; n++) await plus(decimal).click();
  await expect(decimal).toHaveValue("0,3");
  await expect(decimal).toBeFocused();
  await decimal.press("ArrowUp");
  await expect(decimal).toHaveValue("0,4");
  await decimal.press("ArrowDown");
  await expect(decimal).toHaveValue("0,3");
  for (let n = 0; n < 7; n++) await plus(decimal).click();
  await expect(decimal).toHaveValue("1");
  await expect(plus(decimal)).toBeDisabled();
  await decimal.fill("3");
  await expect(decimal).toHaveValue("3");
  await decimal.press("Tab");
  await expect(decimal).toHaveValue("1");

  const input = page.locator("#number-positive");
  await input.click();
  await input.press("Shift+Tab");
  await expect(minus(input)).toBeFocused();
  await minus(input).press("Enter");
  await expect(input).toHaveValue("11");
  await expect(minus(input)).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(input).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(plus(input)).toBeFocused();
  await plus(input).press("Space");
  await expect(input).toHaveValue("12");
  await expect(plus(input)).toBeFocused();
  // Regression: Motion's synthetic keyboard pointer must never start a hold.
  // Check past Base UI's hold threshold, not just the first successful step.
  await page.waitForTimeout(700);
  await expect(input).toHaveValue("12");
  await plus(input).press("Shift+Tab");
  await expect(input).toBeFocused();
  const beforeWheel = await input.inputValue();
  await input.hover();
  await page.mouse.wheel(0, -100);
  await expect(input).toHaveValue(beforeWheel);
});

test("NumberInput: controlled null, parent update, state and geometry invariance", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${mobileUrls.sirio}/components/number-input`);
  const input = page.locator("#number-controlled");
  // Wait for a real client-owned state change before typing into SSR markup.
  await expect(async () => {
    await page.getByRole("button", { name: "Imposta 10", exact: true }).click();
    await expect(input).toHaveValue("10", { timeout: 1000 });
  }).toPass();
  const before = await geometry(input);
  await input.click();
  await input.press("ControlOrMeta+A");
  await input.press("Backspace");
  await expect(input).toHaveValue("");
  await input.press("Tab");
  await expect(input).toHaveValue("");
  await page.getByRole("button", { name: "Imposta 10", exact: true }).click();
  await expect(input).toHaveValue("10");
  await input.fill("20");
  await expect(plus(input)).toBeDisabled();
  expect(await geometry(input)).toEqual(before);
  await input.fill("0");
  await expect(minus(input)).toBeDisabled();
  expect(await geometry(input)).toEqual(before);
  const enabledLabel = page.locator('label[for="number-zero"]');
  const labelColor = await enabledLabel.evaluate((el) => getComputedStyle(el).color);
  for (const id of ["number-controlled", "number-decimal", "number-readonly"]) {
    await expect(page.locator(`label[for="${id}"]`)).toHaveCSS("color", labelColor);
    await expect(page.locator(`label[for="${id}"]`)).toHaveCSS("cursor", "default");
  }

  const readonly = page.locator("#number-readonly");
  await readonly.click();
  await readonly.press("ControlOrMeta+A");
  await readonly.press("Backspace");
  await expect(readonly).toHaveValue("24");
  expect(await readonly.evaluate((el) => (el as HTMLInputElement).selectionEnd)).toBe(2);
  await expect(plus(readonly)).toBeDisabled();
  await expect(minus(readonly)).toBeDisabled();
  const disabled = page.locator("#number-disabled");
  await expect(disabled).toBeDisabled();
  await expect(plus(disabled)).toBeDisabled();
  await expect(minus(disabled)).toBeDisabled();
  await expect(page.locator('label[for="number-disabled"]')).not.toHaveCSS("color", labelColor);
  await expect(page.locator('label[for="number-disabled"]')).toHaveCSS("cursor", "not-allowed");

  const invalid = page.locator("#number-invalid");
  const invalidBefore = await geometry(invalid);
  await invalid.click();
  await expect(invalid).toBeFocused();
  await expect(invalid).toHaveAttribute("aria-invalid", "true");
  await expect(invalid).toHaveAttribute("required", "");
  expect(await geometry(invalid)).toEqual(invalidBefore);
  expect(await page.locator("button button").count()).toBe(0);
  const states = await Promise.all([readonly, disabled, invalid].map((el) => el.evaluate((node) => {
    const s = getComputedStyle(node); return [s.backgroundColor, s.color, s.borderColor, s.opacity];
  })));
  expect(states[0]).not.toEqual(states[1]);
  expect(states[2]).not.toEqual(states[0]);
  expect(states.every((s) => s[3] === "1")).toBe(true);
});

test("NumberInput: mobile touch, long value, reduced motion and forced colors", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 320, height: 740, touch: true, reducedMotion: "reduce" });
  const page = await context.newPage();
  const noErrors = trackRuntimeErrors(page, "NumberInput mobile");
  await page.goto(`${mobileUrls.sirio}/components/number-input`);
  const input = page.locator("#number-positive");
  await input.scrollIntoViewIfNeeded();
  await plus(input).tap();
  await expect(input).toHaveValue("13");
  const bounds = await input.boundingBox();
  for (const button of [minus(input), plus(input)]) {
    const b = (await button.boundingBox())!;
    expect(b.width).toBeGreaterThanOrEqual(44);
    expect(b.height).toBeGreaterThanOrEqual(44);
    expect(b.x - bounds!.x).toBeGreaterThanOrEqual(5);
    expect(bounds!.x + bounds!.width - b.x - b.width).toBeGreaterThanOrEqual(5);
  }
  await expect(input).toHaveCSS("font-size", "16px");
  const before = await geometry(input);
  await input.fill("123456789012345");
  expect(await geometry(input)).toEqual(before);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(input).toHaveCSS("transition-duration", /0\.001s/);
  await page.emulateMedia({ forcedColors: "active" });
  await input.click();
  await expect(input).toHaveCSS("outline-style", "solid");
  await expect(input).toHaveCSS("outline-width", "2px");
  await expect(page.locator("#number-invalid")).toHaveCSS("border-style", "double");
  noErrors();
  await context.close();
});
