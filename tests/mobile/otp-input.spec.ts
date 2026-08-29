import { expect, test } from "@playwright/test";
import { createInputContext, mobileUrls } from "./support/context";
import { trackRuntimeErrors } from "./support/diagnostics";

test("OtpInput keeps one stable field while Base UI owns typing, edit, paste and focus", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 320, height: 720, touch: true });
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: mobileUrls.sirio });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "OTP runtime behavior");
  await page.goto(`${mobileUrls.sirio}/components/otp-input`);

  const root = page.locator('[data-otp-proof="core"]');
  const slots = root.locator(".qv-otp-slot");
  await expect(slots).toHaveCount(6);
  await expect(slots.first()).toHaveAttribute("autocomplete", "one-time-code");
  await expect(slots.first()).toHaveAttribute("inputmode", "numeric");

  const before = await root.boundingBox();
  expect(before).not.toBeNull();
  await slots.first().tap();
  const visualFocus = await slots.first().evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      borderWidth: style.borderWidth,
      outlineStyle: style.outlineStyle,
    };
  });
  expect(visualFocus).toEqual({ borderWidth: "1px", outlineStyle: "none" });
  await page.keyboard.type("123456");
  await expect(slots.last()).toHaveValue("6");
  await expect(page.getByText("Codice completo: 6 caratteri.", { exact: true })).toBeVisible();
  const afterTyping = await root.boundingBox();
  expect({ width: afterTyping?.width, height: afterTyping?.height }).toEqual({ width: before?.width, height: before?.height });

  await slots.nth(2).tap();
  await page.keyboard.type("9");
  await expect(slots.nth(2)).toHaveValue("9");
  await page.keyboard.press("Backspace");
  await expect(slots.last()).toHaveValue("");
  expect(await slots.evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value).join(""))).toBe("12956");
  const afterEdit = await root.boundingBox();
  expect({ width: afterEdit?.width, height: afterEdit?.height }).toEqual({ width: before?.width, height: before?.height });

  await page.getByRole("button", { name: "Svuota codice", exact: true }).click();
  await page.keyboard.press("Shift+Tab");
  await expect(slots.first()).toBeFocused();
  await page.evaluate(() => navigator.clipboard.writeText("654321"));
  await page.keyboard.press("Control+V");
  await expect(slots.last()).toHaveValue("1");
  expect(await slots.evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value).join(""))).toBe("654321");

  await page.getByRole("button", { name: "Svuota codice", exact: true }).click();
  await page.keyboard.press("Shift+Tab");
  await page.evaluate(() => navigator.clipboard.writeText("12a345678"));
  await page.keyboard.press("Control+V");
  expect(await slots.evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value).join(""))).toBe("123456");
  const afterPaste = await root.boundingBox();
  expect({ width: afterPaste?.width, height: afterPaste?.height }).toEqual({ width: before?.width, height: before?.height });

  assertNoRuntimeErrors();
  await context.close();
});

test("OtpInput proves 4/6 lengths, invalid and disabled without duplicate Field demos", async ({ page }) => {
  await page.goto(`${mobileUrls.sirio}/components/otp-input`);
  await expect(page.getByRole("heading", { name: "OTP Input", exact: true })).toBeVisible();

  const four = page.getByRole("group", { name: "Codice breve", exact: true });
  const six = page.getByRole("group", { name: "Codice standard", exact: true });
  await expect(four.locator(".qv-otp-slot")).toHaveCount(4);
  await expect(six.locator(".qv-otp-slot")).toHaveCount(6);

  const invalid = page.locator('[data-visual-specimen="sirio-otp-input-invalid"] [data-slot="otp-input"]');
  await expect(invalid).toHaveAttribute("aria-invalid", "true");
  const disabled = page.locator('[data-visual-specimen="sirio-otp-input-disabled"] [data-slot="otp-input"]');
  await expect(disabled).toHaveAttribute("data-disabled", "");
  await expect(disabled.locator(".qv-otp-slot").first()).toBeDisabled();
  const disabledSurfaces = await disabled.locator(".qv-otp-slot").evaluateAll((slots) =>
    slots.map((slot) => getComputedStyle(slot).backgroundColor),
  );
  expect(new Set(disabledSurfaces).size).toBe(1);

  await page.goto(`${mobileUrls.sirio}/components/controls`);
  await expect(page.locator('[data-slot="otp-input"]')).toHaveCount(0);
});

test("OtpInput preserves semantic states in reduced motion and forced colors", async ({ browser }) => {
  const context = await createInputContext(browser, {
    width: 390,
    height: 844,
    touch: false,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(`${mobileUrls.sirio}/components/otp-input`);

  const root = page.locator('[data-otp-proof="core"]');
  const first = root.locator(".qv-otp-slot").first();
  expect(await root.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe("0s");
  expect(await first.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe("0s");

  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await first.click();
  const focusOutline = await first.evaluate((element) => {
    const style = getComputedStyle(element);
    return { style: style.outlineStyle, width: style.outlineWidth };
  });
  expect(focusOutline).toEqual({ style: "solid", width: "2px" });
  await expect(page.locator('[data-visual-specimen="sirio-otp-input-invalid"] .qv-otp-slot').first()).toHaveCSS("border-style", "double");

  await context.close();
});
