import { expect, test, type Locator } from "@playwright/test";

import { createInputContext, mobileUrls } from "./support/context";
import { expectNoDocumentOverflow, expectTouchTarget } from "./support/geometry";

const matrix = [
  { width: 320, height: 720, touch: true },
  { width: 390, height: 844, touch: true },
  { width: 768, height: 1024, touch: true },
  { width: 1024, height: 768, touch: false },
  { width: 1440, height: 900, touch: false },
] as const;

async function componentSignature(locator: Locator) {
  return locator.evaluate((element) => ({
    elements: element.querySelectorAll("*").length,
    buttons: element.querySelectorAll("button").length,
    headings: element.querySelectorAll("h3").length,
    badges: element.querySelectorAll('[data-slot="badge"]').length,
  }));
}

test("responsive foundation preserves one composition across the canonical matrix", async ({ browser }) => {
  let canonicalSignature: Awaited<ReturnType<typeof componentSignature>> | undefined;

  for (const viewport of matrix) {
    const context = await createInputContext(browser, viewport);
    const page = await context.newPage();
    await page.goto(`${mobileUrls.sirio}/foundations/responsive`);

    const specimen = page.locator("[data-responsive-component]").first();
    await expect(specimen).toBeVisible();
    await expectNoDocumentOverflow(page, `responsive foundation at ${viewport.width}px`);

    const signature = await componentSignature(specimen);
    canonicalSignature ??= signature;
    expect(signature, `DOM contract at ${viewport.width}px`).toEqual(canonicalSignature);

    const layout = await specimen.evaluate((element) => {
      const style = getComputedStyle(element);
      const composition = element.querySelector<HTMLElement>("[data-responsive-composition]");
      if (!composition) throw new Error("Missing responsive composition");
      return {
        contentWidth:
          element.clientWidth - Number.parseFloat(style.paddingLeft) - Number.parseFloat(style.paddingRight),
        columns: getComputedStyle(composition).gridTemplateColumns.split(" ").length,
        rootFontSize: Number.parseFloat(getComputedStyle(document.documentElement).fontSize),
      };
    });
    expect(layout.columns, `intrinsic composition at ${viewport.width}px`).toBe(
      layout.contentWidth >= 34 * layout.rootFontSize ? 2 : 1,
    );

    await context.close();
  }
});

test("container space, not the wide viewport, controls component composition", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1440, height: 900, touch: false });
  const page = await context.newPage();
  await page.goto(`${mobileUrls.sirio}/foundations/responsive`);

  const narrow = page.locator('[data-responsive-host="narrow"] [data-responsive-component]');
  const complex = page.locator('[data-responsive-host="complex"] [data-responsive-component]');
  const [narrowColumns, complexColumns] = await Promise.all(
    [narrow, complex].map((locator) =>
      locator
        .locator("[data-responsive-composition]")
        .evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length),
    ),
  );

  expect(narrowColumns).toBe(1);
  expect(complexColumns).toBe(2);
  expect(await componentSignature(narrow)).toEqual(await componentSignature(complex));
  await expectNoDocumentOverflow(page, "container-query comparison");

  await context.close();
});

test("reflow, landscape, safe area, software keyboard and reduced motion keep every action", async ({ browser }) => {
  const context = await createInputContext(browser, {
    width: 390,
    height: 844,
    touch: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(`${mobileUrls.sirio}/foundations/responsive`);
  await page.addStyleTag({
    content:
      ":root { --safe-area-top: 24px !important; --safe-area-right: 12px !important; --safe-area-bottom: 28px !important; --safe-area-left: 12px !important; }",
  });

  const safeArea = page.locator("[data-responsive-safe-area]");
  const padding = await safeArea.evaluate((element) => {
    const style = getComputedStyle(element);
    return [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft];
  });
  expect(padding).toEqual(["24px", "16px", "28px", "16px"]);

  const composition = page.locator("[data-responsive-composition]").first();
  expect(await composition.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe("0s");
  await expectTouchTarget(page.getByRole("button", { name: "Apri dettaglio" }).first(), "coarse action");
  await expectNoDocumentOverflow(page, "390px portrait reflow");

  await page.setViewportSize({ width: 390, height: 420 });
  const finalAction = page.getByRole("button", { name: "Apri dettaglio" }).last();
  await finalAction.scrollIntoViewIfNeeded();
  await expect(finalAction).toBeVisible();
  await finalAction.click();
  await expectNoDocumentOverflow(page, "software-keyboard-height viewport");
  await context.close();

  const landscapeContext = await createInputContext(browser, { width: 844, height: 390, touch: true });
  const landscapePage = await landscapeContext.newPage();
  await landscapePage.goto(`${mobileUrls.sirio}/foundations/responsive`);
  await expectNoDocumentOverflow(landscapePage, "phone landscape");
  await expect(landscapePage.getByRole("button", { name: "Apri dettaglio" }).first()).toBeVisible();
  await landscapeContext.close();
});
