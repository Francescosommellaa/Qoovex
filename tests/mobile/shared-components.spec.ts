import { expect, test, type Locator, type Page } from "@playwright/test";

import { createInputContext, mobileUrls } from "./support/context";
import { trackRuntimeErrors } from "./support/diagnostics";
import { expectNoDocumentOverflow, expectTouchTarget, expectWithinVisualViewport } from "./support/geometry";

async function tabTo(page: Page, target: Locator, maximumTabs = 80) {
  for (let index = 0; index < maximumTabs; index += 1) {
    await page.keyboard.press("Tab");
    if (await target.evaluate((element) => element === document.activeElement)) return;
  }

  await expect(target).toBeFocused();
}

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

test("motion foundation exposes every canonical role, phase, easing, and control", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 768, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "motion foundation coverage");
  await page.goto(`${mobileUrls.sirio}/foundations/motion`);

  await expect(page.getByRole("link", { name: "Motion", exact: true })).toBeVisible();
  await expect(page.locator('[data-visual-specimen="motion-roles"]')).toHaveCount(4);
  await expect(page.locator('[data-motion-demo]')).toHaveCount(7);
  await expect(page.locator('[data-motion-phase-step]')).toHaveCount(4);
  await expect(page.locator('[data-motion-easing="standard"]')).toHaveCSS(
    "transition-timing-function",
    "cubic-bezier(0.2, 0, 0, 1), cubic-bezier(0.2, 0, 0, 1)",
  );
  await expect(page.locator('[data-motion-easing="emphasized"]')).toHaveCSS(
    "transition-timing-function",
    "cubic-bezier(0.16, 1, 0.3, 1), cubic-bezier(0.2, 0, 0, 1)",
  );

  const lab = page.locator('[data-motion-lab]');
  await expect(lab).toHaveAttribute("data-motion-mode", "system");
  await expect(lab).toHaveAttribute("data-motion-phase", "rest");
  await page.getByRole("button", { name: "Normale", exact: true }).click();
  await expect(lab).toHaveAttribute("data-motion-mode", "normal");
  await page.getByRole("button", { name: "Avvia", exact: true }).click();
  await expect(lab).toHaveAttribute("data-active", "true");
  await expect(lab).toHaveAttribute("data-motion-phase", "settled");
  await expect(page.locator('[data-motion-demo="surface"]')).toHaveAttribute(
    "data-surface-mounted",
    "true",
  );
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(lab).toHaveAttribute("data-active", "false");
  await expect(lab).toHaveAttribute("data-motion-phase", "rest");
  assertNoRuntimeErrors();
  await context.close();
});

test("motion foundation retargets rapid repeated input without layout shift", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 390, height: 844, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "motion foundation rapid input");
  await page.goto(`${mobileUrls.sirio}/foundations/motion`);

  const proof = page.locator('[data-motion-lab]');
  const trigger = page.getByRole("button", { name: "Inverti", exact: true });
  const track = proof.locator('[data-motion-track]');
  const indicator = proof.locator('[data-motion-indicator]');
  await proof.scrollIntoViewIfNeeded();
  await trigger.focus();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Space");
  await page.keyboard.press("Space");
  await expect(trigger).toHaveAttribute("aria-pressed", "false");
  await expect(indicator).toHaveCSS("transition-property", "transform, background-color, color");
  expect(
    await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches)
  ).toBe(true);
  const beforeProof = await proof.boundingBox();
  const beforeTrack = await track.boundingBox();

  await page.getByRole("button", { name: "Input rapido ×3", exact: true }).click();

  await expect(proof).toHaveAttribute("data-active", "true");
  await expect(proof.getByText(/Stato:\s*attivo/)).toBeVisible();
  await expect.poll(async () => track.getAttribute("data-settled")).toBe("true");
  const afterProof = await proof.boundingBox();
  const afterTrack = await track.boundingBox();
  expect(beforeProof).not.toBeNull();
  expect(beforeTrack).not.toBeNull();
  expect(afterProof).not.toBeNull();
  expect(afterTrack).not.toBeNull();
  expect({
    x: afterTrack!.x - afterProof!.x,
    y: afterTrack!.y - afterProof!.y,
    width: afterTrack!.width,
    height: afterTrack!.height,
  }).toEqual({
    x: beforeTrack!.x - beforeProof!.x,
    y: beforeTrack!.y - beforeProof!.y,
    width: beforeTrack!.width,
    height: beforeTrack!.height,
  });
  assertNoRuntimeErrors();
  await context.close();
});

test("reduced motion removes spatial travel but preserves clear color feedback", async ({ browser }) => {
  const context = await createInputContext(browser, {
    width: 390,
    height: 844,
    touch: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "motion foundation reduced motion");
  await page.goto(`${mobileUrls.sirio}/foundations/motion`);

  const trigger = page.getByRole("button", { name: "Avvia", exact: true });
  const track = page.locator('[data-motion-track]');
  const indicator = page.locator('[data-motion-indicator]');
  await trigger.tap();

  await expect(page.locator('[data-motion-lab]')).toHaveAttribute("data-active", "true");
  await expect(page.getByText(/Stato:\s*attivo/)).toBeVisible();
  await expect(track).toHaveAttribute("data-settled", "true");
  await expect(indicator).toHaveCSS("transition-property", "background-color, color");
  expect(
    await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches)
  ).toBe(false);
  assertNoRuntimeErrors();
  await context.close();
});

test("motion foundation preserves state clarity in light and dark themes", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 768, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "motion foundation theme parity");
  await page.goto(`${mobileUrls.sirio}/foundations/motion`);

  const proof = page.locator('[data-motion-lab]');
  const themeTrigger = page.getByRole("button", { name: /Cambia tema/ });

  await themeTrigger.click();
  await page.getByRole("menuitem", { name: "Chiaro" }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  const lightBackground = await proof.evaluate((element) => getComputedStyle(element).backgroundColor);

  await themeTrigger.click();
  await page.getByRole("menuitem", { name: "Scuro" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  const darkBackground = await proof.evaluate((element) => getComputedStyle(element).backgroundColor);

  expect(darkBackground).not.toBe(lightBackground);
  await expect(proof.getByText(/Stato:\s*inattivo/)).toBeVisible();
  assertNoRuntimeErrors();
  await context.close();
});

test("interaction state foundation composes real primitive states without semantic loss", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 768, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "interaction state foundation");
  await page.goto(`${mobileUrls.sirio}/foundations/interaction-states`);

  const foundation = page.locator("[data-interaction-state-foundation]");
  await expect(foundation).toBeVisible();
  await expect(page.getByRole("link", { name: "Interaction states", exact: true })).toBeVisible();

  const aliases = [
    ["selected-tab", "selected"],
    ["selected-toggle", "selected"],
    ["checked", "checked"],
    ["indeterminate", "indeterminate"],
    ["open", "open"],
    ["invalid", "invalid"],
    ["readonly-input", "readonly"],
    ["readonly-textarea", "readonly"],
    ["disabled", "disabled"],
    ["loading", "loading"],
  ] as const;

  for (const [proof, value] of aliases) {
    await expect(page.locator(`[data-state-proof="${proof}"]`)).toHaveCSS(
      "--qv-state-proof",
      value,
    );
  }

  const transient = page.getByRole("button", { name: "Punta, premi e rilascia" });
  const transientSize = await transient.evaluate((element) => ({
    height: (element as HTMLElement).offsetHeight,
    width: (element as HTMLElement).offsetWidth,
  }));
  await transient.hover();
  await expect.poll(() => transient.evaluate((element) => element.matches(":hover"))).toBe(true);
  const transientBox = await transient.boundingBox();
  expect(transientBox).not.toBeNull();
  await page.mouse.move(
    transientBox!.x + transientBox!.width / 2,
    transientBox!.y + transientBox!.height / 2,
  );
  await page.mouse.down();
  await expect.poll(() => transient.evaluate((element) => element.matches(":active"))).toBe(true);
  await page.mouse.up();
  await expect.poll(() => transient.evaluate((element) => element.matches(":active"))).toBe(false);
  await expect(transient).not.toHaveAttribute("aria-selected", "true");
  await expect(transient).not.toHaveAttribute("data-checked", "");
  expect(
    await transient.evaluate((element) => ({
      height: (element as HTMLElement).offsetHeight,
      width: (element as HTMLElement).offsetWidth,
    })),
  ).toEqual(transientSize);

  const selectedTab = page.locator('[data-state-proof="selected-tab"]');
  await selectedTab.hover();
  await expect(selectedTab).toHaveAttribute("aria-selected", "true");

  const additiveFocusCases = [
    [selectedTab, "aria-selected", "true"],
    [page.locator('[data-state-proof="checked"]'), "data-checked", ""],
    [page.locator('[data-state-proof="invalid"]'), "aria-invalid", "true"],
    [page.locator('[data-state-proof="readonly-input"]'), "readonly", ""],
  ] as const;

  await page.keyboard.press("Tab");
  for (const [target, attribute, value] of additiveFocusCases) {
    await target.focus();
    await expect.poll(() => target.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
    await expect(target).toHaveAttribute(attribute, value);
  }

  const readonlyInput = page.locator('[data-state-proof="readonly-input"]');
  await expect(readonlyInput).not.toBeDisabled();
  await readonlyInput.selectText();
  expect(await readonlyInput.evaluate((element) => (element as HTMLInputElement).selectionStart)).toBe(0);

  const disabled = page.locator('[data-state-proof="disabled"]');
  await expect(disabled).toBeDisabled();
  const disabledBefore = await disabled.evaluate((element) => {
    const style = getComputedStyle(element);
    return { backgroundColor: style.backgroundColor, transform: style.transform };
  });
  const disabledBox = await disabled.boundingBox();
  expect(disabledBox).not.toBeNull();
  await page.mouse.move(disabledBox!.x + disabledBox!.width / 2, disabledBox!.y + disabledBox!.height / 2);
  expect(
    await disabled.evaluate((element) => {
      const style = getComputedStyle(element);
      return { backgroundColor: style.backgroundColor, transform: style.transform };
    }),
  ).toEqual(disabledBefore);

  const loading = page.locator('[data-state-proof="loading"]');
  await expect(loading).toBeDisabled();
  await expect(loading).toHaveAttribute("aria-busy", "true");
  expect(
    await loading.evaluate((element) => {
      let activationCount = 0;
      element.addEventListener("click", () => activationCount += 1);
      (element as HTMLButtonElement).click();
      (element as HTMLButtonElement).click();
      return activationCount;
    }),
  ).toBe(0);

  const disclosure = page.locator('[data-state-proof="open"]');
  await disclosure.evaluate((element: HTMLElement) => {
    element.click();
    element.click();
    element.click();
  });
  await expect(disclosure).toHaveAttribute("aria-expanded", "false");
  await disclosure.evaluate((element: HTMLElement) => {
    element.click();
    element.click();
    element.click();
  });
  await expect(disclosure).toHaveAttribute("aria-expanded", "true");
  await expect(disclosure).toHaveCSS("--qv-state-proof", "open");

  assertNoRuntimeErrors();
  await context.close();
});

test("interaction state foundation remains clear for touch, reduced motion, and forced colors", async ({ browser }) => {
  const context = await createInputContext(browser, {
    width: 390,
    height: 844,
    touch: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "interaction state accessibility modes");
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.goto(`${mobileUrls.sirio}/foundations/interaction-states`);

  expect(
    await page.evaluate(() => ({
      fineHover: matchMedia("(hover: hover) and (pointer: fine)").matches,
      forcedColors: matchMedia("(forced-colors: active)").matches,
      reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    })),
  ).toEqual({ fineHover: false, forcedColors: true, reducedMotion: true });

  const invalid = page.locator('[data-state-proof="invalid"]');
  await invalid.focus();
  await expect.poll(() => invalid.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
  await expect(invalid).toHaveAttribute("aria-invalid", "true");
  expect(
    await invalid.evaluate((element) => {
      const style = getComputedStyle(element);
      return style.outlineStyle !== "none" || style.boxShadow !== "none";
    }),
  ).toBe(true);

  const readonly = page.locator('[data-state-proof="readonly-input"]');
  await readonly.focus();
  await expect(readonly).toBeFocused();
  await expect(readonly).not.toBeDisabled();
  await expect(readonly).toHaveCSS("--qv-state-proof", "readonly");

  const transient = page.getByRole("button", { name: "Punta, premi e rilascia" });
  await transient.tap();
  await expect(transient).not.toHaveAttribute("aria-selected", "true");
  await expect(transient).not.toHaveAttribute("aria-pressed", "true");
  assertNoRuntimeErrors();
  await context.close();
});

test("interaction state foundation preserves semantic state in light and dark themes", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 768, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "interaction state theme parity");
  await page.goto(`${mobileUrls.sirio}/foundations/interaction-states`);

  const foundation = page.locator("[data-interaction-state-foundation]");
  const selected = page.locator('[data-state-proof="selected-tab"]');
  const themeTrigger = page.getByRole("button", { name: /Cambia tema/ });

  await themeTrigger.click();
  await page.getByRole("menuitem", { name: "Chiaro" }).click();
  const lightBackground = await foundation.evaluate((element) => getComputedStyle(element).backgroundColor);
  await expect(selected).toHaveAttribute("aria-selected", "true");

  await themeTrigger.click();
  await page.getByRole("menuitem", { name: "Scuro" }).click();
  const darkBackground = await foundation.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(darkBackground).not.toBe(lightBackground);
  await expect(selected).toHaveAttribute("aria-selected", "true");
  assertNoRuntimeErrors();
  await context.close();
});

test("focus foundation exposes one immediate keyboard indicator without geometry shift", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 768, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "focus foundation keyboard path");
  await page.goto(`${mobileUrls.sirio}/foundations/focus`);

  await expect(page.getByRole("link", { name: "Focus", exact: true })).toBeVisible();
  const foundation = page.locator("[data-focus-foundation]");
  await expect(foundation).toBeVisible();

  for (const proof of ["button", "link", "input", "checkbox", "radio", "switch"]) {
    await expect(page.locator(`[data-focus-proof="${proof}"]`)).toBeVisible();
  }

  const button = page.locator('[data-focus-proof="button"]');
  const initialGeometry = await button.evaluate((element) => ({
    height: (element as HTMLElement).offsetHeight,
    width: (element as HTMLElement).offsetWidth,
  }));
  await tabTo(page, button);
  await expect.poll(() => button.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
  expect(await button.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      offset: style.outlineOffset,
      ringShadow: style.getPropertyValue("--tw-ring-shadow").trim(),
      style: style.outlineStyle,
      transitionProperty: style.transitionProperty,
      width: style.outlineWidth,
    };
  })).toMatchObject({
    offset: "2px",
    style: "solid",
    width: "2px",
  });
  expect(
    await button.evaluate((element) => getComputedStyle(element).transitionProperty),
  ).not.toContain("outline");
  expect(await button.evaluate((element) => ({
    height: (element as HTMLElement).offsetHeight,
    width: (element as HTMLElement).offsetWidth,
  }))).toEqual(initialGeometry);

  const selected = page.locator('[data-focus-proof="selected"]');
  await tabTo(page, selected);
  await expect(selected).toHaveAttribute("data-pressed", "");
  await expect.poll(() => selected.evaluate((element) => element.matches(":focus-visible"))).toBe(true);

  const checked = page.locator('[data-focus-proof="checkbox"]');
  await tabTo(page, checked);
  await expect(checked).toHaveAttribute("data-checked", "");
  await expect.poll(() => checked.evaluate((element) => element.matches(":focus-visible"))).toBe(true);

  const invalid = page.locator('[data-focus-proof="invalid"]');
  await tabTo(page, invalid);
  await expect(invalid).toHaveAttribute("aria-invalid", "true");
  await expect.poll(() => invalid.evaluate((element) => element.matches(":focus-visible"))).toBe(true);

  const readonly = page.locator('[data-focus-proof="readonly"]');
  await tabTo(page, readonly);
  await expect(readonly).toHaveAttribute("readonly", "");
  await expect(readonly).not.toBeDisabled();
  await expect.poll(() => readonly.evaluate((element) => element.matches(":focus-visible"))).toBe(true);

  const composite = page.locator('[data-focus-proof="composite"]');
  const compositeTarget = page.locator('[data-focus-proof="composite-input"]');
  await tabTo(page, compositeTarget);
  await expect(compositeTarget).toBeFocused();
  await expect(composite).toHaveCSS("outline-width", "2px");
  await expect(composite).toHaveCSS("outline-offset", "2px");
  await expect(compositeTarget).toHaveCSS("outline-style", "none");

  await page.mouse.click(8, 8);
  await button.click();
  await expect.poll(() => button.evaluate((element) => element.matches(":focus-visible"))).toBe(false);
  assertNoRuntimeErrors();
  await context.close();
});

test("focus foundation transfers into an overlay and restores the real trigger", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 768, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "focus foundation overlay restoration");
  await page.goto(`${mobileUrls.sirio}/foundations/focus`);

  const trigger = page.locator('[data-focus-proof="dialog-trigger"]');
  await tabTo(page, trigger);
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Enter");

  const dialog = page.getByRole("dialog", { name: "Trasferimento del focus" });
  const initialFocus = page.locator('[data-focus-proof="dialog-initial"]');
  await expect(dialog).toBeVisible();
  await expect(initialFocus).toBeFocused();
  await expect.poll(() => initialFocus.evaluate((element) => element.matches(":focus-visible"))).toBe(true);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect.poll(() => trigger.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
  assertNoRuntimeErrors();
  await context.close();
});

test("focus foundation preserves its geometry and contrast in light and dark themes", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 768, touch: false });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "focus foundation theme parity");
  await page.goto(`${mobileUrls.sirio}/foundations/focus`);

  const target = page.locator('[data-focus-proof="button"]');
  const themeTrigger = page.getByRole("button", { name: /Cambia tema/ });

  await themeTrigger.click();
  await page.getByRole("menuitem", { name: "Chiaro" }).click();
  await tabTo(page, target);
  const light = await target.evaluate((element) => {
    const style = getComputedStyle(element);
    return { color: style.outlineColor, offset: style.outlineOffset, width: style.outlineWidth };
  });

  await themeTrigger.click();
  await page.getByRole("menuitem", { name: "Scuro" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await tabTo(page, target);
  const dark = await target.evaluate((element) => {
    const style = getComputedStyle(element);
    return { color: style.outlineColor, offset: style.outlineOffset, width: style.outlineWidth };
  });

  expect(light).toMatchObject({ offset: "2px", width: "2px" });
  expect(dark).toMatchObject({ offset: "2px", width: "2px" });
  expect(dark.color).not.toBe(light.color);
  expect(dark.color).not.toBe("rgba(0, 0, 0, 0)");
  assertNoRuntimeErrors();
  await context.close();
});

test("focus foundation stays visible with forced colors, coarse input, and sticky surfaces", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 390, height: 720, touch: true });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "focus foundation contrast and obscuration");
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.goto(`${mobileUrls.sirio}/foundations/focus`);

  expect(await page.evaluate(() => ({
    fineHover: matchMedia("(hover: hover) and (pointer: fine)").matches,
    forcedColors: matchMedia("(forced-colors: active)").matches,
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
  }))).toEqual({ fineHover: false, forcedColors: true, reducedMotion: true });

  const destructive = page.locator('[data-focus-proof="destructive"]');
  await tabTo(page, destructive);
  expect(await destructive.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      color: style.outlineColor,
      offset: style.outlineOffset,
      style: style.outlineStyle,
      width: style.outlineWidth,
    };
  })).toMatchObject({ offset: "2px", style: "solid", width: "2px" });
  expect(await destructive.evaluate((element) => getComputedStyle(element).outlineColor)).not.toBe("rgba(0, 0, 0, 0)");

  const scrollport = page.locator("[data-focus-scrollport]");
  const sticky = page.locator("[data-focus-sticky]");
  const target = page.locator('[data-focus-proof="not-obscured"]');
  await tabTo(page, target);
  await expect(target).toBeFocused();
  const geometry = await Promise.all([scrollport.boundingBox(), sticky.boundingBox(), target.boundingBox()]);
  expect(geometry.every(Boolean)).toBe(true);
  expect(geometry[2]!.y).toBeGreaterThanOrEqual(geometry[1]!.y + geometry[1]!.height);
  expect(geometry[2]!.y + geometry[2]!.height).toBeLessThanOrEqual(
    geometry[0]!.y + geometry[0]!.height,
  );

  assertNoRuntimeErrors();
  await context.close();
});
