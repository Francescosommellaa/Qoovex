import type { Locator, Page } from "@playwright/test";
import {
  comparePair,
  compareRepeatedRhythm,
  compareScalar,
} from "./geometry-contracts.mjs";
import { surfaceTarget, type GeometryRule, type VisualSurface } from "./stability";

interface Measurements {
  borderRadius: number;
  borderTopWidth: number;
  bottom: number;
  clientHeight: number;
  clientWidth: number;
  gap: number;
  height: number;
  left: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  right: number;
  scrollHeight: number;
  scrollWidth: number;
  top: number;
  width: number;
}

async function measure(locator: Locator): Promise<Measurements> {
  return locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      borderRadius: Number.parseFloat(style.borderRadius),
      borderTopWidth: Number.parseFloat(style.borderTopWidth),
      bottom: rect.bottom,
      clientHeight: element.clientHeight,
      clientWidth: element.clientWidth,
      gap: Number.parseFloat(style.gap),
      height: rect.height,
      left: rect.left,
      paddingBottom: Number.parseFloat(style.paddingBottom),
      paddingLeft: Number.parseFloat(style.paddingLeft),
      paddingRight: Number.parseFloat(style.paddingRight),
      paddingTop: Number.parseFloat(style.paddingTop),
      right: rect.right,
      scrollHeight: element.scrollHeight,
      scrollWidth: element.scrollWidth,
      top: rect.top,
      width: rect.width,
    };
  });
}

function locatorForRule(
  page: Page,
  surface: VisualSurface,
  target: string,
  selector?: string,
  scope: "surface" | "page" = "surface",
): Locator {
  if (selector) {
    return scope === "page" ? page.locator(selector) : surfaceTarget(page, surface).locator(selector);
  }
  return target === surface.target
    ? surfaceTarget(page, surface)
    : page.locator(`[data-visual-geometry="${target}"]`);
}

function metric(measurements: Measurements, name: string): number {
  const value = measurements[name as keyof Measurements];
  if (typeof value !== "number") throw new Error(`unknown geometry metric: ${name}`);
  return value;
}

async function assertRule(page: Page, surface: VisualSurface, rule: GeometryRule): Promise<void> {
  const context = { surface: surface.id, state: surface.setupId ?? "default", tolerance: rule.tolerance };

  if (rule.type === "overflow") {
    const measurements = await measure(
      locatorForRule(page, surface, rule.target, rule.selector, rule.scope),
    );
    const horizontal = rule.axis !== "vertical";
    compareScalar({
      ...context,
      element: rule.target,
      metric: horizontal ? "horizontal overflow" : "vertical overflow",
      expected: horizontal ? measurements.clientWidth : measurements.clientHeight,
      actual: horizontal ? measurements.scrollWidth : measurements.scrollHeight,
    });
    return;
  }

  if (rule.type === "scalar") {
    const measurements = await measure(
      locatorForRule(page, surface, rule.target, rule.selector, rule.scope),
    );
    compareScalar({
      ...context,
      element: rule.target,
      metric: rule.metric,
      expected: rule.expected,
      actual: metric(measurements, rule.metric ?? ""),
    });
    return;
  }

  if (rule.type === "pair") {
    if (!rule.comparisonTarget || !rule.metric) throw new Error(`incomplete pair rule for ${surface.id}`);
    const measurements = await measure(
      locatorForRule(page, surface, rule.target, rule.selector, rule.scope),
    );
    const comparison = await measure(
      locatorForRule(
        page,
        surface,
        rule.comparisonTarget,
        rule.comparisonSelector,
        rule.scope,
      ),
    );
    comparePair({
      ...context,
      relation: `${rule.target} to ${rule.comparisonTarget}`,
      metric: rule.metric,
      first: metric(measurements, rule.metric),
      second: metric(comparison, rule.metric),
    });
    return;
  }

  if (rule.type === "rhythm") {
    const positions = await locatorForRule(
      page,
      surface,
      rule.target,
      rule.selector,
      rule.scope,
    ).evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().top),
    );
    compareRepeatedRhythm({
      ...context,
      relation: rule.target,
      positions,
      expected: rule.expected,
    });
  }
}

export async function assertGeometry(page: Page, surface: VisualSurface): Promise<void> {
  for (const rule of surface.geometry) await assertRule(page, surface, rule);
}
