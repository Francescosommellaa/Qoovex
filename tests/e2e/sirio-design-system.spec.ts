import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const isDesktop = (projectName: string) => projectName.endsWith("-1440");

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3002/");
});

test("pubblica la fondazione Calore Misurato senza testo legacy", async ({
  page,
}) => {
  await expect(
    page.getByRole("heading", {
      name: "Finalmente tutto è al suo posto.",
    }),
  ).toBeVisible();
  await expect(page.getByText("Fondazione Calore Misurato v0")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Autorità silenziosa" }),
  ).toBeVisible();
  await expect(page.getByText("Stress test in cucina")).toBeVisible();
  await expect(page.getByText("Stable v0.5")).toHaveCount(0);
  await expect(page.getByText("Crystal")).toHaveCount(0);
});

test("usa identita Sirio e token del package UI solo stili", async ({
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
  expect(details.reviewPrimary).toBe("#111");
});

test("documenta palette semantica, modalita operative e linguaggio degli stati", async ({
  page,
}) => {
  for (const text of [
    "Porcellana",
    "Grafite",
    "Calore",
    "Pianificazione",
    "Preparazione",
    "Servizio",
    "Revisione",
    "Allergene critico",
    "Pronto per il servizio",
  ]) {
    await expect(page.getByText(text, { exact: true })).toBeVisible();
  }
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

  await expect(page.locator(".sirio-instrument")).toHaveCSS(
    "border-top-style",
    "solid",
  );
  await expect(page.locator(".sirio-instrument")).toHaveCSS(
    "box-shadow",
    "none",
  );
});
