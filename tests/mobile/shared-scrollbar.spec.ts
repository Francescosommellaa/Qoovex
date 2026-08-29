import { expect, test, type Locator } from "@playwright/test";
import { createInputContext, mobileUrls } from "./support/context";

test.use({ launchOptions: { ignoreDefaultArgs: ["--hide-scrollbars"] } });

const skin = (target: Locator) => target.evaluate((element) => {
  const bar = getComputedStyle(element, "::-webkit-scrollbar");
  const thumb = getComputedStyle(element, "::-webkit-scrollbar-thumb");
  return { width: bar.width, height: bar.height, border: thumb.borderLeftWidth,
    radius: thumb.borderRadius, clip: thumb.backgroundClip, tone: thumb.backgroundColor,
    buttons: getComputedStyle(element, "::-webkit-scrollbar-button").display,
    standard: getComputedStyle(element).scrollbarWidth };
});

test("sidebar, popup and textarea share one minimal native scrollbar in both themes", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1280, height: 800, touch: false, reducedMotion: "reduce" });
  const page = await context.newPage();
  for (const theme of ["Chiaro", "Scuro"]) {
    await page.goto(`${mobileUrls.sirio}/components/composite-input`);
    await page.getByRole("button", { name: /Cambia tema/ }).click();
    await page.getByRole("menuitem", { name: theme, exact: true }).click();
    const sidebar = page.locator('[data-slot="sidebar-content"]').first();
    await sidebar.hover();
    const expected = await skin(sidebar);
    expect(expected).toMatchObject({ width: "8px", height: "8px", border: "2px", buttons: "none", standard: "auto" });

    await page.getByRole("combobox", { name: "Paese e prefisso", exact: true }).click();
    const popup = page.locator('[data-slot="select-content"]');
    await popup.hover();
    expect(await skin(popup)).toEqual(expected);
    const before = await popup.boundingBox();
    expect(before!.width).toBeLessThan(200);
    expect(await popup.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
    await page.mouse.wheel(0, 600);
    await expect.poll(() => popup.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
    const target = page.getByRole("option", { name: "Paesi Bassi · +31", exact: true });
    await target.hover();
    const hoverGeometry = await target.evaluate((option) => {
      const popup = option.closest('[data-slot="select-content"]')!;
      const marker = popup.querySelector('[data-slot="sliding-indicator"]')!.getBoundingClientRect();
      const item = option.getBoundingClientRect();
      return { dx: Math.abs(marker.x - item.x), dy: Math.abs(marker.y - item.y),
        dw: Math.abs(marker.width - item.width), dh: Math.abs(marker.height - item.height) };
    });
    for (const delta of Object.values(hoverGeometry)) expect(delta).toBeLessThan(1);
    expect(await popup.boundingBox()).toEqual(before);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("combobox", { name: "Paese e prefisso", exact: true })).toBeFocused();

    await page.goto(`${mobileUrls.sirio}/components/textarea`);
    const textarea = page.locator('textarea:not([disabled]):not([readonly])').first();
    await textarea.hover();
    expect(await skin(textarea)).toEqual(expected);
    await page.emulateMedia({ forcedColors: "active" });
    await expect(textarea).toHaveCSS("scrollbar-color", "auto");
    await page.emulateMedia({ forcedColors: "none" });
  }
  await context.close();
});

test("Select typeahead and Menu/submenu keep intrinsic sizing and real keyboard navigation", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1280, height: 800, touch: false, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(`${mobileUrls.sirio}/components/composite-input`);
  const phone = page.getByRole("combobox", { name: "Paese e prefisso", exact: true });
  await phone.click();
  await expect(page.locator('[data-slot="select-content"] input')).toHaveCount(0);
  await page.keyboard.type("ita");
  await page.keyboard.press("Enter");
  await expect(phone).toHaveText("+39");
  await page.getByRole("combobox", { name: "Valuta", exact: true }).click();
  const currency = page.locator('[data-slot="select-content"][data-open]');
  expect((await currency.boundingBox())!.width).toBeLessThan(260);
  await page.keyboard.press("Escape");

  await page.goto(`${mobileUrls.sirio}/components/dropdown-menu`);
  const trigger = page.getByRole("button", { name: "Esporta Report", exact: true });
  await trigger.click();
  const menu = page.locator('[data-slot="dropdown-menu-content"]');
  expect((await menu.boundingBox())!.width).toBeLessThan(224);
  await page.getByRole("menuitem", { name: "Scarica File", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  const sub = page.locator('[data-slot="dropdown-menu-sub-content"]');
  await expect(sub).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Documento PDF", exact: true })).toBeFocused();
  expect((await sub.boundingBox())!.width).toBeLessThan(224);
  await page.keyboard.press("Escape");
  await expect(sub).toBeHidden();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await context.close();
});
