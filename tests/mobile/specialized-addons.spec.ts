import { expect, test, type Locator, type Page } from "@playwright/test";
import { createInputContext, mobileUrls } from "./support/context";
import { trackRuntimeErrors } from "./support/diagnostics";

const url = `${mobileUrls.sirio}/components/composite-input`;
const formValue = (input: Locator) => input.evaluate((element: HTMLInputElement) => Object.fromEntries(new FormData(element.form!)));
const box = (input: Locator) => input.evaluate((element: HTMLInputElement) => {
  const group = element.closest('[data-slot="input-group"]') as HTMLElement;
  return [group.offsetWidth, group.offsetHeight, element.offsetLeft, element.offsetTop, element.offsetWidth, element.offsetHeight];
});
async function mode(page: Page, label: string) {
  await page.getByRole("combobox", { name: "Stato dei campi" }).click();
  await page.getByRole("option", { name: label, exact: true }).click();
}

test("Phone preserves native value, country selection, keyboard focus and separate form entries", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1100, height: 1000, touch: false });
  const page = await context.newPage();
  const errors = trackRuntimeErrors(page, "Phone addon");
  await page.goto(url);
  const input = page.getByRole("textbox", { name: "Numero di telefono", exact: true });
  const trigger = page.getByRole("combobox", { name: "Paese e prefisso", exact: true });
  await expect(input).toHaveAttribute("type", "tel");
  await expect(input).toHaveAttribute("autocomplete", "tel-national");
  await expect(input).toHaveValue("");
  await input.fill("vvv");
  await expect(input).toHaveValue("");
  await input.fill("+39 (333)-123-4567");
  await expect(input).toHaveValue("3331234567");
  await expect(input).toHaveAccessibleDescription(/Italia.*\+39/);
  const initial = await box(input);
  await input.press("Shift+Tab");
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveCSS("outline-style", "solid");
  await expect(input.locator("..")).toHaveCSS("outline-color", "rgba(0, 0, 0, 0)");
  await trigger.press("Enter");
  await expect(page.getByRole("option", { name: "Italia · +39", exact: true })).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAccessibleDescription(/Francia.*\+33/);
  await expect(input).toHaveValue("3331234567");
  expect(await formValue(input)).toEqual({ phone: "3331234567", country: "FR" });
  expect(await box(input)).toEqual(initial);
  await expect(trigger).toHaveText("+33");
  await expect(trigger.locator("img")).toHaveCount(0);
  await trigger.press("Space");
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("listbox")).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.press("Tab");
  await expect(input).toBeFocused();
  await expect(input.locator("..")).toHaveCSS("outline-style", "solid");
  await input.press("Control+A");
  await input.press("Backspace");
  expect(await formValue(input)).toEqual({ phone: "", country: "FR" });
  errors();
  await context.close();
});

test("Currency preserves exact editing text, formats only on blur and never converts during currency switches", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1100, height: 1000, touch: false });
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: mobileUrls.sirio });
  const page = await context.newPage();
  const errors = trackRuntimeErrors(page, "Currency addon");
  await page.goto(url);
  const input = page.getByRole("textbox", { name: "Importo", exact: true });
  const trigger = page.getByRole("combobox", { name: "Valuta", exact: true });
  await expect(input).toHaveValue("");
  expect(await formValue(input)).toEqual({ amount: "", currency: "EUR" });
  const initial = await box(input);
  await input.fill("0");
  expect(await formValue(input)).toEqual({ amount: "0", currency: "EUR" });
  await input.press("Control+A");
  await page.evaluate(() => navigator.clipboard.writeText("-12,50"));
  await input.press("Control+V");
  await expect(input).toHaveValue("-12,50");
  expect((await formValue(input)).amount).toBe("-12,50");
  await input.fill("1250,5");
  await expect(input).toHaveValue("1250,5");
  await input.press("Tab");
  await expect(input).toHaveValue("1.250,50");
  await input.click();
  await expect(input).toHaveValue("1250,5");
  await input.press("Home");
  await input.press("ArrowRight");
  expect(await input.evaluate((element: HTMLInputElement) => element.selectionStart)).toBe(1);
  for (const [option, code] of [["USD · Dollaro statunitense", "USD"], ["GBP · Sterlina britannica", "GBP"], ["CHF · Franco svizzero", "CHF"]]) {
    await trigger.click();
    await page.getByRole("option", { name: option, exact: true }).click();
    await expect(input).toHaveValue("1.250,50");
    expect(await formValue(input)).toEqual({ amount: "1.250,50", currency: code });
    expect(await box(input)).toEqual(initial);
  }
  await page.getByRole("button", { name: "Inserisci esempio" }).click();
  expect((await formValue(input)).amount).toBe("1.250,50");
  await input.fill("");
  await input.press("Tab");
  await expect(input).toHaveValue("");
  expect((await formValue(input)).amount).toBe("");
  errors();
  await context.close();
});

test("Specialized selectors cannot change readonly or disabled values and invalid retains real focus", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1100, height: 1000, touch: false, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(url);
  const phone = page.getByRole("textbox", { name: "Numero di telefono", exact: true });
  const currency = page.getByRole("textbox", { name: "Importo", exact: true });
  await phone.fill("3331234567");
  await currency.fill("1250,5");
  const initial = [await box(phone), await box(currency)];
  const triggers = page.locator(".qv-addon-trigger");
  for (const state of ["Sola lettura", "Disabilitato", "Da verificare", "Modificabile"]) {
    await mode(page, state);
    for (const [index, input] of [phone, currency].entries()) {
      expect(await box(input)).toEqual(initial[index]);
      await expect(input.locator("..")).toHaveCSS("opacity", "1");
      if (state === "Sola lettura") {
        await expect(input).toHaveAttribute("readonly", "");
        await expect(triggers.nth(index)).toBeDisabled();
        await input.selectText();
        expect(await input.evaluate((element: HTMLInputElement) => element.selectionEnd! - element.selectionStart!)).toBe((await input.inputValue()).length);
        const value = await input.inputValue();
        await input.press("Backspace");
        await expect(input).toHaveValue(value);
      } else if (state === "Disabilitato") {
        await expect(input).toBeDisabled();
        await expect(triggers.nth(index)).toBeDisabled();
        expect(await formValue(input)).toEqual({});
      } else if (state === "Da verificare") {
        await input.click();
        await expect(input).toHaveAttribute("aria-invalid", "true");
        await expect(input).toHaveAccessibleDescription(/da verificare/i);
        await expect(input.locator("..")).toHaveCSS("outline-style", "solid");
        await expect(triggers.nth(index)).toBeEnabled();
      } else {
        await expect(input).toBeEditable();
        await expect(triggers.nth(index)).toBeEnabled();
      }
    }
  }
  await context.close();
});

test("Selectable addons fit 320px with touch targets, long option labels, themes and forced colors", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 320, height: 820, touch: true, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(url);
  await page.getByRole("textbox", { name: "Numero di telefono", exact: true }).fill("3331234567".repeat(5));
  for (const theme of ["Chiaro", "Scuro"]) {
    await page.getByRole("button", { name: "Cambia tema" }).click();
    await page.getByRole("menuitem", { name: theme, exact: true }).click();
    for (const label of ["Paese e prefisso", "Valuta"]) {
      const trigger = page.getByRole("combobox", { name: label, exact: true });
      const group = trigger.locator('xpath=ancestor::*[@data-slot="input-group"]');
      const input = group.locator('input[data-slot="input"]');
      await trigger.tap();
      await expect(page.getByRole("listbox")).toBeVisible();
      const bounds = await trigger.boundingBox();
      const outer = await group.boundingBox();
      expect(bounds!.height).toBeGreaterThanOrEqual(44);
      expect(bounds!.x - outer!.x).toBeGreaterThanOrEqual(6);
      expect(bounds!.y - outer!.y).toBeGreaterThanOrEqual(6);
      const option = page.getByRole("option", { name: label === "Valuta" ? "USD · Dollaro statunitense" : "Regno Unito · +44", exact: true });
      // Popup entrance can still be at scale(.95) on its first visible frame.
      // Assert the settled touch target without sampling that transient frame.
      await expect.poll(async () => (await option.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
      const popup = await page.getByRole("listbox").boundingBox();
      expect(popup!.x).toBeGreaterThanOrEqual(0);
      expect(popup!.x + popup!.width).toBeLessThanOrEqual(320);
      await option.tap();
      await input.tap();
      await expect(input).toHaveCSS("font-size", "16px");
      await expect(input).toHaveCSS("box-shadow", "none");
      const colors = await input.evaluate((element) => ({ value: getComputedStyle(element).color, placeholder: getComputedStyle(element, "::placeholder").color }));
      expect(colors.value).not.toBe(colors.placeholder);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
  await page.emulateMedia({ forcedColors: "active" });
  await mode(page, "Da verificare");
  const phone = page.getByRole("textbox", { name: "Numero di telefono", exact: true });
  await phone.tap();
  await expect(phone.locator("..")).toHaveCSS("border-style", "double");
  await expect(phone.locator("..")).toHaveCSS("outline-width", "2px");
  await phone.press("Shift+Tab");
  await expect(page.getByRole("combobox", { name: "Paese e prefisso" })).toHaveCSS("outline-style", "solid");
  await context.close();
});
