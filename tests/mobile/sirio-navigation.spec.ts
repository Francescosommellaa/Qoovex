import { expect, test } from "@playwright/test";

import { createInputContext, mobileUrls } from "./support/context";
import { trackRuntimeErrors } from "./support/diagnostics";

// Headless Chromium normally suppresses native scrollbars, including their hit areas.
// Keep the real browser affordance enabled to test thumb dragging, not a fake control.
test.use({ launchOptions: { ignoreDefaultArgs: ["--hide-scrollbars"] } });

test("Sirio component navigation preserves the sidebar node and scroll position without document reload", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1280, height: 800, touch: false });
  const page = await context.newPage();
  await page.goto(`${mobileUrls.sirio}/components/select`);
  const sidebar = page.locator('[data-slot="sidebar-content"]').first();
  const original = await sidebar.elementHandle();
  const navigations: string[] = [];
  page.on("request", (request) => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) navigations.push(request.url());
  });
  for (const [label, route, keyboard] of [["Textarea", "textarea", false], ["Select", "select", true]] as const) {
    const link = sidebar.getByRole("link", { name: label, exact: true });
    await link.scrollIntoViewIfNeeded();
    await link.focus();
    const before = await sidebar.evaluate((el) => el.scrollTop);
    expect(before).toBeGreaterThan(100);
    if (keyboard) await link.press("Enter");
    else await link.click();
    await expect(page).toHaveURL(new RegExp(`/components/${route}$`));
    await expect(link).toHaveAttribute("aria-current", "page");
    expect(await original!.evaluate((el) => el.isConnected)).toBe(true);
    expect(await sidebar.evaluate((el) => el.scrollTop)).toBe(before);
  }
  expect(navigations).toEqual([]);
  await page.goBack();
  await expect(sidebar.getByRole("link", { name: "Textarea", exact: true })).toHaveAttribute("aria-current", "page");
  expect(await original!.evaluate((el) => el.isConnected)).toBe(true);
  await context.close();
});

test("Sirio sidebar resizes with repeated pointer drags and keeps the page gap aligned", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1280, height: 800, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "Sirio sidebar resize");
  await page.goto(`${mobileUrls.sirio}/components/search-field`);
  const handle = page.getByRole("separator", { name: "Ridimensiona navigazione" });
  await expect(handle).toBeVisible();
  const container = page.locator('[data-slot="sidebar-container"]').first();
  const gap = page.locator('[data-slot="sidebar-gap"]').first();
  async function dragBy(delta: number) {
    const bounds = await handle.boundingBox();
    if (!bounds) throw new Error("Missing sidebar resize handle");
    const x = bounds.x + bounds.width / 2;
    const y = bounds.y + bounds.height / 2;
    await page.mouse.move(x, y);
    await expect(handle).toHaveCSS("cursor", "col-resize");
    await page.mouse.down();
    await expect(page.locator("body")).toHaveCSS("cursor", "col-resize");
    await page.mouse.move(x + delta, y, { steps: 8 });
    await page.mouse.up();
  }
  await dragBy(64);
  await expect(container).toHaveCSS("width", "320px");
  await expect(gap).toHaveCSS("width", "320px");
  await dragBy(-32);
  await expect(container).toHaveCSS("width", "288px");
  await expect(gap).toHaveCSS("width", "288px");
  await dragBy(500);
  await expect(handle).toHaveAttribute("aria-valuenow", "360");
  await dragBy(-500);
  await expect(handle).toHaveAttribute("aria-valuenow", "224");
  await handle.press("ArrowRight");
  await expect(handle).toHaveAttribute("aria-valuenow", "232");
  await handle.press("End");
  await expect(handle).toHaveAttribute("aria-valuenow", "360");
  await handle.dblclick();
  await expect(container).toHaveCSS("width", "256px");
  await expect(gap).toHaveCSS("width", "256px");
  await expect(page.locator("body")).not.toHaveCSS("cursor", "col-resize");
  await expect(page.locator("body")).not.toHaveCSS("user-select", "none");
  const lastLink = page.locator('[data-slot="sidebar-content"]').first().getByRole("link", { name: "Work Queue Item", exact: true });
  await lastLink.focus();
  await page.keyboard.press("Tab");
  await expect(handle).toBeFocused();
  await expect(handle).toHaveCSS("outline-style", "none");
  const marker = await handle.evaluate((element) => {
    const style = getComputedStyle(element, "::after");
    return { outline: style.outlineStyle, height: style.height };
  });
  expect(marker).toEqual({ outline: "solid", height: "40px" });
  await handle.press("ArrowRight");
  await expect(handle).toHaveAttribute("aria-valuenow", "264");
  assertNoRuntimeErrors();
  await context.close();
});

test("Sirio Button keeps a disabled component group and its own current breadcrumb", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 768, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "Sirio Button breadcrumb");
  await page.goto(`${mobileUrls.sirio}/components/button`);

  const breadcrumb = page.getByRole("navigation", { name: "Percorso di navigazione" });
  await expect(breadcrumb.getByRole("link", { name: "Sirio" })).toBeVisible();
  await expect(breadcrumb.getByText("Componenti UI", { exact: true })).toHaveAttribute("aria-disabled", "true");
  await expect(breadcrumb.getByRole("link", { name: "Componenti UI" })).toHaveCount(0);
  await expect(
    breadcrumb.locator('[data-slot="breadcrumb-item"]').filter({ hasText: "Componenti UI" }),
  ).toHaveCSS("opacity", "0.5");
  await expect(breadcrumb.locator("[aria-current=page]")).toHaveText("Button");
  assertNoRuntimeErrors();
  await context.close();
});

test("Sirio scroll edge fades only hidden content and the native scrollbar stays draggable", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1280, height: 800, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "Sirio sidebar scroll");
  await page.goto(`${mobileUrls.sirio}/components/search-field`);
  const viewport = page.locator('[data-slot="sidebar-content"]').first();
  const edge = page.locator('[data-slot="sidebar-scroll-edge"]').first();
  await expect(edge).toHaveCSS("opacity", "1");
  await expect(edge).toHaveCSS("pointer-events", "none");
  await expect(edge).toHaveCSS("backdrop-filter", "blur(6px)");
  await expect(edge).toHaveCSS("height", "48px");
  // One spatial opacity ramp: a second background gradient would multiply
  // the fade and make its upper half weak/nonuniform again.
  await expect(edge).toHaveCSS("background-image", "none");
  await expect(viewport).toHaveCSS("isolation", "isolate");
  await viewport.hover();
  await expect(viewport).toHaveCSS("scrollbar-width", "auto");
  await expect(viewport).toHaveCSS("scrollbar-color", "auto");
  const geometry = await viewport.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { x: rect.right - 4, y: rect.top + 20, gutter: element.offsetWidth - element.clientWidth };
  });
  expect(geometry.gutter).toBe(8);
  await page.mouse.move(geometry.x, geometry.y);
  await page.mouse.down();
  await page.mouse.move(geometry.x, geometry.y + 180, { steps: 12 });
  await page.mouse.up();
  await expect.poll(() => viewport.evaluate((element) => element.scrollTop)).toBeGreaterThan(100);

  // Native scrolling, not a simulated CSS state; the last destination must remain usable.
  await viewport.hover();
  await page.mouse.wheel(0, 4000);
  await expect(edge).toHaveCSS("opacity", "0");
  await expect(viewport.getByRole("link", { name: "Work Queue Item", exact: true })).toBeInViewport({ ratio: 1 });
  await viewport.getByRole("link", { name: "Work Queue Item", exact: true }).focus();
  await expect(viewport.getByRole("link", { name: "Work Queue Item", exact: true })).toBeFocused();
  await page.mouse.wheel(0, -400);
  await expect(edge).toHaveCSS("opacity", "1");
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await expect(edge).toBeHidden();
  assertNoRuntimeErrors();
  await context.close();
});

test("Sirio dark scroll fade attenuates text without spreading bright pixels", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1280, height: 800, touch: false, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(`${mobileUrls.sirio}/components/search-field`);
  await page.getByRole("button", { name: /Cambia tema/ }).click();
  await page.getByRole("menuitem", { name: "Scuro", exact: true }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.getByRole("menu")).not.toBeVisible();
  const viewport = page.locator('[data-slot="sidebar-content"]').first();
  const edge = page.locator('[data-slot="sidebar-scroll-edge"]').first();
  await viewport.evaluate((el) => { el.scrollTop = 200; });
  await expect(edge).toHaveCSS("opacity", "1");
  await expect(edge).toHaveCSS("backdrop-filter", "none");
  const clip = (await edge.boundingBox())!;
  const withFade = await page.screenshot({ clip });
  await edge.evaluate((el) => { (el as HTMLElement).style.visibility = "hidden"; });
  const withoutFade = await page.screenshot({ clip });
  const changes = await page.evaluate(async ([faded, original]) => {
    const pixels = await Promise.all([faded, original].map(async (data) => {
      const bytes = Uint8Array.from(atob(data), (character) => character.charCodeAt(0));
      const bitmap = await createImageBitmap(new Blob([bytes], { type: "image/png" }));
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(bitmap, 0, 0);
      return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    }));
    let brightened = 0;
    let dimmed = 0;
    for (let i = 0; i < pixels[0].length; i += 4) {
      const delta = pixels[0][i] - pixels[1][i];
      if (delta > 2) brightened++;
      if (delta < -2) dimmed++;
    }
    return { brightened, dimmed };
  }, [withFade.toString("base64"), withoutFade.toString("base64")]);
  expect(changes.brightened).toBe(0);
  expect(changes.dimmed).toBeGreaterThan(20);
  await context.close();
});

test("Sirio narrow touch sidebar retains native scrolling and no desktop resize handle", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 320, height: 640, touch: true });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "Sirio narrow sidebar");
  await page.goto(`${mobileUrls.sirio}/components/search-field`);
  const trigger = page.locator('[data-slot="sidebar-trigger"]');
  // Await the mobile disclosure contract, not the server's desktop fallback.
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Navigazione principale" });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole("separator", { name: "Ridimensiona navigazione" })).toHaveCount(0);
  const viewport = dialog.locator('[data-slot="sidebar-content"]');
  const edge = dialog.locator('[data-slot="sidebar-scroll-edge"]');
  await expect(edge).toHaveCSS("opacity", "1");
  await expect(viewport).toHaveCSS("scrollbar-width", "auto");
  await viewport.getByRole("link", { name: "Work Queue Item", exact: true }).scrollIntoViewIfNeeded();
  await expect(edge).toHaveCSS("opacity", "0");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  assertNoRuntimeErrors();
  await context.close();
});
