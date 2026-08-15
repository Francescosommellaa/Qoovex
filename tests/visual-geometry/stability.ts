import { expect, type Locator, type Page } from "@playwright/test";

export interface VisualSurface {
  id: string;
  app: "sirio" | "web" | "workspace";
  route: string;
  target: string;
  theme: "light" | "dark";
  tier: "critical" | "representative" | "broad";
  setupId?: string;
  geometry: readonly GeometryRule[];
  snapshot: {
    name: string;
    options: {
      animations: "disabled";
      caret: "hide";
      maxDiffPixels: number;
      scale: "css";
    };
  };
  waitForSettled?: boolean;
}

export interface GeometryRule {
  type: "overflow" | "scalar" | "pair" | "rhythm" | "layout-shift";
  axis?: "horizontal" | "vertical";
  target: string;
  comparisonTarget?: string;
  metric?: string;
  expected?: number;
  tolerance: number;
}

const APP_ORIGINS = Object.freeze({
  sirio: "http://127.0.0.1:3002",
  web: "http://127.0.0.1:3000",
  workspace: "http://127.0.0.1:3001",
});
const LOOPBACK_HOSTS = new Set(["127.0.0.1", "::1", "localhost"]);

export function appOrigin(app: VisualSurface["app"]): string {
  return APP_ORIGINS[app];
}

export function surfaceTarget(page: Page, surface: VisualSurface): Locator {
  if (surface.app === "web" || surface.app === "workspace") return page.getByRole("main");
  return page.locator(`[data-visual-specimen="${surface.target}"]`);
}

export interface StabilityDiagnostics {
  pageErrors: string[];
  consoleErrors: string[];
}

export async function prepareStablePage(
  page: Page,
  surface: VisualSurface,
): Promise<StabilityDiagnostics> {
  const diagnostics: StabilityDiagnostics = { pageErrors: [], consoleErrors: [] };

  page.on("pageerror", (error) => diagnostics.pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (/Failed to load resource.*(?:ERR_FAILED|ERR_BLOCKED_BY_CLIENT)/i.test(text)) return;
    diagnostics.consoleErrors.push(text);
  });

  await page.route("**/*", async (route) => {
    const requestUrl = new URL(route.request().url());
    if (!["http:", "https:"].includes(requestUrl.protocol) || LOOPBACK_HOSTS.has(requestUrl.hostname)) {
      await route.continue();
      return;
    }
    await route.abort("blockedbyclient");
  });

  await page.addInitScript((theme) => {
    localStorage.setItem("theme", theme);
  }, surface.theme);
  await page.clock.setFixedTime(new Date("2026-08-15T10:00:00+02:00"));

  await page.goto(new URL(surface.route, appOrigin(surface.app)).href, {
    waitUntil: "domcontentloaded",
  });

  const target = surfaceTarget(page, surface);
  await expect(target).toBeVisible();
  await target.scrollIntoViewIfNeeded();

  if (surface.waitForSettled) {
    await expect(page.locator('[aria-busy="true"], [data-slot="skeleton"]')).toHaveCount(0);
  }

  return diagnostics;
}

export function assertStableDiagnostics(diagnostics: StabilityDiagnostics): void {
  expect(diagnostics.pageErrors, "unexpected page errors").toEqual([]);
  expect(diagnostics.consoleErrors, "unexpected console errors").toEqual([]);
}
