import type { Browser, BrowserContext, Page } from "@playwright/test";

export const mobileUrls = {
  web: process.env.MOBILE_WEB_URL ?? "http://localhost:3000",
  workspace: process.env.MOBILE_WORKSPACE_URL ?? "http://localhost:3001",
  sirio: process.env.MOBILE_SIRIO_URL ?? "http://localhost:3002",
} as const;

export async function createInputContext(
  browser: Browser,
  {
    width,
    height,
    touch,
    reducedMotion = "no-preference",
  }: {
    width: number;
    height: number;
    touch: boolean;
    reducedMotion?: "no-preference" | "reduce";
  },
): Promise<BrowserContext> {
  return browser.newContext({
    viewport: { width, height },
    hasTouch: touch,
    reducedMotion,
    colorScheme: "light",
    locale: "it-IT",
  });
}
export async function selectDevView(page: Page, view: "BUSINESS" | "PROFESSIONAL" | "CLIENT") {
  const response = await page.request.post(`${mobileUrls.workspace}/api/dev-auth`, {
    data: { view },
  });
  if (!response.ok()) {
    throw new Error(`Dev view ${view} failed with ${response.status()}.`);
  }
}
