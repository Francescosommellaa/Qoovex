import type { Locator, Page } from "@playwright/test";
import {
  comparePair,
  compareRepeatedRhythm,
  compareScalar,
} from "./geometry-contracts.mjs";
import { surfaceTarget, type GeometryRule, type VisualSurface } from "./stability";

interface Measurements {
  bottom: number;
  clientHeight: number;
  clientWidth: number;
  height: number;
  left: number;
  right: number;
  scrollHeight: number;
  scrollWidth: number;
  top: number;
  width: number;
}

async function measure(locator: Locator): Promise<Measurements> {
  return locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      bottom: rect.bottom,
      clientHeight: element.clientHeight,
      clientWidth: element.clientWidth,
      height: rect.height,
      left: rect.left,
      right: rect.right,
      scrollHeight: element.scrollHeight,
      scrollWidth: element.scrollWidth,
      top: rect.top,
      width: rect.width,
    };
  });
}

function locatorForRule(page: Page, surface: VisualSurface, target: string): Locator {
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
  const measurements = await measure(locatorForRule(page, surface, rule.target));
  const context = { surface: surface.id, state: surface.setupId ?? "default", tolerance: rule.tolerance };

  if (rule.type === "overflow") {
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
    const comparison = await measure(locatorForRule(page, surface, rule.comparisonTarget));
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
    const positions = await locatorForRule(page, surface, rule.target).evaluateAll((elements) =>
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
