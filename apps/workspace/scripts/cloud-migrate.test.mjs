import assert from "node:assert/strict";
import test from "node:test";

import { createCloudMigrationPlan } from "./cloud-migrate.mjs";

test("ignora le build che non sono Preview o Production Vercel", () => {
  assert.equal(createCloudMigrationPlan({}, "head"), null);
  assert.equal(createCloudMigrationPlan({ VERCEL_ENV: "development" }, "head"), null);
});

test("prepara una migration cloud con la head dichiarata", () => {
  assert.deepEqual(
    createCloudMigrationPlan({ VERCEL_ENV: "production" }, "20260809020000_single_active_organization_membership"),
    {
      environment: "production",
      expectedLastMigration: "20260809020000_single_active_organization_membership",
    },
  );
});
