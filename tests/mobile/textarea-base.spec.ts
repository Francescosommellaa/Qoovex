import { expect, test, type Locator, type Page } from "@playwright/test";

import { createInputContext, mobileUrls } from "./support/context";
import { trackRuntimeErrors } from "./support/diagnostics";

async function tabTo(page: Page, target: Locator) {
  for (let step = 0; step < 100; step += 1) {
    await page.keyboard.press("Tab");
    if (await target.evaluate((element) => element === document.activeElement)) return;
  }
  throw new Error("Textarea target was not reached with keyboard navigation.");
}

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

test("base Textarea supports real focus, immediate editing, paste and controlled auto-grow", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 900, touch: false });
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: mobileUrls.sirio });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "base Textarea interaction");
  await page.goto(`${mobileUrls.sirio}/components/textarea`);

  const first = page.locator('[data-textarea-proof="auto"]');
  const second = page.locator('[data-textarea-proof="fixed"]');
  await page.locator("body").click({ position: { x: 4, y: 4 } });
  await tabTo(page, first);
  await expect(first).toBeFocused();
  await expect.poll(() => first.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
  await tabTo(page, second);
  await expect(second).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "Svuota" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(first).toBeFocused();

  const typing = first;
  const emptyHeight = (await box(typing)).height;
  await typing.click();
  await page.keyboard.type("prima riga\nseconda riga", { delay: 0 });
  await page.keyboard.press("Control+A");
  await page.keyboard.type("testo sostituito", { delay: 0 });
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
  await expect(typing).toHaveValue("");

  const pasted = "uno\ndue\ntre\nquattro\ncinque\nsei";
  await page.evaluate((value) => navigator.clipboard.writeText(value), pasted);
  await page.keyboard.press("Control+V");
  await expect(typing).toHaveValue(pasted);
  expect((await box(typing)).height).toBeGreaterThan(emptyHeight);

  await page.getByRole("button", { name: "Inserisci esempio" }).click();
  await expect(typing).toHaveValue(/Sopralluogo completato/);
  await page.getByRole("button", { name: "Svuota" }).click();
  await expect(typing).toHaveValue("");
  expect((await box(typing)).height).toBe(emptyHeight);

  const style = await typing.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      fieldSizing: computed.getPropertyValue("field-sizing"),
      transitionProperty: computed.transitionProperty,
    };
  });
  expect(style.fieldSizing).toBe("content");
  expect(style.transitionProperty).toContain("border-color");
  expect(style.transitionProperty).toContain("background-color");
  expect(style.transitionProperty).toContain("outline-color");
  expect(style.transitionProperty).toContain("box-shadow");
  expect(style.transitionProperty).not.toContain("height");
  expect(style.transitionProperty).not.toContain("all");
  assertNoRuntimeErrors();
  await context.close();
});

test("base Textarea keeps resize modes, capped growth and semantic states truthful", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 900, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "base Textarea resize and states");
  await page.goto(`${mobileUrls.sirio}/components/textarea`);

  const auto = page.locator('[data-textarea-proof="auto"]');
  const capped = auto;
  const manual = page.locator('[data-textarea-proof="manual"]');
  const fixed = page.locator('[data-textarea-proof="fixed"]');
  await expect(auto).toHaveAttribute("data-resize", "auto");
  await expect(manual).toHaveAttribute("data-resize", "vertical");
  await expect(fixed).toHaveAttribute("data-resize", "none");
  expect(await manual.evaluate((element) => ({ resize: getComputedStyle(element).resize, tag: element.tagName }))).toEqual({ resize: "vertical", tag: "TEXTAREA" });
  expect(await manual.evaluate((element) => ({
    ink: getComputedStyle(element, "::-webkit-resizer").backgroundImage,
  }))).toMatchObject({ ink: expect.stringContaining("4px 1px") });
  expect(await fixed.evaluate((element) => getComputedStyle(element).resize)).toBe("none");
  await manual.scrollIntoViewIfNeeded();
  const manualBefore = await manual.boundingBox();
  if (!manualBefore) throw new Error("Manual Textarea geometry is unavailable.");
  await page.mouse.move(manualBefore.x + manualBefore.width - 6, manualBefore.y + manualBefore.height - 6);
  await page.mouse.down();
  await page.mouse.move(manualBefore.x + manualBefore.width + 18, manualBefore.y + manualBefore.height + 54, { steps: 8 });
  await page.mouse.up();
  expect((await box(manual)).height).toBeGreaterThan(manualBefore.height);
  expect((await box(manual)).width).toBe(manualBefore.width);
  const enlarged = await manual.boundingBox();
  await page.mouse.move(enlarged!.x + enlarged!.width - 6, enlarged!.y + enlarged!.height - 6);
  await page.mouse.down();
  await page.mouse.move(enlarged!.x + enlarged!.width - 6, enlarged!.y - 50, { steps: 8 });
  await page.mouse.up();
  expect((await box(manual)).height).toBe(manualBefore.height);

  const cappedMinimum = (await box(capped)).height;
  await capped.fill(Array.from({ length: 14 }, (_, index) => `riga ${index + 1}`).join("\n"));
  const cappedMetrics = await capped.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      clientHeight: element.clientHeight,
      maxHeight: Number.parseFloat(computed.maxHeight),
      overflowY: computed.overflowY,
      scrollHeight: element.scrollHeight,
    };
  });
  expect(cappedMetrics.clientHeight).toBeLessThanOrEqual(cappedMetrics.maxHeight);
  expect(cappedMetrics.scrollHeight).toBeGreaterThan(cappedMetrics.clientHeight);
  expect(cappedMetrics.overflowY).toBe("auto");
  await capped.fill("");
  expect((await box(capped)).height).toBe(cappedMinimum);

  // Verify inherited native states on the useful specimen, not extra catalog rows.
  const editable = fixed;
  const editableBackground = await editable.evaluate((element) => getComputedStyle(element).backgroundColor);
  await fixed.evaluate((element: HTMLTextAreaElement) => { element.readOnly = true; });
  const readonly = fixed;
  await expect(readonly).toHaveAttribute("readonly", "");
  await expect.poll(() => readonly.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(editableBackground);
  await page.waitForTimeout(180);
  const readonlyBackground = await readonly.evaluate((element) => getComputedStyle(element).backgroundColor);
  await readonly.focus();
  await readonly.selectText();
  expect(await readonly.evaluate((element: HTMLTextAreaElement) => element.selectionEnd - element.selectionStart)).toBe((await readonly.inputValue()).length);
  await fixed.evaluate((element: HTMLTextAreaElement) => { element.readOnly = false; element.disabled = true; });
  await expect(fixed).toBeDisabled();
  await expect.poll(() => fixed.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(readonlyBackground);
  await page.waitForTimeout(180);
  expect(await fixed.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(editableBackground);
  await fixed.evaluate((element: HTMLTextAreaElement) => { element.disabled = false; element.setAttribute("aria-invalid", "true"); });
  const invalid = fixed;
  await expect(invalid).toHaveAttribute("aria-invalid", "true");
  await invalid.focus();
  await expect(invalid).toBeFocused();
  expect(await invalid.evaluate((element) => ({ border: getComputedStyle(element).borderColor, outline: getComputedStyle(element).outlineWidth }))).toMatchObject({ outline: "1px" });
  expect(await invalid.evaluate((element) => getComputedStyle(element).borderColor)).not.toBe(await auto.evaluate((element) => getComputedStyle(element).borderColor));
  assertNoRuntimeErrors();
  await context.close();
});

test("base Textarea preserves sibling geometry and long-content usability at 320px", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 320, height: 720, touch: true, reducedMotion: "reduce" });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "base Textarea accessibility environments");
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.goto(`${mobileUrls.sirio}/components/textarea`);

  const geometry = page.locator('[data-textarea-proof="auto"]');
  const after = page.locator('[data-textarea-proof="actions"]');
  const initialGeometry = await box(geometry);
  const initialAfter = await box(after);
  await geometry.tap();
  await expect(geometry).toBeFocused();
  expect(await box(geometry)).toEqual(initialGeometry);
  expect(await box(after)).toEqual(initialAfter);
  await geometry.evaluate((element) => element.setAttribute("aria-invalid", "true"));
  expect(await box(geometry)).toEqual(initialGeometry);
  expect(await box(after)).toEqual(initialAfter);
  await expect(geometry).toHaveCSS("border-style", "double");
  await geometry.evaluate((element) => element.removeAttribute("aria-invalid"));

  const long = geometry;
  await long.fill("UnaParolaMoltoLungaSenzaSpazi".repeat(60) + "\n" + "Nota estesa.\n".repeat(20));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(await long.evaluate((element) => ({
    border: getComputedStyle(element).borderStyle,
    fontSize: Number.parseFloat(getComputedStyle(element).fontSize),
    overflow: element.scrollWidth <= element.clientWidth,
  }))).toEqual({ border: "solid", fontSize: 16, overflow: true });
  assertNoRuntimeErrors();
  await context.close();
});

test("fixed-height Textarea softens unread overflow without obscuring editing or the end of content", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 900, touch: false });
  const page = await context.newPage();
  await page.goto(`${mobileUrls.sirio}/components/textarea`);
  const fixed = page.locator('[data-textarea-proof="fixed"]');
  const frame = fixed.locator("..");
  const fade = frame.locator('[data-slot="textarea-overflow"]');
  await fixed.scrollIntoViewIfNeeded();
  expect(await fixed.evaluate((element) => ({
    width: getComputedStyle(element, "::-webkit-scrollbar").width,
    buttons: getComputedStyle(element, "::-webkit-scrollbar-button").display,
    standardOverride: getComputedStyle(element).scrollbarWidth,
    standardColor: getComputedStyle(element).scrollbarColor,
  }))).toEqual({ width: "8px", buttons: "none", standardOverride: "auto", standardColor: "auto" });
  await expect(fade).toBeVisible();
  await expect(fade).toHaveAttribute("aria-hidden", "true");
  const end = fade.locator('[data-textarea-edge="end"]');
  expect(await fade.evaluate((element) => ({
    pointerEvents: getComputedStyle(element).pointerEvents,
    background: getComputedStyle(element).backgroundColor,
  }))).toEqual({ pointerEvents: "none", background: "rgba(0, 0, 0, 0)" });
  await expect(end).toHaveCSS("bottom", "0px");
  expect(await end.evaluate((element) => ({
    blur: getComputedStyle(element).backdropFilter,
    mask: getComputedStyle(element).maskImage,
  }))).toEqual({ blur: "none", mask: expect.stringContaining("linear-gradient") });
  await expect(fade).toHaveCSS("overflow", "hidden");
  await expect(fade).toHaveCSS("border-radius", "9px");
  // The fade must use the actual field surface, including hover and native states.
  for (const state of ["rest", "hover", "readonly", "disabled"]) {
    if (state === "hover") await fixed.hover();
    if (state === "readonly") await fixed.evaluate((element: HTMLTextAreaElement) => { element.readOnly = true; });
    if (state === "disabled") await fixed.evaluate((element: HTMLTextAreaElement) => { element.disabled = true; });
    await expect.poll(() => fixed.evaluate((element) => {
      const edge = element.parentElement!.querySelector('[data-textarea-edge="end"]')!;
      return getComputedStyle(element).backgroundColor === getComputedStyle(edge).backgroundColor;
    })).toBe(true);
  }
  await fixed.evaluate((element: HTMLTextAreaElement) => { element.disabled = false; element.readOnly = false; });
  const originalGeometry = await box(fixed);
  await fixed.click();
  await expect(fixed).toBeFocused();
  await expect(fade).toBeVisible();
  await fixed.press("Control+Home");
  await expect(end).toHaveCSS("opacity", "0.6");
  await fixed.press("Control+End");
  // Native scroll-to-caret may leave bottom padding below the last glyph;
  // editing stays clear even before the scroll container reaches its endpoint.
  expect(await fixed.evaluate((element: HTMLTextAreaElement) => element.selectionEnd)).toBe((await fixed.inputValue()).length);
  await expect(fade).toBeVisible();
  await expect(fade.locator('[data-textarea-edge="start"]')).toHaveCSS("opacity", "0.6");
  await fixed.press("Control+Shift+Home");
  expect(await fixed.evaluate((element: HTMLTextAreaElement) => element.selectionEnd - element.selectionStart)).toBe((await fixed.inputValue()).length);
  await fixed.press("Control+End");
  await fixed.press("End");
  await page.keyboard.type(" Nota aggiunta.");
  await expect(fixed).toHaveValue(/Nota aggiunta\.$/);
  expect(await box(fixed)).toEqual(originalGeometry);

  await fixed.press("Control+Home");
  await page.getByRole("heading", { name: "Altezza fissa", exact: true }).click();
  await expect(fade).toBeVisible();
  await expect(frame).toHaveAttribute("data-overflow-end", "");
  await expect(end).toHaveCSS("opacity", "1");
  await fixed.hover();
  await page.mouse.wheel(0, 900);
  await expect(frame).not.toHaveAttribute("data-overflow-end");
  await expect(frame).toHaveAttribute("data-overflow-start", "");
  await fixed.fill("Una sola riga.");
  await expect(frame).not.toHaveAttribute("data-overflow-start");
  await expect(frame).not.toHaveAttribute("data-overflow-end");
  await fixed.fill("Nota multilinea.\n".repeat(15));
  await fixed.press("Control+Home");
  await page.getByRole("heading", { name: "Altezza fissa", exact: true }).click();
  await expect(fade).toBeVisible();
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await expect(fade).toBeHidden();
  await expect(fixed).toHaveCSS("overflow-y", "auto");
  await context.close();
});

for (const theme of ["Chiaro", "Scuro"] as const) {
  test(`Textarea long-content fade has no halo and persists during editing — ${theme}`, async ({ browser }) => {
    const context = await createInputContext(browser, { width: 320, height: 720, touch: true, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(`${mobileUrls.sirio}/components/textarea`);
    await page.getByRole("button", { name: /Cambia tema/ }).click();
    await page.getByRole("menuitem", { name: theme, exact: true }).click();
    const fixed = page.locator('[data-textarea-proof="fixed"]');
    const frame = fixed.locator("..");
    const overlay = frame.locator('[data-slot="textarea-overflow"]');
    await fixed.tap();
    await fixed.fill("UnaParolaMoltoLungaSenzaSpazi".repeat(40) + "\nNota finale.");
    await fixed.press("Control+Home");
    await fixed.press("ArrowDown");
    await fixed.press("ArrowDown");
    await expect(frame).toHaveAttribute("data-overflow-end", "");
    await expect(overlay).toBeVisible();
    const end = overlay.locator('[data-textarea-edge="end"]');
    await expect(end).toHaveCSS("opacity", "0.6");
    await expect(end).toHaveCSS("backdrop-filter", "none");
    await expect(end).toHaveCSS("transition-duration", "0s");
    const rectangle = (await overlay.boundingBox())!;
    // Compare only interior pixels; borders, selection and focus ring are not
    // part of the fade. A dark cue must never brighten/spread the light glyphs.
    const clip = { x: rectangle.x + 10, y: rectangle.y + rectangle.height - 24, width: rectangle.width - 20, height: 20 };
    const faded = await page.screenshot({ clip });
    await overlay.evaluate((element: HTMLElement) => { element.style.visibility = "hidden"; });
    const original = await page.screenshot({ clip });
    const changes = await page.evaluate(async ([a, b]) => {
      const pixels = await Promise.all([a, b].map(async (data) => {
        const bytes = Uint8Array.from(atob(data), (character) => character.charCodeAt(0));
        const bitmap = await createImageBitmap(new Blob([bytes], { type: "image/png" }));
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const drawing = canvas.getContext("2d")!;
        drawing.drawImage(bitmap, 0, 0);
        return drawing.getImageData(0, 0, canvas.width, canvas.height).data;
      }));
      let brighter = 0;
      let darker = 0;
      for (let i = 0; i < pixels[0].length; i += 4) {
        const delta = pixels[0][i] - pixels[1][i];
        if (delta > 2) brighter++;
        if (delta < -2) darker++;
      }
      return { brighter, darker };
    }, [faded.toString("base64"), original.toString("base64")]);
    expect(theme === "Scuro" ? changes.brighter : changes.darker).toBe(0);
    expect(theme === "Scuro" ? changes.darker : changes.brighter).toBeGreaterThan(20);
    await overlay.evaluate((element: HTMLElement) => { element.style.removeProperty("visibility"); });
    await fixed.fill("");
    await expect(frame).not.toHaveAttribute("data-overflow-start");
    await expect(frame).not.toHaveAttribute("data-overflow-end");
    await expect(end).toHaveCSS("opacity", "0");
    expect(await fixed.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    await context.close();
  });
}

test("content fade leaves the complete border and rounded corner pixels unchanged while scrolling", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 900, touch: false });
  const page = await context.newPage();
  await page.goto(`${mobileUrls.sirio}/components/textarea`);
  const fixed = page.locator('[data-textarea-proof="fixed"]');
  const frame = fixed.locator("..");
  const overlay = frame.locator('[data-slot="textarea-overflow"]');
  await fixed.hover();
  await page.mouse.wheel(0, 72);
  await expect(frame).toHaveAttribute("data-overflow-start", "");
  await expect(frame).toHaveAttribute("data-overflow-end", "");
  await expect(overlay.locator('[data-textarea-edge="start"]')).toHaveCSS("opacity", "1");
  const rectangle = (await fixed.boundingBox())!;
  const clips = [
    { x: rectangle.x, y: rectangle.y },
    { x: rectangle.x + rectangle.width - 3, y: rectangle.y },
    { x: rectangle.x, y: rectangle.y + rectangle.height - 3 },
    { x: rectangle.x + rectangle.width - 3, y: rectangle.y + rectangle.height - 3 },
  ].map((point) => ({ ...point, width: 3, height: 3 }));
  clips.push(
    { x: rectangle.x + 10, y: rectangle.y, width: rectangle.width - 20, height: 1 },
    { x: rectangle.x + 10, y: rectangle.y + rectangle.height - 1, width: rectangle.width - 20, height: 1 },
    { x: rectangle.x, y: rectangle.y - 3, width: rectangle.width, height: 3 },
    { x: rectangle.x, y: rectangle.y + rectangle.height, width: rectangle.width, height: 3 },
    { x: rectangle.x - 3, y: rectangle.y, width: 3, height: rectangle.height },
    { x: rectangle.x + rectangle.width, y: rectangle.y, width: 3, height: rectangle.height },
  );
  const withFade = [];
  for (const clip of clips) withFade.push(await page.screenshot({ clip }));
  await overlay.evaluate((element) => { (element as HTMLElement).style.visibility = "hidden"; });
  for (let index = 0; index < clips.length; index += 1) {
    expect(await page.screenshot({ clip: clips[index] })).toEqual(withFade[index]);
  }
  await context.close();
});

test("Textarea usage examples retain native limits, editable validation and readable unavailable states", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 900, touch: false });
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: mobileUrls.sirio });
  const page = await context.newPage();
  await page.goto(`${mobileUrls.sirio}/components/textarea`);
  const comment = page.getByRole("textbox", { name: "Commento", exact: true });
  await comment.fill("Nota breve.");
  const commentCounter = page.locator("#textarea-comment-count");
  const counterBox = await commentCounter.boundingBox();
  const counterSize = { height: counterBox?.height, width: counterBox?.width };
  await expect(commentCounter).toHaveText("11 / 200");
  await expect(commentCounter).toHaveAttribute("data-state", "normal");
  await comment.fill("a".repeat(180));
  await expect(commentCounter).toHaveText("180 / 200");
  await expect(commentCounter).toHaveAttribute("data-state", "near-limit");
  expect(await commentCounter.boundingBox()).toMatchObject(counterSize);
  await comment.press("Control+A");
  await page.evaluate(() => navigator.clipboard.writeText("a".repeat(230)));
  await comment.press("Control+V");
  await expect(comment).toHaveValue("a".repeat(200));
  await expect(commentCounter).toHaveText("200 / 200");
  await expect(commentCounter).toHaveAttribute("data-state", "at-limit");
  expect(await commentCounter.boundingBox()).toMatchObject(counterSize);
  await comment.press("End");
  await comment.press("b");
  await expect(comment).toHaveValue("a".repeat(200));
  await expect(page.locator('[data-slot="character-counter"][data-state="over-limit"]')).toHaveText("510 / 500");
  await expect(page.getByRole("status")).toHaveCount(0);

  await expect(page.getByRole("textbox", { name: "Disabilitata", exact: true })).toBeDisabled();
  const invalid = page.getByRole("textbox", { name: "Descrizione", exact: true });
  await expect(invalid).toHaveAttribute("required", "");
  const invalidLabel = page.locator('label[for="textarea-invalid"]');
  await expect(invalidLabel.locator('[data-slot="label-required"]')).toHaveText("*");
  await expect(invalidLabel.locator('[data-slot="label-required"]')).toHaveAttribute("aria-hidden", "true");
  await expect(invalid).toHaveAccessibleName("Descrizione");
  await invalidLabel.click();
  await expect(invalid).toBeFocused();
  await expect(invalid).toHaveAttribute("aria-invalid", "true");
  await invalid.fill("Intervento descritto.");
  await expect(invalid).not.toHaveAttribute("aria-invalid");
  await expect(page.locator("#textarea-invalid-help")).toHaveText("Indica il lavoro da svolgere e il risultato atteso.");
  await expect(page.locator("#textarea-invalid-error")).toHaveCount(0);
  await invalid.fill("");
  await expect(invalid).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("textbox", { name: "Indirizzo", exact: true })).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "Sola lettura", exact: true })).toHaveCount(0);

  await page.setViewportSize({ width: 320, height: 720 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await context.close();
});

test("overflow cues belong to every capped Textarea and follow content and native resize", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 900, touch: false });
  const page = await context.newPage();
  await page.goto(`${mobileUrls.sirio}/components/textarea`);
  const auto = page.locator('[data-textarea-proof="auto"]');
  const autoFrame = auto.locator("..");
  await expect(autoFrame).not.toHaveAttribute("data-overflow-end");
  await page.getByRole("button", { name: "Inserisci esempio" }).click();
  await expect(autoFrame).toHaveAttribute("data-overflow-end", "");
  await page.getByRole("button", { name: "Svuota" }).click();
  await expect(autoFrame).not.toHaveAttribute("data-overflow-end");

  for (const proof of ["manual", "note", "invalid"]) {
    const textarea = page.locator(`[data-textarea-proof="${proof}"]`);
    const frame = textarea.locator("..");
    await textarea.fill("Contenuto multilinea.\n".repeat(12));
    await textarea.press("Control+Home");
    await expect(frame).toHaveAttribute("data-overflow-end", "");
    const geometry = await textarea.boundingBox();
    const cue = await frame.locator('[data-slot="textarea-overflow"]').boundingBox();
    expect(cue!.x).toBe(geometry!.x + 1);
    // Only the actual native scrollbar and border are excluded, never text padding.
    expect(cue!.width).toBe(await textarea.evaluate((element) => element.clientWidth));
    await textarea.fill("");
    await expect(frame).not.toHaveAttribute("data-overflow-end");
  }

  const manual = page.locator('[data-textarea-proof="manual"]');
  await manual.fill("Uno\nDue\nTre\nQuattro");
  await manual.press("Control+Home");
  await expect(manual.locator("..")).toHaveAttribute("data-overflow-end", "");
  const before = await manual.boundingBox();
  await page.mouse.move(before!.x + before!.width - 4, before!.y + before!.height - 4);
  await page.mouse.down();
  await page.mouse.move(before!.x + before!.width - 4, before!.y + before!.height + 80, { steps: 8 });
  await page.mouse.up();
  await expect(manual.locator("..")).not.toHaveAttribute("data-overflow-end");
  await context.close();
});
