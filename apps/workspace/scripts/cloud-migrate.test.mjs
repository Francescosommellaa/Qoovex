import { describe, expect, it } from "vitest";

import { createCloudMigrationPlan } from "./cloud-migrate.mjs";

describe("createCloudMigrationPlan", () => {
  it("ignora le build che non sono Preview o Production Vercel", () => {
    expect(createCloudMigrationPlan({}, "head")).toBeNull();
    expect(createCloudMigrationPlan({ VERCEL_ENV: "development" }, "head")).toBeNull();
  });

  it("prepara una migration cloud con la head dichiarata", () => {
    expect(
      createCloudMigrationPlan({ VERCEL_ENV: "production" }, "20260809020000_single_active_organization_membership"),
    ).toEqual({
      environment: "production",
      expectedLastMigration: "20260809020000_single_active_organization_membership",
    });
  });
});
