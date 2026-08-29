import { expect, test, type Locator } from "@playwright/test";
import { createInputContext, mobileUrls } from "./support/context";
import { trackRuntimeErrors } from "./support/diagnostics";

async function canonicalColor(target: Locator, token: string) {
  return target.evaluate((element, name) => {
    const probe = document.createElement("span");
    probe.style.color = `var(${name})`;
    element.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, token);
}

async function geometry(group: Locator) {
  return group.evaluate((element: HTMLElement) => {
    const input = element.querySelector("input")!;
    return [element.offsetWidth, element.offsetHeight, input.offsetLeft, input.offsetTop, input.offsetWidth, input.offsetHeight];
  });
}

test("URL addons preserve native value, accessible context and real keyboard focus", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 900, touch: false });
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: mobileUrls.sirio });
  const page = await context.newPage();
  const errors = trackRuntimeErrors(page, "Input addons native ownership");
  await page.goto(`${mobileUrls.sirio}/components/composite-input`);
  const input = page.getByRole("textbox", { name: "Dominio o percorso", exact: true });
  const group = input.locator("..");
  await expect(input).toHaveValue("");
  await expect(input).toHaveAccessibleDescription(/Protocollo HTTPS.*solo dominio/);
  await expect(group.locator('[data-slot="input-addon"]')).toHaveAttribute("aria-hidden", "true");
  await input.click();
  await page.keyboard.type("esempio.test");
  await page.keyboard.press("Control+A");
  await page.evaluate(() => navigator.clipboard.writeText("docs.esempio.test"));
  await page.keyboard.press("Control+V");
  await expect(input).toHaveValue("docs.esempio.test");
  expect(await input.evaluate((element: HTMLInputElement) => Array.from(new FormData(element.form!).entries()))).toEqual([["domain", "docs.esempio.test"]]);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Anteprima URL" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(input).toBeFocused();
  await expect(group).toHaveCSS("outline-width", "1px");
  await expect(input).toHaveCSS("outline-style", "none");
  await expect(input).toHaveCSS("box-shadow", "none");
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("URL composto dal consumer")).toHaveText("https://docs.esempio.test");
  await input.fill("");
  await expect(page.getByLabel("URL composto dal consumer")).toBeEmpty();
  expect(await input.evaluate((element: HTMLInputElement) => element.validity.valueMissing)).toBe(true);
  errors();
  await context.close();
});

test("InputGroup owns one stable opaque boundary through hover focus invalid readonly and disabled", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 900, touch: false });
  const page = await context.newPage();
  await page.goto(`${mobileUrls.sirio}/components/composite-input`);
  const group = page.locator('[data-url-input]');
  const input = group.locator("input");
  const addon = group.locator('[data-slot="input-addon"]');
  const initial = await geometry(group);
  const sibling = page.getByRole("button", { name: "Anteprima URL" });
  const siblingOffset = () => sibling.evaluate((element: HTMLElement) => [element.offsetLeft, element.offsetTop]);
  const beforeSibling = await siblingOffset();
  await expect(group).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(group).toHaveCSS("border-width", "1px");
  await expect(input).toHaveCSS("border-width", "0px");
  const rest = await group.evaluate((element) => getComputedStyle(element).borderColor);
  await addon.hover();
  await expect(group).not.toHaveCSS("border-color", rest);
  expect(await geometry(group)).toEqual(initial);
  await input.click();
  await expect(input).toBeFocused();
  await expect(group).toHaveCSS("outline-offset", "0px");
  await expect(input).toHaveCSS("box-shadow", "none");
  await input.fill("Long-domain-reference.esempio.test");
  let readonlySurface = "";
  for (const state of ["invalid", "readonly", "disabled", "editable"]) {
    await input.evaluate((element: HTMLInputElement, value) => {
      element.setAttribute("aria-invalid", value === "invalid" ? "true" : "false");
      element.readOnly = value === "readonly";
      element.disabled = value === "disabled";
    }, state);
    if (state === "invalid") {
      await expect(group).toHaveCSS("border-color", await canonicalColor(group, "--destructive"));
      await expect(input).toBeFocused();
    }
    if (state === "readonly") {
      await expect(group).toHaveCSS("background-color", await canonicalColor(group, "--muted"));
      readonlySurface = await group.evaluate((element) => getComputedStyle(element).backgroundColor);
      await input.selectText();
      expect(await input.evaluate((element: HTMLInputElement) => element.selectionEnd! - element.selectionStart!)).toBe((await input.inputValue()).length);
    }
    if (state === "disabled") {
      await expect(input).toBeDisabled();
      // Sirio's marketing cursor overrides document cursors while enabled.
      // Verify the native unavailable cue in its supported reduced-motion mode.
      await page.emulateMedia({ reducedMotion: "reduce" });
      await expect(group).toHaveCSS("cursor", "not-allowed");
      await expect(group).toHaveCSS("opacity", "1");
      await expect(group).not.toHaveCSS("background-color", readonlySurface);
    }
    expect(await geometry(group)).toEqual(initial);
    expect(await siblingOffset()).toEqual(beforeSibling);
  }
  const transition = await group.evaluate((element) => getComputedStyle(element).transitionProperty);
  expect(transition).toContain("background-color");
  expect(transition).toContain("box-shadow");
  expect(transition).not.toMatch(/all|transform|height|width/);
  await context.close();
});

test("prefix and suffix keep space for long values at 320px with real touch, themes and forced colors", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 320, height: 720, touch: true, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(`${mobileUrls.sirio}/components/composite-input`);
  for (const theme of ["Chiaro", "Scuro"]) {
    await page.getByRole("button", { name: /Cambia tema/ }).click();
    await page.getByRole("menuitem", { name: theme, exact: true }).click();
    for (const proof of ["url", "suffix"]) {
      const group = page.locator(proof === "url" ? "[data-url-input]" : `[data-addon-proof="${proof}"]`);
      const input = group.locator("input");
      const addon = group.locator('[data-slot="input-addon"]');
      await input.tap();
      await expect(input).toBeFocused();
      await expect(group).toHaveCSS("min-height", "44px");
      await expect(input).toHaveCSS("font-size", "16px");
      await expect(input).toHaveCSS("box-shadow", "none");
      await input.fill("LongUnbrokenValue".repeat(30));
      await input.press("End");
      expect(await input.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
      // Stress the documented truncation policy without inventing a domain demo.
      const original = await addon.innerText();
      await addon.locator("span").evaluate((element) => { element.textContent = "UnPrefissoOSuffissoMoltoLungoSenzaSpazi".repeat(4); });
      expect((await addon.boundingBox())!.width).toBeLessThanOrEqual((await group.boundingBox())!.width * 0.35);
      expect((await input.boundingBox())!.width).toBeGreaterThan((await group.boundingBox())!.width * 0.5);
      await expect(addon.locator("span")).toHaveCSS("text-overflow", "ellipsis");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await addon.locator("span").evaluate((element, text) => { element.textContent = text; }, original);
    }
  }
  await page.emulateMedia({ forcedColors: "active" });
  await page.locator("[data-url-input] input").fill("esempio.test");
  await page.getByRole("combobox", { name: "Stato dei campi" }).click();
  await page.getByRole("option", { name: "Da verificare", exact: true }).click();
  const invalid = page.locator('[data-url-input]');
  await invalid.locator("input").tap();
  await expect(invalid).toHaveCSS("outline-width", "2px");
  await expect(invalid).toHaveCSS("border-style", "double");
  await page.getByRole("combobox", { name: "Stato dei campi" }).click();
  await page.getByRole("option", { name: "Sola lettura", exact: true }).click();
  await expect(invalid).toHaveCSS("border-style", "dashed");
  await expect(invalid.locator("input")).toHaveCSS("border-width", "0px");
  await context.close();
});
