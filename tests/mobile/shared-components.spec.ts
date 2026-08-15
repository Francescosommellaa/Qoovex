import { expect, test } from "@playwright/test";

import { createInputContext, mobileUrls } from "./support/context";
import { trackRuntimeErrors } from "./support/diagnostics";
import { expectNoDocumentOverflow, expectTouchTarget, expectWithinVisualViewport } from "./support/geometry";

test("coarse-pointer shared buttons expose at least a 44px effective target", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 390, height: 844, touch: true });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "shared touch targets");
  await page.goto(`${mobileUrls.sirio}/components/button`);
  assertNoRuntimeErrors();
  for (const name of ["Condividi XS", "Condividi SM", "Condividi Default", "Condividi LG"]) {
    await expectTouchTarget(page.getByRole("button", { name }), name);
  }
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
  await page.getByRole("button", { name: "Chiudi finestra" }).tap();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  assertNoRuntimeErrors();
  await context.close();
});
