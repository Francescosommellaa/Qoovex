import { expect, test } from "@playwright/test";

import { assertGeometry } from "./geometry-assertions";
import { applyInteractionSetup, captureTarget } from "./interaction-setups";
import { VISUAL_SURFACES } from "./surface-manifest.mjs";
import {
  assertStableDiagnostics,
  prepareStablePage,
  type VisualSurface,
} from "./stability";

const tierRank = Object.freeze({ critical: 0, representative: 1, broad: 2 });

function selectedSurfaces(): readonly VisualSurface[] {
  const requestedTier = process.env.QOOVEX_VISUAL_TIER ?? "critical";
  if (!(requestedTier in tierRank)) throw new Error(`unknown visual tier: ${requestedTier}`);
  const requestedApps = new Set(
    (process.env.QOOVEX_VISUAL_APPS ?? "sirio,web,workspace")
      .split(",")
      .map((app) => app.trim())
      .filter(Boolean),
  );

  return (VISUAL_SURFACES as readonly VisualSurface[]).filter(
    (surface) =>
      requestedApps.has(surface.app) &&
      tierRank[surface.tier] <= tierRank[requestedTier as keyof typeof tierRank],
  );
}

for (const surface of selectedSurfaces()) {
  const projectName = `${surface.app}-${surface.theme}`;

  test(`[${projectName}] ${surface.id}`, async ({ page }) => {
    const diagnostics = await prepareStablePage(page, surface);
    await applyInteractionSetup(page, surface);
    await assertGeometry(page, surface);
    await expect(captureTarget(page, surface)).toHaveScreenshot(
      surface.snapshot.name,
      surface.snapshot.options,
    );
    assertStableDiagnostics(diagnostics);
  });
}
