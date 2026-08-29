import { expect, test, type Locator, type Page } from "@playwright/test";

import { createInputContext, mobileUrls } from "./support/context";
import { trackRuntimeErrors } from "./support/diagnostics";

test("result hover belongs to one row, never to the surrounding specimen", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1320, height: 900, touch: false });
  const page = await context.newPage();
  await page.goto(`${mobileUrls.sirio}/components/search-field`);
  const specimen = page.getByRole("heading", { name: "Typing, risultati e clear", exact: true }).locator("..");
  const rows = specimen.getByRole("list", { name: "Risultati di esempio" }).getByRole("button");
  const firstIcon = rows.nth(0).locator("span").first();
  const secondIcon = rows.nth(1).locator("span").first();
  await specimen.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const restingTone = await firstIcon.evaluate((element) => getComputedStyle(element).backgroundColor);
  await specimen.hover({ position: { x: 5, y: 5 } });
  await expect(firstIcon).toHaveCSS("background-color", restingTone);
  await expect(secondIcon).toHaveCSS("background-color", restingTone);
  const before = await box(rows.nth(1));
  await rows.nth(0).hover();
  await expect(firstIcon).not.toHaveCSS("background-color", restingTone);
  await expect(secondIcon).toHaveCSS("background-color", restingTone);
  await rows.nth(1).hover();
  await expect(firstIcon).toHaveCSS("background-color", restingTone);
  await expect(secondIcon).not.toHaveCSS("background-color", restingTone);
  expect(await box(rows.nth(1))).toEqual(before);
  await page.mouse.move(0, 0);
  await rows.nth(0).focus();
  await expect(rows.nth(0)).toBeFocused();
  await expect(firstIcon).not.toHaveCSS("background-color", restingTone);
  await expect(secondIcon).toHaveCSS("background-color", restingTone);
  await context.close();
});

test("empty search uses one recovery composition inline and in both real dialogs", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 900, touch: false });
  const page = await context.newPage();
  await page.goto(`${mobileUrls.sirio}/components/search-field`);
  const inline = page.locator('[data-search-proof="escape"]');
  const inlineArea = inline.locator("../..");
  await inline.fill("zzzznessunmatch");
  await expect(inlineArea.locator('[data-slot="empty-title"]')).toHaveText("Nessun risultato");
  const description = await inlineArea.locator('[data-slot="empty-description"]').innerText();
  await inlineArea.getByRole("button", { name: "Ricomincia la ricerca", exact: true }).click();
  await expect(inline).toHaveValue("");
  await expect(inline).toBeFocused();
  await expect(inlineArea.locator('[data-slot="empty"]')).toHaveCount(0);
  // This specimen is also a real search when a matching term replaces the query.
  await inline.fill("roma");
  await expect(inlineArea.getByRole("button", { name: /Ristrutturazione Via Roma/ })).toBeVisible();

  await page.getByRole("button", { name: "Apri ricerca risorse", exact: true }).click();
  const modal = page.getByRole("dialog", { name: "Seleziona una risorsa", exact: true });
  const modalInput = modal.locator('input[type="search"]');
  await modalInput.fill("zzzznessunmatch");
  await expect(modal.locator('[data-slot="empty-description"]')).toHaveText(description);
  await modal.getByRole("button", { name: "Ricomincia la ricerca", exact: true }).click();
  await expect(modalInput).toHaveValue("");
  await expect(modalInput).toBeFocused();
  await expect(modal.locator('[data-slot="empty"]')).toHaveCount(0);
  await modal.getByRole("button", { name: "Chiudi ricerca risorse", exact: true }).click();

  await page.keyboard.press("Control+k");
  const catalog = page.getByRole("dialog", { name: "Cerca nel catalogo Sirio", exact: true });
  const catalogInput = catalog.locator('input[type="search"]');
  await catalogInput.fill("zzzznessunmatch");
  await expect(catalog.locator('[data-slot="empty-description"]')).toHaveText(description);
  await catalog.getByRole("button", { name: "Ricomincia la ricerca", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(catalogInput).toHaveValue("");
  await expect(catalogInput).toBeFocused();
  await expect(catalog.locator('[data-slot="empty"]')).toHaveCount(0);
  await expect(catalog.getByRole("link", { name: /Colori/ })).toBeVisible();
  await context.close();
});

test("shared search recovery remains readable and touchable in dark, reduced motion and forced colors at 320px", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 320, height: 720, touch: true, reducedMotion: "reduce" });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "search empty recovery environments");
  await page.goto(`${mobileUrls.sirio}/components/search-field`);
  await page.getByRole("button", { name: /Cambia tema/ }).tap();
  await page.getByRole("menuitem", { name: "Scuro", exact: true }).tap();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByRole("button", { name: "Apri ricerca risorse", exact: true }).tap();
  const modal = page.getByRole("dialog", { name: "Seleziona una risorsa", exact: true });
  const input = modal.locator('input[type="search"]');
  await input.fill("z".repeat(300));
  const recovery = modal.getByRole("button", { name: "Ricomincia la ricerca", exact: true });
  await expect(recovery).toBeVisible();
  expect((await box(recovery)).height).toBeGreaterThanOrEqual(44);
  expect(await modal.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await expect(modal.locator('[data-slot="empty-title"]')).toBeVisible();
  await recovery.tap();
  await expect(input).toHaveValue("");
  await expect(input).toBeFocused();
  assertNoRuntimeErrors();
  await context.close();
});

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

test("base SearchField clears controlled and uncontrolled values with keyboard and pointer focus continuity", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 900, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "base SearchField clear contract");
  await page.goto(`${mobileUrls.sirio}/components/search-field`);

  const controlled = page.locator('[data-search-proof="controlled"]');
  const controlledRoot = controlled.locator("..");
  const controlledGeometry = { input: await box(controlled), root: await box(controlledRoot) };
  await expect(controlled).toHaveAttribute("type", "search");
  await controlled.fill("fondazioni");
  const controlledClear = controlledRoot.getByRole("button", { name: "Cancella ricerca" });
  await expect(controlledClear).toBeVisible();
  await controlledClear.click();
  await expect(controlled).toHaveValue("");
  await expect(controlled).toBeFocused();
  await expect(controlledClear).toHaveCount(0);
  expect({ input: await box(controlled), root: await box(controlledRoot) }).toEqual(controlledGeometry);

  await page.getByRole("button", { name: "Apri ricerca risorse" }).click();
  const uncontrolled = page.locator('[data-search-proof="uncontrolled"]');
  const uncontrolledRoot = uncontrolled.locator("..");
  await expect(uncontrolled).toHaveValue("ri");
  await uncontrolled.focus();
  await page.keyboard.press("Tab");
  const uncontrolledClear = uncontrolledRoot.getByRole("button", { name: "Cancella ricerca" });
  await expect(uncontrolledClear).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(uncontrolled).toBeFocused();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(uncontrolled).toHaveValue("");
  await expect(uncontrolled).toBeFocused();
  await page.keyboard.type("Input nativo", { delay: 0 });
  await page.keyboard.press("Tab");
  await expect(uncontrolledRoot.getByRole("button", { name: "Cancella ricerca" })).toBeFocused();
  await page.keyboard.press("Space");
  await expect(uncontrolled).toHaveValue("");
  await expect(uncontrolled).toBeFocused();
  await page.getByRole("button", { name: "Chiudi ricerca risorse" }).click();

  const escape = page.locator('[data-search-proof="escape"]');
  await escape.fill("dialog");
  await page.evaluate(() => {
    (window as typeof window & { searchEscapeEvents?: Array<{ defaultPrevented: boolean }> }).searchEscapeEvents = [];
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        (window as typeof window & { searchEscapeEvents?: Array<{ defaultPrevented: boolean }> }).searchEscapeEvents?.push({ defaultPrevented: event.defaultPrevented });
      }
    });
  });
  await escape.press("Escape");
  await expect(escape).toHaveValue("");
  await expect(escape).toBeFocused();
  await escape.press("Escape");
  expect(await page.evaluate(() => (window as typeof window & { searchEscapeEvents?: Array<{ defaultPrevented: boolean }> }).searchEscapeEvents)).toEqual([
    { defaultPrevented: true },
    { defaultPrevented: false },
  ]);

  const readonly = page.locator('[data-search-proof="readonly"]');
  await expect(readonly).toHaveAttribute("readonly", "");
  await expect(readonly.locator("..").getByRole("button", { name: "Cancella ricerca" })).toHaveCount(0);
  const disabled = page.locator('[data-search-proof="disabled"]');
  await expect(disabled).toBeDisabled();
  await expect(disabled.locator("..").getByRole("button", { name: "Cancella ricerca" })).toHaveCount(0);
  const notClearable = page.locator('[data-search-proof="not-clearable"]');
  await expect(notClearable).toBeEditable();
  await expect(notClearable.locator("..").getByRole("button", { name: "Cancella ricerca" })).toHaveCount(0);
  assertNoRuntimeErrors();
  await context.close();
});

test("base SearchField keeps icon slots and state geometry stable while preserving native editing", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 900, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "base SearchField geometry and states");
  await page.goto(`${mobileUrls.sirio}/components/search-field`);

  const controlled = page.locator('[data-search-proof="controlled"]');
  const root = controlled.locator("..");
  const description = page.locator('[data-search-proof="controlled-status"]');
  const initial = { input: await box(controlled), root: await box(root), description: await box(description) };
  const padding = await controlled.evaluate((element) => {
    const computed = getComputedStyle(element);
    return { left: Number.parseFloat(computed.paddingLeft), right: Number.parseFloat(computed.paddingRight) };
  });
  expect(padding.left).toBeGreaterThanOrEqual(36);
  expect(padding.right).toBeGreaterThanOrEqual(56);
  const longQuery = "Una query molto lunga che continua a scorrere orizzontalmente senza passare sotto il clear";
  await controlled.fill(longQuery);
  expect({ input: await box(controlled), root: await box(root), description: await box(description) }).toEqual(initial);
  await controlled.press("Control+A");
  expect(await controlled.evaluate((element) => [(element as HTMLInputElement).selectionStart, (element as HTMLInputElement).selectionEnd])).toEqual([0, longQuery.length]);
  await controlled.press("End");
  expect(await controlled.evaluate((element) => (element as HTMLInputElement).selectionStart)).toBe(longQuery.length);
  await controlled.press("Home");
  expect(await controlled.evaluate((element) => (element as HTMLInputElement).selectionStart)).toBe(0);

  const searchIcon = root.locator("svg").first();
  await expect(searchIcon).toHaveAttribute("aria-hidden", "true");
  expect(await searchIcon.evaluate((element) => getComputedStyle(element).pointerEvents)).toBe("none");
  const clear = root.getByRole("button", { name: "Cancella ricerca" });
  await clear.hover();
  const rootBox = await root.boundingBox();
  const surfaceBox = await clear.locator('[data-slot="icon-button-motion-surface"]').boundingBox();
  expect(rootBox).not.toBeNull();
  expect(surfaceBox).not.toBeNull();
  expect(rootBox!.x + rootBox!.width - (surfaceBox!.x + surfaceBox!.width)).toBeGreaterThanOrEqual(5);
  await clear.focus();
  await expect(clear).toBeFocused();
  await expect(controlled).not.toBeFocused();
  await expect.poll(() => clear.evaluate((element) => element.matches(":focus-visible"))).toBe(true);

  assertNoRuntimeErrors();
  await context.close();
});

test("base SearchField remains touchable and unclipped at 320px in reduced motion and forced colors", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 320, height: 720, touch: true, reducedMotion: "reduce" });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "base SearchField accessibility environments");
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.goto(`${mobileUrls.sirio}/components/search-field`);

  const controlled = page.locator('[data-search-proof="controlled"]');
  await controlled.tap();
  await controlled.fill("touch");
  const root = controlled.locator("..");
  const clear = root.getByRole("button", { name: "Cancella ricerca" });
  const clearBox = await box(clear);
  expect(clearBox.height).toBeGreaterThanOrEqual(44);
  expect(clearBox.width).toBeGreaterThanOrEqual(44);
  expect(await controlled.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(16);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(await root.getByRole("button").count()).toBe(1);
  await clear.tap();
  await expect(controlled).toHaveValue("");
  await expect(controlled).toBeFocused();
  expect(await controlled.evaluate((element) => {
    const computed = getComputedStyle(element);
    return computed.borderStyle !== "none" && computed.borderWidth !== "0px";
  })).toBe(true);
  assertNoRuntimeErrors();
  await context.close();
});
