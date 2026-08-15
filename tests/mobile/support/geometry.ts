import { expect, type Locator, type Page } from "@playwright/test";

export async function expectNoDocumentOverflow(page: Page, label: string) {
  const geometry = await page.evaluate(() => {
    const root = document.documentElement;
    const overflow = [...document.querySelectorAll<HTMLElement>("body *")]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && (rect.right > root.clientWidth + 1 || rect.left < -1);
      })
      .slice(0, 5)
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        slot: element.dataset.slot ?? null,
        text: element.textContent?.trim().slice(0, 60) ?? "",
        rect: element.getBoundingClientRect().toJSON(),
      }));
    return {
      clientWidth: root.clientWidth,
      scrollWidth: root.scrollWidth,
      overflow,
    };
  });

  expect(
    geometry.scrollWidth,
    `${label} overflowed ${geometry.clientWidth}px: ${JSON.stringify(geometry.overflow)}`,
  ).toBeLessThanOrEqual(geometry.clientWidth + 1);
}

export async function expectTouchTarget(locator: Locator, label: string) {
  await expect(locator, label).toBeVisible();
  const size = await locator.evaluate((element) => {
    const target = element as HTMLElement;
    return { width: target.offsetWidth, height: target.offsetHeight };
  });
  expect(size.width, `${label} touch width`).toBeGreaterThanOrEqual(44);
  expect(size.height, `${label} touch height`).toBeGreaterThanOrEqual(44);
}

export async function expectWithinVisualViewport(locator: Locator, label: string) {
  await expect(locator, label).toBeVisible();
  const geometry = await locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const viewport = window.visualViewport;
    return {
      rect: { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left },
      viewport: {
        top: viewport?.offsetTop ?? 0,
        left: viewport?.offsetLeft ?? 0,
        width: viewport?.width ?? window.innerWidth,
        height: viewport?.height ?? window.innerHeight,
      },
    };
  });
  const right = geometry.viewport.left + geometry.viewport.width;
  const bottom = geometry.viewport.top + geometry.viewport.height;
  expect(geometry.rect.left, `${label} left edge`).toBeGreaterThanOrEqual(geometry.viewport.left - 1);
  expect(geometry.rect.top, `${label} top edge`).toBeGreaterThanOrEqual(geometry.viewport.top - 1);
  expect(geometry.rect.right, `${label} right edge`).toBeLessThanOrEqual(right + 1);
  expect(geometry.rect.bottom, `${label} bottom edge`).toBeLessThanOrEqual(bottom + 1);
}

export async function expectNoCollision(first: Locator, second: Locator, label: string) {
  const [firstBox, secondBox] = await Promise.all([first.boundingBox(), second.boundingBox()]);
  if (!firstBox || !secondBox) return;
  const overlap =
    firstBox.x < secondBox.x + secondBox.width &&
    firstBox.x + firstBox.width > secondBox.x &&
    firstBox.y < secondBox.y + secondBox.height &&
    firstBox.y + firstBox.height > secondBox.y;
  expect(overlap, label).toBe(false);
}
