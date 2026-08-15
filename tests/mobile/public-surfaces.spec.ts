import { expect, test } from "@playwright/test";

import { createInputContext, mobileUrls } from "./support/context";
import { trackRuntimeErrors } from "./support/diagnostics";
import { expectNoCollision, expectNoDocumentOverflow, expectTouchTarget } from "./support/geometry";

const viewports = [
  { id: "compact", width: 320, height: 720 },
  { id: "phone", width: 390, height: 844 },
  { id: "tablet", width: 768, height: 1024 },
  { id: "laptop", width: 1024, height: 768 },
  { id: "desktop", width: 1440, height: 900 },
] as const;

test("Web, Workspace auth, and Sirio reflow without document overflow at every canonical width", async ({ browser }) => {
  for (const viewport of viewports) {
    const context = await createInputContext(browser, {
      ...viewport,
      touch: viewport.width <= 768,
    });
    const page = await context.newPage();
    const assertNoRuntimeErrors = trackRuntimeErrors(page, `canonical surfaces at ${viewport.width}px`);
    for (const [surface, url] of [
      ["web", `${mobileUrls.web}/`],
      ["workspace", `${mobileUrls.workspace}/sign-in`],
      ["sirio", `${mobileUrls.sirio}/components/button`],
    ] as const) {
      await page.goto(url);
      await expect(page.locator("body"), `${surface} ${viewport.id} body`).toBeVisible();
      await expectNoDocumentOverflow(page, `${surface} at ${viewport.width}px`);
    }
    assertNoRuntimeErrors();
    await context.close();
  }
});

test("Web mobile navigation remains touch-sized, closable, keyboard operable, and interruption-safe", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 390, height: 844, touch: true, reducedMotion: "reduce" });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "Web mobile navigation");
  await page.goto(mobileUrls.web);
  await expectNoCollision(
    page.locator("header").first(),
    page.getByRole("complementary", { name: "Informativa cookie" }),
    "Web floating navigation and cookie banner must not overlap",
  );
  const trigger = page.getByRole("button", { name: "Apri navigazione" });
  await expectTouchTarget(trigger, "Web navigation trigger");
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expectTouchTarget(page.getByRole("button", { name: "Chiudi navigazione" }), "Web navigation close");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  assertNoRuntimeErrors();
  await context.close();
});

test("focused auth controls stay visible when the software keyboard reduces the viewport", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 390, height: 844, touch: true });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "Workspace software keyboard simulation");
  await page.goto(`${mobileUrls.workspace}/sign-in`);
  const password = page.getByRole("textbox", { name: "Password" });
  await password.focus();
  await page.setViewportSize({ width: 390, height: 420 });
  await password.evaluate((element) => element.scrollIntoView({ block: "center" }));
  const box = await password.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height).toBeLessThanOrEqual(420);
  await expectNoDocumentOverflow(page, "Workspace auth with software keyboard");
  assertNoRuntimeErrors();
  await context.close();
});

test("portrait, landscape, and 200 percent equivalent reflow keep the Web primary path usable", async ({ browser }) => {
  for (const viewport of [
    { label: "portrait", width: 390, height: 844 },
    { label: "landscape", width: 844, height: 390 },
    { label: "zoom-200-equivalent", width: 320, height: 720 },
  ]) {
    const context = await createInputContext(browser, { ...viewport, touch: true });
    const page = await context.newPage();
    const assertNoRuntimeErrors = trackRuntimeErrors(page, viewport.label);
    await page.goto(mobileUrls.web);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoDocumentOverflow(page, viewport.label);
    assertNoRuntimeErrors();
    await context.close();
  }
});
