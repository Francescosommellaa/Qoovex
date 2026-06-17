import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const isDesktop = (projectName: string) => projectName.endsWith("-1440");
const isMobile = (projectName: string) => projectName.endsWith("-375");

async function openMobileMenu(page: import("@playwright/test").Page, projectName: string) {
  if (isMobile(projectName)) {
    await page.getByRole("button", { exact: true, name: "Menu" }).click();
    await expect(page.getByRole("button", { name: "Chiudi" })).toBeVisible();
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3002/");
});

test("pubblica Sirio come atlante italiano delle fondazioni", async ({
  page,
}) => {
  await expect(
    page.getByRole("heading", {
      name: "Uno strumento, non una vetrina.",
    }),
  ).toBeVisible();
  await expect(page.getByText("Calore Misurato v0")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Autorita silenziosa" }),
  ).toBeVisible();
  await expect(page.getByText("Criterio: utile, chiaro, durevole.")).toBeVisible();
  await expect(page.getByText(["Stable", "v0.5"].join(" "))).toHaveCount(0);
  await expect(page.getByText(["Cry", "stal"].join(""))).toHaveCount(0);
});

test("usa identita Sirio e token del package UI styles-only", async ({
  page,
}) => {
  await expect(page.locator(".sirio-brand img")).toHaveAttribute(
    "src",
    "/logo-icon/sirio-icon.svg",
  );

  const details = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    document.documentElement.setAttribute("data-qv-mode", "kitchen");
    const kitchenHeight = getComputedStyle(
      document.documentElement,
    ).getPropertyValue("--qv-control-height");
    document.documentElement.setAttribute("data-qv-mode", "review");
    const reviewPrimary = getComputedStyle(
      document.documentElement,
    ).getPropertyValue("--qv-action-primary-bg");
    document.documentElement.removeAttribute("data-qv-mode");

    return {
      action: styles.getPropertyValue("--qv-action-primary-bg").trim(),
      kitchenHeight: kitchenHeight.trim(),
      reviewPrimary: reviewPrimary.trim(),
    };
  });

  expect(details.action).toBe("#d96b2b");
  expect(details.kitchenHeight).toBe("56px");
  expect(["#111", "#111111"]).toContain(details.reviewPrimary);
});

test("mostra palette, tipografia, layout, azioni, stati e modalita", async ({
  page,
}, testInfo) => {
  for (const text of [
    "Porcellana",
    "Grafite",
    "Calore",
    "Tipografia",
    "Layout",
    "Primaria",
    "Critico",
    "Cucina",
    "Revisione",
  ]) {
    expect(await page.getByText(text, { exact: true }).count()).toBeGreaterThan(0);
  }

  await openMobileMenu(page, testInfo.project.name);
  await page.getByRole("link", { name: "Stati" }).click();
  await expect(
    page.getByRole("heading", { name: "Ogni stato spiega cosa e' cambiato." }),
  ).toBeInViewport();
  await expect(page.locator(".sirio-atlas")).toHaveAttribute(
    "data-active-section",
    "stati",
  );
});

test("mantiene navigazione persistente, opaca e con stato attivo", async ({
  page,
}, testInfo) => {
  const sidebar = page.locator(".sirio-sidebar");
  await expect(sidebar).toHaveCSS("background-color", "rgb(255, 255, 255)");

  const before = await sidebar.boundingBox();
  await openMobileMenu(page, testInfo.project.name);
  await page.getByRole("link", { name: "Qualita" }).click();
  await expect(page.locator(".sirio-atlas")).toHaveAttribute(
    "data-active-section",
    "qualita",
  );
  const after = await sidebar.boundingBox();

  expect(Math.abs((before?.x ?? 0) - (after?.x ?? 0))).toBeLessThanOrEqual(1);
  expect(Math.abs((before?.y ?? 0) - (after?.y ?? 0))).toBeLessThanOrEqual(1);
});

test("su mobile apre un menu fullscreen opaco", async ({ page }, testInfo) => {
  test.skip(!isMobile(testInfo.project.name));

  await page.getByRole("button", { exact: true, name: "Menu" }).click();
  await expect(page.getByRole("button", { name: "Chiudi" })).toBeVisible();
  await expect(page.locator(".sirio-sidebar nav")).toHaveCSS(
    "background-color",
    "rgb(250, 249, 246)",
  );
  await expect(page.getByRole("link", { name: "Qualita" })).toBeVisible();
});

test("la pagina non ha violazioni Axe serie o critiche", async ({
  page,
}, testInfo) => {
  test.skip(!isDesktop(testInfo.project.name));

  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter(({ impact }) =>
    ["critical", "serious"].includes(impact ?? ""),
  );
  expect(blocking).toEqual([]);
});

test("il layout non ha overflow orizzontale e regge reflow 200 percento", async ({
  page,
}, testInfo) => {
  const normal = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(normal.scroll).toBeLessThanOrEqual(normal.client);

  test.skip(!isDesktop(testInfo.project.name));
  await page.setViewportSize({ width: 720, height: 900 });
  await page.reload();
  const zoomed = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(zoomed.scroll).toBeLessThanOrEqual(zoomed.client);
});

test("forced colors preserva i confini visibili", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-1440");
  await page.emulateMedia({ forcedColors: "active" });
  await page.reload();

  await expect(page.locator(".sirio-command-board")).toHaveCSS(
    "border-top-style",
    "solid",
  );
  await expect(page.locator(".sirio-command-board")).toHaveCSS(
    "box-shadow",
    "none",
  );
});
